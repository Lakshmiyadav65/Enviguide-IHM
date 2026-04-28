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

  /**
   * Get audits with status 'In Progress' or 'Pending' (Pending Audits Registry).
   *
   * Status alone drives the registry — post-clarification audits live under
   * the dedicated 'Awaiting Clarification' status (set by sendClarificationEmail)
   * so they don't collide with fresh uploads, and a re-upload resets the
   * audit back to 'In Progress'. No clarification-existence subquery needed.
   */
  async getPendingAudits(userId: string) {
    const r = await query(
      `SELECT a.* FROM audit_summaries a
         JOIN vessels v ON a.vessel_id = v.id
        WHERE v.created_by_id = $1
          AND a.status IN ('In Progress', 'Pending')
        ORDER BY a.last_activity DESC`,
      [userId],
    );
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  /** Get audits with status 'Pending Review' (Pending Reviews Registry) */
  async getPendingReviews(userId: string) {
    // Status alone drives this list. The audit's status flips back to
    // 'In Progress' inside sendClarificationEmail when a Send-Mail succeeds,
    // so post-clarification rows naturally fall out of this query — no
    // clarification-existence subquery needed (and historic clarifications
    // shouldn't disqualify a fresh Send-for-Review).
    const r = await query(
      `SELECT a.* FROM audit_summaries a
         JOIN vessels v ON a.vessel_id = v.id
        WHERE v.created_by_id = $1
          AND a.status = 'Pending Review'
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

  /** Fetch clarifications for an IMO (most recent first), with per-item state. */
  async getClarificationsForImo(imoNumber: string) {
    const r = await query(
      `SELECT id, vessel_id, imo_number, vessel_name, recipient_emails, cc_emails,
              subject, body, suspected_items, status, error_message, sent_by, created_at
         FROM clarification_requests
        WHERE imo_number = $1
        ORDER BY created_at DESC`,
      [imoNumber],
    );
    const clarifications = r.rows as Array<Record<string, unknown>>;
    if (clarifications.length === 0) return [];

    const ids = clarifications.map((c) => c.id);
    const itemsRes = await query(
      `SELECT clarification_id, item_index,
              mds_status,  mds_file_path,  mds_file_name,  mds_received_at,
              sdoc_status, sdoc_file_path, sdoc_file_name, sdoc_received_at,
              reminder_count, hm_status, reviewed_at, reviewed_by,
              notes, updated_at
         FROM clarification_items
        WHERE clarification_id = ANY($1::uuid[])
        ORDER BY item_index ASC`,
      [ids],
    );

    // Group items by clarification_id.
    const byClar: Record<string, Array<Record<string, unknown>>> = {};
    for (const row of itemsRes.rows as Array<Record<string, unknown>>) {
      const key = String(row.clarification_id);
      if (!byClar[key]) byClar[key] = [];
      byClar[key].push(row);
    }

    return clarifications.map((c) => ({
      ...c,
      items: byClar[String(c.id)] ?? [],
    }));
  },

  /**
   * Aggregate rows for the MD SDoC Audit Pending page: one row per vessel
   * that has at least one clarification item, with counts + last submission.
   */
  async getMdsPendingOverview(userId: string) {
    const r = await query(
      `SELECT
          a.imo_number,
          a.vessel_name,
          a.total_po,
          a.id AS audit_id,
          -- Per-doc counts (MD = legacy mds_*, SDoC = new sdoc_*).
          COUNT(ci.id) FILTER (WHERE ci.mds_status  = 'pending')  AS pending_md,
          COUNT(ci.id) FILTER (WHERE ci.mds_status  = 'received') AS received_md,
          COUNT(ci.id) FILTER (WHERE ci.sdoc_status = 'pending')  AS pending_sdoc,
          COUNT(ci.id) FILTER (WHERE ci.sdoc_status = 'received') AS received_sdoc,
          -- Combined "MDS" counts: pending if either doc is pending,
          -- received only when both are in. Drives the legacy header tiles.
          COUNT(ci.id) FILTER (
            WHERE ci.mds_status = 'pending' OR ci.sdoc_status = 'pending'
          ) AS pending_mds,
          COUNT(ci.id) FILTER (
            WHERE ci.mds_status = 'received' AND ci.sdoc_status = 'received'
          ) AS received_mds,
          COUNT(ci.id)                                          AS total_clarification_items,
          COUNT(DISTINCT cr.id)                                 AS clarification_count,
          BOOL_OR(cr.submitted_at IS NOT NULL)                  AS any_submitted,
          GREATEST(
            MAX(ci.mds_received_at),
            MAX(ci.sdoc_received_at)
          )                                                     AS last_received_at,
          MAX(cr.submitted_at)                                  AS last_submitted_at
        FROM audit_summaries a
        JOIN vessels v ON v.id = a.vessel_id
        LEFT JOIN clarification_requests cr ON cr.vessel_id = a.vessel_id
        LEFT JOIN clarification_items ci   ON ci.clarification_id = cr.id
       WHERE v.created_by_id = $1
       GROUP BY a.id
       HAVING COUNT(ci.id) > 0
       ORDER BY MAX(COALESCE(ci.mds_received_at, cr.created_at)) DESC NULLS LAST`,
      [userId],
    );
    return r.rows as Array<Record<string, unknown>>;
  },

  /**
   * Line items for a vessel's active audit, annotated with clarification
   * state when the item was emailed. Used by the PO viewer's All / Pending /
   * Received filters. Matches line items to clarification_items by PO number
   * within the vessel (PO numbers are unique per upload).
   *
   * If no active audit exists for the vessel but clarification_items do, we
   * still return them as synthetic rows so the admin can see what's pending.
   */
  async getVesselPoItems(vesselId: string, userId: string) {
    // Verify the caller owns this vessel before returning anything.
    const ownershipRes = await query(
      `SELECT 1 FROM vessels WHERE id = $1 AND created_by_id = $2 LIMIT 1`,
      [vesselId, userId],
    );
    if (ownershipRes.rows.length === 0) {
      return { items: [] as Array<Record<string, unknown>>, auditId: null };
    }

    // Pick the newest non-Completed audit for the vessel — may be null.
    // 'Awaiting Clarification' is a live audit too (clarifications dispatched,
    // waiting on supplier responses); the PO viewer must still show its line
    // items so the admin can see Received MDS / Pending MDS rows.
    const auditRes = await query(
      `SELECT a.id FROM audit_summaries a
        WHERE a.vessel_id = $1
          AND a.status IN ('In Progress', 'Pending', 'Pending Review', 'Awaiting Clarification', 'submitted')
        ORDER BY a.created_at DESC
        LIMIT 1`,
      [vesselId],
    );
    const auditId = auditRes.rows.length > 0
      ? String((auditRes.rows[0] as Record<string, unknown>).id)
      : null;

    const itemsRes = auditId
      ? await query(
          `SELECT row_index, name, vessel_name, po_number, imo_number,
                  po_sent_date, md_requested_date, item_description, is_suspected,
                  impa_code, issa_code, equipment_code, equipment_name,
                  maker, model, part_number, unit, quantity,
                  vendor_remark, vendor_email, vendor_name
             FROM audit_line_items
            WHERE audit_id = $1
            ORDER BY row_index ASC`,
          [auditId],
        )
      : { rows: [] as Array<Record<string, unknown>> };

    // Gather clarification state keyed by PO number. If a PO was referenced
    // in multiple clarification emails, the newest wins.
    const clarRes = await query(
      `SELECT cr.id AS clarification_id, cr.created_at,
              cr.suspected_items, cr.submitted_at, cr.status AS cr_status,
              ci.item_index,
              ci.mds_status,  ci.mds_file_name,  ci.mds_file_path,  ci.mds_received_at,
              ci.sdoc_status, ci.sdoc_file_name, ci.sdoc_file_path, ci.sdoc_received_at,
              ci.reminder_count, ci.hm_status, ci.reviewed_at, ci.reviewed_by
         FROM clarification_requests cr
         LEFT JOIN clarification_items ci ON ci.clarification_id = cr.id
        WHERE cr.vessel_id = $1
        ORDER BY cr.created_at ASC`,
      [vesselId],
    );

    type Clar = {
      clarification_id: string;
      created_at: string;
      suspected_items: unknown;
      submitted_at: string | null;
      cr_status: string;
      item_index: number | null;
      mds_status: string | null;
      mds_file_name: string | null;
      mds_file_path: string | null;
      mds_received_at: string | null;
      sdoc_status: string | null;
      sdoc_file_name: string | null;
      sdoc_file_path: string | null;
      sdoc_received_at: string | null;
      reminder_count: number | null;
      hm_status: string | null;
      reviewed_at: string | null;
      reviewed_by: string | null;
    };
    const stateByPO = new Map<string, {
      clarificationId: string;
      itemIndex: number;
      mdStatus: string;
      mdFileName: string | null;
      mdFilePath: string | null;
      mdReceivedAt: string | null;
      sdocStatus: string;
      sdocFileName: string | null;
      sdocFilePath: string | null;
      sdocReceivedAt: string | null;
      reminderCount: number;
      submittedAt: string | null;
      hmStatus: string | null;
      reviewedAt: string | null;
      reviewedBy: string | null;
    }>();

    for (const row of clarRes.rows as Clar[]) {
      if (row.item_index == null) continue;
      const suspected = Array.isArray(row.suspected_items) ? row.suspected_items as unknown[][] : [];
      const r = suspected[row.item_index];
      if (!Array.isArray(r)) continue;
      const poNumber = String(r[2] ?? '').trim();
      if (!poNumber) continue;
      stateByPO.set(poNumber, {
        clarificationId: row.clarification_id,
        itemIndex: row.item_index,
        mdStatus: row.mds_status ?? 'pending',
        mdFileName: row.mds_file_name,
        mdFilePath: row.mds_file_path,
        mdReceivedAt: row.mds_received_at,
        sdocStatus: row.sdoc_status ?? 'pending',
        sdocFileName: row.sdoc_file_name,
        sdocFilePath: row.sdoc_file_path,
        sdocReceivedAt: row.sdoc_received_at,
        reminderCount: row.reminder_count ?? 0,
        submittedAt: row.submitted_at,
        hmStatus: row.hm_status,
        reviewedAt: row.reviewed_at,
        reviewedBy: row.reviewed_by,
      });
    }

    // Combined "MDS" status: 'received' only when BOTH MD and SDoC are in.
    // 'pending' if either is still missing. 'none' when there is no
    // clarification at all for the row.
    const combinedStatus = (md: string, sdoc: string): string => (
      md === 'received' && sdoc === 'received' ? 'received' : 'pending'
    );

    const items: Array<Record<string, unknown>> = itemsRes.rows.map((row) => {
      const r = row as Record<string, unknown>;
      const po = String(r.po_number ?? '').trim();
      const state = stateByPO.get(po);
      return {
        ...r,
        clarification_id: state?.clarificationId ?? null,
        clarification_item_index: state?.itemIndex ?? null,
        // Per-doc state
        md_status: state?.mdStatus ?? 'none',
        md_file_name: state?.mdFileName ?? null,
        md_file_path: state?.mdFilePath ?? null,
        md_received_at: state?.mdReceivedAt ?? null,
        sdoc_status: state?.sdocStatus ?? 'none',
        sdoc_file_name: state?.sdocFileName ?? null,
        sdoc_file_path: state?.sdocFilePath ?? null,
        sdoc_received_at: state?.sdocReceivedAt ?? null,
        // Combined "MDS" status (back-compat field used by the PO viewer's
        // Received Mds / Pending Mds filters).
        mds_status: state ? combinedStatus(state.mdStatus, state.sdocStatus) : 'none',
        // Legacy aliases — point at the MD slot. These are only read by older
        // code paths still using the single-doc model; new code should consume
        // md_*/sdoc_* explicitly.
        mds_file_name: state?.mdFileName ?? null,
        mds_file_path: state?.mdFilePath ?? null,
        mds_received_at: state?.mdReceivedAt ?? null,
        reminder_count: state?.reminderCount ?? 0,
        submitted_at: state?.submittedAt ?? null,
        hm_status: state?.hmStatus ?? null,
        // Per-item admin review (drives the 'Reviewed Mds' filter pill).
        reviewed_at: state?.reviewedAt ?? null,
        reviewed_by: state?.reviewedBy ?? null,
      };
    });

    // Rescue orphan clarification items — rows that were previously in
    // audit_line_items but got stripped (legacy bug after Send Mail). Rebuild
    // the row from the suspected_items snapshot stored on clarification_requests
    // and append so the PO viewer still shows them in Suspected / Received /
    // Pending Mds tabs.
    const existingPOs = new Set(items.map((i) => String(i.po_number ?? '').trim()).filter(Boolean));
    const standardHeaderCols = [
      'name', 'vessel_name', 'po_number', 'imo_number',
      'po_sent_date', 'md_requested_date', 'item_description', 'is_suspected',
      'impa_code', 'issa_code', 'equipment_code', 'equipment_name',
      'maker', 'model', 'part_number', 'unit', 'quantity',
      'vendor_remark', 'vendor_email', 'vendor_name',
    ];
    const orphanMap = new Map<string, Record<string, unknown>>();
    for (const row of clarRes.rows as Clar[]) {
      if (row.item_index == null) continue;
      const suspected = Array.isArray(row.suspected_items) ? row.suspected_items as unknown[][] : [];
      const r = suspected[row.item_index];
      if (!Array.isArray(r)) continue;
      const po = String(r[2] ?? '').trim();
      if (!po || existingPOs.has(po) || orphanMap.has(po)) continue;

      const mdSt = row.mds_status ?? 'pending';
      const sdocSt = row.sdoc_status ?? 'pending';
      const synth: Record<string, unknown> = {
        row_index: -1,
        extra_data: {},
        clarification_id: row.clarification_id,
        clarification_item_index: row.item_index,
        // Per-doc state
        md_status: mdSt,
        md_file_name: row.mds_file_name,
        md_file_path: row.mds_file_path,
        md_received_at: row.mds_received_at,
        sdoc_status: sdocSt,
        sdoc_file_name: row.sdoc_file_name,
        sdoc_file_path: row.sdoc_file_path,
        sdoc_received_at: row.sdoc_received_at,
        // Combined back-compat fields (received iff both arrived).
        mds_status: mdSt === 'received' && sdocSt === 'received' ? 'received' : 'pending',
        mds_file_name: row.mds_file_name,
        mds_file_path: row.mds_file_path,
        mds_received_at: row.mds_received_at,
        reminder_count: row.reminder_count ?? 0,
        submitted_at: row.submitted_at,
        hm_status: row.hm_status ?? null,
        reviewed_at: row.reviewed_at ?? null,
        reviewed_by: row.reviewed_by ?? null,
      };
      standardHeaderCols.forEach((col, idx) => {
        synth[col] = col === 'is_suspected' ? 'Yes' : (r[idx] ?? null);
      });
      orphanMap.set(po, synth);
    }

    return { items: [...items, ...orphanMap.values()], auditId };
  },

  /** Fetch a single clarification_item row (for ownership checks before update). */
  async getClarificationItem(clarificationId: string, itemIndex: number) {
    const r = await query(
      `SELECT ci.*, cr.imo_number, cr.vessel_id
         FROM clarification_items ci
         JOIN clarification_requests cr ON cr.id = ci.clarification_id
        WHERE ci.clarification_id = $1 AND ci.item_index = $2
        LIMIT 1`,
      [clarificationId, itemIndex],
    );
    return r.rows[0] as Record<string, unknown> | undefined;
  },

  /**
   * Fetch a clarification + the item, joined, for a reminder re-send. Returns
   * enough columns to build the email (recipients, subject, public_token) and
   * to verify ownership via imo_number.
   */
  async getClarificationForReminder(clarificationId: string, itemIndex: number) {
    const r = await query(
      `SELECT cr.id, cr.imo_number, cr.vessel_id, cr.vessel_name,
              cr.recipient_emails, cr.cc_emails, cr.subject,
              cr.public_token, cr.public_token_expires_at
         FROM clarification_requests cr
         JOIN clarification_items ci ON ci.clarification_id = cr.id
        WHERE cr.id = $1 AND ci.item_index = $2
        LIMIT 1`,
      [clarificationId, itemIndex],
    );
    return r.rows[0] as Record<string, unknown> | undefined;
  },

  /**
   * After a reminder email has been sent, bump the item's reminder_count and
   * extend the clarification's public link expiry so the supplier can still
   * use it.
   */
  async incrementReminderAndExtendToken(
    clarificationId: string,
    itemIndex: number,
    newExpiresAt: Date,
  ) {
    const r = await query(
      `UPDATE clarification_items
          SET reminder_count = reminder_count + 1, updated_at = NOW()
        WHERE clarification_id = $1 AND item_index = $2
      RETURNING item_index, reminder_count`,
      [clarificationId, itemIndex],
    );
    await query(
      `UPDATE clarification_requests
          SET public_token_expires_at = $2
        WHERE id = $1`,
      [clarificationId, newExpiresAt],
    );
    return r.rows[0] as Record<string, unknown> | undefined;
  },

  /**
   * Attach an uploaded supplier document to a clarification item.
   * @param kind 'md' (Material Declaration) or 'sdoc' (Supplier Declaration of
   *             Conformity). MD is stored in mds_* columns (legacy slot reused),
   *             SDoC in the dedicated sdoc_* columns.
   */
  async setClarificationItemDocument(
    clarificationId: string,
    itemIndex: number,
    kind: 'md' | 'sdoc',
    filePath: string,
    fileName: string,
  ) {
    const cols = kind === 'sdoc'
      ? { status: 'sdoc_status', path: 'sdoc_file_path', name: 'sdoc_file_name', at: 'sdoc_received_at' }
      : { status: 'mds_status',  path: 'mds_file_path',  name: 'mds_file_name',  at: 'mds_received_at' };

    const r = await query(
      `UPDATE clarification_items
          SET ${cols.status} = 'received',
              ${cols.path}   = $3,
              ${cols.name}   = $4,
              ${cols.at}     = NOW(),
              updated_at     = NOW()
        WHERE clarification_id = $1 AND item_index = $2
      RETURNING *`,
      [clarificationId, itemIndex, filePath, fileName],
    );
    return r.rows[0] as Record<string, unknown> | undefined;
  },

  /**
   * Mark a clarification item as reviewed by the admin. Sets reviewed_at to
   * NOW() and stores the reviewer identity. Returns the updated row so the
   * controller can echo the review timestamp to the frontend.
   */
  async markClarificationItemReviewed(
    clarificationId: string,
    itemIndex: number,
    reviewedBy: string,
  ) {
    const r = await query(
      `UPDATE clarification_items
          SET reviewed_at = NOW(),
              reviewed_by = $3,
              updated_at  = NOW()
        WHERE clarification_id = $1 AND item_index = $2
      RETURNING item_index, reviewed_at, reviewed_by`,
      [clarificationId, itemIndex, reviewedBy],
    );
    return r.rows[0] as Record<string, unknown> | undefined;
  },

  /**
   * Clear the uploaded document for a kind (MD or SDoC) so the supplier can
   * re-upload. Returns the file path that was previously stored so the caller
   * can delete it from object storage.
   */
  async clearClarificationItemDocument(
    clarificationId: string,
    itemIndex: number,
    kind: 'md' | 'sdoc',
  ): Promise<string | null> {
    const cols = kind === 'sdoc'
      ? { status: 'sdoc_status', path: 'sdoc_file_path', name: 'sdoc_file_name', at: 'sdoc_received_at' }
      : { status: 'mds_status',  path: 'mds_file_path',  name: 'mds_file_name',  at: 'mds_received_at' };

    const existing = await query(
      `SELECT ${cols.path} AS file_path FROM clarification_items
        WHERE clarification_id = $1 AND item_index = $2`,
      [clarificationId, itemIndex],
    );
    const filePath = (existing.rows[0]?.file_path as string | undefined) ?? null;

    await query(
      `UPDATE clarification_items
          SET ${cols.status} = 'pending',
              ${cols.path}   = NULL,
              ${cols.name}   = NULL,
              ${cols.at}     = NULL,
              updated_at     = NOW()
        WHERE clarification_id = $1 AND item_index = $2`,
      [clarificationId, itemIndex],
    );
    return filePath;
  },
};
