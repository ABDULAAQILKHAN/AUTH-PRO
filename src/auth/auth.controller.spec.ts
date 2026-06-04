import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// ─── Mock AuthService ─────────────────────────────────────────────────────────

const mockAuthService = {
  signup: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  updatePassword: jest.fn(),
  verifyEmail: jest.fn(),
};

// ─── Mock Express Response ────────────────────────────────────────────────────

function makeMockRes() {
  const res: any = {};
  res.redirect = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // ── signup ──────────────────────────────────────────────────────────────────

  describe('signup()', () => {
    it('returns accessToken on successful signup (HTTP 201 by default)', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'MyP@ssword1',
        redirectUrl: 'https://app.com/dashboard',
      };
      mockAuthService.signup.mockResolvedValue({ accessToken: 'jwt-token' });

      const result = await controller.signup(dto as any);

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
    });

    it('propagates BadRequestException for duplicate email', async () => {
      mockAuthService.signup.mockRejectedValue(
        new BadRequestException('User already exists'),
      );

      await expect(controller.signup({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns accessToken on successful login (HTTP 200)', async () => {
      const dto = { email: 'user@example.com', password: 'MyP@ssword1' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'jwt-token' });

      const result = await controller.login(dto as any);

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });

    it('propagates UnauthorizedException for bad credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login({} as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── forgotPassword ──────────────────────────────────────────────────────────

  describe('forgotPassword()', () => {
    it('always returns the same safe message regardless of email existence', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword({
        email: 'anyone@example.com',
        redirectUrl: 'https://app.com/reset-password',
      } as any);

      expect(result).toEqual({
        message: 'If the email exists, a reset link has been sent.',
      });
    });
  });

  // ── updatePassword ──────────────────────────────────────────────────────────

  describe('updatePassword()', () => {
    it('returns success message on valid token', async () => {
      mockAuthService.updatePassword.mockResolvedValue(undefined);

      const result = await controller.updatePassword({
        token: 'valid-token',
        newPassword: 'NewP@ssword1',
      } as any);

      expect(result).toEqual({ message: 'Password successfully updated.' });
    });

    it('propagates BadRequestException for invalid token', async () => {
      mockAuthService.updatePassword.mockRejectedValue(
        new BadRequestException('Invalid or expired token'),
      );

      await expect(
        controller.updatePassword({ token: 'bad', newPassword: 'x' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── verifyEmail ─────────────────────────────────────────────────────────────

  describe('verifyEmail()', () => {
    it('redirects to redirectUrl when provided', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);
      const mockRes = makeMockRes();

      await controller.verifyEmail(
        'valid-token',
        'https://app.com/dashboard',
        mockRes,
      );

      expect(mockRes.redirect).toHaveBeenCalledWith('https://app.com/dashboard');
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('returns JSON when no redirectUrl is provided', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);
      const mockRes = makeMockRes();

      await controller.verifyEmail('valid-token', '', mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Email successfully verified.',
      });
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('propagates BadRequestException for an invalid token', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(
        new BadRequestException('Invalid or expired verification token'),
      );
      const mockRes = makeMockRes();

      await expect(
        controller.verifyEmail('bad-token', '', mockRes),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── resetPasswordRedirect ───────────────────────────────────────────────────

  describe('resetPasswordRedirect()', () => {
    it('appends the token to the redirectUrl and redirects', async () => {
      const mockRes = makeMockRes();

      await controller.resetPasswordRedirect(
        'abc123',
        'https://app.com/reset-password',
        mockRes,
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'https://app.com/reset-password?token=abc123',
      );
    });

    it('returns JSON with token when no redirectUrl is provided', async () => {
      const mockRes = makeMockRes();

      await controller.resetPasswordRedirect('abc123', '', mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'abc123' }),
      );
    });
  });
});
