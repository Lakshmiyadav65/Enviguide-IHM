// ── Purchase Order Routes ─────────────────────────────────
// GET  /api/v1/purchase-orders
// POST /api/v1/purchase-orders
// GET  /api/v1/purchase-orders/:id
// PUT  /api/v1/purchase-orders/:id
// POST /api/v1/purchase-orders/upload

import { Router } from 'express';
import multer from 'multer';
import {
  listPurchaseOrders, createPurchaseOrder,
  getPurchaseOrder, updatePurchaseOrder, uploadPurchaseOrder,
} from '../controllers/purchaseOrder.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const upload = multer({ dest: 'uploads/po/' });
const router = Router();
router.use(authenticate);

router.route('/')
  .get(listPurchaseOrders)
  .post(createPurchaseOrder);

router.route('/:id')
  .get(getPurchaseOrder)
  .put(updatePurchaseOrder);

router.post('/upload', upload.single('file'), uploadPurchaseOrder);

export default router;
