import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Matches, IsOptional, IsObject } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Must contain at least one uppercase letter, one lowercase letter, one number and one special character' })
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password too weak. Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  password: string;

  @ApiProperty({
    required: false,
    example: {
      name: 'John Doe',
      phone: '+1234567890',
      additionalEmail: 'john@example.com',
      address: '123 Main St'
    }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ description: 'The token sent to email' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'Must contain at least one uppercase letter, one lowercase letter, one number and one special character' })
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'password too weak. Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
  newPassword: string;
}

export class TokenEntity {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;
}
