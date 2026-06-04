import { Controller, Post, Get, Query, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, ForgotPasswordDto, UpdatePasswordDto, TokenEntity } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 3 signups per hour — prevents bulk account creation
  @Post('signup')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.', type: TokenEntity })
  @ApiResponse({ status: 400, description: 'Bad request or User already exists.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async signup(@Body() signupDto: SignupDto): Promise<TokenEntity> {
    return this.authService.signup(signupDto);
  }

  // 5 login attempts per minute — brute-force protection
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.', type: TokenEntity })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async login(@Body() loginDto: LoginDto): Promise<TokenEntity> {
    return this.authService.login(loginDto);
  }

  // 3 reset requests per hour — prevents email flooding
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'If the email exists, a reset link has been sent.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto);
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password using reset token' })
  @ApiResponse({ status: 200, description: 'Password successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto): Promise<{ message: string }> {
    await this.authService.updatePassword(updatePasswordDto);
    return { message: 'Password successfully updated.' };
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiResponse({ status: 200, description: 'Email successfully verified.' })
  @ApiResponse({ status: 302, description: 'Redirects to redirectUrl if provided.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token.' })
  async verifyEmail(
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl: string,
    @Res() res: Response
  ) {
    await this.authService.verifyEmail(token);
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }
    return res.json({ message: 'Email successfully verified.' });
  }

  @Get('reset-password')
  @ApiOperation({ summary: 'Redirect to password reset page' })
  @ApiResponse({ status: 302, description: 'Redirects to redirectUrl with token.' })
  async resetPasswordRedirect(
    @Query('token') token: string,
    @Query('redirectUrl') redirectUrl: string,
    @Res() res: Response
  ) {
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl);
        url.searchParams.append('token', token);
        return res.redirect(url.toString());
      } catch (e) {
        return res.redirect(`${redirectUrl}?token=${token}`);
      }
    }
    return res.json({ message: 'Please use this token to reset your password', token });
  }
}
