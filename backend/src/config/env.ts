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
  SMTP_HOST:    process.env.SMTP_HOST,
  SMTP_PORT:    process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_USER:    process.env.SMTP_USER,
  SMTP_PASS:    process.env.SMTP_PASS,
  EMAIL_FROM:   process.env.EMAIL_FROM,
  // Cloudflare R2 (S3-compatible) for persistent file storage. All optional —
  // if unset, uploads stay on local disk and we serve them via /uploads/*
  // (fine for dev, ephemeral on Render's free tier).
  R2_ACCOUNT_ID:        process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID:     process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET:            process.env.R2_BUCKET,
  R2_PUBLIC_BASE_URL:   process.env.R2_PUBLIC_BASE_URL,
  APP_BASE_URL:         optional('APP_BASE_URL', 'https://ihm-enviguide.vercel.app'),
};
