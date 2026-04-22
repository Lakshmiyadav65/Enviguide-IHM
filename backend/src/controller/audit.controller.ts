// -- Audit Controller (Pending Audits & Reviews) -----------
import type { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';
import { DocumentService } from '../services/document.service.js';
import { sendMail } from '../services/email.service.js';
import { query } from '../config/database.js';
import { createError } from '../middleware/errorHandler.js';

// Canonical 20-column header used by the upload + review screens. If you add a
// column here, also update audit_line_items columns and the upload controller.
const LINE_ITEM_HEADER = [
  'Name', 'Vessel Name', 'PO Number', 'IMO Number',
  'PO Sent Date', 'MD Requested Date', 'Item Description', 'Is Suspected',
  'IMPA Code', 'ISSA Code', 'Equipment Code', 'Equipment Name',
  'Maker', 'Model', 'Part Number', 'Unit', 'Quantity',
  'Vendor Remark', 'Vendor Email', 'Vendor Name',
];

function lineItemRowToArray(row: Record<string, unknown>): unknown[] {
  const arr = [
    row.name, row.vessel_name, row.po_number, row.imo_number,
    row.po_sent_date, row.md_requested_date, row.item_description, row.is_suspected,
    row.impa_code, row.issa_code, row.equipment_code, row.equipment_name,
    row.maker, row.model, row.part_number, row.unit, row.quantity,
    row.vendor_remark, row.vendor_email, row.vendor_name,
  ].map((v) => (v == null ? '' : String(v)));
  const extra = (row.extra_data as unknown[]) ?? [];
  if (Array.isArray(extra)) arr.push(...extra.map((v) => (v == null ? '' : String(v))));
  return arr;
}

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

/** GET /api/v1/audits/:imo/line-items — rows for the review/edit grid */
export async function getAuditLineItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));

    const auditId = String((audit as Record<string, unknown>).id);
    const dbRows = await AuditService.getLineItems(auditId);
    const rows = dbRows.map(lineItemRowToArray);

    res.json({
      success: true,
      data: {
        auditId,
        imo: req.params.imo,
        header: LINE_ITEM_HEADER,
        rows,
      },
    });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/audits/:imo/line-items — replace all rows for an audit.
 * Body: { rows: any[][] }   where each row is aligned to LINE_ITEM_HEADER (extras after col 20 go to extra_data).
 * Used by the editor grid (manual edits) and by the review wizard after sending a clarification email
 * (which removes suspected rows).
 */
export async function replaceAuditLineItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));

    const { rows } = req.body as { rows?: unknown[][] };
    if (!Array.isArray(rows)) {
      return next(createError('rows must be an array of row arrays', 400));
    }

    const auditRow = audit as Record<string, unknown>;
    const auditId = String(auditRow.id);
    const vesselId = auditRow.vesselId ? String(auditRow.vesselId) : null;

    await AuditService.replaceLineItems(auditId, vesselId, rows);
    // Keep totalItems in sync so list pages show correct counts.
    await query(
      `UPDATE audit_summaries SET total_items = $1, last_activity = NOW(), updated_at = NOW() WHERE id = $2`,
      [rows.length, auditId],
    );

    res.json({ success: true, data: { auditId, rowsWritten: rows.length } });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/:imo/clarifications — clarifications sent for an audit */
export async function getAuditClarifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const audit = await AuditService.getAuditByImo(req.params.imo as string, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));

    const rows = await AuditService.getClarificationsForImo(req.params.imo as string);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/audits/:id — hard-delete an audit and its line items */
export async function deleteAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await AuditService.getAuditById(id, req.user!.userId);
    if (!existing) return next(createError('Audit not found', 404));

    // FK on audit_line_items has ON DELETE CASCADE, so they go with the audit.
    await AuditService.deleteAudit(id);
    res.json({ success: true, data: { id } });
  } catch (err) { next(err); }
}
