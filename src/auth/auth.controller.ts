import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, ForgotPasswordDto, UpdatePasswordDto, TokenEntity } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.', type: TokenEntity })
  @ApiResponse({ status: 400, description: 'Bad request or User already exists.' })
  async signup(@Body() signupDto: SignupDto): Promise<TokenEntity> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.', type: TokenEntity })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto): Promise<TokenEntity> {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'If the email exists, a reset link has been sent.' })
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
}
