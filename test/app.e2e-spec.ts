/**
 * E2E Tests for AUTH-PRO
 *
 * All external dependencies (Prisma, MailService, StorageService, sharp) are
 * mocked so no real database, SMTP server, or cloud storage is required.
 *
 * Run:  npm run test:e2e
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { MailService } from '../src/mail/mail.service';
import { StorageService } from '../src/storage/storage.service';
import * as bcrypt from 'bcrypt';

// ─── Mock sharp at the module level ──────────────────────────────────────────

const mockSharpInstance = {
  resize: jest.fn().mockReturnThis(),
  webp: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed')),
};
jest.mock('sharp', () => jest.fn(() => mockSharpInstance));

// ─── Shared mocks ─────────────────────────────────────────────────────────────

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  media: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

const mockMail = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendCustomEmail: jest.fn().mockResolvedValue(undefined),
};

const mockStorage = {
  uploadFile: jest.fn().mockResolvedValue('https://cdn.example.com/avatars/uuid.webp'),
  uploadMedia: jest.fn().mockResolvedValue({
    publicUrl: 'https://cdn.example.com/media/images/uuid.webp',
    filename: 'media/images/user-id-1/uuid.webp',
    size: 45312,
  }),
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-01-01T00:00:00.000Z');
const FUTURE = new Date(NOW.getTime() + 3_600_000);

async function makeHashedUser(overrides: Partial<Record<string, unknown>> = {}) {
  const hashed = await bcrypt.hash('MyP@ssword1', 10);
  return {
    id: 'user-id-1',
    email: 'user@example.com',
    password: hashed,
    avatarUrl: null,
    metadata: null,
    isEmailVerified: true,
    emailVerificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

const mediaRecord = {
  id: 'media-id-1',
  userId: 'user-id-1',
  email: 'user@example.com',
  url: 'https://cdn.example.com/media/images/uuid.webp',
  type: 'image',
  filename: 'media/images/user-id-1/uuid.webp',
  mimeType: 'image/webp',
  size: 45312,
  tag: 'blog-thumbnails',
  createdAt: NOW,
  updatedAt: NOW,
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AUTH-PRO E2E', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let validToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.ADMIN_PASS = 'admin-pass-123';
    process.env.API_URL = 'http://localhost:3000';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'smtp-pass';
    process.env.R2_ACCOUNT_ID = 'fake-account';
    process.env.R2_ACCESS_KEY_ID = 'fake-key';
    process.env.R2_SECRET_ACCESS_KEY = 'fake-secret';
    process.env.R2_BUCKET_NAME = 'fake-bucket';
    process.env.R2_PUBLIC_URL = 'https://cdn.example.com';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(MailService)
      .useValue(mockMail)
      .overrideProvider(StorageService)
      .useValue(mockStorage)
      .compile();

    app = moduleFixture.createNestApplication();
    // Apply the same global ValidationPipe as production (src/main.ts)
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    validToken = jwtService.sign(
      { sub: 'user-id-1', email: 'user@example.com' },
      { secret: 'test-secret' },
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mail/storage always resolves
    mockMail.sendVerificationEmail.mockResolvedValue(undefined);
    mockMail.sendPasswordResetEmail.mockResolvedValue(undefined);
    mockMail.sendCustomEmail.mockResolvedValue(undefined);
    mockStorage.uploadFile.mockResolvedValue('https://cdn.example.com/avatars/uuid.webp');
    mockStorage.uploadMedia.mockResolvedValue({
      publicUrl: 'https://cdn.example.com/media/images/uuid.webp',
      filename: 'media/images/user-id-1/uuid.webp',
      size: 45312,
    });
    mockStorage.deleteFile.mockResolvedValue(undefined);
    mockSharpInstance.toBuffer.mockResolvedValue(Buffer.from('compressed'));
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Landing page ─────────────────────────────────────────────────────────────

  describe('GET /', () => {
    it('returns 200 with HTML', async () => {
      const res = await request(app.getHttpServer()).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('Auth-Pro');
    });
  });

  describe('GET /docs', () => {
    it('returns 200 with API documentation HTML', async () => {
      const res = await request(app.getHttpServer()).get('/docs');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
      expect(res.text).toContain('API Documentation');
    });
  });

  // ── POST /auth/signup ─────────────────────────────────────────────────────────

  describe('POST /auth/signup', () => {
    it('returns 201 and accessToken for valid payload', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // email not taken
      mockPrisma.user.create.mockResolvedValue(
        await makeHashedUser({ isEmailVerified: false }),
      );

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'MyP@ssword1',
          redirectUrl: 'http://localhost:3001/dashboard',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(mockMail.sendVerificationEmail).toHaveBeenCalled();
    });

    it('returns 400 for a weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'weak',
          redirectUrl: 'http://localhost:3001/dashboard',
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 for a missing required field (redirectUrl)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'user@example.com', password: 'MyP@ssword1' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when email is already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(await makeHashedUser());

      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'user@example.com',
          password: 'MyP@ssword1',
          redirectUrl: 'http://localhost:3001/dashboard',
        });

      expect(res.status).toBe(400);
    });
  });

  // ── POST /auth/login ──────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('returns 200 and accessToken for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(await makeHashedUser());

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'MyP@ssword1' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('returns 401 for an incorrect password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(await makeHashedUser());

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'WrongPass1!' });

      expect(res.status).toBe(401);
    });

    it('returns 401 for a non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@example.com', password: 'MyP@ssword1' });

      expect(res.status).toBe(401);
    });

    it('returns 401 for a banned (email-unverified) user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(
        await makeHashedUser({ isEmailVerified: false }),
      );

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'MyP@ssword1' });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /auth/forgot-password ────────────────────────────────────────────────

  describe('POST /auth/forgot-password', () => {
    it('returns 200 with the same message whether or not the email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // email not found

      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'anyone@example.com',
          redirectUrl: 'http://localhost:3001/reset-password',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('sends reset email when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(await makeHashedUser());
      mockPrisma.user.update.mockResolvedValue(await makeHashedUser());

      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'user@example.com',
          redirectUrl: 'http://localhost:3001/reset-password',
        });

      expect(res.status).toBe(200);
      expect(mockMail.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  // ── POST /auth/update-password ────────────────────────────────────────────────

  describe('POST /auth/update-password', () => {
    it('returns 200 and success message for a valid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(
        await makeHashedUser({
          resetPasswordToken: 'valid-token',
          resetPasswordExpires: FUTURE,
        }),
      );
      mockPrisma.user.update.mockResolvedValue(await makeHashedUser());

      const res = await request(app.getHttpServer())
        .post('/auth/update-password')
        .send({ token: 'valid-token', newPassword: 'NewP@ssword1' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Password successfully updated.' });
    });

    it('returns 400 for an invalid or expired token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/auth/update-password')
        .send({ token: 'bad-token', newPassword: 'NewP@ssword1' });

      expect(res.status).toBe(400);
    });
  });

  // ── GET /users/me ─────────────────────────────────────────────────────────────

  describe('GET /users/me', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer()).get('/users/me');
      expect(res.status).toBe(401);
    });

    it('returns 200 with user profile for a valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(await makeHashedUser());

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'user-id-1');
      expect(res.body).toHaveProperty('email', 'user@example.com');
      expect(res.body).not.toHaveProperty('password');
    });
  });

  // ── PATCH /users/me ───────────────────────────────────────────────────────────

  describe('PATCH /users/me', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .send({ metadata: { theme: 'dark' } });
      expect(res.status).toBe(401);
    });

    it('returns 200 with updated metadata', async () => {
      const userWithMeta = await makeHashedUser({ metadata: { theme: 'dark' } });
      mockPrisma.user.findUnique.mockResolvedValue(userWithMeta);
      mockPrisma.user.update.mockResolvedValue(userWithMeta);

      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ metadata: { theme: 'dark' } });

      expect(res.status).toBe(200);
    });
  });

  // ── POST /users/avatar ────────────────────────────────────────────────────────

  describe('POST /users/avatar', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/avatar')
        .attach('file', Buffer.from('fake'), 'avatar.jpg');
      expect(res.status).toBe(401);
    });

    it('returns 200 with updated avatarUrl after upload', async () => {
      const updatedUser = await makeHashedUser({
        avatarUrl: 'https://cdn.example.com/avatars/uuid.webp',
      });
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const res = await request(app.getHttpServer())
        .post('/users/avatar')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'avatar.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      expect(mockStorage.uploadFile).toHaveBeenCalled();
    });
  });

  // ── POST /users/ban ───────────────────────────────────────────────────────────

  describe('POST /users/ban', () => {
    it('returns 200 with banned user when correct adminPass is provided', async () => {
      const user = await makeHashedUser();
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        isEmailVerified: false,
      });

      const res = await request(app.getHttpServer())
        .post('/users/ban')
        .send({ adminPass: 'admin-pass-123', userId: 'user-id-1' });

      expect(res.status).toBe(201);
      expect(res.body.isEmailVerified).toBe(false);
    });

    it('returns 401 for incorrect adminPass', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/ban')
        .send({ adminPass: 'wrong-pass', userId: 'user-id-1' });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /mail/send-custom ────────────────────────────────────────────────────

  describe('POST /mail/send-custom', () => {
    it('returns 200 with success message for a valid adminPass', async () => {
      const res = await request(app.getHttpServer())
        .post('/mail/send-custom')
        .send({
          adminPass: 'admin-pass-123',
          to: 'recipient@example.com',
          subject: 'Hello!',
          htmlTemplate: '<p>Body</p>',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Email successfully sent.' });
      expect(mockMail.sendCustomEmail).toHaveBeenCalled();
    });

    it('returns 401 for incorrect adminPass', async () => {
      const res = await request(app.getHttpServer())
        .post('/mail/send-custom')
        .send({
          adminPass: 'wrong-pass',
          to: 'recipient@example.com',
          subject: 'Hello!',
          htmlTemplate: '<p>Body</p>',
        });

      expect(res.status).toBe(401);
    });
  });

  // ── POST /media/images ────────────────────────────────────────────────────────

  describe('POST /media/images', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/media/images')
        .field('tag', 'blog-thumbnails')
        .attach('file', Buffer.from('fake'), 'photo.jpg');
      expect(res.status).toBe(401);
    });

    it('returns 201 and MediaEntity after successful upload', async () => {
      mockPrisma.media.create.mockResolvedValue(mediaRecord);

      const res = await request(app.getHttpServer())
        .post('/media/images')
        .set('Authorization', `Bearer ${validToken}`)
        .field('tag', 'blog-thumbnails')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('url');
      expect(res.body).toHaveProperty('tag', 'blog-thumbnails');
    });
  });

  // ── GET /media ─────────────────────────────────────────────────────────────────

  describe('GET /media', () => {
    it('returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/media');
      expect(res.status).toBe(401);
    });

    it('returns 200 with an array of MediaEntity', async () => {
      mockPrisma.media.findMany.mockResolvedValue([mediaRecord]);

      const res = await request(app.getHttpServer())
        .get('/media')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('id', 'media-id-1');
    });

    it('filters by tag when ?tag= is provided', async () => {
      mockPrisma.media.findMany.mockResolvedValue([mediaRecord]);

      const res = await request(app.getHttpServer())
        .get('/media?tag=blog-thumbnails')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(mockPrisma.media.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tag: 'blog-thumbnails' }),
        }),
      );
    });

    it('returns 200 with an empty array when no media exists', async () => {
      mockPrisma.media.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/media')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  // ── GET /media/:id ─────────────────────────────────────────────────────────────

  describe('GET /media/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/media/media-id-1');
      expect(res.status).toBe(401);
    });

    it('returns 200 with the MediaEntity for an owned file', async () => {
      mockPrisma.media.findUnique.mockResolvedValue(mediaRecord);

      const res = await request(app.getHttpServer())
        .get('/media/media-id-1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'media-id-1');
    });

    it('returns 404 for a file owned by another user', async () => {
      mockPrisma.media.findUnique.mockResolvedValue({
        ...mediaRecord,
        userId: 'other-user-id',
      });

      const res = await request(app.getHttpServer())
        .get('/media/media-id-1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /media/:id ──────────────────────────────────────────────────────────

  describe('DELETE /media/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).delete('/media/media-id-1');
      expect(res.status).toBe(401);
    });

    it('returns 200 with success message for an owned file', async () => {
      mockPrisma.media.findUnique.mockResolvedValue(mediaRecord);
      mockPrisma.media.delete.mockResolvedValue(mediaRecord);

      const res = await request(app.getHttpServer())
        .delete('/media/media-id-1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Media successfully deleted' });
    });

    it('returns 404 for a file not owned by the user', async () => {
      mockPrisma.media.findUnique.mockResolvedValue({
        ...mediaRecord,
        userId: 'other-user-id',
      });

      const res = await request(app.getHttpServer())
        .delete('/media/media-id-1')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
    });
  });
});
