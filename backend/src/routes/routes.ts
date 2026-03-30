import { Router } from 'express';
import authRouter from './subRoutes/auth.routes.js';
import vesselRouter from './subRoutes/vessel.routes.js';
import purchaseOrderRouter from './subRoutes/purchaseOrder.routes.js';
// materialRouter is now nested under /vessels/:vesselId/materials (see vessel.routes.ts)
import auditRouter from './subRoutes/audit.routes.js';
import securityRouter from './subRoutes/security.routes.js';
import masterRouter from './subRoutes/master.routes.js';
import dashboardRouter from './subRoutes/dashboard.routes.js';

const router = Router();

router.use('/auth',            authRouter);
router.use('/vessels',         vesselRouter);
router.use('/purchase-orders', purchaseOrderRouter);
// materials routes are now nested under /vessels/:vesselId/materials
router.use('/audits',          auditRouter);
router.use('/security',        securityRouter);
router.use('/master',          masterRouter);
router.use('/dashboard',       dashboardRouter);

export default router;
