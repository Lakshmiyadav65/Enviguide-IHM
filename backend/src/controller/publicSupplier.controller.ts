// -- Public Supplier Portal Controller ---------------------------------
// No-auth endpoints used by the supplier upload page. A clarification
// request's public_token is the only credential; the uploader also
// provides their email for audit.

import type { Request, Response, NextFunction } from 'express';
import { query } from '../config/database.js';
import { persistUploadedFile } from '../services/storage.service.js';
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
}

async function getByTokenIfValid(token: string): Promise<ClarificationRow | null> {
  const r = await query(
    `SELECT id, imo_number, vessel_name, subject, suspected_items,
            public_token, public_token_expires_at, created_at
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
      `SELECT item_index, mds_status, mds_file_name, mds_file_path, mds_received_at, uploaded_by_email
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
    // IDs, or full audit context.
    const items = suspected.map((row, idx) => {
      const r = Array.isArray(row) ? row : [];
      const state = stateByIdx.get(idx) ?? {};
      return {
        index: idx,
        poNumber: String(r[2] ?? ''),
        itemDescription: String(r[6] ?? ''),
        equipmentName: String(r[11] ?? ''),
        quantity: String(r[16] ?? ''),
        mdsStatus: String(state.mds_status ?? 'pending'),
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
        items,
      },
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/public/clarifications/:token/items/:idx/document
 * multipart: file (PDF/image/office doc), email (supplier's email for audit)
 */
export async function uploadPublicMdsDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) return next(createError('File required', 400));

    const token = req.params.token as string;
    const itemIndex = Number(req.params.idx);
    if (!Number.isFinite(itemIndex) || itemIndex < 0) {
      return next(createError('Invalid item index', 400));
    }

    const clarification = await getByTokenIfValid(token);
    if (!clarification) return next(createError('Link not found or expired', 404));

    const uploaderEmail = (req.body as Record<string, string>).email?.trim() || null;
    if (!uploaderEmail || !uploaderEmail.includes('@')) {
      return next(createError('A valid email is required', 400));
    }

    const stored = await persistUploadedFile(req.file.path, req.file.originalname, 'mds');
    const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || null;

    const upd = await query(
      `UPDATE clarification_items
          SET mds_status = 'received',
              mds_file_path = $3,
              mds_file_name = $4,
              mds_received_at = NOW(),
              uploaded_by_email = $5,
              uploaded_by_ip = $6,
              updated_at = NOW()
        WHERE clarification_id = $1 AND item_index = $2
      RETURNING item_index, mds_status, mds_file_name, mds_file_path, mds_received_at`,
      [clarification.id, itemIndex, stored.url, stored.name, uploaderEmail, ip],
    );
    if (upd.rows.length === 0) return next(createError('Item not found for this link', 404));

    res.json({ success: true, data: upd.rows[0] });
  } catch (err) { next(err); }
}
