import { Logger } from '@nestjs/common';

const logger = new Logger('JwtConfig');
const FALLBACK_JWT_SECRET = 'secret';
let hasWarned = false;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (!hasWarned) {
      logger.warn(
        'JWT_SECRET is not set — falling back to an insecure default. ' +
        `This is NOT safe for production. Set JWT_SECRET in your .env (see http://localhost:${process.env.PORT ?? 3000} for setup steps).`,
      );
      hasWarned = true;
    }
    return FALLBACK_JWT_SECRET;
  }
  return secret;
}
