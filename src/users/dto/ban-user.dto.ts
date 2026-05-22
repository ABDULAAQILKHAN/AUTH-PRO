import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BanUserDto {
  @ApiProperty({ description: 'Admin password for verification' })
  @IsNotEmpty()
  @IsString()
  adminPass: string;

  @ApiProperty({ description: 'User ID to ban', example: 'uuid-here' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
