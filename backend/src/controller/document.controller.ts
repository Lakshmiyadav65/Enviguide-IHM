import type { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service.js';
import { VesselService } from '../services/vessel.service.js';
import { createError } from '../middleware/errorHandler.js';

const VALID_TYPES = ['IHM Report', 'SOC', 'Ship Particulars', 'MD', 'SDoC', 'Other'];
const VALID_STATUS = ['pending', 'approved', 'rejected', 'expired'];

async function verify(userId: string, vesselId: string, next: NextFunction) {
  const v = await VesselService.getVesselByIdForUser(vesselId, userId);
  if (!v) { next(createError('Vessel not found', 404)); return null; }
  return v;
}

/** GET /api/v1/vessels/:vesselId/documents */
export async function listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const v = await verify(req.user!.userId, vesselId, next);
    if (!v) return;

    const filters = {
      documentType: req.query.documentType as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    };

    const documents = await DocumentService.getDocumentsForVessel(vesselId, filters);
    const total = await DocumentService.getDocumentCount(vesselId);
    res.json({ success: true, data: documents, total });
  } catch (err) { next(err); }
}

/** POST /api/v1/vessels/:vesselId/documents */
export async function uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const v = await verify(req.user!.userId, vesselId, next);
    if (!v) return;

    if (!req.file) return next(createError('File is required', 400));

    const { name, documentType, category, description } = req.body as Record<string, string>;

    if (!documentType || !VALID_TYPES.includes(documentType)) {
      return next(createError(`documentType must be one of: ${VALID_TYPES.join(', ')}`, 400));
    }

    const data = {
      name: name || req.file.originalname,
      documentType,
      category: category || 'general',
      status: 'pending',
      fileName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user!.email,
      description,
    };

    const doc = await DocumentService.createDocument(data, vesselId);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
}

/** GET /api/v1/vessels/:vesselId/documents/:id */
export async function getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const v = await verify(req.user!.userId, vesselId, next);
    if (!v) return;

    const doc = await DocumentService.getDocumentById(req.params.id as string, vesselId);
    if (!doc) return next(createError('Document not found', 404));
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
}

/** PUT /api/v1/vessels/:vesselId/documents/:id */
export async function updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const v = await verify(req.user!.userId, vesselId, next);
    if (!v) return;

    const existing = await DocumentService.getDocumentById(req.params.id as string, vesselId);
    if (!existing) return next(createError('Document not found', 404));

    const body = req.body as Record<string, unknown>;
    if (body.status && !VALID_STATUS.includes(body.status as string)) {
      return next(createError(`status must be one of: ${VALID_STATUS.join(', ')}`, 400));
    }

    const doc = await DocumentService.updateDocument(req.params.id as string, body);
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/vessels/:vesselId/documents/:id */
export async function deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const v = await verify(req.user!.userId, vesselId, next);
    if (!v) return;

    const existing = await DocumentService.getDocumentById(req.params.id as string, vesselId);
    if (!existing) return next(createError('Document not found', 404));

    await DocumentService.deleteDocument(req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
}
