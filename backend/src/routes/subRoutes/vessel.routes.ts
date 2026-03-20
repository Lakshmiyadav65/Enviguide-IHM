// â”€â”€ Vessel Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET    /api/v1/vessels
// POST   /api/v1/vessels
// GET    /api/v1/vessels/:id
// PUT    /api/v1/vessels/:id
// DELETE /api/v1/vessels/:id
// GET    /api/v1/vessels/:id/decks
// GET    /api/v1/vessels/:id/materials
// GET    /api/v1/vessels/:id/certificates

import { Router } from 'express';
import {
  listVessels, createVessel, getVessel,
  updateVessel, deleteVessel, getVesselDecks,
  getVesselMaterials, getVesselCertificates,
} from '../../controller/vessel.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.route('/')
  .get(listVessels)
  .post(createVessel);

router.route('/:id')
  .get(getVessel)
  .put(updateVessel)
  .delete(deleteVessel);

router.get('/:id/decks',        getVesselDecks);
router.get('/:id/materials',    getVesselMaterials);
router.get('/:id/certificates', getVesselCertificates);

export default router;
