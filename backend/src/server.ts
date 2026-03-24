// ============================================================
// IHM EnviGuide - Backend Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Route modules
import rootRouter from './routes/routes.js';

const app = express();

// -- Security & Parsing ------------------------------------
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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

