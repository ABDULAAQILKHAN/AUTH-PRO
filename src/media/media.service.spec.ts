import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { mockPrismaService } from '../__mocks__/prisma.mock';
import { mockStorageService } from '../__mocks__/storage.mock';

// ─── Mock sharp ────────────────────────────────────────────────────────────────
// We mock 'sharp' so no actual image processing happens in tests.

const mockSharpInstance = {
  resize: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed-image-data')),
};

jest.mock('sharp', () => jest.fn(() => mockSharpInstance));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-01-01T00:00:00.000Z');

const dbMedia = {
  id: 'media-id-1',
  userId: 'user-id-1',
  email: 'user@example.com',
  url: 'https://cdn.example.com/media/images/user-id-1/uuid.webp',
  type: 'image',
  filename: 'media/images/user-id-1/uuid.webp',
  mimeType: 'image/webp',
  size: 45312,
  tag: 'blog-thumbnails',
  createdAt: NOW,
  updatedAt: NOW,
};

const validImageFile = {
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake-image-bytes'),
  size: 100_000,
} as Express.Multer.File;

const nonImageFile = {
  originalname: 'data.csv',
  mimetype: 'text/csv',
  buffer: Buffer.from('col1,col2'),
  size: 50,
} as Express.Multer.File;

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset sharp mock chain
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('compressed-image-data'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  // ── uploadImage ───────────────────────────────────────────────────────────────

  describe('uploadImage()', () => {
    it('compresses the image, uploads to storage, saves to DB, and returns Media record', async () => {
      mockStorageService.uploadMedia.mockResolvedValue({
        publicUrl: dbMedia.url,
        filename: dbMedia.filename,
        size: dbMedia.size,
      });
      mockPrismaService.media.create.mockResolvedValue(dbMedia);

      const result = await service.uploadImage(
        'user-id-1',
        'user@example.com',
        'blog-thumbnails',
        validImageFile,
      );

      // sharp was called with the file buffer
      const sharp = require('sharp');
      expect(sharp).toHaveBeenCalledWith(validImageFile.buffer);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(
        expect.objectContaining({ width: 1920 }),
      );
      expect(mockSharpInstance.webp).toHaveBeenCalledWith({ quality: 80 });

      // Storage was called with the compressed buffer
      expect(mockStorageService.uploadMedia).toHaveBeenCalledWith(
        expect.any(Buffer),
        'image/webp',
        '.webp',
        'media/images',
        'user-id-1',
      );

      // DB record was saved
      expect(mockPrismaService.media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-id-1',
            email: 'user@example.com',
            tag: 'blog-thumbnails',
            mimeType: 'image/webp',
          }),
        }),
      );

      expect(result).toEqual(dbMedia);
    });

    it('throws BadRequestException for a non-image file (mimetype check)', async () => {
      await expect(
        service.uploadImage(
          'user-id-1',
          'user@example.com',
          'docs',
          nonImageFile,
        ),
      ).rejects.toThrow(
        new BadRequestException('Uploaded file is not a valid image'),
      );

      expect(mockStorageService.uploadMedia).not.toHaveBeenCalled();
      expect(mockPrismaService.media.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when sharp processing fails', async () => {
      mockSharpInstance.toBuffer.mockRejectedValue(new Error('sharp error'));

      await expect(
        service.uploadImage(
          'user-id-1',
          'user@example.com',
          'blog-thumbnails',
          validImageFile,
        ),
      ).rejects.toThrow(new BadRequestException('Failed to process image'));
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns all media for the user when no tag is given', async () => {
      mockPrismaService.media.findMany.mockResolvedValue([dbMedia]);

      const result = await service.findAll('user-id-1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id-1' } }),
      );
    });

    it('filters by tag when a tag is provided', async () => {
      mockPrismaService.media.findMany.mockResolvedValue([dbMedia]);

      await service.findAll('user-id-1', 'blog-thumbnails');

      expect(mockPrismaService.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-id-1', tag: 'blog-thumbnails' },
        }),
      );
    });

    it('returns an empty array when the user has no media', async () => {
      mockPrismaService.media.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-id-1', 'nonexistent-tag');

      expect(result).toEqual([]);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns the media record for the owner', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(dbMedia);

      const result = await service.findOne('media-id-1', 'user-id-1');

      expect(result).toEqual(dbMedia);
    });

    it('throws NotFoundException when media belongs to another user', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue({
        ...dbMedia,
        userId: 'different-user-id',
      });

      await expect(
        service.findOne('media-id-1', 'user-id-1'),
      ).rejects.toThrow(new NotFoundException('Media not found'));
    });

    it('throws NotFoundException when media record does not exist', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent-id', 'user-id-1'),
      ).rejects.toThrow(new NotFoundException('Media not found'));
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('deletes from both storage and DB for the owner', async () => {
      // findOne internally calls findUnique
      mockPrismaService.media.findUnique.mockResolvedValue(dbMedia);
      mockStorageService.deleteFile.mockResolvedValue(undefined);
      mockPrismaService.media.delete.mockResolvedValue(dbMedia);

      await expect(
        service.remove('media-id-1', 'user-id-1'),
      ).resolves.toBeUndefined();

      expect(mockStorageService.deleteFile).toHaveBeenCalledWith(dbMedia.filename);
      expect(mockPrismaService.media.delete).toHaveBeenCalledWith({
        where: { id: 'media-id-1' },
      });
    });

    it('still deletes DB record even if storage deletion fails (graceful fallback)', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue(dbMedia);
      mockStorageService.deleteFile.mockRejectedValue(
        new Error('Storage unreachable'),
      );
      mockPrismaService.media.delete.mockResolvedValue(dbMedia);

      // Should NOT throw — storage error is caught and logged
      await expect(
        service.remove('media-id-1', 'user-id-1'),
      ).resolves.toBeUndefined();

      expect(mockPrismaService.media.delete).toHaveBeenCalled();
    });

    it('throws NotFoundException when media belongs to another user', async () => {
      mockPrismaService.media.findUnique.mockResolvedValue({
        ...dbMedia,
        userId: 'other-user',
      });

      await expect(
        service.remove('media-id-1', 'user-id-1'),
      ).rejects.toThrow(NotFoundException);

      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
      expect(mockPrismaService.media.delete).not.toHaveBeenCalled();
    });
  });
});
