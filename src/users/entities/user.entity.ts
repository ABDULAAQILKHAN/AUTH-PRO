import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserEntity implements User {
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @ApiProperty({ description: 'The hashed password of the user (excluded from responses)' })
  password: string;

  @ApiProperty({ description: 'The URL of the user avatar', required: false, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ description: 'Reset password token', required: false, nullable: true })
  resetPasswordToken: string | null;

  @ApiProperty({ description: 'Reset password expiry', required: false, nullable: true })
  resetPasswordExpires: Date | null;

  @ApiProperty({ description: 'The creation date of the record' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the record' })
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
    // Usually we exclude password from serialization
    if (this.password) {
      delete (this as any).password;
    }
  }
}
