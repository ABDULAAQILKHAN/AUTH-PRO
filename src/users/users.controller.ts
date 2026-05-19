import { Controller, Get, Post, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';
import { UserEntity } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.', type: UserEntity })
  async getProfile(@Request() req: any): Promise<UserEntity> {
    const user = await this.usersService.findById(req.user.userId);
    return new UserEntity(user);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully.', type: UserEntity })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserEntity> {
    const avatarUrl = await this.storageService.uploadFile(file, req.user.userId);
    return this.usersService.updateAvatar(req.user.userId, avatarUrl);
  }
}
