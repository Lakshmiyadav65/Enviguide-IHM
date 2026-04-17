// -- Suppliers Service --------------------------------------
import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  name: 'name',
  category: 'category',
  location: 'location',
  contactEmail: 'contact_email',
  phone: 'phone',
  rating: 'rating',
  status: 'status',
  notes: 'notes',
};

const REVERSE: Record<string, string> = {};
for (const [c, s] of Object.entries(FIELD_MAP)) REVERSE[s] = c;
REVERSE['id'] = 'id';
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

export const SupplierService = {
  async list(filters?: { category?: string; location?: string; search?: string }) {
    let sql = `SELECT * FROM suppliers WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;

    if (filters?.category) { sql += ` AND category = $${i++}`; params.push(filters.category); }
    if (filters?.location) { sql += ` AND location = $${i++}`; params.push(filters.location); }
    if (filters?.search) {
      sql += ` AND (name ILIKE $${i} OR category ILIKE $${i} OR location ILIKE $${i})`;
      params.push(`%${filters.search}%`);
      i++;
    }

    sql += ' ORDER BY name ASC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  async getById(id: string) {
    const r = await query('SELECT * FROM suppliers WHERE id = $1', [id]);
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>) {
    if (!data.name) throw new Error('name is required');
    const { cols, vals } = extract(data);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO suppliers (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
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
      `UPDATE suppliers SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async delete(id: string) {
    await query('DELETE FROM suppliers WHERE id = $1', [id]);
  },
};
