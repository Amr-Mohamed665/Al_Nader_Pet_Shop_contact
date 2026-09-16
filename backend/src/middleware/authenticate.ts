import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import ApiError from '../utils/ApiError';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(new ApiError(401, 'No token provided. Send it as: Authorization: Bearer <token>'));
    return;
  }

  try {
    const decoded = verifyToken(token); // { id, name, email, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err: unknown) {
    if ((err as Error).name === 'TokenExpiredError') {
      next(new ApiError(401, 'Your session has expired. Please log in again.'));
      return;
    }
    next(new ApiError(401, 'Invalid token.'));
  }
}

export default authenticate;
