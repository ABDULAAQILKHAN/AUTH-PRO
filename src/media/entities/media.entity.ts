import { ApiProperty } from '@nestjs/swagger';

export class MediaEntity {
  @ApiProperty({ example: 'uuid', description: 'The unique identifier of the media' })
  id: string;

  @ApiProperty({ example: 'uuid', description: 'The ID of the user who owns the media' })
  userId: string;

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @ApiProperty({ example: 'https://r2.example.com/media/images/uuid.webp', description: 'The public URL of the media' })
  url: string;

  @ApiProperty({ example: 'image', description: 'The type of media (e.g., image, video)' })
  type: string;

  @ApiProperty({ example: 'media/images/uuid.webp', description: 'The internal filename/key in cloud storage' })
  filename: string;

  @ApiProperty({ example: 'image/webp', description: 'The MIME type of the media' })
  mimeType: string;

  @ApiProperty({ example: 102400, description: 'The size of the media in bytes' })
  size: number;

  @ApiProperty({ example: 'project-a', description: 'The tag associated with this media for filtering' })
  tag: string;

  @ApiProperty({ example: '2026-05-22T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-22T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;

  constructor(partial: Partial<MediaEntity>) {
    Object.assign(this, partial);
  }
}
