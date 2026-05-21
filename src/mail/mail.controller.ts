import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MailService } from './mail.service';
import { SendCustomEmailDto } from './dto/send-custom-email.dto';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-custom')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a custom HTML email (Admin only)' })
  @ApiResponse({ status: 200, description: 'Email successfully sent.' })
  @ApiResponse({ status: 401, description: 'Invalid admin password.' })
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
