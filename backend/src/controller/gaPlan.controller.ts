import type { Request, Response, NextFunction } from 'express';
import { GAPlanService } from '../services/gaPlan.service.js';
import { VesselService } from '../services/vessel.service.js';
import { createError } from '../middleware/errorHandler.js';

/** GET /api/v1/vessels/:vesselId/ga-plans */
export async function listGAPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { vesselId } = req.params;

    // Verify vessel belongs to user
    const vessel = await VesselService.getVesselByIdForUser(vesselId, userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    const plans = await GAPlanService.getPlansForVessel(vesselId);
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
}

/** POST /api/v1/vessels/:vesselId/ga-plans */
export async function uploadGAPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { vesselId } = req.params;

    // Verify vessel belongs to user
    const vessel = await VesselService.getVesselByIdForUser(vesselId, userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    if (!req.file) {
      return next(createError('GA Plan image file is required', 400));
    }

    const name = (req.body.name as string) || req.file.originalname.replace(/\.[^/.]+$/, '');

    const plan = await GAPlanService.createPlan({
      vesselId,
      name,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

/** GET /api/v1/vessels/:vesselId/ga-plans/:planId */
export async function getGAPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { vesselId, planId } = req.params;

    const vessel = await VesselService.getVesselByIdForUser(vesselId, userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    const plan = await GAPlanService.getPlanById(planId, vesselId);
    if (!plan) return next(createError('GA Plan not found', 404));

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/v1/vessels/:vesselId/ga-plans/:planId */
export async function updateGAPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { vesselId, planId } = req.params;
    const { name } = req.body as { name?: string };

    const vessel = await VesselService.getVesselByIdForUser(vesselId, userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    const existing = await GAPlanService.getPlanById(planId, vesselId);
    if (!existing) return next(createError('GA Plan not found', 404));

    if (!name || !name.trim()) {
      return next(createError('Name is required', 400));
    }

    const plan = await GAPlanService.updatePlan(planId, name.trim());
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/v1/vessels/:vesselId/ga-plans/:planId */
export async function deleteGAPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { vesselId, planId } = req.params;

    const vessel = await VesselService.getVesselByIdForUser(vesselId, userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    const existing = await GAPlanService.getPlanById(planId, vesselId);
    if (!existing) return next(createError('GA Plan not found', 404));

    await GAPlanService.deletePlan(planId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
