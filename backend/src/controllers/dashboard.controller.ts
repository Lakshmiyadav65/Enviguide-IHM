// ── Dashboard Controller ──────────────────────────────────
import type { Request, Response, NextFunction } from 'express';

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // TODO: aggregate from DB
    res.json({
      success: true,
      data: {
        users:          { newRegistrations: 0, ihmRegistrations: 0, inactiveUsers: 0, trend: 0 },
        purchaseOrders: { totalLineItems: 0, pendingMDs: 0, receivedMDs: 0, hmRed: 0, hmGreen: 0, trend: 0 },
        vessels:        { newOnboarded: 0, itemsMovedFromDeck: 0, itemsMovedAshore: 0, socExpired: 0 },
      },
    });
  } catch (err) { next(err); }
}

export async function getSocAlerts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // TODO: query vessels with expiring/expired SOC certificates
    res.json({ success: true, data: [] });
  } catch (err) { next(err); }
}
