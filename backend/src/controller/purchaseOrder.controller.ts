// -- Purchase Order Controller -----------------------------
import type { Request, Response, NextFunction } from 'express';
import { PurchaseOrderService } from '../services/purchaseOrder.service.js';
import { VesselService } from '../services/vessel.service.js';
import { AuditService } from '../services/audit.service.js';
import { query } from '../config/database.js';
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

/**
 * POST /api/v1/purchase-orders/upload-bulk — bulk PO upload from Excel/PDF/CSV.
 *
 * Expects multipart/form-data with:
 *   - file:      the raw uploaded file (kept for audit trail)
 *   - vesselId:  vessel the upload belongs to
 *   - stats:     JSON string { totalPO, totalItems, duplicatePO, duplicateSupplierCode, duplicateProduct }
 *   - lineItems: JSON string — array of arrays (rows) using the standard 20-column order from the frontend
 *
 * Creates one audit_summary row, then bulk-inserts all lineItems into audit_line_items.
 */
export async function uploadPurchaseOrderBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) return next(createError('File required', 400));

    const body = req.body as Record<string, string>;
    const vesselId = body.vesselId;
    if (!vesselId) return next(createError('vesselId is required', 400));

    const vessel = await VesselService.getVesselByIdForUser(vesselId, req.user!.userId);
    if (!vessel) return next(createError('Vessel not found', 404));

    let stats: Record<string, number> = {};
    let lineItems: unknown[][] = [];
    try {
      if (body.stats) stats = JSON.parse(body.stats);
      if (body.lineItems) lineItems = JSON.parse(body.lineItems);
    } catch {
      return next(createError('stats and lineItems must be valid JSON', 400));
    }

    if (!Array.isArray(lineItems)) {
      return next(createError('lineItems must be an array of row arrays', 400));
    }

    const v = vessel as Record<string, unknown>;

    // 1. Create the audit summary.
    const audit = await AuditService.createAudit({
      imoNumber: v.imoNumber,
      vesselName: v.name,
      totalPO: Number(stats.totalPO ?? 0),
      totalItems: Number(stats.totalItems ?? lineItems.length),
      duplicatePO: Number(stats.duplicatePO ?? 0),
      duplicateSupplierCode: Number(stats.duplicateSupplierCode ?? 0),
      duplicateProduct: Number(stats.duplicateProduct ?? 0),
      status: 'In Progress',
    }, vesselId);

    const auditId = (audit as Record<string, string>).id;
    const filePath = `/uploads/po/${req.file.filename}`;

    await query(
      `UPDATE audit_summaries
         SET uploaded_file_path = $1, uploaded_file_name = $2
       WHERE id = $3`,
      [filePath, req.file.originalname, auditId],
    );

    // 2. Bulk-insert line items in chunks (Postgres parameter limit is 65,535).
    //    With 24 columns/row, 2000 rows = 48,000 params — safe.
    const CHUNK = 1000;
    let inserted = 0;
    for (let offset = 0; offset < lineItems.length; offset += CHUNK) {
      const batch = lineItems.slice(offset, offset + CHUNK);
      const vals: unknown[] = [];
      const placeholders: string[] = [];

      batch.forEach((row, i) => {
        const rowIndex = offset + i;
        const r = Array.isArray(row) ? row : [];
        // Standard 20-column layout; anything beyond goes into extra_data.
        const extra = r.slice(20);
        const base = [
          auditId,
          vesselId,
          rowIndex,
          r[0] ?? null,                 // name
          r[1] ?? null,                 // vessel_name
          r[2] ?? null,                 // po_number
          r[3] ?? null,                 // imo_number
          r[4] ?? null,                 // po_sent_date
          r[5] ?? null,                 // md_requested_date
          r[6] ?? null,                 // item_description
          (r[7] === 'Yes' ? 'Yes' : 'No'), // is_suspected
          r[8] ?? null,                 // impa_code
          r[9] ?? null,                 // issa_code
          r[10] ?? null,                // equipment_code
          r[11] ?? null,                // equipment_name
          r[12] ?? null,                // maker
          r[13] ?? null,                // model
          r[14] ?? null,                // part_number
          r[15] ?? null,                // unit
          r[16] ?? null,                // quantity
          r[17] ?? null,                // vendor_remark
          r[18] ?? null,                // vendor_email
          r[19] ?? null,                // vendor_name
          JSON.stringify(extra),        // extra_data
        ];
        const start = vals.length;
        const phs = base.map((_, j) => `$${start + j + 1}`);
        // extra_data is the last one and must cast to jsonb
        phs[phs.length - 1] = `${phs[phs.length - 1]}::jsonb`;
        placeholders.push(`(${phs.join(', ')})`);
        vals.push(...base);
      });

      if (placeholders.length === 0) continue;

      await query(
        `INSERT INTO audit_line_items (
           audit_id, vessel_id, row_index,
           name, vessel_name, po_number, imo_number,
           po_sent_date, md_requested_date, item_description, is_suspected,
           impa_code, issa_code, equipment_code, equipment_name,
           maker, model, part_number, unit, quantity,
           vendor_remark, vendor_email, vendor_name, extra_data
         ) VALUES ${placeholders.join(', ')}`,
        vals,
      );
      inserted += placeholders.length;
    }

    res.status(201).json({
      success: true,
      data: {
        auditId,
        imoNumber: v.imoNumber,
        vesselName: v.name,
        filePath,
        fileName: req.file.originalname,
        linesInserted: inserted,
      },
      message: 'Purchase order uploaded and audit created',
    });
  } catch (err) { next(err); }
}
