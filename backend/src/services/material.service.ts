import { query } from '../config/database.js';

// Column mapping: camelCase (API) -> snake_case (DB)
const FIELD_MAP: Record<string, string> = {
  name: 'name',
  ihmPart: 'ihm_part',
  category: 'category',
  hazardType: 'hazard_type',
  equipmentClass: 'equipment_class',
  hmStatus: 'hm_status',
  quantity: 'quantity',
  unit: 'unit',
  noOfPieces: 'no_of_pieces',
  totalQuantity: 'total_quantity',
  compartment: 'compartment',
  equipment: 'equipment',
  position: 'position',
  component: 'component',
  materialName: 'material_name',
  shipPO: 'ship_po',
  movementType: 'movement_type',
  manufacturer: 'manufacturer',
  ihmPartNumber: 'ihm_part_number',
  description: 'description',
  remarks: 'remarks',
  avoidUpdation: 'avoid_updation',
  pinX: 'pin_x',
  pinY: 'pin_y',
};

const REVERSE_MAP: Record<string, string> = {};
for (const [camel, snake] of Object.entries(FIELD_MAP)) {
  REVERSE_MAP[snake] = camel;
}
REVERSE_MAP['id'] = 'id';
REVERSE_MAP['vessel_id'] = 'vesselId';
REVERSE_MAP['deck_id'] = 'deckId';
REVERSE_MAP['deck_area_id'] = 'deckAreaId';
REVERSE_MAP['created_at'] = 'createdAt';
REVERSE_MAP['updated_at'] = 'updatedAt';

function toApi(row: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = REVERSE_MAP[key] || key;
    result[camel] = value;
  }
  // Construct pin object for frontend convenience
  if (result.pinX !== null && result.pinX !== undefined && result.pinY !== null && result.pinY !== undefined) {
    result.pin = { x: result.pinX, y: result.pinY };
  } else {
    result.pin = null;
  }
  return result;
}

function extractFields(data: Record<string, unknown>): { columns: string[]; values: unknown[] } {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [camel, snake] of Object.entries(FIELD_MAP)) {
    if (camel in data && data[camel] !== undefined) {
      columns.push(snake);
      values.push(data[camel]);
    }
  }
  return { columns, values };
}

export const MaterialService = {
  /** List all materials for a vessel, optionally filtered by deck */
  async getMaterialsForVessel(vesselId: string, deckId?: string) {
    let sql = `SELECT m.*, d.name AS deck_name
               FROM materials m
               LEFT JOIN decks d ON m.deck_id = d.id
               WHERE m.vessel_id = $1`;
    const params: unknown[] = [vesselId];

    if (deckId) {
      sql += ' AND m.deck_id = $2';
      params.push(deckId);
    }

    sql += ' ORDER BY m.created_at DESC';

    const result = await query(sql, params);
    return result.rows.map((row: Record<string, unknown>) => ({
      ...toApi(row),
      deckName: row.deck_name || null,
    }));
  },

  /** Get materials grouped by deck for mapping view */
  async getMaterialMapping(vesselId: string) {
    const result = await query(
      `SELECT m.*, d.name AS deck_name, da.thumbnail AS deck_thumbnail
       FROM materials m
       LEFT JOIN decks d ON m.deck_id = d.id
       LEFT JOIN deck_areas da ON m.deck_area_id = da.id
       WHERE m.vessel_id = $1
       ORDER BY d.name ASC, m.created_at ASC`,
      [vesselId],
    );

    // Group by deck
    const mapping: Record<string, { deckId: string; deckName: string; deckThumbnail: string | null; materials: unknown[] }> = {};
    for (const row of result.rows as Record<string, unknown>[]) {
      const dId = (row.deck_id as string) || 'unassigned';
      if (!mapping[dId]) {
        mapping[dId] = {
          deckId: dId,
          deckName: (row.deck_name as string) || 'Unassigned',
          deckThumbnail: (row.deck_thumbnail as string) || null,
          materials: [],
        };
      }
      mapping[dId].materials.push(toApi(row));
    }

    return Object.values(mapping);
  },

  /** Get a single material by ID */
  async getMaterialById(id: string, vesselId: string) {
    const result = await query(
      `SELECT m.*, d.name AS deck_name
       FROM materials m
       LEFT JOIN decks d ON m.deck_id = d.id
       WHERE m.id = $1 AND m.vessel_id = $2`,
      [id, vesselId],
    );
    if (!result.rows[0]) return null;
    return {
      ...toApi(result.rows[0] as Record<string, unknown>),
      deckName: (result.rows[0] as Record<string, unknown>).deck_name || null,
    };
  },

  /** Create a material entry */
  async createMaterial(data: Record<string, unknown>, vesselId: string, deckId?: string, deckAreaId?: string) {
    const { columns, values } = extractFields(data);
    columns.push('vessel_id');
    values.push(vesselId);

    if (deckId) {
      columns.push('deck_id');
      values.push(deckId);
    }
    if (deckAreaId) {
      columns.push('deck_area_id');
      values.push(deckAreaId);
    }

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `INSERT INTO materials (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return toApi(result.rows[0] as Record<string, unknown>);
  },

  /** Update a material entry */
  async updateMaterial(id: string, data: Record<string, unknown>) {
    const { columns, values } = extractFields(data);

    // Handle deck transfer
    if ('deckId' in data) {
      columns.push('deck_id');
      values.push(data.deckId || null);
    }
    if ('deckAreaId' in data) {
      columns.push('deck_area_id');
      values.push(data.deckAreaId || null);
    }

    if (columns.length === 0) return null;

    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE materials SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] ? toApi(result.rows[0] as Record<string, unknown>) : null;
  },

  /** Delete a material entry */
  async deleteMaterial(id: string) {
    await query('DELETE FROM materials WHERE id = $1', [id]);
  },

  /** Transfer a material to a different deck (clears pin — needs re-mapping) */
  async transferMaterial(id: string, newDeckId: string) {
    const result = await query(
      `UPDATE materials SET deck_id = $1, pin_x = NULL, pin_y = NULL, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [newDeckId, id],
    );
    return result.rows[0] ? toApi(result.rows[0] as Record<string, unknown>) : null;
  },

  /** Complete a re-mapping after transfer: set new pin + update fields */
  async remapMaterial(id: string, data: Record<string, unknown>) {
    const { columns, values } = extractFields(data);

    if ('deckId' in data) {
      columns.push('deck_id');
      values.push(data.deckId || null);
    }
    if ('deckAreaId' in data) {
      columns.push('deck_area_id');
      values.push(data.deckAreaId || null);
    }

    if (columns.length === 0) return null;

    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    setClauses.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE materials SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] ? toApi(result.rows[0] as Record<string, unknown>) : null;
  },

  /** Get material count per vessel (for dashboard) */
  async getMaterialCount(vesselId: string) {
    const result = await query(
      'SELECT COUNT(*)::int AS total FROM materials WHERE vessel_id = $1',
      [vesselId],
    );
    return result.rows[0].total as number;
  },

  /** Get material summary by IHM Part for a vessel */
  async getMaterialSummary(vesselId: string) {
    const result = await query(
      `SELECT ihm_part, category, COUNT(*)::int AS count
       FROM materials WHERE vessel_id = $1
       GROUP BY ihm_part, category
       ORDER BY ihm_part, category`,
      [vesselId],
    );
    return result.rows;
  },
};
