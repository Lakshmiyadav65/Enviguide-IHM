import type { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service.js';
import { createError } from '../middleware/errorHandler.js';

/** GET /api/v1/permissions/nodes — full permission tree */
export async function listPermissionNodes(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tree = await PermissionService.listNodes();
    res.json({ success: true, data: tree });
  } catch (err) { next(err); }
}

/** POST /api/v1/permissions/nodes — upsert a node */
export async function upsertPermissionNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, label, parentId, sortOrder } = req.body as {
      id?: string; label?: string; parentId?: string | null; sortOrder?: number;
    };
    if (!id || !label) return next(createError('id and label are required', 400));
    await PermissionService.upsertNode(id, label, parentId ?? null, sortOrder ?? 0);
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function deletePermissionNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await PermissionService.deleteNode(req.params.id as string);
    res.status(204).send();
  } catch (err) { next(err); }
}

/** GET /api/v1/permissions/users/:userId */
export async function getUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ids = await PermissionService.getUserPermissions(req.params.userId as string);
    res.json({ success: true, data: ids });
  } catch (err) { next(err); }
}

/** PUT /api/v1/permissions/users/:userId  body: { nodeIds: string[] } */
export async function setUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nodeIds } = req.body as { nodeIds?: unknown };
    if (!Array.isArray(nodeIds)) return next(createError('nodeIds[] is required', 400));
    await PermissionService.setUserPermissions(req.params.userId as string, nodeIds as string[]);
    res.json({ success: true });
  } catch (err) { next(err); }
}

/** GET /api/v1/permissions/roles/:roleName */
export async function getRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ids = await PermissionService.getRolePermissions(req.params.roleName as string);
    res.json({ success: true, data: ids });
  } catch (err) { next(err); }
}

/** PUT /api/v1/permissions/roles/:roleName  body: { nodeIds: string[] } */
export async function setRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { nodeIds } = req.body as { nodeIds?: unknown };
    if (!Array.isArray(nodeIds)) return next(createError('nodeIds[] is required', 400));
    await PermissionService.setRolePermissions(req.params.roleName as string, nodeIds as string[]);
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function listRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await PermissionService.listRoles();
    res.json({ success: true, data: roles });
  } catch (err) { next(err); }
}
