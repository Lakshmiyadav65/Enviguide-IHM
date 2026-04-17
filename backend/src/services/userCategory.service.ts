// -- User Categories Service --------------------------------
import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  name: 'name',
  description: 'description',
  status: 'status',
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

export const UserCategoryService = {
  async list(filters?: { archived?: boolean; search?: string }) {
    let sql = `SELECT c.*, COALESCE(uc.user_count, 0)::int AS user_count
               FROM user_categories c
               LEFT JOIN (
                 SELECT category, COUNT(*) AS user_count FROM users GROUP BY category
               ) uc ON uc.category = c.name
               WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;

    if (filters?.archived !== undefined) {
      sql += ` AND c.archived = $${i++}`;
      params.push(filters.archived);
    }
    if (filters?.search) {
      sql += ` AND c.name ILIKE $${i++}`;
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY c.name ASC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => ({
      ...toApi(row),
      userCount: row.user_count,
    }));
  },

  async getById(id: string) {
    const r = await query('SELECT * FROM user_categories WHERE id = $1', [id]);
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>) {
    if (!data.name) throw new Error('name is required');
    const existing = await query('SELECT id FROM user_categories WHERE name = $1', [data.name]);
    if (existing.rows[0]) throw new Error('Category name already exists');

    const { cols, vals } = extract(data);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO user_categories (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
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
      `UPDATE user_categories SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async delete(id: string) {
    await query('DELETE FROM user_categories WHERE id = $1', [id]);
  },

  async setArchived(id: string, archived: boolean) {
    const r = await query(
      `UPDATE user_categories SET archived = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [archived, id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },
};
