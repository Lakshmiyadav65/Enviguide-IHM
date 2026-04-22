// ============================================================
// IHM EnviGuide - Backend Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Route modules
import rootRouter from './routes/routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// -- Security & Parsing ------------------------------------
app.use(helmet());

// CORS_ORIGIN may be a single origin or a comma-separated list. Empty strings are
// dropped so trailing commas don't accidentally match every origin.
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Requests without an Origin header (curl, server-to-server) are allowed.
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// -- Static Files (uploads) --------------------------------
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// -- Health Check ------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -- API Routes --------------------------------------------
const API = '/api/v1';
app.use(API, rootRouter);

// -- Error Handling ----------------------------------------
app.use(notFound);
app.use(errorHandler);

// -- Start Server ------------------------------------------
app.listen(env.PORT, () => {
  console.log(`IHM API running -> http://localhost:${env.PORT}/api/v1`);
});

export default app;

