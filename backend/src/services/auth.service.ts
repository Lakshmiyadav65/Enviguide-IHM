import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';

export const AuthService = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
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

  updateLastActivity(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastActivity: new Date() },
    });
  },
};
