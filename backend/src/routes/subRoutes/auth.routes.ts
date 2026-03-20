// â”€â”€ Auth Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// POST /api/v1/auth/login
// POST /api/v1/auth/logout
// POST /api/v1/auth/refresh
// GET  /api/v1/auth/me

import { Router } from 'express';
import { login, logout, refresh, me } from '../../controller/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/login',   login);
router.post('/logout',  authenticate, logout);
router.post('/refresh', refresh);
router.get('/me',       authenticate, me);

export default router;
