import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
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

  @ApiProperty({ example: 'newpassword123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class TokenEntity {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;
}
