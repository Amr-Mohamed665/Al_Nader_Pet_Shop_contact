import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export function validateCategory(req: Request, res: Response, next: NextFunction): void {
  const { name, slug } = req.body as { name?: unknown; slug?: unknown };
  const errors: string[] = [];

  if (!name || !String(name).trim()) {
    errors.push("'name' is required.");
  }

  if (!slug || !String(slug).trim()) {
    errors.push("'slug' is required.");
  } else if (!/^[a-z0-9-]+$/.test(String(slug))) {
    errors.push("'slug' must contain only lowercase letters, numbers, and hyphens.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, errors.join(' ')));
    return;
  }

  next();
}

export default validateCategory;
