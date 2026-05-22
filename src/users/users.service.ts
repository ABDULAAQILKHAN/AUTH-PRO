import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });
    return new UserEntity(updatedUser);
  }

  async updateMetadata(id: string, metadata: Record<string, any>): Promise<UserEntity> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { metadata: metadata as any },
    });
    return new UserEntity(updatedUser);
  }

  async banUser(id: string): Promise<UserEntity> {
    const user = await this.findById(id); // Ensures user exists
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isEmailVerified: false },
    });
    return new UserEntity(updatedUser);
  }
}
