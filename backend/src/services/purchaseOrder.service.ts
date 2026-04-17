import { query } from '../config/database.js';

const PO_FIELD_MAP: Record<string, string> = {
  poNumber: 'po_number',
  supplierName: 'supplier_name',
  supplierCode: 'supplier_code',
  status: 'status',
  totalItems: 'total_items',
  totalAmount: 'total_amount',
  currency: 'currency',
  poDate: 'po_date',
  description: 'description',
  fileName: 'file_name',
  filePath: 'file_path',
};

const REVERSE: Record<string, string> = {};
for (const [c, s] of Object.entries(PO_FIELD_MAP)) REVERSE[s] = c;
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
  for (const [c, s] of Object.entries(PO_FIELD_MAP)) {
    if (c in data && data[c] !== undefined) {
      cols.push(s);
      vals.push(data[c]);
    }
  }
  return { cols, vals };
}

export const PurchaseOrderService = {
  async listForUser(userId: string, filters?: { vesselId?: string; status?: string; supplierName?: string }) {
    let sql = `SELECT po.*, v.name AS vessel_name FROM purchase_orders po
               JOIN vessels v ON po.vessel_id = v.id
               WHERE v.created_by_id = $1`;
    const params: unknown[] = [userId];
    let i = 2;

    if (filters?.vesselId) { sql += ` AND po.vessel_id = $${i++}`; params.push(filters.vesselId); }
    if (filters?.status) { sql += ` AND po.status = $${i++}`; params.push(filters.status); }
    if (filters?.supplierName) {
      sql += ` AND po.supplier_name ILIKE $${i++}`;
      params.push(`%${filters.supplierName}%`);
    }

    sql += ' ORDER BY po.created_at DESC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => ({ ...toApi(row), vesselName: row.vessel_name }));
  },

  async getById(id: string, userId: string) {
    const r = await query(
      `SELECT po.* FROM purchase_orders po
       JOIN vessels v ON po.vessel_id = v.id
       WHERE po.id = $1 AND v.created_by_id = $2`,
      [id, userId],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>, vesselId: string) {
    const { cols, vals } = extract(data);
    cols.push('vessel_id');
    vals.push(vesselId);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO purchase_orders (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
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
      `UPDATE purchase_orders SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async delete(id: string) {
    await query('DELETE FROM purchase_orders WHERE id = $1', [id]);
  },

  /** Group POs by supplier — for the supplier-mapped view */
  async getBySupplierForVessel(vesselId: string) {
    const r = await query(
      `SELECT supplier_name, supplier_code, COUNT(*)::int AS po_count,
              SUM(total_items)::int AS total_items,
              array_agg(json_build_object('id', id, 'poNumber', po_number, 'status', status)) AS pos
       FROM purchase_orders
       WHERE vessel_id = $1
       GROUP BY supplier_name, supplier_code
       ORDER BY supplier_name`,
      [vesselId],
    );
    return r.rows;
  },
};
