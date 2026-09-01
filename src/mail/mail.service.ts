import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn(
        'SMTP credentials are not fully configured — email sending will fail until SMTP_HOST, SMTP_USER, and SMTP_PASS are set. ' +
        `Visit http://localhost:${process.env.PORT ?? 3000} for setup steps.`,
      );
    }
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

  async sendPasswordResetEmail(to: string, token: string, redirectUrl: string) {
    const baseUrl =
      process.env.API_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    const resetUrl =
      `${baseUrl}/auth/reset-password?token=${token}&redirectUrl=${encodeURIComponent(redirectUrl)}`;

    const templatePath = path.join(__dirname, '..', 'assets', 'email-templates', 'reset-password.html');
    let htmlTemplate = '';
    try {
      htmlTemplate = await fs.readFile(templatePath, 'utf-8');
      htmlTemplate = htmlTemplate.replace(/\{\{resetUrl\}\}/g, resetUrl);
      htmlTemplate = htmlTemplate.replace(/\{\{baseUrl\}\}/g, baseUrl);
    } catch (err) {
      this.logger.error('Error reading reset-password.html template', err);
      // Fallback HTML
      htmlTemplate = `<p>Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`;
    }

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

      html: htmlTemplate,
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

  async sendVerificationEmail(to: string, token: string, redirectUrl: string) {
    const baseUrl =
      process.env.API_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    const verifyUrl =
      `${baseUrl}/auth/verify-email?token=${token}&redirectUrl=${encodeURIComponent(redirectUrl)}`;

    const templatePath = path.join(__dirname, '..', 'assets', 'email-templates', 'verify-email.html');
    let htmlTemplate = '';
    try {
      htmlTemplate = await fs.readFile(templatePath, 'utf-8');
      htmlTemplate = htmlTemplate.replace(/\{\{verifyUrl\}\}/g, verifyUrl);
      htmlTemplate = htmlTemplate.replace(/\{\{baseUrl\}\}/g, baseUrl);
    } catch (err) {
      this.logger.error('Error reading verify-email.html template', err);
      // Fallback HTML
      htmlTemplate = `<p>Click here to verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`;
    }

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        '"Auth-Pro" <noreply@example.com>',
      to,
      subject: 'Verify Your Email',
      text:
        `Welcome to Auth-Pro!\n\n` +
        `Please click the following link to verify your email:\n\n` +
        `${verifyUrl}`,
      html: htmlTemplate,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending verification email to ${to}`, error);
      throw error;
    }
  }

  async sendCustomEmail(to: string, subject: string, htmlTemplate: string) {
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        '"Auth-Pro" <noreply@example.com>',
      to,
      subject,
      html: htmlTemplate,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Custom email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Error sending custom email to ${to}`, error);
      throw error;
    }
  }
}
