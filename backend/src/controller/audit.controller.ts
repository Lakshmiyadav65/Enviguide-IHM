// -- Audit Controller (Pending Audits & Reviews) -----------
import type { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';
import { DocumentService } from '../services/document.service.js';
import { sendMail } from '../services/email.service.js';
import { query } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

/** GET /api/v1/audits/pending — Audits with status In Progress / Pending */
export async function getPendingAudits(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audits = await AuditService.getPendingAudits(req.user!.userId);
    res.json({ success: true, data: audits, total: audits.length });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/reviews — Audits with status Pending Review */
export async function getPendingReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reviews = await AuditService.getPendingReviews(req.user!.userId);
    res.json({ success: true, data: reviews, total: reviews.length });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/:imo */
export async function getAuditDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));
    res.json({ success: true, data: audit });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/reviews/:imo */
export async function getReviewDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Review not found', 404));
    res.json({ success: true, data: audit });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/audits/:id/send-for-review */
export async function sendAuditForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await AuditService.getAuditById(id, req.user!.userId);
    if (!existing) return next(createError('Audit not found', 404));

    const { assignedTo } = req.body as { assignedTo?: string };
    const updated = await AuditService.sendToReview(id, assignedTo);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/audits/reviews/:id/complete */
export async function completeReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await AuditService.getAuditById(id, req.user!.userId);
    if (!existing) return next(createError('Review not found', 404));

    const updated = await AuditService.completeReview(id, req.user!.email);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/audits/reviews/:id/reject */
export async function rejectReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await AuditService.getAuditById(id, req.user!.userId);
    if (!existing) return next(createError('Review not found', 404));

    const updated = await AuditService.rejectReview(id, req.user!.email);
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/mds-doc — Suspected hazardous items pending MD/SDoC */
export async function getMdsDocAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // For now, use audits with hazmat materials pending - real query joins materials with category=hazard
    const audits = await AuditService.getAudits({ userId: req.user!.userId });
    res.json({ success: true, data: audits });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/:imo/documents */
export async function getAuditDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));

    const vesselId = (audit as Record<string, unknown>).vesselId as string;
    const docs = await DocumentService.getDocumentsForVessel(vesselId);
    res.json({ success: true, data: docs, imo: req.params.imo });
  } catch (err) { next(err); }
}

/** POST /api/v1/audits/:imo/documents */
export async function uploadAuditDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));
    if (!req.file) return next(createError('File required', 400));

    const vesselId = (audit as Record<string, unknown>).vesselId as string;
    const data = {
      name: req.body.name || req.file.originalname,
      documentType: req.body.documentType || 'Other',
      category: 'audit',
      status: 'pending',
      fileName: req.file.originalname,
      filePath: `/uploads/docs/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user!.email,
    };
    const doc = await DocumentService.createDocument(data, vesselId);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
}

/** POST /api/v1/audits/clarification-email — send vendor clarification email */
export async function sendClarificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      imo,
      vesselName,
      to,
      cc,
      subject,
      body,
      suspectedItems,
    } = req.body as {
      imo?: string;
      vesselName?: string;
      to?: string[];
      cc?: string[];
      subject?: string;
      body?: string;
      suspectedItems?: unknown[];
    };

    if (!imo || !to || to.length === 0 || !subject || !body) {
      return next(createError('imo, to, subject, and body are required', 400));
    }

    const audit = await AuditService.getAuditByImo(imo, req.user!.userId);
    const vesselId = audit ? (audit as Record<string, unknown>).vesselId as string : null;

    const html = body
      .split('\n')
      .map((line) => `<div>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || '&nbsp;'}</div>`)
      .join('');

    let status = 'sent';
    let errorMessage: string | null = null;

    try {
      await sendMail({ to, cc, subject, text: body, html });
    } catch (mailErr) {
      status = 'failed';
      errorMessage = mailErr instanceof Error ? mailErr.message : 'Unknown mail error';
    }

    const inserted = await query(
      `INSERT INTO clarification_requests
         (vessel_id, imo_number, vessel_name, recipient_emails, cc_emails,
          subject, body, suspected_items, status, error_message, sent_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)
       RETURNING id, status, created_at`,
      [
        vesselId,
        imo,
        vesselName || null,
        to.join(', '),
        cc && cc.length ? cc.join(', ') : null,
        subject,
        body,
        JSON.stringify(suspectedItems || []),
        status,
        errorMessage,
        req.user!.userId,
      ],
    );

    if (status === 'failed') {
      return next(createError(`Email not sent: ${errorMessage}`, 502));
    }

    res.json({ success: true, data: inserted.rows[0] });
  } catch (err) { next(err); }
}
