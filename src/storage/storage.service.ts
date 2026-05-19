import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly logger = new Logger(StorageService.name);

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://\${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `avatars/\${userId}/\${uuidv4()}\${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      // R2 public URL needs to be configured in .env, e.g. https://pub-xxxx.r2.dev
      const publicUrl = `\${process.env.R2_PUBLIC_URL}/\${fileName}`;
      return publicUrl;
    } catch (error) {
      this.logger.error('Error uploading file to R2', error);
      throw error;
    }
  }
}
