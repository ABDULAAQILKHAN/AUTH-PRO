import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch {
      this.logger.warn(
        'Database connection failed at startup (DATABASE_URL/DIRECT_URL missing or invalid). ' +
        'The app will keep running, but database-dependent endpoints will fail until this is fixed. ' +
        `Visit http://localhost:${process.env.PORT ?? 3000} for setup steps.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
