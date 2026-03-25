import { query } from '../config/database.js';

// Column mapping: camelCase (API) -> snake_case (DB)
const FIELD_MAP: Record<string, string> = {
  name: 'name', imoNumber: 'imo_number', vesselType: 'vessel_type',
  registrationNumber: 'registration_number', signalLetters: 'signal_letters',
  grossTonnage: 'gross_tonnage', deadweightTonnage: 'deadweight_tonnage',
  teuUnits: 'teu_units', registeredOwner: 'registered_owner',
  shipOwner: 'ship_owner', shipManager: 'ship_manager',
  fleet: 'fleet', subFleet: 'sub_fleet', vesselClass: 'vessel_class',
  vesselIhmClass: 'vessel_ihm_class', classIdNo: 'class_id_no',
  ihmClass: 'ihm_class', flagState: 'flag_state', portOfRegistry: 'port_of_registry',
  nameOfYard: 'name_of_yard', shipyardLocation: 'shipyard_location',
  buildersUniqueId: 'builders_unique_id', keelLaidDate: 'keel_laid_date',
  deliveryDate: 'delivery_date', ihmMethod: 'ihm_method', mdStandard: 'md_standard',
  ihmReference: 'ihm_reference', socReference: 'soc_reference',
  socExpiryDate: 'soc_expiry_date', complianceStatus: 'compliance_status', image: 'image',
};

// Reverse mapping: snake_case (DB) -> camelCase (API)
const REVERSE_MAP: Record<string, string> = {};
for (const [camel, snake] of Object.entries(FIELD_MAP)) {
  REVERSE_MAP[snake] = camel;
}
REVERSE_MAP['id'] = 'id';
REVERSE_MAP['created_by_id'] = 'createdById';
REVERSE_MAP['created_at'] = 'createdAt';
REVERSE_MAP['updated_at'] = 'updatedAt';

/** Convert a DB row (snake_case) to API object (camelCase) */
function toApi(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = REVERSE_MAP[key] || key;
    result[camel] = value;
  }
  return result;
}

/** Extract known fields from request body and convert to snake_case */
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

export const VesselService = {
  /** Get all vessels belonging to a specific user */
  async getVesselsByUser(userId: string) {
    const result = await query(
      'SELECT * FROM vessels WHERE created_by_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map(toApi);
  },

  /** Get a single vessel only if it belongs to the user */
  async getVesselByIdForUser(id: string, userId: string) {
    const result = await query(
      'SELECT * FROM vessels WHERE id = $1 AND created_by_id = $2',
      [id, userId],
    );
    return result.rows[0] ? toApi(result.rows[0]) : null;
  },

  /** Check if IMO already exists (globally unique) */
  async getVesselByImo(imoNumber: string) {
    const result = await query(
      'SELECT id FROM vessels WHERE imo_number = $1',
      [imoNumber],
    );
    return result.rows[0] || null;
  },

  /** Create a vessel owned by the user */
  async createVessel(data: Record<string, unknown>, userId: string) {
    const { columns, values } = extractFields(data);
    columns.push('created_by_id');
    values.push(userId);

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const result = await query(
      `INSERT INTO vessels (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return toApi(result.rows[0]);
  },

  /** Update a vessel */
  async updateVessel(id: string, data: Record<string, unknown>) {
    const { columns, values } = extractFields(data);
    if (columns.length === 0) return this.getVesselByIdForUser(id, '');

    const setClauses = columns.map((col, i) => `${col} = $${i + 1}`);
    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE vessels SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return result.rows[0] ? toApi(result.rows[0]) : null;
  },

  /** Delete a vessel */
  async deleteVessel(id: string) {
    await query('DELETE FROM vessels WHERE id = $1', [id]);
  },
};
