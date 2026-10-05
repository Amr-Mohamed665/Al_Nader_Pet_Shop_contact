import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

/**
 * Must be used AFTER the `authenticate` middleware.
 * Rejects non-admin callers with a 403 Forbidden error.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    next(new ApiError(403, 'Forbidden: admin access required.'));
    return;
  }
  next();
}

export default requireAdmin;
