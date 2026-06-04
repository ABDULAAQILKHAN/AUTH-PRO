import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { mockPrismaService } from '../__mocks__/prisma.mock';
import { mockMailService } from '../__mocks__/mail.mock';
import * as bcrypt from 'bcrypt';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-01-01T00:00:00.000Z');
const FUTURE = new Date(NOW.getTime() + 3600_000); // +1 hour

const baseUser = {
  id: 'user-id-1',
  email: 'user@example.com',
  password: 'hashed_password',
  isEmailVerified: true,
  emailVerificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  avatarUrl: null,
  metadata: null,
  createdAt: NOW,
  updatedAt: NOW,
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: mockMailService },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // ── signup ──────────────────────────────────────────────────────────────────

  describe('signup()', () => {
    const dto = {
      email: 'new@example.com',
      password: 'MyP@ssword1',
      redirectUrl: 'https://app.com/dashboard',
      metadata: { name: 'Alice' },
    };

    it('creates a user and returns an accessToken', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...baseUser,
        id: 'new-user-id',
        email: dto.email,
        isEmailVerified: false,
      });
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.signup(dto);

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: dto.email }),
        }),
      );
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        dto.email,
        expect.any(String),
        dto.redirectUrl,
      );
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('throws BadRequestException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(baseUser);

      await expect(service.signup(dto)).rejects.toThrow(
        new BadRequestException('User already exists'),
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('propagates errors thrown by MailService', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...baseUser,
        email: dto.email,
      });
      mockMailService.sendVerificationEmail.mockRejectedValue(
        new Error('SMTP error'),
      );

      await expect(service.signup(dto)).rejects.toThrow('SMTP error');
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns an accessToken for valid credentials', async () => {
      const plainPassword = 'MyP@ssword1';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        ...baseUser,
        password: hashedPassword,
        isEmailVerified: true,
      });

      const result = await service.login({
        email: baseUser.email,
        password: plainPassword,
      });

      expect(result).toEqual({ accessToken: 'mock.jwt.token' });
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'whatever' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...baseUser,
        password: await bcrypt.hash('correct_password', 10),
      });

      await expect(
        service.login({ email: baseUser.email, password: 'wrong_password' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('throws UnauthorizedException when email is not verified (banned user)', async () => {
      const plainPassword = 'MyP@ssword1';
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...baseUser,
        password: await bcrypt.hash(plainPassword, 10),
        isEmailVerified: false, // banned / not verified
      });

      await expect(
        service.login({ email: baseUser.email, password: plainPassword }),
      ).rejects.toThrow(new UnauthorizedException('Email not verified'));
    });
  });

  // ── forgotPassword ──────────────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    const dto = {
      email: baseUser.email,
      redirectUrl: 'https://app.com/reset-password',
    };

    it('generates a reset token and sends the email for an existing user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(baseUser);
      mockPrismaService.user.update.mockResolvedValue(baseUser);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await expect(service.forgotPassword(dto)).resolves.toBeUndefined();

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: baseUser.id },
          data: expect.objectContaining({
            resetPasswordToken: expect.any(String),
            resetPasswordExpires: expect.any(Date),
          }),
        }),
      );
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        dto.email,
        expect.any(String),
        dto.redirectUrl,
      );
    });

    it('returns silently for a non-existent email (prevents enumeration)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.forgotPassword(dto)).resolves.toBeUndefined();

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  // ── updatePassword ──────────────────────────────────────────────────────────

  describe('updatePassword()', () => {
    it('updates the password and clears the reset token for a valid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...baseUser,
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: FUTURE,
      });
      mockPrismaService.user.update.mockResolvedValue(baseUser);

      await expect(
        service.updatePassword({
          token: 'valid-token',
          newPassword: 'NewP@ssword1',
        }),
      ).resolves.toBeUndefined();

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resetPasswordToken: null,
            resetPasswordExpires: null,
          }),
        }),
      );
    });

    it('throws BadRequestException for an invalid token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePassword({
          token: 'bad-token',
          newPassword: 'NewP@ssword1',
        }),
      ).rejects.toThrow(new BadRequestException('Invalid or expired token'));
    });

    it('throws BadRequestException for an expired token (findFirst returns null due to gt filter)', async () => {
      // The service filters by resetPasswordExpires: { gt: new Date() }
      // An expired token means findFirst finds no matching record
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePassword({
          token: 'expired-token',
          newPassword: 'NewP@ssword1',
        }),
      ).rejects.toThrow(new BadRequestException('Invalid or expired token'));
    });
  });

  // ── verifyEmail ─────────────────────────────────────────────────────────────

  describe('verifyEmail()', () => {
    it('marks email as verified and clears the verification token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({
        ...baseUser,
        isEmailVerified: false,
        emailVerificationToken: 'verify-token-abc',
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...baseUser,
        isEmailVerified: true,
        emailVerificationToken: null,
      });

      await expect(service.verifyEmail('verify-token-abc')).resolves.toBeUndefined();

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: baseUser.id },
          data: { isEmailVerified: true, emailVerificationToken: null },
        }),
      );
    });

    it('throws BadRequestException for an invalid / already-used token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        new BadRequestException('Invalid or expired verification token'),
      );
    });
  });
});
