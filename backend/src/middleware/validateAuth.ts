import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { name, email, password } = req.body as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push("'name' is required.");
  }
  if (!email || !EMAIL_RE.test(String(email))) {
    errors.push("A valid 'email' is required.");
  }
  if (!password || String(password).length < 6) {
    errors.push("'password' is required and must be at least 6 characters.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, errors.join(' ')));
    return;
  }
  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { email, password } = req.body as { email?: unknown; password?: unknown };
  const errors: string[] = [];

  if (!email) errors.push("'email' is required.");
  if (!password) errors.push("'password' is required.");

  if (errors.length > 0) {
    next(new ApiError(400, errors.join(' ')));
    return;
  }
  next();
}
