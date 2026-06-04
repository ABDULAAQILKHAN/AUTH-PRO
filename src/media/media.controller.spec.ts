import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaEntity } from './entities/media.entity';

// ─── Mock MediaService ────────────────────────────────────────────────────────

const mockMediaService = {
  uploadImage: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

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

const mockRequest = {
  user: { userId: 'user-id-1', email: 'user@example.com' },
};

const mockFile = {
  originalname: 'photo.jpg',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake'),
  size: 1000,
} as Express.Multer.File;

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MediaController', () => {
  let controller: MediaController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [{ provide: MediaService, useValue: mockMediaService }],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  // ── POST /media/images ─────────────────────────────────────────────────────────

  describe('uploadImage()', () => {
    it('returns a MediaEntity on successful upload', async () => {
      mockMediaService.uploadImage.mockResolvedValue(dbMedia);

      const result = await controller.uploadImage(
        mockRequest,
        { tag: 'blog-thumbnails' },
        mockFile,
      );

      expect(result).toBeInstanceOf(MediaEntity);
      expect(result.url).toBe(dbMedia.url);
      expect(result.tag).toBe('blog-thumbnails');
      expect(mockMediaService.uploadImage).toHaveBeenCalledWith(
        'user-id-1',
        'user@example.com',
        'blog-thumbnails',
        mockFile,
      );
    });
  });

  // ── GET /media ─────────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns all media as an array of MediaEntity (no tag filter)', async () => {
      mockMediaService.findAll.mockResolvedValue([dbMedia]);

      const result = await controller.findAll(mockRequest, undefined);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaEntity);
      expect(mockMediaService.findAll).toHaveBeenCalledWith('user-id-1', undefined);
    });

    it('passes the tag query parameter to the service', async () => {
      mockMediaService.findAll.mockResolvedValue([dbMedia]);

      await controller.findAll(mockRequest, 'blog-thumbnails');

      expect(mockMediaService.findAll).toHaveBeenCalledWith(
        'user-id-1',
        'blog-thumbnails',
      );
    });

    it('returns an empty array when no media exists', async () => {
      mockMediaService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest, 'nonexistent-tag');

      expect(result).toEqual([]);
    });
  });

  // ── GET /media/:id ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('returns a MediaEntity for an owned file', async () => {
      mockMediaService.findOne.mockResolvedValue(dbMedia);

      const result = await controller.findOne('media-id-1', mockRequest);

      expect(result).toBeInstanceOf(MediaEntity);
      expect(result.id).toBe('media-id-1');
      expect(mockMediaService.findOne).toHaveBeenCalledWith(
        'media-id-1',
        'user-id-1',
      );
    });

    it('propagates NotFoundException for a file owned by another user', async () => {
      mockMediaService.findOne.mockRejectedValue(
        new NotFoundException('Media not found'),
      );

      await expect(
        controller.findOne('media-id-1', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── DELETE /media/:id ──────────────────────────────────────────────────────────

  describe('remove()', () => {
    it('returns the success message after deletion', async () => {
      mockMediaService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('media-id-1', mockRequest);

      expect(result).toEqual({ message: 'Media successfully deleted' });
      expect(mockMediaService.remove).toHaveBeenCalledWith(
        'media-id-1',
        'user-id-1',
      );
    });

    it('propagates NotFoundException when the file does not belong to the user', async () => {
      mockMediaService.remove.mockRejectedValue(
        new NotFoundException('Media not found'),
      );

      await expect(
        controller.remove('media-id-1', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
