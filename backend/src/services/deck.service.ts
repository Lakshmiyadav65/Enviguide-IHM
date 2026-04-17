import { query } from '../config/database.js';

function toApi(row: Record<string, unknown>) {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    gaPlanId: row.ga_plan_id,
    deckAreaId: row.deck_area_id,
    name: row.name,
    level: row.level,
    gaPlanUrl: row.ga_plan_url,
    thumbnail: row.thumbnail,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const DeckService = {
  /** List all decks for a vessel — includes mapped material count per deck */
  async getDecksForVessel(vesselId: string) {
    const result = await query(
      `SELECT d.*, da.x, da.y, da.width, da.height,
              COALESCE(mc.material_count, 0)::int AS material_count
       FROM decks d
       LEFT JOIN deck_areas da ON d.deck_area_id = da.id
       LEFT JOIN (
         SELECT deck_id, COUNT(*) AS material_count
         FROM materials
         WHERE deck_id IS NOT NULL
         GROUP BY deck_id
       ) mc ON mc.deck_id = d.id
       WHERE d.vessel_id = $1
       ORDER BY d.level ASC, d.created_at ASC`,
      [vesselId],
    );
    return result.rows.map((row: Record<string, unknown>) => ({
      ...toApi(row),
      mappedItemsCount: row.material_count,
      cropCoordinates: row.deck_area_id
        ? { x: row.x, y: row.y, width: row.width, height: row.height }
        : null,
    }));
  },

  /** Get a single deck */
  async getDeckById(id: string, vesselId: string) {
    const result = await query(
      `SELECT d.*, da.x, da.y, da.width, da.height
       FROM decks d
       LEFT JOIN deck_areas da ON d.deck_area_id = da.id
       WHERE d.id = $1 AND d.vessel_id = $2`,
      [id, vesselId],
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0] as Record<string, unknown>;
    return {
      ...toApi(row),
      cropCoordinates: row.deck_area_id
        ? { x: row.x, y: row.y, width: row.width, height: row.height }
        : null,
    };
  },

  /** Create a deck (from a cropped deck area on a GA Plan) */
  async createDeck(data: {
    vesselId: string;
    gaPlanId?: string;
    deckAreaId?: string;
    name: string;
    level?: number;
    gaPlanUrl?: string;
    thumbnail?: string;
  }) {
    // Auto-assign level = MAX(level) + 1 if not provided
    let level = data.level;
    if (level === undefined) {
      const maxResult = await query(
        'SELECT COALESCE(MAX(level), -1) AS max_level FROM decks WHERE vessel_id = $1',
        [data.vesselId],
      );
      level = (maxResult.rows[0].max_level as number) + 1;
    }

    const result = await query(
      `INSERT INTO decks (vessel_id, ga_plan_id, deck_area_id, name, level, ga_plan_url, thumbnail)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.vesselId,
        data.gaPlanId || null,
        data.deckAreaId || null,
        data.name,
        level,
        data.gaPlanUrl || null,
        data.thumbnail || null,
      ],
    );
    return toApi(result.rows[0]);
  },

  /** Update a deck */
  async updateDeck(id: string, data: Record<string, unknown>) {
    const fieldMap: Record<string, string> = {
      name: 'name',
      level: 'level',
      gaPlanUrl: 'ga_plan_url',
      thumbnail: 'thumbnail',
      status: 'status',
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in data && data[key] !== undefined) {
        setClauses.push(`${col} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE decks SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] ? toApi(result.rows[0]) : null;
  },

  /** Delete a deck */
  async deleteDeck(id: string) {
    await query('DELETE FROM decks WHERE id = $1', [id]);
  },

  /** Check if a deck name already exists for this vessel */
  async nameExists(vesselId: string, name: string, excludeId?: string) {
    const result = excludeId
      ? await query(
          'SELECT id FROM decks WHERE vessel_id = $1 AND LOWER(name) = LOWER($2) AND id != $3',
          [vesselId, name, excludeId],
        )
      : await query(
          'SELECT id FROM decks WHERE vessel_id = $1 AND LOWER(name) = LOWER($2)',
          [vesselId, name],
        );
    return result.rows.length > 0;
  },

  /** Get deck count for a vessel */
  async getDeckCount(vesselId: string) {
    const result = await query(
      'SELECT COUNT(*)::int AS count FROM decks WHERE vessel_id = $1',
      [vesselId],
    );
    return result.rows[0].count as number;
  },
};
