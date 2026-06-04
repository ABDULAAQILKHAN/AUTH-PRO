/**
 * Security E2E Tests for AUTH-PRO
 *
 * Covers three layers added by the security hardening work:
 *   1. Helmet HTTP security headers
 *   2. ValidationPipe (whitelist + forbidNonWhitelisted) & JSON body size limit
 *   3. Per-endpoint rate limiting (ThrottlerModule / @Throttle overrides)
 *
 * All external dependencies are mocked — no real DB, SMTP, or storage needed.
 * Run:  npm run test:e2e
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { json } from 'express';
import helmet from 'helmet';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { MailService } from '../src/mail/mail.service';
import { StorageService } from '../src/storage/storage.service';

// ─── Mock sharp (required by MediaModule) ─────────────────────────────────────

const mockSharpInstance = {
  resize: jest.fn().mockReturnThis(),
  webp:   jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed')),
};
jest.mock('sharp', () => jest.fn(() => mockSharpInstance));

// ─── Mock factories (fresh instance per test section) ─────────────────────────

function makeMockPrisma() {
  const methods = { findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(),
                    create: jest.fn(), update: jest.fn(), delete: jest.fn() };
  return { user: { ...methods }, media: { ...methods }, $connect: jest.fn(), $disconnect: jest.fn() };
}

function makeMockMail() {
  return {
    sendVerificationEmail:  jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    sendCustomEmail:        jest.fn().mockResolvedValue(undefined),
  };
}

function makeMockStorage() {
  return {
    uploadFile:  jest.fn().mockResolvedValue('https://cdn.example.com/avatars/uuid.webp'),
    uploadMedia: jest.fn().mockResolvedValue({ publicUrl: 'https://cdn.example.com/media/uuid.webp', filename: 'media/uuid.webp', size: 1024 }),
    deleteFile:  jest.fn().mockResolvedValue(undefined),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function makeHashedUser(overrides: Record<string, unknown> = {}) {
  const hashed = await bcrypt.hash('MyP@ssword1', 10);
  return {
    id: 'user-id-1', email: 'user@example.com', password: hashed,
    avatarUrl: null, metadata: null, isEmailVerified: true,
    emailVerificationToken: null, resetPasswordToken: null, resetPasswordExpires: null,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function setEnvVars() {
  process.env.JWT_SECRET     = 'test-secret';
  process.env.ADMIN_PASS     = 'admin-pass-123';
  process.env.API_URL        = 'http://localhost:3000';
  process.env.SMTP_HOST      = 'smtp.test';
  process.env.SMTP_PORT      = '587';
  process.env.SMTP_USER      = 'u';
  process.env.SMTP_PASS      = 'p';
  process.env.R2_ACCOUNT_ID        = 'a';
  process.env.R2_ACCESS_KEY_ID     = 'k';
  process.env.R2_SECRET_ACCESS_KEY = 's';
  process.env.R2_BUCKET_NAME       = 'b';
  process.env.R2_PUBLIC_URL        = 'https://cdn.example.com';
}

async function buildApp(
  mockPrisma: ReturnType<typeof makeMockPrisma>,
  mockMail:   ReturnType<typeof makeMockMail>,
  mockStorage: ReturnType<typeof makeMockStorage>,
): Promise<NestExpressApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(mockPrisma)
    .overrideProvider(MailService).useValue(mockMail)
    .overrideProvider(StorageService).useValue(mockStorage)
    .compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(json({ limit: '1mb' }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  await app.init();
  return app;
}

// ─── 1. HTTP Headers & Input Hardening ────────────────────────────────────────

describe('Security — HTTP Headers & Input Hardening', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    setEnvVars();
    app = await buildApp(makeMockPrisma(), makeMockMail(), makeMockStorage());
  });

  afterAll(async () => { await app.close(); });

  // ── Helmet headers ─────────────────────────────────────────────────────────

  describe('Helmet security headers', () => {
    let headers: Record<string, string>;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).get('/');
      headers = res.headers as Record<string, string>;
    });

    it('sets X-Frame-Options: SAMEORIGIN', () => {
      expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('sets X-Content-Type-Options: nosniff', () => {
      expect(headers['x-content-type-options']).toBe('nosniff');
    });

    it('sets Strict-Transport-Security header', () => {
      expect(headers['strict-transport-security']).toBeDefined();
      expect(headers['strict-transport-security']).toContain('max-age=');
    });

    it('sets Content-Security-Policy header', () => {
      expect(headers['content-security-policy']).toBeDefined();
    });

    it('sets Referrer-Policy header', () => {
      expect(headers['referrer-policy']).toBeDefined();
    });

    it('sets X-DNS-Prefetch-Control: off', () => {
      expect(headers['x-dns-prefetch-control']).toBe('off');
    });

    it('removes X-Powered-By header', () => {
      expect(headers['x-powered-by']).toBeUndefined();
    });
  });

  // ── ValidationPipe ─────────────────────────────────────────────────────────

  describe('ValidationPipe — whitelist & forbidNonWhitelisted', () => {
    it('POST /auth/login returns 400 when an unknown field is present', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'x@x.com', password: 'P@ssword1', injected: 'evil' });
      expect(res.status).toBe(400);
    });

    it('POST /auth/signup returns 400 when an unknown field is present', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'x@x.com', password: 'P@ssword1', redirectUrl: 'http://a.com', hack: true });
      expect(res.status).toBe(400);
    });

    it('POST /auth/login returns 400 when a required field is missing (no password)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'x@x.com' });
      expect(res.status).toBe(400);
    });

    it('POST /auth/signup returns 400 for a weak password (too short)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'x@x.com', password: 'weak', redirectUrl: 'http://a.com' });
      expect(res.status).toBe(400);
    });

    it('POST /auth/signup returns 400 when redirectUrl is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'x@x.com', password: 'MyP@ssword1' });
      expect(res.status).toBe(400);
    });

    it('POST /users/ban returns 400 when an unknown field is present', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/ban')
        .send({ adminPass: 'admin-pass-123', userId: 'id-1', extra: 'field' });
      expect(res.status).toBe(400);
    });

    it('POST /mail/send-custom returns 400 when an unknown field is present', async () => {
      const res = await request(app.getHttpServer())
        .post('/mail/send-custom')
        .send({ adminPass: 'admin-pass-123', to: 'r@r.com', subject: 'Hi', htmlTemplate: '<p>Hi</p>', extra: 'x' });
      expect(res.status).toBe(400);
    });
  });

  // ── JSON body size limit ────────────────────────────────────────────────────

  describe('JSON body size limit (1 MB)', () => {
    it('returns 413 when the JSON body exceeds 1 MB', async () => {
      // Payload ~1.05 MB — exceeds the 1mb express.json() limit
      const oversized = { email: 'x@x.com', password: 'P@ssword1', data: 'x'.repeat(1_100_000) };
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(oversized);
      expect(res.status).toBe(413);
    });
  });
});

// ─── 2. Rate Limiting ─────────────────────────────────────────────────────────
//
// Each endpoint has its own throttle bucket (keyed by route + client IP), so
// exhausting one endpoint's limit does not affect any other. All tests share one
// app instance — a fresh one so the in-memory ThrottlerStorage starts empty.

describe('Security — Rate Limiting', () => {
  let app: NestExpressApplication;
  let mockPrisma: ReturnType<typeof makeMockPrisma>;
  let mockMail:   ReturnType<typeof makeMockMail>;

  beforeAll(async () => {
    setEnvVars();
    mockPrisma  = makeMockPrisma();
    mockMail    = makeMockMail();
    app = await buildApp(mockPrisma, mockMail, makeMockStorage());
  });

  afterAll(async () => { await app.close(); });

  // ── POST /auth/login — 5 req / min ─────────────────────────────────────────

  describe('POST /auth/login (limit: 5 per minute)', () => {
    it('allows the first 5 requests and blocks the 6th with 429', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // user not found → 401 each time

      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'attacker@x.com', password: 'Wrong1!' });
        expect(res.status).not.toBe(429);
      }

      const throttled = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'attacker@x.com', password: 'Wrong1!' });
      expect(throttled.status).toBe(429);
    });
  });

  // ── POST /auth/signup — 3 req / hr ─────────────────────────────────────────

  describe('POST /auth/signup (limit: 3 per hour)', () => {
    it('allows the first 3 requests and blocks the 4th with 429', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(await makeHashedUser({ isEmailVerified: false }));

      for (let i = 0; i < 3; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/signup')
          .send({ email: `signup${i}@example.com`, password: 'MyP@ssword1', redirectUrl: 'http://a.com' });
        expect(res.status).not.toBe(429);
      }

      const throttled = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'overflow@example.com', password: 'MyP@ssword1', redirectUrl: 'http://a.com' });
      expect(throttled.status).toBe(429);
    });
  });

  // ── POST /auth/forgot-password — 3 req / hr ────────────────────────────────

  describe('POST /auth/forgot-password (limit: 3 per hour)', () => {
    it('allows the first 3 requests and blocks the 4th with 429', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // email not found — still returns 200

      for (let i = 0; i < 3; i++) {
        const res = await request(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({ email: 'anyone@example.com', redirectUrl: 'http://a.com/reset' });
        expect(res.status).not.toBe(429);
      }

      const throttled = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'anyone@example.com', redirectUrl: 'http://a.com/reset' });
      expect(throttled.status).toBe(429);
    });
  });

  // ── POST /users/ban — 5 req / min ──────────────────────────────────────────

  describe('POST /users/ban (limit: 5 per minute)', () => {
    it('allows the first 5 requests and blocks the 6th with 429', async () => {
      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer())
          .post('/users/ban')
          .send({ adminPass: 'wrong-pass', userId: 'user-id-1' });
        expect(res.status).not.toBe(429);
      }

      const throttled = await request(app.getHttpServer())
        .post('/users/ban')
        .send({ adminPass: 'wrong-pass', userId: 'user-id-1' });
      expect(throttled.status).toBe(429);
    });
  });

  // ── POST /mail/send-custom — 10 req / hr ───────────────────────────────────
  //
  // The global short tier (5 req/sec) could fire before the 10/hr limit.
  // Requests are sent in two batches of 5 with a 1.1 s gap between them so the
  // short-tier window resets, ensuring the 10/hr default-tier override is the
  // one that triggers the 429 on the 11th request.

  describe('POST /mail/send-custom (limit: 10 per hour)', () => {
    it('allows the first 10 requests and blocks the 11th with 429', async () => {
      const body = { adminPass: 'admin-pass-123', to: 'r@r.com', subject: 'X', htmlTemplate: '<p>X</p>' };

      // Batch 1 — requests 1–5
      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer()).post('/mail/send-custom').send(body);
        expect(res.status).not.toBe(429);
      }

      // Wait for the 5 req/sec short-tier window to reset
      await new Promise(r => setTimeout(r, 1100));

      // Batch 2 — requests 6–10
      for (let i = 0; i < 5; i++) {
        const res = await request(app.getHttpServer()).post('/mail/send-custom').send(body);
        expect(res.status).not.toBe(429);
      }

      await new Promise(r => setTimeout(r, 1100));

      // Request 11 — must be blocked by the 10/hr limit
      const throttled = await request(app.getHttpServer()).post('/mail/send-custom').send(body);
      expect(throttled.status).toBe(429);
    }, 15_000); // extend timeout to cover the two 1.1 s sleeps
  });
});
