// -- Audit Routes -----------------------------------------
// GET  /api/v1/audits/pending
// GET  /api/v1/audits/:imo
// GET  /api/v1/audits/reviews
// GET  /api/v1/audits/reviews/:imo
// GET  /api/v1/audits/mds-doc
// GET  /api/v1/audits/:imo/documents
// POST /api/v1/audits/:imo/documents   (upload document)

import { Router } from 'express';
import multer from 'multer';
import {
  getPendingAudits, getAuditDetail,
  getPendingReviews, getReviewDetail,
  getMdsDocAudit, getAuditDocuments, uploadAuditDocument,
} from '../../controller/audit.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const upload = multer({ dest: 'uploads/docs/' });
const router = Router();
router.use(authenticate);

router.get('/pending',       getPendingAudits);
router.get('/reviews',       getPendingReviews);
router.get('/reviews/:imo',  getReviewDetail);
router.get('/mds-doc',       getMdsDocAudit);
router.get('/:imo',          getAuditDetail);
router.get('/:imo/documents', getAuditDocuments);
router.post('/:imo/documents', upload.single('file'), uploadAuditDocument);

export default router;
