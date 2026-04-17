// -- User Admin Service -------------------------------------
// CRUD + role assignment + profile update. Distinct from AuthService (login).
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  country: 'country',
  status: 'status',
  category: 'category',
  companyName: 'company_name',
  avatar: 'avatar',
  systemMessage: 'system_message',
  paymentStatus: 'payment_status',
  isLimitedShips: 'is_limited_ships',
  roleName: 'role_name',
  origin: 'origin',
};

const REVERSE: Record<string, string> = {};
for (const [c, s] of Object.entries(FIELD_MAP)) REVERSE[s] = c;
REVERSE['id'] = 'id';
REVERSE['last_activity'] = 'lastActivity';
REVERSE['created_at'] = 'createdAt';
REVERSE['updated_at'] = 'updatedAt';

function toApi(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === 'password') continue;
    out[REVERSE[k] || k] = v;
  }
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

export const UserService = {
  async list(filters?: { status?: string; category?: string; search?: string }) {
    let sql = `SELECT * FROM users WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;

    if (filters?.status) {
      sql += ` AND status = $${i++}`;
      params.push(filters.status);
    }
    if (filters?.category) {
      sql += ` AND category = $${i++}`;
      params.push(filters.category);
    }
    if (filters?.search) {
      sql += ` AND (name ILIKE $${i} OR email ILIKE $${i} OR category ILIKE $${i})`;
      params.push(`%${filters.search}%`);
      i++;
    }

    sql += ' ORDER BY created_at DESC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  async getById(id: string) {
    const r = await query('SELECT * FROM users WHERE id = $1', [id]);
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>) {
    if (!data.email || !data.name || !data.password) {
      throw new Error('email, name and password are required');
    }
    const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing.rows[0]) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(data.password as string, 10);
    const { cols, vals } = extract(data);
    cols.push('password');
    vals.push(hashed);

    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO users (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
      vals,
    );
    return toApi(r.rows[0] as Record<string, unknown>);
  },

  async update(id: string, data: Record<string, unknown>) {
    const { cols, vals } = extract(data);

    if (data.password) {
      cols.push('password');
      vals.push(await bcrypt.hash(data.password as string, 10));
    }

    if (cols.length === 0) return null;

    const setClauses = cols.map((c, i) => `${c} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    vals.push(id);

    const r = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async delete(id: string) {
    await query('DELETE FROM users WHERE id = $1', [id]);
  },

  async setAvatar(id: string, avatarPath: string) {
    const r = await query(
      `UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [avatarPath, id],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async assignRole(userId: string, roleName: string, category?: string) {
    const r = await query(
      `UPDATE users SET role_name = $1, category = COALESCE($2, category), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [roleName, category || null, userId],
    );
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },
};
