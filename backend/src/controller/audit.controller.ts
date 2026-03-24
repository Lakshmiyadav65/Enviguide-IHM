// â"€â"€ Audit Controller â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
import type { Request, Response, NextFunction } from 'express';

export async function getPendingAudits(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [] }); } catch (err) { next(err); }
}
export async function getAuditDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: { imo: req.params['imo'] } }); } catch (err) { next(err); }
}
export async function getPendingReviews(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [] }); } catch (err) { next(err); }
}
export async function getReviewDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: { imo: req.params['imo'] } }); } catch (err) { next(err); }
}
export async function getMdsDocAudit(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [] }); } catch (err) { next(err); }
}
export async function getAuditDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [], imo: req.params['imo'] }); } catch (err) { next(err); }
}
export async function uploadAuditDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    res.json({ success: true, message: 'Document uploaded', filename: file?.originalname, imo: req.params['imo'] });
  } catch (err) { next(err); }
}
