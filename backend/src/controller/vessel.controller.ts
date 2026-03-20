// â”€â”€ Vessel Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import type { Request, Response, NextFunction } from 'express';
import { VesselService } from '../services/vessel.service.js';

export async function listVessels(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vessels = await VesselService.getAllVessels();
    res.json({ success: true, data: vessels });
  } catch (err) { next(err); }
}

export async function createVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vessel = await VesselService.createVessel(req.body);
    res.status(201).json({ success: true, data: vessel });
  } catch (err) { next(err); }
}

export async function getVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vessel = await VesselService.getVesselById(req.params.id as string);
    res.json({ success: true, data: vessel });
  } catch (err) { next(err); }
}

export async function updateVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vessel = await VesselService.updateVessel(req.params.id as string, req.body);
    res.json({ success: true, data: vessel });
  } catch (err) { next(err); }
}

export async function deleteVessel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await VesselService.deleteVessel(req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function getVesselDecks(_req: Request, res: Response, _next: NextFunction): Promise<void> {
  // Placeholder logic for decks-specific data
  res.json({ success: true, data: [] });
}

export async function getVesselMaterials(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    // Placeholder logic for materials-specific data
  res.json({ success: true, data: [] });
}

export async function getVesselCertificates(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    // Placeholder logic for certificates-specific data
  res.json({ success: true, data: [] });
}
