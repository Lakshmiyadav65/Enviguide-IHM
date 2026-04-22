import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  imoNumber: 'imo_number',
  vesselName: 'vessel_name',
  totalPO: 'total_po',
  totalItems: 'total_items',
  duplicatePO: 'duplicate_po',
  duplicateSupplierCode: 'duplicate_supplier_code',
  duplicateProduct: 'duplicate_product',
  status: 'status',
  reviewAssignedTo: 'review_assigned_to',
  reviewedBy: 'reviewed_by',
  reviewedAt: 'reviewed_at',
};

const REVERSE_MAP: Record<string, string> = {};
for (const [c, s] of Object.entries(FIELD_MAP)) REVERSE_MAP[s] = c;
REVERSE_MAP['id'] = 'id';
REVERSE_MAP['vessel_id'] = 'vesselId';
REVERSE_MAP['last_activity'] = 'lastActivity';
REVERSE_MAP['created_at'] = 'createdAt';
REVERSE_MAP['updated_at'] = 'updatedAt';

function toApi(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[REVERSE_MAP[k] || k] = v;
  return out;
}

function extractFields(data: Record<string, unknown>) {
  const cols: string[] = [];
  const vals: unknown[] = [];
  for (const [c, s] of Object.entries(FIELD_MAP)) {
    if (c in data && data[c] !== undefined) {
      cols.push(s);
      vals.push(data[c]);
    }
  }
  return { cols, vals };
}

export const AuditService = {
  /** Get all audits (optionally filter by status) */
  async getAudits(filters?: { status?: string; userId?: string }) {
    let sql = `SELECT a.*, v.created_by_id FROM audit_summaries a
               LEFT JOIN vessels v ON a.vessel_id = v.id WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;

    if (filters?.userId) {
      sql += ` AND v.created_by_id = $${i++}`;
      params.push(filters.userId);
    }
    if (filters?.status) {
      sql += ` AND a.status = $${i++}`;
      params.push(filters.status);
    }

    sql += ' ORDER BY a.created_at DESC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  /** Get audits with status 'In Progress' or 'Pending' (Pending Audits Registry) */
  async getPendingAudits(userId: string) {
    const r = await query(
      `SELECT a.* FROM audit_summaries a
       JOIN vessels v ON a.vessel_id = v.id
       WHERE v.created_by_id = $1 AND a.status IN ('In Progress', 'Pending')
       ORDER BY a.last_activity DESC`,
      [userId],
    );
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  /** Get audits with status 'Pending Review' (Pending Reviews Registry) */
  async getPendingReviews(userId: string) {
    const r = await query(
      `SELECT a.* FROM audit_summaries a
       JOIN vessels v ON a.vessel_id = v.id
       WHERE v.created_by_id = $1 AND a.status = 'Pending Review'
       ORDER BY a.last_activity DESC`,
      [userId],
    );
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  /** Get a specific audit by IMO */
  async getAuditByImo(imoNumber: string, userId: string) {
    const r = await query(
      `SELECT a.* FROM audit_summaries a
       JOIN vessels v ON a.vessel_id = v.id
       WHERE a.imo_number = $1 AND v.created_by_id = $2
       LIMIT 1`,
      [imoNumber, userId],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  /** Get a single audit by ID */
  async getAuditById(id: string, userId: string) {
    const r = await query(
      `SELECT a.* FROM audit_summaries a
       JOIN vessels v ON a.vessel_id = v.id
       WHERE a.id = $1 AND v.created_by_id = $2`,
      [id, userId],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  /** Create an audit summary (typically after a PO upload) */
  async createAudit(data: Record<string, unknown>, vesselId: string) {
    const { cols, vals } = extractFields(data);
    cols.push('vessel_id');
    vals.push(vesselId);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO audit_summaries (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
      vals,
    );
    return toApi(r.rows[0] as Record<string, unknown>);
  },

  /** Update audit (also updates last_activity) */
  async updateAudit(id: string, data: Record<string, unknown>) {
    const { cols, vals } = extractFields(data);
    if (cols.length === 0) return null;
    const setClauses = cols.map((c, i) => `${c} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    setClauses.push('last_activity = NOW()');
    vals.push(id);
    const r = await query(
      `UPDATE audit_summaries SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  /** Send to review — moves from 'In Progress' to 'Pending Review' */
  async sendToReview(id: string, assignedTo?: string) {
    const r = await query(
      `UPDATE audit_summaries
       SET status = 'Pending Review',
           review_assigned_to = $1,
           last_activity = NOW(),
           updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [assignedTo || null, id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  /** Complete review — moves from 'Pending Review' to 'Completed' */
  async completeReview(id: string, reviewedBy: string) {
    const r = await query(
      `UPDATE audit_summaries
       SET status = 'Completed',
           reviewed_by = $1,
           reviewed_at = NOW(),
           last_activity = NOW(),
           updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [reviewedBy, id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  /** Reject review — moves back to 'In Progress' */
  async rejectReview(id: string, reviewedBy: string) {
    const r = await query(
      `UPDATE audit_summaries
       SET status = 'In Progress',
           reviewed_by = $1,
           reviewed_at = NOW(),
           last_activity = NOW(),
           updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [reviewedBy, id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async deleteAudit(id: string) {
    await query('DELETE FROM audit_summaries WHERE id = $1', [id]);
  },

  /** Fetch all line items for an audit, ordered by row_index. */
  async getLineItems(auditId: string) {
    const r = await query(
      `SELECT row_index, name, vessel_name, po_number, imo_number,
              po_sent_date, md_requested_date, item_description, is_suspected,
              impa_code, issa_code, equipment_code, equipment_name,
              maker, model, part_number, unit, quantity,
              vendor_remark, vendor_email, vendor_name, extra_data
         FROM audit_line_items
        WHERE audit_id = $1
        ORDER BY row_index ASC`,
      [auditId],
    );
    return r.rows as Array<Record<string, unknown>>;
  },

  /** Replace all line items for an audit with the given rows (array of array-of-strings). */
  async replaceLineItems(auditId: string, vesselId: string | null, rows: unknown[][]) {
    // Transaction: delete all, then bulk insert new rows in chunks.
    await query('BEGIN');
    try {
      await query('DELETE FROM audit_line_items WHERE audit_id = $1', [auditId]);

      const CHUNK = 1000;
      for (let offset = 0; offset < rows.length; offset += CHUNK) {
        const batch = rows.slice(offset, offset + CHUNK);
        if (batch.length === 0) continue;

        const vals: unknown[] = [];
        const placeholders: string[] = [];

        batch.forEach((row, i) => {
          const rowIndex = offset + i;
          const r = Array.isArray(row) ? row : [];
          const extra = r.slice(20);
          const base = [
            auditId,
            vesselId,
            rowIndex,
            r[0] ?? null,
            r[1] ?? null,
            r[2] ?? null,
            r[3] ?? null,
            r[4] ?? null,
            r[5] ?? null,
            r[6] ?? null,
            r[7] === 'Yes' ? 'Yes' : 'No',
            r[8] ?? null,
            r[9] ?? null,
            r[10] ?? null,
            r[11] ?? null,
            r[12] ?? null,
            r[13] ?? null,
            r[14] ?? null,
            r[15] ?? null,
            r[16] ?? null,
            r[17] ?? null,
            r[18] ?? null,
            r[19] ?? null,
            JSON.stringify(extra),
          ];
          const start = vals.length;
          const phs = base.map((_, j) => `$${start + j + 1}`);
          phs[phs.length - 1] = `${phs[phs.length - 1]}::jsonb`;
          placeholders.push(`(${phs.join(', ')})`);
          vals.push(...base);
        });

        await query(
          `INSERT INTO audit_line_items (
             audit_id, vessel_id, row_index,
             name, vessel_name, po_number, imo_number,
             po_sent_date, md_requested_date, item_description, is_suspected,
             impa_code, issa_code, equipment_code, equipment_name,
             maker, model, part_number, unit, quantity,
             vendor_remark, vendor_email, vendor_name, extra_data
           ) VALUES ${placeholders.join(', ')}`,
          vals,
        );
      }

      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  },

  /** Fetch clarifications for an IMO (most recent first). */
  async getClarificationsForImo(imoNumber: string) {
    const r = await query(
      `SELECT id, vessel_id, imo_number, vessel_name, recipient_emails, cc_emails,
              subject, body, suspected_items, status, error_message, sent_by, created_at
         FROM clarification_requests
        WHERE imo_number = $1
        ORDER BY created_at DESC`,
      [imoNumber],
    );
    return r.rows as Array<Record<string, unknown>>;
  },
};
