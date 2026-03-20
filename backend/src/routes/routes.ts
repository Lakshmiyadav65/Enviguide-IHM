import { Router } from 'express';
import authRouter from './subRoutes/auth.routes.js';
import vesselRouter from './subRoutes/vessel.routes.js';
import purchaseOrderRouter from './subRoutes/purchaseOrder.routes.js';
import materialRouter from './subRoutes/material.routes.js';
import auditRouter from './subRoutes/audit.routes.js';
import securityRouter from './subRoutes/security.routes.js';
import masterRouter from './subRoutes/master.routes.js';
import dashboardRouter from './subRoutes/dashboard.routes.js';

const router = Router();

router.use('/auth',            authRouter);
router.use('/vessels',         vesselRouter);
router.use('/purchase-orders', purchaseOrderRouter);
router.use('/materials',       materialRouter);
router.use('/audits',          auditRouter);
router.use('/security',        securityRouter);
router.use('/master',          masterRouter);
router.use('/dashboard',       dashboardRouter);

export default router;
