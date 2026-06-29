import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from '../config/database.js';
import { logger } from '../utils/logger.js';

const log = logger.child('user');

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

function toApi(row: any) {
  if (!row) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === 'password') continue;
    if (k === '_id') {
      out['id'] = v;
    } else {
      out[REVERSE[k] || k] = v;
    }
  }
  return out;
}

function extract(data: Record<string, unknown>) {
  const fields: Record<string, unknown> = {};
  for (const [c, s] of Object.entries(FIELD_MAP)) {
    if (c in data && data[c] !== undefined) {
      fields[s] = data[c];
    }
  }
  return fields;
}

export const UserService = {
  async list(filters?: { status?: string; category?: string; search?: string }) {
    const db = getDb();
    const query: Record<string, any> = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.category) {
      query.category = filters.category;
    }
    if (filters?.search) {
      const regex = { $regex: filters.search, $options: 'i' };
      query.$or = [
        { name: regex },
        { email: regex },
        { category: regex }
      ];
    }

    const cursor = db.collection('users').find(query).sort({ created_at: -1 });
    const rows = await cursor.toArray();
    return rows.map(toApi);
  },

  async getById(id: string) {
    const db = getDb();
    const doc = await db.collection('users').findOne({ _id: id });
    return doc ? toApi(doc) : null;
  },

  async create(data: Record<string, unknown>) {
    if (!data.email || !data.name || !data.password) {
      throw new Error('email, name and password are required');
    }
    const db = getDb();
    const existing = await db.collection('users').findOne({ email: data.email });
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(data.password as string, 10);
    const fields = extract(data);
    fields['password'] = hashed;
    fields['created_at'] = new Date();
    fields['updated_at'] = new Date();

    const _id = crypto.randomUUID();
    await db.collection('users').insertOne({
      _id,
      ...fields
    });

    const created = await db.collection('users').findOne({ _id });
    const apiUser = toApi(created) as any;
    log.info(`✓ created user=${apiUser.name} email=${apiUser.email} category=${apiUser.category ?? '-'} role=${apiUser.roleName ?? '-'}`);
    return apiUser;
  },

  async update(id: string, data: Record<string, unknown>) {
    const db = getDb();
    const fields = extract(data);

    if (data.password) {
      fields['password'] = await bcrypt.hash(data.password as string, 10);
    }

    if (Object.keys(fields).length === 0) return null;

    fields['updated_at'] = new Date();
    await db.collection('users').updateOne(
      { _id: id },
      { $set: fields }
    );
    const updated = await db.collection('users').findOne({ _id: id });
    return updated ? toApi(updated) : null;
  },

  async delete(id: string) {
    const db = getDb();
    await db.collection('users').deleteOne({ _id: id });
  },

  async setAvatar(id: string, avatarPath: string) {
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: id },
      { $set: { avatar: avatarPath, updated_at: new Date() } }
    );
    const updated = await db.collection('users').findOne({ _id: id });
    return updated ? toApi(updated) : null;
  },

  async assignRole(userId: string, roleName: string, category?: string) {
    const db = getDb();
    const updateFields: Record<string, any> = {
      role_name: roleName,
      updated_at: new Date()
    };
    if (category) {
      updateFields.category = category;
    }
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: updateFields }
    );
    const updated = await db.collection('users').findOne({ _id: userId });
    return updated ? toApi(updated) : null;
  },
};
