// ============================================================
// Backend Environment Config - Validates & Exports .env
// ============================================================
// Crashes at startup if a required variable is missing,
// so you never get a mysterious runtime failure.

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  PORT:         Number(optional('PORT', '8000')),
  NODE_ENV:     optional('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET:   required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  CORS_ORIGIN:  optional('CORS_ORIGIN', 'http://localhost:5173'),
  UPLOAD_DIR:   optional('UPLOAD_DIR', './uploads'),
  MAX_FILE_SIZE_MB: Number(optional('MAX_FILE_SIZE_MB', '10')),
};
