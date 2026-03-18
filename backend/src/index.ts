// ============================================================
// IHM EnviGuide — Backend Entry Point
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Route modules (uncomment as you build each one)
import authRouter from './routes/auth.routes.js';
import vesselRouter from './routes/vessel.routes.js';
import purchaseOrderRouter from './routes/purchaseOrder.routes.js';
import materialRouter from './routes/material.routes.js';
import auditRouter from './routes/audit.routes.js';
import securityRouter from './routes/security.routes.js';
import masterRouter from './routes/master.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

const app = express();

// ── Security & Parsing ────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,            authRouter);
app.use(`${API}/vessels`,         vesselRouter);
app.use(`${API}/purchase-orders`, purchaseOrderRouter);
app.use(`${API}/materials`,       materialRouter);
app.use(`${API}/audits`,          auditRouter);
app.use(`${API}/security`,        securityRouter);
app.use(`${API}/master`,          masterRouter);
app.use(`${API}/dashboard`,       dashboardRouter);

// ── Error Handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`✅ IHM API running → http://localhost:${env.PORT}/api/v1`);
});

export default app;
