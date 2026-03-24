import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service.js';
import { createError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { AuthPayload } from '../middleware/auth.middleware.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return next(createError('Email and password are required', 400));
    }

    const user = await AuthService.findUserByEmail(email);
    if (!user) {
      return next(createError('Invalid credentials', 401));
    }

    if (user.status !== 'active') {
      return next(createError('Account is deactivated', 403));
    }

    const valid = await AuthService.verifyPassword(password, user.password);
    if (!valid) {
      return next(createError('Invalid credentials', 401));
    }

    const token = AuthService.generateToken(user);

    // Fire-and-forget last activity update
    AuthService.updateLastActivity(user.id).catch(() => {});

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.category },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(createError('No token provided', 401));
    }

    const oldToken = authHeader.slice(7);
    let payload: AuthPayload;
    try {
      payload = jwt.verify(oldToken, env.JWT_SECRET) as AuthPayload;
    } catch {
      return next(createError('Invalid or expired token', 401));
    }

    const user = await AuthService.findUserById(payload.userId);
    if (!user || user.status !== 'active') {
      return next(createError('User not found or deactivated', 401));
    }

    const token = AuthService.generateToken(user);
    res.json({ success: true, data: { token } });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await AuthService.findUserById(req.user!.userId);
    if (!user) {
      return next(createError('User not found', 404));
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.category,
        phone: user.phone,
        country: user.country,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}
