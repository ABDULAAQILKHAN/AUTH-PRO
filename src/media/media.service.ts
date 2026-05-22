import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import sharp from 'sharp';
import { Media } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadImage(userId: string, email: string, tag: string, file: Express.Multer.File): Promise<Media> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Uploaded file is not a valid image');
    }

    try {
      // Compress and convert image to webp
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true }) // Max width 1920px
        .webp({ quality: 80 }) // 80% quality webp is usually very small and good quality
        .toBuffer();

      // Upload to storage
      const { publicUrl, filename, size } = await this.storageService.uploadMedia(
        compressedBuffer,
        'image/webp',
        '.webp',
        'media/images',
        userId
      );

      // Save to database
      const media = await this.prisma.media.create({
        data: {
          userId,
          email,
          tag,
          url: publicUrl,
          type: 'image',
          filename,
          mimeType: 'image/webp',
          size,
        },
      });

      return media;
    } catch (error) {
      this.logger.error('Failed to process and upload image', error);
      throw new BadRequestException('Failed to process image');
    }
  }

  async findAll(userId: string, tag?: string): Promise<Media[]> {
    const whereClause: any = { userId };
    if (tag) {
      whereClause.tag = tag;
    }
    return this.prisma.media.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media || media.userId !== userId) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async remove(id: string, userId: string): Promise<void> {
    const media = await this.findOne(id, userId);

    try {
      // Delete from storage
      await this.storageService.deleteFile(media.filename);
    } catch (error) {
      this.logger.error(`Failed to delete file from storage: ${media.filename}`, error);
      // Proceed to delete from db even if storage deletion fails (e.g., file already missing)
    }

    // Delete from database
    await this.prisma.media.delete({
      where: { id },
    });
  }
}
