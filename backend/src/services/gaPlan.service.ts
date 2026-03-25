import { query } from '../config/database.js';
import fs from 'fs/promises';

function toApi(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    name: row.name,
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const GAPlanService = {
  /** List all GA Plans for a vessel */
  async getPlansForVessel(vesselId: string) {
    const result = await query(
      `SELECT gp.*, COUNT(da.id)::int AS deck_area_count
       FROM ga_plans gp
       LEFT JOIN deck_areas da ON da.ga_plan_id = gp.id
       WHERE gp.vessel_id = $1
       GROUP BY gp.id
       ORDER BY gp.created_at DESC`,
      [vesselId],
    );
    return result.rows.map((row) => ({
      ...toApi(row),
      _count: { deckAreas: row.deck_area_count },
    }));
  },

  /** Get a single GA Plan with all its deck areas */
  async getPlanById(id: string, vesselId: string) {
    const planResult = await query(
      'SELECT * FROM ga_plans WHERE id = $1 AND vessel_id = $2',
      [id, vesselId],
    );
    if (!planResult.rows[0]) return null;

    const areasResult = await query(
      'SELECT * FROM deck_areas WHERE ga_plan_id = $1 ORDER BY sort_order ASC',
      [id],
    );

    return {
      ...toApi(planResult.rows[0]),
      deckAreas: areasResult.rows.map((r) => ({
        id: r.id, gaPlanId: r.ga_plan_id, name: r.name,
        x: r.x, y: r.y, width: r.width, height: r.height,
        thumbnail: r.thumbnail, sortOrder: r.sort_order,
        createdAt: r.created_at, updatedAt: r.updated_at,
      })),
    };
  },

  /** Create a GA Plan record */
  async createPlan(data: {
    vesselId: string; name: string; fileName: string;
    filePath: string; fileSize: number; mimeType: string;
  }) {
    const result = await query(
      `INSERT INTO ga_plans (vessel_id, name, file_name, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.vesselId, data.name, data.fileName, data.filePath, data.fileSize, data.mimeType],
    );
    return { ...toApi(result.rows[0]), _count: { deckAreas: 0 } };
  },

  /** Update GA Plan name */
  async updatePlan(id: string, name: string) {
    const result = await query(
      'UPDATE ga_plans SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, id],
    );
    return result.rows[0] ? toApi(result.rows[0]) : null;
  },

  /** Delete a GA Plan and its file from disk */
  async deletePlan(id: string) {
    const planResult = await query('SELECT * FROM ga_plans WHERE id = $1', [id]);
    if (!planResult.rows[0]) return null;

    // Delete from database (deck_areas cascade)
    await query('DELETE FROM ga_plans WHERE id = $1', [id]);

    // Delete file from disk (best-effort)
    try {
      await fs.unlink(planResult.rows[0].file_path);
    } catch {
      // File may already be missing
    }

    return toApi(planResult.rows[0]);
  },
};
