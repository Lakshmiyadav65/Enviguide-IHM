import crypto from 'crypto';
import { getCollection } from '../config/database.js';
import { isUserAdmin } from './access.js';

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

/** Convert a DB document to API object (camelCase) */
function toApi(row: any): Record<string, unknown> {
  if (!row) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === '_id') {
      result['id'] = value;
    } else {
      const camel = REVERSE_MAP[key] || key;
      result[camel] = value;
    }
  }
  return result;
}

/** Extract known fields from request body and convert to snake_case */
function extractFields(data: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [camel, snake] of Object.entries(FIELD_MAP)) {
    if (camel in data && data[camel] !== undefined) {
      fields[snake] = data[camel];
    }
  }
  return fields;
}

export const VesselService = {
  async getVesselsByUser(userId: string) {
    const coll = getCollection('vessels');
    const query = (await isUserAdmin(userId)) ? {} : { created_by_id: userId };
    const cursor = coll.find(query).sort({ created_at: -1 });
    const rows = await cursor.toArray();
    return rows.map(toApi);
  },

  async getVesselByIdForUser(id: string, userId: string) {
    const coll = getCollection('vessels');
    const query: any = (await isUserAdmin(userId)) ? { _id: id } : { _id: id, created_by_id: userId };
    const row = await coll.findOne(query);
    return row ? toApi(row) : null;
  },

  async getVesselByImo(imoNumber: string) {
    const coll = getCollection('vessels');
    const row = await coll.findOne({ imo_number: imoNumber });
    return row ? toApi(row) : null;
  },

  async createVessel(data: Record<string, unknown>, userId: string) {
    const coll = getCollection('vessels');
    const fields = extractFields(data);
    fields['created_by_id'] = userId;
    fields['created_at'] = new Date();
    fields['updated_at'] = new Date();
    const _id = crypto.randomUUID();
    
    await coll.insertOne({
      _id,
      ...fields
    });
    const created = await coll.findOne({ _id });
    return toApi(created);
  },

  async updateVessel(id: string, data: Record<string, unknown>) {
    const coll = getCollection('vessels');
    const fields = extractFields(data);
    if (Object.keys(fields).length === 0) return this.getVesselByIdForUser(id, '');

    fields['updated_at'] = new Date();
    await coll.updateOne(
      { _id: id },
      { $set: fields }
    );
    const updated = await coll.findOne({ _id: id });
    return updated ? toApi(updated) : null;
  },

  async deleteVessel(id: string) {
    const coll = getCollection('vessels');
    await coll.deleteOne({ _id: id });
  },
};
