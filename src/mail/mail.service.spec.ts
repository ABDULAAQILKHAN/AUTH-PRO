import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

// ─── Mock nodemailer ───────────────────────────────────────────────────────────
// jest.mock() factories are hoisted before all variable declarations.
// We cannot reference a `const` defined below the factory in the factory itself.
// Solution: store the mock fn on a module-scope object that CAN be accessed
// after hoisting, then reference `mockTransport.sendMail` inside the factory.

const mockTransport = { sendMail: jest.fn() };

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransport),
}));

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Default: sendMail resolves successfully
    mockTransport.sendMail.mockResolvedValue({ messageId: 'msg-id' });

    process.env.API_URL = 'http://localhost:3000';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@example.com';
    process.env.SMTP_PASS = 'smtp-pass';
    process.env.SMTP_FROM = '"Auth-Pro" <noreply@example.com>';

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  // ── sendVerificationEmail ────────────────────────────────────────────────────

  describe('sendVerificationEmail()', () => {
    it('calls sendMail with correct recipient, subject, and token in the body', async () => {
      await service.sendVerificationEmail(
        'user@example.com',
        'verify-token-abc',
        'https://app.com/dashboard',
      );

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
      const mailArg = mockTransport.sendMail.mock.calls[0][0];

      expect(mailArg.to).toBe('user@example.com');
      expect(mailArg.subject).toBe('Verify Your Email');
      // Token should appear in the text fallback
      const body: string = mailArg.text || mailArg.html || '';
      expect(body).toContain('verify-token-abc');
    });

    it('propagates SMTP errors (connection refused)', async () => {
      mockTransport.sendMail.mockRejectedValue(
        new Error('SMTP connection refused'),
      );

      await expect(
        service.sendVerificationEmail(
          'user@example.com',
          'verify-token',
          'https://app.com/dashboard',
        ),
      ).rejects.toThrow('SMTP connection refused');
    });
  });

  // ── sendPasswordResetEmail ───────────────────────────────────────────────────

  describe('sendPasswordResetEmail()', () => {
    it('calls sendMail with correct recipient, subject, and token in the body', async () => {
      await service.sendPasswordResetEmail(
        'user@example.com',
        'reset-token-xyz',
        'https://app.com/reset-password',
      );

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
      const mailArg = mockTransport.sendMail.mock.calls[0][0];

      expect(mailArg.to).toBe('user@example.com');
      expect(mailArg.subject).toBe('Password Reset Request');
      const body: string = mailArg.text || mailArg.html || '';
      expect(body).toContain('reset-token-xyz');
    });

    it('propagates SMTP timeout errors', async () => {
      mockTransport.sendMail.mockRejectedValue(new Error('Timeout'));

      await expect(
        service.sendPasswordResetEmail(
          'user@example.com',
          'token',
          'https://app.com/reset',
        ),
      ).rejects.toThrow('Timeout');
    });
  });

  // ── sendCustomEmail ──────────────────────────────────────────────────────────

  describe('sendCustomEmail()', () => {
    it('calls sendMail with the exact to, subject, and html body provided', async () => {
      const htmlBody = '<h1>Hello!</h1><p>Welcome aboard.</p>';

      await service.sendCustomEmail(
        'recipient@example.com',
        'Welcome!',
        htmlBody,
      );

      expect(mockTransport.sendMail).toHaveBeenCalledTimes(1);
      const mailArg = mockTransport.sendMail.mock.calls[0][0];

      expect(mailArg.to).toBe('recipient@example.com');
      expect(mailArg.subject).toBe('Welcome!');
      expect(mailArg.html).toBe(htmlBody);
    });

    it('propagates SMTP auth errors', async () => {
      mockTransport.sendMail.mockRejectedValue(new Error('Auth failed'));

      await expect(
        service.sendCustomEmail(
          'user@example.com',
          'Subject',
          '<p>Body</p>',
        ),
      ).rejects.toThrow('Auth failed');
    });
  });
});
