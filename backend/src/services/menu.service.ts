// -- Menu Items Service -------------------------------------
import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  title: 'title',
  description: 'description',
  path: 'path',
  icon: 'icon',
  sortOrder: 'sort_order',
  archived: 'archived',
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

export const MenuService = {
  async list(archived = false) {
    const r = await query(
      `SELECT * FROM menu_items WHERE archived = $1 ORDER BY sort_order ASC, title ASC`,
      [archived],
    );
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  async getById(id: string) {
    const r = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>) {
    if (!data.title || !data.path) throw new Error('title and path are required');
    const { cols, vals } = extract(data);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO menu_items (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
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
      `UPDATE menu_items SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async archive(id: string) {
    const r = await query(
      `UPDATE menu_items SET archived = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async restore(id: string) {
    const r = await query(
      `UPDATE menu_items SET archived = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async delete(id: string) {
    await query('DELETE FROM menu_items WHERE id = $1', [id]);
  },
};
