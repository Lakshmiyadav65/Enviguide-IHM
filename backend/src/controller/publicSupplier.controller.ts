// -- Public Supplier Portal Controller ---------------------------------
// No-auth endpoints used by the supplier upload page. A clarification
// request's public_token is the only credential; the uploader also
// provides their email which must match one of the email's recipients.

import type { Request, Response, NextFunction } from 'express';
import { query } from '../config/database.js';
import { persistUploadedFile, deleteStoredFile } from '../services/storage.service.js';
import { createError } from '../middleware/errorHandler.js';

interface ClarificationRow {
  id: string;
  imo_number: string;
  vessel_name: string | null;
  subject: string;
  suspected_items: unknown;
  public_token: string;
  public_token_expires_at: string | Date | null;
  created_at: string | Date;
  recipient_emails: string;
  cc_emails: string | null;
  supplier_company: string | null;
  supplier_contact_name: string | null;
  supplier_comments: string | null;
  prepared_date: string | null;
  submitted_at: string | Date | null;
}

async function getByTokenIfValid(token: string): Promise<ClarificationRow | null> {
  const r = await query(
    `SELECT id, imo_number, vessel_name, subject, suspected_items,
            public_token, public_token_expires_at, created_at,
            recipient_emails, cc_emails,
            supplier_company, supplier_contact_name, supplier_comments,
            prepared_date, submitted_at
       FROM clarification_requests
      WHERE public_token = $1 LIMIT 1`,
    [token],
  );
  const row = r.rows[0] as ClarificationRow | undefined;
  if (!row) return null;
  if (row.public_token_expires_at) {
    const exp = new Date(row.public_token_expires_at as string);
    if (Date.now() > exp.getTime()) return null;
  }
  return row;
}

/** Does the email the supplier typed match anyone the email was addressed to? */
function emailMatchesRecipients(email: string, clarification: ClarificationRow): boolean {
  const normalized = email.trim().toLowerCase();
  const pool = [
    ...(clarification.recipient_emails || '').split(/[,;]/),
    ...((clarification.cc_emails || '').split(/[,;]/)),
  ].map((e) => e.trim().toLowerCase()).filter(Boolean);
  return pool.includes(normalized);
}

/** GET /api/v1/public/clarifications/:token — supplier-facing item list */
export async function getPublicClarification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.params.token as string;
    const clarification = await getByTokenIfValid(token);
    if (!clarification) return next(createError('Link not found or expired', 404));

    const suspected = Array.isArray(clarification.suspected_items)
      ? clarification.suspected_items as unknown[][]
      : [];

    const itemsRes = await query(
      `SELECT item_index,
              mds_status,  mds_file_name,  mds_file_path,  mds_received_at,
              sdoc_status, sdoc_file_name, sdoc_file_path, sdoc_received_at,
              uploaded_by_email
         FROM clarification_items
        WHERE clarification_id = $1
        ORDER BY item_index ASC`,
      [clarification.id],
    );
    const stateByIdx = new Map<number, Record<string, unknown>>();
    for (const s of itemsRes.rows as Array<Record<string, unknown>>) {
      stateByIdx.set(Number(s.item_index), s);
    }

    // Return only the fields the supplier needs. Don't leak emails, internal
    // IDs, or full audit context. Each item now carries TWO independent doc
    // slots: md (Material Declaration) and sdoc (Supplier Declaration of
    // Conformity). The legacy mds* fields remain for back-compat and mirror
    // the MD slot.
    const items = suspected.map((row, idx) => {
      const r = Array.isArray(row) ? row : [];
      const state = stateByIdx.get(idx) ?? {};
      const mdStatus = String(state.mds_status ?? 'pending');
      const sdocStatus = String(state.sdoc_status ?? 'pending');
      return {
        index: idx,
        poNumber: String(r[2] ?? ''),
        itemDescription: String(r[6] ?? ''),
        equipmentName: String(r[11] ?? ''),
        quantity: String(r[16] ?? ''),
        md: {
          status: mdStatus,
          fileName: state.mds_file_name ? String(state.mds_file_name) : null,
          filePath: state.mds_file_path ? String(state.mds_file_path) : null,
          receivedAt: state.mds_received_at ? String(state.mds_received_at) : null,
        },
        sdoc: {
          status: sdocStatus,
          fileName: state.sdoc_file_name ? String(state.sdoc_file_name) : null,
          filePath: state.sdoc_file_path ? String(state.sdoc_file_path) : null,
          receivedAt: state.sdoc_received_at ? String(state.sdoc_received_at) : null,
        },
        // Legacy mirrors of MD slot — older clients still read these.
        mdsStatus: mdStatus,
        mdsFileName: state.mds_file_name ? String(state.mds_file_name) : null,
        mdsFilePath: state.mds_file_path ? String(state.mds_file_path) : null,
        mdsReceivedAt: state.mds_received_at ? String(state.mds_received_at) : null,
      };
    });

    res.json({
      success: true,
      data: {
        vesselName: clarification.vessel_name,
        imoNumber: clarification.imo_number,
        subject: clarification.subject,
        sentAt: clarification.created_at,
        supplierCompany: clarification.supplier_company,
        supplierContactName: clarification.supplier_contact_name,
        supplierComments: clarification.supplier_comments,
        preparedDate: clarification.prepared_date,
        submittedAt: clarification.submitted_at,
        items,
      },
    });
  } catch (err) { next(err); }
}

/** Coerce a path/body kind value to one of the two supported document slots. */
function parseKind(raw: unknown): 'md' | 'sdoc' | null {
  const s = String(raw ?? '').trim().toLowerCase();
  if (s === 'md' || s === 'mds') return 'md';
  if (s === 'sdoc' || s === 'sdocs') return 'sdoc';
  return null;
}

/** Column tuple for the requested document slot. MD reuses legacy mds_*. */
function colsForKind(kind: 'md' | 'sdoc') {
  return kind === 'sdoc'
    ? { status: 'sdoc_status', path: 'sdoc_file_path', name: 'sdoc_file_name', at: 'sdoc_received_at' }
    : { status: 'mds_status',  path: 'mds_file_path',  name: 'mds_file_name',  at: 'mds_received_at' };
}

/**
 * POST /api/v1/public/clarifications/:token/items/:idx/document/:kind
 * kind ∈ { 'md', 'sdoc' }
 * multipart: file (PDF/image/office doc), email (must match recipients),
 *            supplierCompany (required), supplierContactName (required),
 *            supplierComments (optional), preparedDate (optional)
 *
 * Upload is blocked until supplierCompany + supplierContactName are set.
 * Each item carries two independent doc slots — MD and SDoC — populated
 * separately by the supplier. The slot is selected by the :kind segment.
 */
export async function uploadPublicMdsDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) return next(createError('File required', 400));

    const token = req.params.token as string;
    const itemIndex = Number(req.params.idx);
    if (!Number.isFinite(itemIndex) || itemIndex < 0) {
      return next(createError('Invalid item index', 400));
    }
    const kind = parseKind(req.params.kind);
    if (!kind) return next(createError("Invalid document kind. Expected 'md' or 'sdoc'.", 400));

    const clarification = await getByTokenIfValid(token);
    if (!clarification) return next(createError('Link not found or expired', 404));

    const body = req.body as Record<string, string>;
    const uploaderEmail = body.email?.trim() || '';
    if (!uploaderEmail || !uploaderEmail.includes('@')) {
      return next(createError('A valid email is required', 400));
    }
    if (!emailMatchesRecipients(uploaderEmail, clarification)) {
      return next(createError('Email does not match the address this link was sent to', 403));
    }

    const supplierCompany = body.supplierCompany?.trim() || '';
    const supplierContactName = body.supplierContactName?.trim() || '';
    if (!supplierCompany) return next(createError('Supplier company is required', 400));
    if (!supplierContactName) return next(createError('Contact person is required', 400));
    const supplierComments = body.supplierComments?.trim() || null;
    const preparedDate = body.preparedDate?.trim() || null;

    const stored = await persistUploadedFile(req.file.path, req.file.originalname, kind);
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || null;

    // Persist supplier fields on the clarification request (last write wins).
    await query(
      `UPDATE clarification_requests
          SET supplier_company = $2,
              supplier_contact_name = $3,
              supplier_comments = COALESCE($4, supplier_comments),
              prepared_date = COALESCE($5, prepared_date)
        WHERE id = $1`,
      [clarification.id, supplierCompany, supplierContactName, supplierComments, preparedDate],
    );

    const c = colsForKind(kind);
    const upd = await query(
      `UPDATE clarification_items
          SET ${c.status} = 'received',
              ${c.path}   = $3,
              ${c.name}   = $4,
              ${c.at}     = NOW(),
              uploaded_by_email = $5,
              uploaded_by_ip    = $6,
              updated_at        = NOW()
        WHERE clarification_id = $1 AND item_index = $2
      RETURNING item_index,
                mds_status,  mds_file_name,  mds_file_path,  mds_received_at,
                sdoc_status, sdoc_file_name, sdoc_file_path, sdoc_received_at`,
      [clarification.id, itemIndex, stored.url, stored.name, uploaderEmail, ip],
    );
    if (upd.rows.length === 0) return next(createError('Item not found for this link', 404));

    res.json({ success: true, data: upd.rows[0] });
  } catch (err) { next(err); }
}

/**
 * DELETE /api/v1/public/clarifications/:token/items/:idx/document/:kind
 * kind ∈ { 'md', 'sdoc' }
 * Removes the uploaded document for one slot of one item so the supplier
 * can re-upload. Requires the matching email in the request body.
 */
export async function deletePublicMdsDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.params.token as string;
    const itemIndex = Number(req.params.idx);
    if (!Number.isFinite(itemIndex) || itemIndex < 0) {
      return next(createError('Invalid item index', 400));
    }
    const kind = parseKind(req.params.kind);
    if (!kind) return next(createError("Invalid document kind. Expected 'md' or 'sdoc'.", 400));

    const clarification = await getByTokenIfValid(token);
    if (!clarification) return next(createError('Link not found or expired', 404));

    const email = (req.body as Record<string, string>).email?.trim() || '';
    if (!emailMatchesRecipients(email, clarification)) {
      return next(createError('Email does not match the address this link was sent to', 403));
    }

    const c = colsForKind(kind);
    const existing = await query(
      `SELECT ${c.path} AS file_path FROM clarification_items
        WHERE clarification_id = $1 AND item_index = $2`,
      [clarification.id, itemIndex],
    );
    const filePath = existing.rows[0]?.file_path as string | undefined;

    // Best-effort remove from R2/Supabase. Skip if we can't derive a key.
    if (filePath) {
      const key = filePath.split('/').slice(-2).join('/'); // e.g. "md/xxx.pdf" or "sdoc/xxx.pdf"
      await deleteStoredFile(key);
    }

    await query(
      `UPDATE clarification_items
          SET ${c.status} = 'pending',
              ${c.path}   = NULL,
              ${c.name}   = NULL,
              ${c.at}     = NULL,
              updated_at  = NOW()
        WHERE clarification_id = $1 AND item_index = $2`,
      [clarification.id, itemIndex],
    );

    res.json({ success: true });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/public/clarifications/:token/submit
 * Supplier finalises their submission. Marks submitted_at on the
 * clarification; items already uploaded keep status='received', items
 * without a doc stay 'pending' (admin can chase them separately).
 */
export async function submitPublicClarification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.params.token as string;
    const clarification = await getByTokenIfValid(token);
    if (!clarification) return next(createError('Link not found or expired', 404));

    const body = req.body as Record<string, string>;
    const email = body.email?.trim() || '';
    if (!emailMatchesRecipients(email, clarification)) {
      return next(createError('Email does not match the address this link was sent to', 403));
    }

    const supplierCompany = body.supplierCompany?.trim() || null;
    const supplierContactName = body.supplierContactName?.trim() || null;
    const supplierComments = body.supplierComments?.trim() || null;
    const preparedDate = body.preparedDate?.trim() || null;

    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || null;

    await query(
      `UPDATE clarification_requests
          SET supplier_company = COALESCE($2, supplier_company),
              supplier_contact_name = COALESCE($3, supplier_contact_name),
              supplier_comments = COALESCE($4, supplier_comments),
              prepared_date = COALESCE($5, prepared_date),
              submitted_at = NOW(),
              submitted_by_ip = $6,
              status = 'submitted'
        WHERE id = $1`,
      [clarification.id, supplierCompany, supplierContactName, supplierComments, preparedDate, ip],
    );

    res.json({ success: true });
  } catch (err) { next(err); }
}
