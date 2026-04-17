import { query } from '../config/database.js';

const FIELD_MAP: Record<string, string> = {
  name: 'name',
  documentType: 'document_type',
  category: 'category',
  status: 'status',
  fileName: 'file_name',
  filePath: 'file_path',
  fileSize: 'file_size',
  mimeType: 'mime_type',
  uploadedBy: 'uploaded_by',
  description: 'description',
};

const REVERSE_MAP: Record<string, string> = {};
for (const [c, s] of Object.entries(FIELD_MAP)) REVERSE_MAP[s] = c;
REVERSE_MAP['id'] = 'id';
REVERSE_MAP['vessel_id'] = 'vesselId';
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

export const DocumentService = {
  async getDocumentsForVessel(vesselId: string, filters?: { documentType?: string; status?: string; search?: string }) {
    let sql = 'SELECT * FROM documents WHERE vessel_id = $1';
    const params: unknown[] = [vesselId];
    let i = 2;

    if (filters?.documentType) {
      sql += ` AND document_type = $${i++}`;
      params.push(filters.documentType);
    }
    if (filters?.status) {
      sql += ` AND status = $${i++}`;
      params.push(filters.status);
    }
    if (filters?.search) {
      sql += ` AND (name ILIKE $${i} OR file_name ILIKE $${i})`;
      params.push(`%${filters.search}%`);
      i++;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return result.rows.map((r: Record<string, unknown>) => toApi(r));
  },

  async getDocumentById(id: string, vesselId: string) {
    const result = await query(
      'SELECT * FROM documents WHERE id = $1 AND vessel_id = $2',
      [id, vesselId],
    );
    return result.rows[0] ? toApi(result.rows[0] as Record<string, unknown>) : null;
  },

  async createDocument(data: Record<string, unknown>, vesselId: string) {
    const { cols, vals } = extractFields(data);
    cols.push('vessel_id');
    vals.push(vesselId);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `INSERT INTO documents (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      vals,
    );
    return toApi(result.rows[0] as Record<string, unknown>);
  },

  async updateDocument(id: string, data: Record<string, unknown>) {
    const { cols, vals } = extractFields(data);
    if (cols.length === 0) return null;
    const setClauses = cols.map((c, i) => `${c} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    vals.push(id);
    const result = await query(
      `UPDATE documents SET ${setClauses.join(', ')} WHERE id = $${vals.length} RETURNING *`,
      vals,
    );
    return result.rows[0] ? toApi(result.rows[0] as Record<string, unknown>) : null;
  },

  async deleteDocument(id: string) {
    await query('DELETE FROM documents WHERE id = $1', [id]);
  },

  async getDocumentCount(vesselId: string) {
    const r = await query('SELECT COUNT(*)::int AS total FROM documents WHERE vessel_id = $1', [vesselId]);
    return r.rows[0].total as number;
  },
};
