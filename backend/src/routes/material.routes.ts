// ── Material / IHM Routes ─────────────────────────────────
// GET    /api/v1/materials
// POST   /api/v1/materials
// GET    /api/v1/materials/:id
// PUT    /api/v1/materials/:id
// DELETE /api/v1/materials/:id
// GET    /api/v1/materials/mapping

import { Router } from 'express';
import {
  listMaterials, createMaterial, getMaterial,
  updateMaterial, deleteMaterial, getMaterialMapping,
} from '../controllers/material.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/mapping', getMaterialMapping);

router.route('/')
  .get(listMaterials)
  .post(createMaterial);

router.route('/:id')
  .get(getMaterial)
  .put(updateMaterial)
  .delete(deleteMaterial);

export default router;
