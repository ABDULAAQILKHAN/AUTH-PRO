import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { mockMailService } from '../__mocks__/mail.mock';

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MailController', () => {
  let controller: MailController;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.ADMIN_PASS = 'test-admin-pass';

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [{ provide: MailService, useValue: mockMailService }],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  afterEach(() => {
    delete process.env.ADMIN_PASS;
  });

  // ── POST /mail/send-custom ────────────────────────────────────────────────────

  describe('sendCustomEmail()', () => {
    it('sends email and returns success message when adminPass is correct', async () => {
      mockMailService.sendCustomEmail.mockResolvedValue(undefined);

      const result = await controller.sendCustomEmail({
        adminPass: 'test-admin-pass',
        to: 'recipient@example.com',
        subject: 'Hello!',
        htmlTemplate: '<p>Welcome</p>',
      });

      expect(result).toEqual({ message: 'Email successfully sent.' });
      expect(mockMailService.sendCustomEmail).toHaveBeenCalledWith(
        'recipient@example.com',
        'Hello!',
        '<p>Welcome</p>',
      );
    });

    it('throws UnauthorizedException when adminPass is wrong', async () => {
      await expect(
        controller.sendCustomEmail({
          adminPass: 'wrong-password',
          to: 'someone@example.com',
          subject: 'Test',
          htmlTemplate: '<p>Body</p>',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid admin password'));

      expect(mockMailService.sendCustomEmail).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when ADMIN_PASS env var is not set', async () => {
      delete process.env.ADMIN_PASS;

      await expect(
        controller.sendCustomEmail({
          adminPass: 'any-pass',
          to: 'someone@example.com',
          subject: 'Test',
          htmlTemplate: '<p>Body</p>',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('propagates MailService errors (e.g. SMTP failure)', async () => {
      mockMailService.sendCustomEmail.mockRejectedValue(new Error('SMTP down'));

      await expect(
        controller.sendCustomEmail({
          adminPass: 'test-admin-pass',
          to: 'user@example.com',
          subject: 'Test',
          htmlTemplate: '<p>Body</p>',
        }),
      ).rejects.toThrow('SMTP down');
    });
  });
});
