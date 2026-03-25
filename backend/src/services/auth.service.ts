import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/env.js';

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  country: string | null;
  status: string;
  category: string;
  password: string;
  last_activity: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const AuthService = {
  async findUserByEmail(email: string) {
    const result = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return result.rows[0] || null;
  },

  async findUserById(id: string) {
    const result = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] || null;
  },

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  },

  generateToken(user: { id: string; email: string; category: string }): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.category },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
    );
  },

  async updateLastActivity(userId: string) {
    await query(
      'UPDATE users SET last_activity = NOW(), updated_at = NOW() WHERE id = $1',
      [userId],
    );
  },
};
