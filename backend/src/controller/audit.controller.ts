// -- Audit Controller (Pending Audits & Reviews) -----------
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuditService } from '../services/audit.service.js';
import { DocumentService } from '../services/document.service.js';
import { sendMail } from '../services/email.service.js';
import { persistUploadedFile } from '../services/storage.service.js';
import { query } from '../config/database.js';
import { env } from '../config/env.js';
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

    // Generate a one-way token the supplier will use on the public upload page.
    // 32 random bytes, URL-safe base64 → ~43 chars. 72-hour expiry.
    const publicToken = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const supplierLink = `${env.APP_BASE_URL.replace(/\/$/, '')}/upload/${publicToken}`;

    // Append the upload link to whatever the user typed in the body.
    const expiresText = expiresAt.toISOString().replace('T', ' ').replace(/\..+/, ' UTC');
    const bodyWithLink = `${body}\n\n---\nUpload documents directly via this secure link (no login required):\n${supplierLink}\n\nThis link expires on ${expiresText} (72 hours from now).`;
    const html = bodyWithLink
      .split('\n')
      .map((line) => {
        const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Turn the supplier link into a real anchor tag.
        if (line.trim() === supplierLink) {
          return `<div><a href="${supplierLink}" style="color:#00B0FA;font-weight:600">${supplierLink}</a></div>`;
        }
        return `<div>${escaped || '&nbsp;'}</div>`;
      })
      .join('');

    let status = 'sent';
    let errorMessage: string | null = null;

    try {
      await sendMail({ to, cc, subject, text: bodyWithLink, html });
    } catch (mailErr) {
      status = 'failed';
      errorMessage = mailErr instanceof Error ? mailErr.message : 'Unknown mail error';
    }

    const inserted = await query(
      `INSERT INTO clarification_requests
         (vessel_id, imo_number, vessel_name, recipient_emails, cc_emails,
          subject, body, suspected_items, status, error_message, sent_by,
          public_token, public_token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13)
       RETURNING id, status, created_at`,
      [
        vesselId,
        imo,
        vesselName || null,
        to.join(', '),
        cc && cc.length ? cc.join(', ') : null,
        subject,
        bodyWithLink,
        JSON.stringify(suspectedItems || []),
        status,
        errorMessage,
        req.user!.userId,
        publicToken,
        expiresAt,
      ],
    );

    // Seed per-item rows so we can track MDS upload, reminders etc. per item.
    const clarificationId = String((inserted.rows[0] as Record<string, unknown>).id);
    const itemCount = Array.isArray(suspectedItems) ? suspectedItems.length : 0;
    if (itemCount > 0) {
      const placeholders: string[] = [];
      const vals: unknown[] = [];
      for (let i = 0; i < itemCount; i++) {
        const start = vals.length;
        placeholders.push(`($${start + 1}, $${start + 2})`);
        vals.push(clarificationId, i);
      }
      await query(
        `INSERT INTO clarification_items (clarification_id, item_index)
         VALUES ${placeholders.join(', ')}
         ON CONFLICT (clarification_id, item_index) DO NOTHING`,
        vals,
      );
    }

    if (status === 'failed') {
      return next(createError(`Email not sent: ${errorMessage}`, 502));
    }

    res.json({ success: true, data: inserted.rows[0] });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/:imo/line-items — rows for the review/edit grid.
 *  Picks an arbitrary audit if the IMO has duplicates; prefer by-id for
 *  pages that already know the audit UUID.
 */
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

/** GET /api/v1/audits/by-id/:auditId/line-items — exact audit, no IMO ambiguity */
export async function getAuditLineItemsById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auditId = req.params.auditId as string;
    const audit = await AuditService.getAuditById(auditId, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));

    const a = audit as Record<string, unknown>;
    const dbRows = await AuditService.getLineItems(auditId);
    const rows = dbRows.map(lineItemRowToArray);

    res.json({
      success: true,
      data: {
        auditId,
        imo: a.imoNumber,
        header: LINE_ITEM_HEADER,
        rows,
      },
    });
  } catch (err) { next(err); }
}

/**
 * PATCH /api/v1/audits/:imo/line-items — replace all rows for the audit
 * matching this IMO (picks arbitrary one if multiple exist). Prefer the
 * by-id variant below when the caller has the audit UUID.
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
    await query(
      `UPDATE audit_summaries SET total_items = $1, last_activity = NOW(), updated_at = NOW() WHERE id = $2`,
      [rows.length, auditId],
    );

    res.json({ success: true, data: { auditId, rowsWritten: rows.length } });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/audits/by-id/:auditId/line-items — exact audit, no IMO ambiguity */
export async function replaceAuditLineItemsById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const auditId = req.params.auditId as string;
    const audit = await AuditService.getAuditById(auditId, req.user!.userId);
    if (!audit) return next(createError('Audit not found', 404));

    const { rows } = req.body as { rows?: unknown[][] };
    if (!Array.isArray(rows)) {
      return next(createError('rows must be an array of row arrays', 400));
    }

    const a = audit as Record<string, unknown>;
    const vesselId = a.vesselId ? String(a.vesselId) : null;

    await AuditService.replaceLineItems(auditId, vesselId, rows);
    await query(
      `UPDATE audit_summaries SET total_items = $1, last_activity = NOW(), updated_at = NOW() WHERE id = $2`,
      [rows.length, auditId],
    );

    res.json({ success: true, data: { auditId, rowsWritten: rows.length } });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/mds-pending — aggregate view for the MD SDoC Audit Pending page */
export async function getMdsPendingOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await AuditService.getMdsPendingOverview(req.user!.userId);
    const data = rows.map((r) => {
      const pendingMds = Number(r.pending_mds ?? 0);
      const submitted = Boolean(r.any_submitted);
      return {
        imoNumber: String(r.imo_number ?? ''),
        vesselName: String(r.vessel_name ?? ''),
        totalPOs: Number(r.total_po ?? 0),
        pendingMDS: pendingMds,
        pendingSdocs: pendingMds, // same until we track MD and SDoC separately
        receivedMDS: Number(r.received_mds ?? 0),
        clarificationCount: Number(r.clarification_count ?? 0),
        clarificationStatus: pendingMds === 0 && submitted ? 'Resolved' : 'Awaiting Clarification',
        lastSubmissionDate: r.last_submitted_at
          ? String(r.last_submitted_at).split('T')[0]
          : (r.last_received_at ? String(r.last_received_at).split('T')[0] : ''),
      };
    });
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
}

/** GET /api/v1/audits/vessels/:vesselId/po-items — all line items for the vessel's active audit, with clarification state */
export async function getVesselPoItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const result = await AuditService.getVesselPoItems(vesselId, req.user!.userId);
    res.json({ success: true, data: result });
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

/**
 * POST /api/v1/audits/clarifications/:clarId/items/:idx/document — upload the
 * vendor's MD/SDoC reply for a specific suspected item. Stores the file and
 * marks the item as 'received'.
 */
export async function uploadClarificationItemDocument(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) return next(createError('File required', 400));

    const clarificationId = req.params.clarId as string;
    const itemIndex = Number(req.params.idx);
    if (!Number.isFinite(itemIndex) || itemIndex < 0) {
      return next(createError('Invalid item index', 400));
    }

    const item = await AuditService.getClarificationItem(clarificationId, itemIndex);
    if (!item) return next(createError('Clarification item not found', 404));

    // Verify user owns the vessel this clarification belongs to.
    const imo = String(item.imo_number);
    const parent = await AuditService.getAuditByImo(imo, req.user!.userId);
    if (!parent) return next(createError('Audit not found for this user', 404));

    const stored = await persistUploadedFile(req.file.path, req.file.originalname, 'mds');
    const updated = await AuditService.setClarificationItemDocument(
      clarificationId,
      itemIndex,
      stored.url,
      stored.name,
    );

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/audits/clarifications/:clarId/items/:idx/remind
 * Re-send the clarification email as a reminder for one item. Optional body:
 *   { subject?, body?, to?, cc? }  — overrides for the outgoing mail.
 * Reuses the existing public_token (so the supplier's link stays the same)
 * and extends its expiry by 72 hours. Increments reminder_count on the item.
 */
export async function sendClarificationItemReminder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clarificationId = req.params.clarId as string;
    const itemIndex = Number(req.params.idx);
    if (!Number.isFinite(itemIndex) || itemIndex < 0) {
      return next(createError('Invalid item index', 400));
    }

    const clar = await AuditService.getClarificationForReminder(clarificationId, itemIndex);
    if (!clar) return next(createError('Clarification item not found', 404));

    // Ownership via the parent audit.
    const owned = await AuditService.getAuditByImo(String(clar.imo_number), req.user!.userId);
    if (!owned) return next(createError('Audit not found for this user', 404));

    const overrides = (req.body || {}) as {
      subject?: string;
      body?: string;
      to?: string | string[];
      cc?: string | string[];
    };

    const parseList = (v: string | string[] | undefined): string[] => {
      if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
      if (typeof v === 'string') return v.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const toOverride = parseList(overrides.to);
    const ccOverride = parseList(overrides.cc);
    const toField = toOverride.length > 0
      ? toOverride
      : parseList(String(clar.recipient_emails || ''));
    const ccField = ccOverride.length > 0
      ? ccOverride
      : parseList(clar.cc_emails ? String(clar.cc_emails) : '');

    if (toField.length === 0) {
      return next(createError('No recipient email available for reminder', 400));
    }

    const supplierLink = `${env.APP_BASE_URL.replace(/\/$/, '')}/upload/${clar.public_token}`;
    const newExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
    const expiresText = newExpiresAt.toISOString().replace('T', ' ').replace(/\..+/, ' UTC');

    const subjectLine = overrides.subject?.trim()
      || `Reminder: ${clar.subject || 'Documentation required'}`;
    const bodyBase = overrides.body?.trim()
      || `This is a reminder regarding our earlier request. We still need the MDS / SDoC documents for vessel ${clar.vessel_name || clar.imo_number}.`;
    const bodyWithLink = `${bodyBase}\n\n---\nUpload documents directly via this secure link (no login required):\n${supplierLink}\n\nThis link expires on ${expiresText} (72 hours from now).`;
    const html = bodyWithLink
      .split('\n')
      .map((line) => {
        const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (line.trim() === supplierLink) {
          return `<div><a href="${supplierLink}" style="color:#00B0FA;font-weight:600">${supplierLink}</a></div>`;
        }
        return `<div>${escaped || '&nbsp;'}</div>`;
      })
      .join('');

    try {
      await sendMail({
        to: toField,
        cc: ccField.length > 0 ? ccField : undefined,
        subject: subjectLine,
        text: bodyWithLink,
        html,
      });
    } catch (mailErr) {
      return next(createError(
        `Email not sent: ${mailErr instanceof Error ? mailErr.message : 'Unknown mail error'}`,
        502,
      ));
    }

    const updated = await AuditService.incrementReminderAndExtendToken(
      clarificationId,
      itemIndex,
      newExpiresAt,
    );

    res.json({
      success: true,
      data: {
        reminderCount: updated?.reminder_count ?? null,
        sentTo: toField,
        publicLink: supplierLink,
        expiresAt: newExpiresAt,
      },
    });
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
