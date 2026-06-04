import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendCustomEmailDto } from './dto/send-custom-email.dto';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // 10 custom emails per hour — prevents SMTP abuse even with correct admin pass
  @Post('send-custom')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a custom HTML email (Admin only)' })
  @ApiResponse({ status: 200, description: 'Email successfully sent.' })
  @ApiResponse({ status: 401, description: 'Invalid admin password.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async sendCustomEmail(@Body() sendCustomEmailDto: SendCustomEmailDto): Promise<{ message: string }> {
    const adminPass = process.env.ADMIN_PASS;

    if (!adminPass || sendCustomEmailDto.adminPass !== adminPass) {
      throw new UnauthorizedException('Invalid admin password');
    }

    await this.mailService.sendCustomEmail(
      sendCustomEmailDto.to,
      sendCustomEmailDto.subject,
      sendCustomEmailDto.htmlTemplate,
    );

    return { message: 'Email successfully sent.' };
  }
}
