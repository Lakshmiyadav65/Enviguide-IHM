// ============================================================
// Global Error Handler Middleware
// ============================================================

import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message    = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env['NODE_ENV'] !== 'production' && { stack: err.stack }),
    },
  });
}

/** Convenience factory for operational errors */
export function createError(message: string, statusCode = 500): AppError {
  const error: AppError = new Error(message);
  error.statusCode      = statusCode;
  error.isOperational   = true;
  return error;
}
