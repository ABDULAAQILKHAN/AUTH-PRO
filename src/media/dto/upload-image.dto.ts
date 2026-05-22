import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'The image file to upload' })
  file: any;

  @ApiProperty({ description: 'A required tag to categorize this media (e.g., project name, service, id)', example: 'project-alpha' })
  @IsString()
  @IsNotEmpty()
  tag: string;
}
