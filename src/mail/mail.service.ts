import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const baseUrl =
      process.env.FRONTEND_URL || 'http://localhost:3000';

    const resetUrl =
      `${baseUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        '"Auth-Pro" <noreply@example.com>',

      to,

      subject: 'Password Reset Request',

      text:
        `You requested a password reset.\n\n` +
        `Click the following link to reset your password:\n\n` +
        `${resetUrl}`,

      html: `
      <p>You requested a password reset.</p>

      <p>
        Click the following link to reset your password:
      </p>

      <p>
        <a href="${resetUrl}">
          Reset Password
        </a>
      </p>

      <p>${resetUrl}</p>
    `,
    };

    try {
      await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Password reset email sent to ${to}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending email to ${to}`,
        error,
      );

      throw error;
    }
  }
}
