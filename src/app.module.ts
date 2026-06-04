import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Three-tier rate limiting: short burst · per-minute · per-hour
    // 'default' name is required so @Throttle({ default: {...} }) overrides in controllers resolve correctly
    ThrottlerModule.forRoot([
      { name: 'short',   ttl: 1000,     limit: 5   },  // 5 req / sec
      { name: 'default', ttl: 60000,    limit: 60  },  // 60 req / min
      { name: 'long',    ttl: 3600000,  limit: 500 },  // 500 req / hr
    ]),

    PrismaModule,
    MailModule,
    StorageModule,
    UsersModule,
    AuthModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard globally — controllers can override with @Throttle()
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
