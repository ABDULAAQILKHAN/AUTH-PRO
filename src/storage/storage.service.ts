import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);

  constructor() {
    if (
      !process.env.R2_ACCOUNT_ID ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_BUCKET_NAME
    ) {
      this.logger.warn(
        'Cloudflare R2 credentials are not fully configured — file uploads will fail until R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME are set. ' +
        `Visit http://localhost:${process.env.PORT ?? 3000} for setup steps.`,
      );
    }
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);

    const fileName = `avatars/${userId}/${uuidv4()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file to R2', error);
      throw error;
    }
  }

  async uploadMedia(buffer: Buffer, mimetype: string, extension: string, folder: string, userId: string): Promise<{ publicUrl: string; filename: string; size: number }> {
    const filename = `${folder}/${userId}/${uuidv4()}${extension}`;
    const size = buffer.length;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: mimetype,
    });

    try {
      await this.s3Client.send(command);
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
      return { publicUrl, filename, size };
    } catch (error) {
      this.logger.error('Error uploading media to R2', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Error deleting file ${filename} from R2`, error);
      throw error;
    }
  }
}