import { query } from '../config/database.js';

interface RectCoords {
  x: number;
  y: number;
  width: number;
  height: number;
}

function toApi(row: Record<string, unknown>) {
  return {
    id: row.id,
    gaPlanId: row.ga_plan_id,
    name: row.name,
    x: row.x as number,
    y: row.y as number,
    width: row.width as number,
    height: row.height as number,
    thumbnail: row.thumbnail,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Check if two rectangles overlap */
function rectsOverlap(a: RectCoords, b: RectCoords): boolean {
  if (a.x + a.width <= b.x) return false;
  if (b.x + b.width <= a.x) return false;
  if (a.y + a.height <= b.y) return false;
  if (b.y + b.height <= a.y) return false;
  return true;
}

export const DeckAreaService = {
  /** List all deck areas for a GA Plan */
  async getAreasForPlan(gaPlanId: string) {
    const result = await query(
      'SELECT * FROM deck_areas WHERE ga_plan_id = $1 ORDER BY sort_order ASC',
      [gaPlanId],
    );
    return result.rows.map(toApi);
  },

  /** Get a single deck area */
  async getAreaById(id: string, gaPlanId: string) {
    const result = await query(
      'SELECT * FROM deck_areas WHERE id = $1 AND ga_plan_id = $2',
      [id, gaPlanId],
    );
    return result.rows[0] ? toApi(result.rows[0]) : null;
  },

  /** Check if a name already exists in this GA Plan */
  async nameExists(gaPlanId: string, name: string, excludeId?: string) {
    const result = excludeId
      ? await query(
          'SELECT id FROM deck_areas WHERE ga_plan_id = $1 AND LOWER(name) = LOWER($2) AND id != $3',
          [gaPlanId, name, excludeId],
        )
      : await query(
          'SELECT id FROM deck_areas WHERE ga_plan_id = $1 AND LOWER(name) = LOWER($2)',
          [gaPlanId, name],
        );
    return result.rows.length > 0;
  },

  /** Check if new coordinates overlap with any existing area */
  async checkOverlap(gaPlanId: string, coords: RectCoords, excludeId?: string): Promise<string | null> {
    const result = excludeId
      ? await query(
          'SELECT name, x, y, width, height FROM deck_areas WHERE ga_plan_id = $1 AND id != $2',
          [gaPlanId, excludeId],
        )
      : await query(
          'SELECT name, x, y, width, height FROM deck_areas WHERE ga_plan_id = $1',
          [gaPlanId],
        );

    for (const area of result.rows) {
      if (rectsOverlap(coords, { x: area.x, y: area.y, width: area.width, height: area.height })) {
        return area.name;
      }
    }
    return null;
  },

  /** Create a new deck area */
  async createArea(data: {
    gaPlanId: string; name: string;
    x: number; y: number; width: number; height: number;
    thumbnail?: string;
  }) {
    // Auto-assign sort order
    const maxResult = await query(
      'SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM deck_areas WHERE ga_plan_id = $1',
      [data.gaPlanId],
    );
    const sortOrder = (maxResult.rows[0].max_sort as number) + 1;

    const result = await query(
      `INSERT INTO deck_areas (ga_plan_id, name, x, y, width, height, thumbnail, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.gaPlanId, data.name, data.x, data.y, data.width, data.height, data.thumbnail || null, sortOrder],
    );
    return toApi(result.rows[0]);
  },

  /** Update a deck area */
  async updateArea(id: string, data: Record<string, unknown>) {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name', x: 'x', y: 'y', width: 'width',
      height: 'height', thumbnail: 'thumbnail',
    };

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
      `UPDATE deck_areas SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0] ? toApi(result.rows[0]) : null;
  },

  /** Delete a deck area */
  async deleteArea(id: string) {
    await query('DELETE FROM deck_areas WHERE id = $1', [id]);
  },

  /** Delete all deck areas for a GA Plan (reset) */
  async deleteAllAreas(gaPlanId: string) {
    const result = await query('DELETE FROM deck_areas WHERE ga_plan_id = $1', [gaPlanId]);
    return { count: result.rowCount || 0 };
  },
};
