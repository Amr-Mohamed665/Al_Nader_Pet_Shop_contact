import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export function validateMenuItem(req: Request, res: Response, next: NextFunction): void {
  const { name, price } = req.body as { name?: unknown; price?: unknown };
  const isCreate = req.method === 'POST';
  const errors: string[] = [];

  if (isCreate && (!name || typeof name !== 'string' || !String(name).trim())) {
    errors.push("'name' is required and must be a non-empty string.");
  }
  if (isCreate && (price === undefined || price === null || price === '')) {
    errors.push("'price' is required.");
  }
  if (price !== undefined && price !== null && price !== '' && Number.isNaN(Number(price))) {
    errors.push("'price' must be a number.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, errors.join(' ')));
    return;
  }
  next();
}

export default validateMenuItem;
