import { Controller, Get, Post, Patch, Body, UseGuards, UseInterceptors, UploadedFile, Request, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully.', type: UserEntity })
  async getProfile(@Request() req: any): Promise<UserEntity> {
    const user = await this.usersService.findById(req.user.userId);
    return new UserEntity(user);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update current user metadata' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.', type: UserEntity })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.updateMetadata(req.user.userId, updateUserDto.metadata || {});
  }

  @Post('avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  // 5 ban attempts per minute — slows down admin credential guessing
  @Post('ban')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Ban a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User banned successfully.', type: UserEntity })
  @ApiResponse({ status: 401, description: 'Invalid admin password.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async banUser(@Body() banUserDto: BanUserDto): Promise<UserEntity> {
    const adminPass = process.env.ADMIN_PASS;

    if (!adminPass || banUserDto.adminPass !== adminPass) {
      throw new UnauthorizedException('Invalid admin password');
    }

    return this.usersService.banUser(banUserDto.userId);
  }
}
