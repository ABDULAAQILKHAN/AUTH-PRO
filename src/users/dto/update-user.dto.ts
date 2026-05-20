import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    example: {
      name: 'John Doe',
      phone: '+1234567890',
      additionalEmail: 'john@example.com',
      address: '123 Main St',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
