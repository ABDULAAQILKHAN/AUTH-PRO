import { Controller, Get, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Request, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';
import { MediaEntity } from './entities/media.entity';
import { UploadImageDto } from './dto/upload-image.dto';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images')
  @ApiOperation({ summary: 'Upload and compress an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully.', type: MediaEntity })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaEntity> {
    const media = await this.mediaService.uploadImage(req.user.userId, req.user.email, body.tag, file);
    return new MediaEntity(media);
  }

  @Get()
  @ApiOperation({ summary: 'List all media for current user' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter media by tag' })
  @ApiResponse({ status: 200, description: 'Media listed successfully.', type: [MediaEntity] })
  async findAll(@Request() req: any, @Query('tag') tag?: string): Promise<MediaEntity[]> {
    const mediaList = await this.mediaService.findAll(req.user.userId, tag);
    return mediaList.map(m => new MediaEntity(m));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific media file' })
  @ApiResponse({ status: 200, description: 'Media details retrieved successfully.', type: MediaEntity })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<MediaEntity> {
    const media = await this.mediaService.findOne(id, req.user.userId);
    return new MediaEntity(media);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully.' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<{ message: string }> {
    await this.mediaService.remove(id, req.user.userId);
    return { message: 'Media successfully deleted' };
  }
}
