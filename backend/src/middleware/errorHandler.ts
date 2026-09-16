import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error | ApiError, req: Request, res: Response, next: NextFunction): void {
  const apiErr = err as ApiError;
  const statusCode = apiErr.statusCode && apiErr.statusCode >= 400 ? apiErr.statusCode : 500;

  if (statusCode === 500) {
    console.error(err);
  }

  const response: {
    success: false;
    message: string;
    errors?: Record<string, string>;
  } = {
    success: false,
    message: statusCode === 500 ? 'Something went wrong on the server.' : err.message,
  };

  if (apiErr.errors) {
    response.errors = apiErr.errors;
  }

  res.status(statusCode).json(response);
}

export default errorHandler;
