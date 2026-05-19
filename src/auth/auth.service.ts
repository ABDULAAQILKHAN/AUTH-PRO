import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SignupDto, LoginDto, ForgotPasswordDto, UpdatePasswordDto, TokenEntity } from './dto/auth.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupDto: SignupDto): Promise<TokenEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: signupDto.email,
        password: hashedPassword,
      },
    });

    return this.generateToken(user.id, user.email);
  }

  async login(loginDto: LoginDto): Promise<TokenEntity> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Return silently to prevent email enumeration
      return;
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, token);
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: updatePasswordDto.token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  private generateToken(userId: string, email: string): TokenEntity {
    const payload = { email, sub: userId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
