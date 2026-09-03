import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/index';

const SECRET = process.env.JWT_SECRET ?? 'techmaster-phase4-classroom-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

/**
 * Signs a JWT token with the given payload.
 * payload should be small, non-sensitive data: id, role, name.
 * NEVER put the password (or its hash) in here.
 */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws if invalid or expired.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
