// -- Audit Routes -----------------------------------------
// GET   /api/v1/audits/pending                       — Pending Audits Registry
// GET   /api/v1/audits/reviews                       — Pending Reviews Registry
// GET   /api/v1/audits/mds-doc                       — MD/SDoC Doc Audit list
// GET   /api/v1/audits/:imo                          — audit detail by IMO
// GET   /api/v1/audits/reviews/:imo                  — review detail by IMO
// PATCH /api/v1/audits/:id/send-for-review           — move audit → Pending Review
// PATCH /api/v1/audits/reviews/:id/complete          — mark review Completed
// PATCH /api/v1/audits/reviews/:id/reject            — reject (back to In Progress)
// GET   /api/v1/audits/:imo/documents                — documents for an audit
// POST  /api/v1/audits/:imo/documents                — upload doc to audit

import { Router } from 'express';
import multer from 'multer';
import {
  getPendingAudits, getAuditDetail,
  getPendingReviews, getReviewDetail,
  getMdsDocAudit, getAuditDocuments, uploadAuditDocument,
  sendAuditForReview, completeReview, rejectReview,
  sendClarificationEmail,
} from '../../controller/audit.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const upload = multer({ dest: 'uploads/docs/' });
const router = Router();
router.use(authenticate);

router.get('/pending',                       getPendingAudits);
router.get('/reviews',                       getPendingReviews);
router.get('/reviews/:imo',                  getReviewDetail);
router.get('/mds-doc',                       getMdsDocAudit);

router.post('/clarification-email',          sendClarificationEmail);

router.patch('/:id/send-for-review',         sendAuditForReview);
router.patch('/reviews/:id/complete',        completeReview);
router.patch('/reviews/:id/reject',          rejectReview);

router.get('/:imo',                          getAuditDetail);
router.get('/:imo/documents',                getAuditDocuments);
router.post('/:imo/documents', upload.single('file'), uploadAuditDocument);

export default router;
