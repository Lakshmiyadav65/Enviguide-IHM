// â"€â"€ Purchase Order Controller â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
import type { Request, Response, NextFunction } from 'express';

export async function listPurchaseOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [] }); } catch (err) { next(err); }
}
export async function createPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ success: true, data: req.body }); } catch (err) { next(err); }
}
export async function getPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: { id: req.params['id'] } }); } catch (err) { next(err); }
}
export async function updatePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: req.body }); } catch (err) { next(err); }
}
export async function uploadPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // TODO: parse Excel/PDF, extract line items, save to DB
    const file = req.file;
    res.json({ success: true, message: 'File received', filename: file?.originalname });
  } catch (err) { next(err); }
}
