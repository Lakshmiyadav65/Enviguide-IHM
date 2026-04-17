// -- Suspected Keywords Service ------------------------------
// Keywords auto-flag materials whose name/description matches.
import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  keyword: 'keyword',
  hazardType: 'hazard_type',
  severity: 'severity',
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

export interface KeywordMatch {
  keyword: string;
  hazardType: string | null;
  severity: string;
}

// Simple in-memory cache; refreshed on mutations.
let cache: KeywordMatch[] | null = null;

export const SuspectedKeywordService = {
  invalidateCache() {
    cache = null;
  },

  async list(filters?: { status?: string; hazardType?: string; search?: string }) {
    let sql = `SELECT * FROM suspected_keywords WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;

    if (filters?.status) { sql += ` AND status = $${i++}`; params.push(filters.status); }
    if (filters?.hazardType) { sql += ` AND hazard_type = $${i++}`; params.push(filters.hazardType); }
    if (filters?.search) {
      sql += ` AND (keyword ILIKE $${i} OR hazard_type ILIKE $${i})`;
      params.push(`%${filters.search}%`);
      i++;
    }

    sql += ' ORDER BY keyword ASC';
    const r = await query(sql, params);
    return r.rows.map((row: Record<string, unknown>) => toApi(row));
  },

  async getById(id: string) {
    const r = await query('SELECT * FROM suspected_keywords WHERE id = $1', [id]);
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async create(data: Record<string, unknown>) {
    if (!data.keyword) throw new Error('keyword is required');
    const existing = await query('SELECT id FROM suspected_keywords WHERE keyword = $1', [data.keyword]);
    if (existing.rows[0]) throw new Error('Keyword already registered');

    const { cols, vals } = extract(data);
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ');
    const r = await query(
      `INSERT INTO suspected_keywords (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
      vals,
    );
    this.invalidateCache();
    return toApi(r.rows[0] as Record<string, unknown>);
  },

  async update(id: string, data: Record<string, unknown>) {
    const { cols, vals } = extract(data);
    if (cols.length === 0) return null;

    const setClauses = cols.map((c, i) => `${c} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    vals.push(id);

    const r = await query(
      `UPDATE suspected_keywords SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    this.invalidateCache();
    return r.rows[0] ? toApi(r.rows[0] as Record<string, unknown>) : null;
  },

  async delete(id: string) {
    await query('DELETE FROM suspected_keywords WHERE id = $1', [id]);
    this.invalidateCache();
  },

  async getActiveKeywords(): Promise<KeywordMatch[]> {
    if (cache) return cache;
    const r = await query(
      `SELECT keyword, hazard_type, severity FROM suspected_keywords WHERE status = 'Active'`,
    );
    cache = r.rows.map((row: Record<string, unknown>) => ({
      keyword: (row.keyword as string).toUpperCase(),
      hazardType: (row.hazard_type as string) || null,
      severity: (row.severity as string) || 'Medium',
    }));
    return cache;
  },

  /**
   * Scan a material's text fields against active keywords.
   * Returns the strongest match (Critical > High > Medium > Low).
   */
  async findMatch(fields: Array<string | null | undefined>): Promise<KeywordMatch | null> {
    const keywords = await this.getActiveKeywords();
    if (keywords.length === 0) return null;

    const haystack = fields
      .filter((f): f is string => Boolean(f))
      .join(' ')
      .toUpperCase();
    if (!haystack) return null;

    const SEVERITY_RANK: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    let best: KeywordMatch | null = null;

    for (const kw of keywords) {
      if (haystack.includes(kw.keyword)) {
        if (!best || (SEVERITY_RANK[kw.severity] || 0) > (SEVERITY_RANK[best.severity] || 0)) {
          best = kw;
        }
      }
    }
    return best;
  },
};
