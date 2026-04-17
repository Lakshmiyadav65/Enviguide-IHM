// -- Purchase Order Controller -----------------------------
import type { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services/purchaseOrder.service.js';
import { VesselService } from '../services/vessel.service.js';
import { AuditService } from '../services/audit.service.js';
import { createError } from '../middleware/errorHandler.js';

const VALID_STATUS = ['responsive', 'non-responsive', 'pending'];

/** GET /api/v1/purchase-orders */
export async function listPurchaseOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      vesselId: req.query.vesselId as string | undefined,
      status: req.query.status as string | undefined,
      supplierName: req.query.supplier as string | undefined,
    };
    const pos = await PurchaseOrderService.listForUser(req.user!.userId, filters);
    res.json({ success: true, data: pos, total: pos.length });
  } catch (err) { next(err); }
}

/** POST /api/v1/purchase-orders */
export async function createPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const vesselId = body.vesselId as string;

    if (!vesselId) return next(createError('vesselId is required', 400));

    const vessel = await VesselService.getVesselByIdForUser(vesselId, req.user!.userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    if (!body.poNumber || !body.supplierName) {
      return next(createError('poNumber and supplierName are required', 400));
    }
    if (body.status && !VALID_STATUS.includes(body.status as string)) {
      return next(createError(`status must be one of: ${VALID_STATUS.join(', ')}`, 400));
    }

    delete body.vesselId;
    const po = await PurchaseOrderService.create(body, vesselId);
    res.status(201).json({ success: true, data: po });
  } catch (err) { next(err); }
}

/** GET /api/v1/purchase-orders/:id */
export async function getPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const po = await PurchaseOrderService.getById(req.params.id as string, req.user!.userId);
    if (!po) return next(createError('Purchase order not found', 404));
    res.json({ success: true, data: po });
  } catch (err) { next(err); }
}

/** PUT /api/v1/purchase-orders/:id */
export async function updatePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await PurchaseOrderService.getById(req.params.id as string, req.user!.userId);
    if (!existing) return next(createError('Purchase order not found', 404));

    const body = req.body as Record<string, unknown>;
    if (body.status && !VALID_STATUS.includes(body.status as string)) {
      return next(createError(`status must be one of: ${VALID_STATUS.join(', ')}`, 400));
    }

    const po = await PurchaseOrderService.update(req.params.id as string, body);
    res.json({ success: true, data: po });
  } catch (err) { next(err); }
}

/** DELETE /api/v1/purchase-orders/:id */
export async function deletePurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await PurchaseOrderService.getById(req.params.id as string, req.user!.userId);
    if (!existing) return next(createError('Purchase order not found', 404));
    await PurchaseOrderService.delete(req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
}

/** POST /api/v1/purchase-orders/upload — Upload PO file + create record + audit summary */
export async function uploadPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) return next(createError('File required', 400));

    const body = req.body as Record<string, string>;
    const vesselId = body.vesselId;
    if (!vesselId) return next(createError('vesselId is required', 400));

    const vessel = await VesselService.getVesselByIdForUser(vesselId, req.user!.userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    if (!body.poNumber || !body.supplierName) {
      return next(createError('poNumber and supplierName form fields are required', 400));
    }

    const v = vessel as Record<string, unknown>;
    const totalItems = parseInt(body.totalItems || '0', 10);

    // 1. Create PO record
    const po = await PurchaseOrderService.create({
      poNumber: body.poNumber,
      supplierName: body.supplierName,
      supplierCode: body.supplierCode,
      status: 'pending',
      totalItems,
      totalAmount: body.totalAmount ? parseFloat(body.totalAmount) : null,
      currency: body.currency || 'USD',
      poDate: body.poDate,
      description: body.description,
      fileName: req.file.originalname,
      filePath: `/uploads/po/${req.file.filename}`,
    }, vesselId);

    // 2. Create / increment audit summary for this vessel
    await AuditService.createAudit({
      imoNumber: v.imoNumber,
      vesselName: v.name,
      totalPO: 1,
      totalItems,
      duplicatePO: 0,
      duplicateSupplierCode: 0,
      duplicateProduct: 0,
      status: 'In Progress',
    }, vesselId);

    res.status(201).json({ success: true, data: po, message: 'PO uploaded and audit created' });
  } catch (err) { next(err); }
}

/** GET /api/v1/purchase-orders/by-supplier/:vesselId — Group POs by supplier */
export async function getPurchaseOrdersBySupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vesselId = req.params.vesselId as string;
    const vessel = await VesselService.getVesselByIdForUser(vesselId, req.user!.userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    const grouped = await PurchaseOrderService.getBySupplierForVessel(vesselId);
    res.json({ success: true, data: grouped });
  } catch (err) { next(err); }
}
