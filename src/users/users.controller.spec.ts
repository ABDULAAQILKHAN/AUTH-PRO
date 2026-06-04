import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';
import { mockStorageService } from '../__mocks__/storage.mock';
import { UserEntity } from './entities/user.entity';

// ─── Mock UsersService ────────────────────────────────────────────────────────

const mockUsersService = {
  findById: jest.fn(),
  updateAvatar: jest.fn(),
  updateMetadata: jest.fn(),
  banUser: jest.fn(),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-01-01T00:00:00.000Z');

const userEntityData = {
  id: 'user-id-1',
  email: 'user@example.com',
  avatarUrl: null,
  metadata: { plan: 'free' },
  isEmailVerified: true,
  emailVerificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  createdAt: NOW,
  updatedAt: NOW,
};

// Simulates a request object set by JwtAuthGuard
const mockRequest = { user: { userId: 'user-id-1', email: 'user@example.com' } };

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Set a known ADMIN_PASS for ban tests
    process.env.ADMIN_PASS = 'test-admin-pass';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    delete process.env.ADMIN_PASS;
  });

  // ── GET /users/me ─────────────────────────────────────────────────────────────

  describe('getProfile()', () => {
    it('returns a UserEntity without the password field', async () => {
      const rawUser = { ...userEntityData, password: 'hashed_pw' };
      mockUsersService.findById.mockResolvedValue(rawUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toBeInstanceOf(UserEntity);
      expect((result as any).password).toBeUndefined();
      expect(result.email).toBe('user@example.com');
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-id-1');
    });

    it('throws NotFoundException when user is not found', async () => {
      mockUsersService.findById.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── PATCH /users/me ───────────────────────────────────────────────────────────

  describe('updateProfile()', () => {
    it('calls updateMetadata and returns updated UserEntity', async () => {
      const updatedUser = new UserEntity({
        ...userEntityData,
        metadata: { plan: 'pro', theme: 'dark' },
      });
      mockUsersService.updateMetadata.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockRequest, {
        metadata: { plan: 'pro', theme: 'dark' },
      });

      expect(result.metadata).toEqual({ plan: 'pro', theme: 'dark' });
      expect(mockUsersService.updateMetadata).toHaveBeenCalledWith(
        'user-id-1',
        { plan: 'pro', theme: 'dark' },
      );
    });

    it('calls updateMetadata with empty object when no metadata provided', async () => {
      const updatedUser = new UserEntity(userEntityData);
      mockUsersService.updateMetadata.mockResolvedValue(updatedUser);

      await controller.updateProfile(mockRequest, {} as any);

      expect(mockUsersService.updateMetadata).toHaveBeenCalledWith(
        'user-id-1',
        {},
      );
    });
  });

  // ── POST /users/avatar ────────────────────────────────────────────────────────

  describe('uploadAvatar()', () => {
    it('uploads file to storage and updates avatarUrl', async () => {
      const fakeFile = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('fake-image'),
        size: 1024,
      } as Express.Multer.File;

      const fakeUrl = 'https://cdn.example.com/avatars/user-id-1/uuid.png';
      mockStorageService.uploadFile.mockResolvedValue(fakeUrl);

      const updatedUser = new UserEntity({ ...userEntityData, avatarUrl: fakeUrl });
      mockUsersService.updateAvatar.mockResolvedValue(updatedUser);

      const result = await controller.uploadAvatar(mockRequest, fakeFile);

      expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
        fakeFile,
        'user-id-1',
      );
      expect(mockUsersService.updateAvatar).toHaveBeenCalledWith(
        'user-id-1',
        fakeUrl,
      );
      expect(result.avatarUrl).toBe(fakeUrl);
    });
  });

  // ── POST /users/ban ───────────────────────────────────────────────────────────

  describe('banUser()', () => {
    it('bans a user when correct adminPass is provided', async () => {
      const bannedUser = new UserEntity({
        ...userEntityData,
        isEmailVerified: false,
      });
      mockUsersService.banUser.mockResolvedValue(bannedUser);

      const result = await controller.banUser({
        adminPass: 'test-admin-pass',
        userId: 'user-id-1',
      });

      expect(result.isEmailVerified).toBe(false);
      expect(mockUsersService.banUser).toHaveBeenCalledWith('user-id-1');
    });

    it('throws UnauthorizedException when adminPass is wrong', async () => {
      await expect(
        controller.banUser({
          adminPass: 'wrong-password',
          userId: 'user-id-1',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid admin password'));

      expect(mockUsersService.banUser).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when ADMIN_PASS env var is not set', async () => {
      delete process.env.ADMIN_PASS;

      await expect(
        controller.banUser({
          adminPass: 'any-pass',
          userId: 'user-id-1',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
