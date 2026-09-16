import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types/index';
import ApiError from '../utils/ApiError';

/**
 * Usage: router.delete('/:id', authenticate, requireRole('admin'), handler)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, 'Authentication required.'));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "You don't have permission to do that."));
      return;
    }
    next();
  };
}

export default requireRole;
