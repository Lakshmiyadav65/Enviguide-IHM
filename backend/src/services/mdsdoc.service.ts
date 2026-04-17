import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  poId: 'po_id',
  materialId: 'material_id',
  supplierName: 'supplier_name',
  supplierCode: 'supplier_code',
  itemName: 'item_name',
  ihmPart: 'ihm_part',
  hazardType: 'hazard_type',
  status: 'status',
  reminderCount: 'reminder_count',
  lastReminderAt: 'last_reminder_at',
  receivedAt: 'received_at',
  notes: 'notes',
};

const REVERSE: Record<string, string> = {};
for (const [c, s] of Object.entries(FIELD_MAP)) REVERSE[s] = c;
REVERSE['id'] = 'id';
REVERSE['vessel_id'] = 'vesselId';
REVERSE['created_at'] = 'createdAt';
REVERSE['updated_at'] = 'updatedAt';

function toApi(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[REVERSE[k] || k] = v;
  return out;
}

function extract(data: Record<string, unknown>) {
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

export const MdSDocService = {
  /** List requests grouped by status (Pending, Received, Reminder, etc.) */
  async listForVessel(vesselId: string, status?: string) {
    let sql = 'SELECT * FROM md_sdoc_requests WHERE vessel_id = $1';
    const params: unknown[] = [vesselId];
    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }
    sql += ' ORDER BY supplier_name, created_at DESC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  /** Get all requests grouped by supplier (for the Request Pending UI) */
  async getGroupedBySupplier(vesselId: string, status?: string) {
    let sql = `SELECT supplier_name, supplier_code,
                      json_agg(json_build_object(
                        'id', id, 'itemName', item_name, 'ihmPart', ihm_part,
                        'hazardType', hazard_type, 'status', status, 'reminderCount', reminder_count
                      )) AS items,
                      COUNT(*)::int AS total_items
               FROM md_sdoc_requests
               WHERE vessel_id = $1`;
    const params: unknown[] = [vesselId];
    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }
    sql += ' GROUP BY supplier_name, supplier_code ORDER BY supplier_name';
    const r = await query(sql, params);
    return r.rows;
  },

  async getById(id: string, vesselId: string) {
    const r = await query(
      'SELECT * FROM md_sdoc_requests WHERE id = $1 AND vessel_id = $2',
      [id, vesselId],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>, vesselId: string) {
    const { cols, vals } = extract(data);
    cols.push('vessel_id');
    vals.push(vesselId);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO md_sdoc_requests (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
      vals,
    );
    return toApi(r.rows[0] as Record<string, unknown>);
  },

  async update(id: string, data: Record<string, unknown>) {
    const { cols, vals } = extract(data);
    if (cols.length === 0) return null;
    const setClauses = cols.map((c, i) => `${c} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    vals.push(id);
    const r = await query(
      `UPDATE md_sdoc_requests SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async sendReminder(id: string) {
    const r = await query(
      `UPDATE md_sdoc_requests
       SET reminder_count = reminder_count + 1,
           last_reminder_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async markReceived(id: string) {
    const r = await query(
      `UPDATE md_sdoc_requests
       SET status = 'Received', received_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  /** Auto-generate requests from suspected hazardous materials (category=hazard, no MD yet) */
  async generateFromHazardousMaterials(vesselId: string) {
    const r = await query(
      `INSERT INTO md_sdoc_requests (vessel_id, material_id, item_name, ihm_part, hazard_type, supplier_name, status)
       SELECT m.vessel_id, m.id, m.name, m.ihm_part, m.hazard_type,
              COALESCE(m.manufacturer, 'Unknown Supplier'), 'Pending'
       FROM materials m
       WHERE m.vessel_id = $1
         AND m.category = 'hazard'
         AND NOT EXISTS (
           SELECT 1 FROM md_sdoc_requests r WHERE r.material_id = m.id
         )
       RETURNING *`,
      [vesselId],
    );
    return { generated: r.rowCount || 0, requests: r.rows.map((row: Record<string, unknown>) => toApi(row)) };
  },
};
