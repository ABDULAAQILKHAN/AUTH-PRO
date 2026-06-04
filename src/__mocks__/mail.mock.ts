/** Shared mock MailService — no real SMTP calls in tests. */
export const mockMailService = {
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendCustomEmail: jest.fn(),
};
