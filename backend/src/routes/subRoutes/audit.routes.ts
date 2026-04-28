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
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getPendingAudits, getAuditDetail,
  getPendingReviews, getReviewDetail,
  getMdsDocAudit, getAuditDocuments, uploadAuditDocument,
  sendAuditForReview, completeReview, rejectReview,
  sendClarificationEmail,
  getAuditLineItems, replaceAuditLineItems, getAuditClarifications,
  getAuditLineItemsById, replaceAuditLineItemsById,
  uploadClarificationItemDocument,
  sendClarificationItemReminder,
  getMdsPendingOverview, getVesselPoItems,
  deleteAudit,
} from '../../controller/audit.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdsDir = path.resolve(__dirname, '..', '..', '..', 'uploads', 'mds');
if (!fs.existsSync(mdsDir)) fs.mkdirSync(mdsDir, { recursive: true });

const upload = multer({ dest: 'uploads/docs/' });
const mdsUpload = multer({
  dest: mdsDir,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();
router.use(authenticate);

router.get('/pending',                       getPendingAudits);
router.get('/reviews',                       getPendingReviews);
router.get('/reviews/:imo',                  getReviewDetail);
router.get('/mds-doc',                       getMdsDocAudit);
router.get('/mds-pending',                   getMdsPendingOverview);
router.get('/vessels/:vesselId/po-items',    getVesselPoItems);

router.post('/clarification-email',          sendClarificationEmail);

router.patch('/:id/send-for-review',         sendAuditForReview);
router.patch('/reviews/:id/complete',        completeReview);
router.patch('/reviews/:id/reject',          rejectReview);
router.delete('/:id',                        deleteAudit);

router.get('/by-id/:auditId/line-items',     getAuditLineItemsById);
router.patch('/by-id/:auditId/line-items',   replaceAuditLineItemsById);

router.get('/:imo/line-items',               getAuditLineItems);
router.patch('/:imo/line-items',             replaceAuditLineItems);
router.get('/:imo/clarifications',           getAuditClarifications);

router.post(
  '/clarifications/:clarId/items/:idx/document/:kind',
  mdsUpload.single('file'),
  uploadClarificationItemDocument,
);

router.post(
  '/clarifications/:clarId/items/:idx/remind',
  sendClarificationItemReminder,
);

router.get('/:imo',                          getAuditDetail);
router.get('/:imo/documents',                getAuditDocuments);
router.post('/:imo/documents', upload.single('file'), uploadAuditDocument);

export default router;
