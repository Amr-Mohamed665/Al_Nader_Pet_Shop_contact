import type { Request, Response, NextFunction } from 'express';
import * as featuredStore from '../data/featuredStore';
import ApiError from '../utils/ApiError';

/** GET /api/featured  (public) */
export function getFeatured(req: Request, res: Response): void {
  const ids = featuredStore.get();
  res.status(200).json({ success: true, data: ids });
}

/** PUT /api/featured  (admin only) */
export function setFeatured(req: Request, res: Response, next: NextFunction): void {
  const { ids } = req.body as { ids?: unknown };

  if (!Array.isArray(ids)) {
    next(new ApiError(400, "Request body must contain an 'ids' array."));
    return;
  }
  if (ids.length > 8) {
    next(new ApiError(400, 'You can feature a maximum of 8 products.'));
    return;
  }

  // Ensure all values are strings
  const cleanIds = ids.map(String);
  featuredStore.set(cleanIds);

  res.status(200).json({ success: true, data: cleanIds });
}
