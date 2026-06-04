import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService } from '../__mocks__/prisma.mock';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-01-01T00:00:00.000Z');

const dbUser = {
  id: 'user-id-1',
  email: 'user@example.com',
  password: 'hashed_pw',
  avatarUrl: null,
  metadata: { plan: 'free', name: 'Alice' },
  isEmailVerified: true,
  emailVerificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  createdAt: NOW,
  updatedAt: NOW,
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ── findById ─────────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('returns the user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.findById('user-id-1');

      expect(result).toEqual(dbUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  // ── updateAvatar ─────────────────────────────────────────────────────────────

  describe('updateAvatar()', () => {
    it('updates the avatarUrl and returns a UserEntity without password', async () => {
      const newAvatarUrl = 'https://cdn.example.com/avatars/uuid.webp';
      mockPrismaService.user.update.mockResolvedValue({
        ...dbUser,
        avatarUrl: newAvatarUrl,
      });

      const result = await service.updateAvatar('user-id-1', newAvatarUrl);

      expect(result.avatarUrl).toBe(newAvatarUrl);
      // UserEntity constructor deletes the password field
      expect((result as any).password).toBeUndefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { avatarUrl: newAvatarUrl },
      });
    });
  });

  // ── updateMetadata ────────────────────────────────────────────────────────────

  describe('updateMetadata()', () => {
    it('deep-merges new metadata with existing metadata', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...dbUser,
        metadata: { plan: 'pro', name: 'Alice', theme: 'dark' },
      });

      const result = await service.updateMetadata('user-id-1', {
        plan: 'pro',
        theme: 'dark',
      });

      // 'name' from existing metadata is preserved, plus new keys added/updated
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            metadata: { plan: 'pro', name: 'Alice', theme: 'dark' },
          },
        }),
      );
      expect((result as any).password).toBeUndefined();
    });

    it('sets metadata from scratch when user has no existing metadata', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...dbUser,
        metadata: null,
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...dbUser,
        metadata: { theme: 'dark' },
      });

      await service.updateMetadata('user-id-1', { theme: 'dark' });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { metadata: { theme: 'dark' } },
        }),
      );
    });

    it('removes a key when its value is null (null-merge pattern)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      // After null-merge { plan: null } → plan is removed (set to null in the object)
      mockPrismaService.user.update.mockResolvedValue({
        ...dbUser,
        metadata: { name: 'Alice', plan: null },
      });

      await service.updateMetadata('user-id-1', { plan: null });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { metadata: { name: 'Alice', plan: null } },
        }),
      );
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMetadata('ghost-id', { theme: 'dark' }),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  // ── banUser ──────────────────────────────────────────────────────────────────

  describe('banUser()', () => {
    it('sets isEmailVerified to false (banning mechanism)', async () => {
      // findById calls prisma.user.findUnique once
      mockPrismaService.user.findUnique.mockResolvedValue(dbUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...dbUser,
        isEmailVerified: false,
      });

      const result = await service.banUser('user-id-1');

      expect(result.isEmailVerified).toBe(false);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { isEmailVerified: false },
      });
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.banUser('ghost-id')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

});
