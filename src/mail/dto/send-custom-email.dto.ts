import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendCustomEmailDto {
  @ApiProperty({ description: 'Admin password for verification' })
  @IsNotEmpty()
  @IsString()
  adminPass: string;

  @ApiProperty({ description: 'Recipient email address', example: 'user@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject', example: 'Custom Notification' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'HTML template for the email body', example: '<h1>Hello</h1><p>World</p>' })
  @IsNotEmpty()
  @IsString()
  htmlTemplate: string;
}
