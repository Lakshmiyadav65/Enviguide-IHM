// ── Vessel Controller ─────────────────────────────────────
import type { Request, Response, NextFunction } from 'express';

export async function listVessels(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [] }); } catch (err) { next(err); }
}
export async function createVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.status(201).json({ success: true, data: req.body }); } catch (err) { next(err); }
}
export async function getVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: { id: req.params['id'] } }); } catch (err) { next(err); }
}
export async function updateVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: req.body }); } catch (err) { next(err); }
}
export async function deleteVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { void req.params['id']; res.status(204).send(); } catch (err) { next(err); }
}
export async function getVesselDecks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [], vesselId: req.params['id'] }); } catch (err) { next(err); }
}
export async function getVesselMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [], vesselId: req.params['id'] }); } catch (err) { next(err); }
}
export async function getVesselCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json({ success: true, data: [], vesselId: req.params['id'] }); } catch (err) { next(err); }
}
