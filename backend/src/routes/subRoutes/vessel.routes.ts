// -- Vessel Routes ----------------------------------------
// GET    /api/v1/vessels
// POST   /api/v1/vessels
// GET    /api/v1/vessels/:id
// PUT    /api/v1/vessels/:id
// DELETE /api/v1/vessels/:id
// POST   /api/v1/vessels/:id/image
// GET    /api/v1/vessels/:id/decks
// GET    /api/v1/vessels/:id/materials
// GET    /api/v1/vessels/:id/certificates

import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  listVessels, createVessel, getVessel,
  updateVessel, deleteVessel, uploadVesselImage,
  getVesselDecks, getVesselMaterials, getVesselCertificates,
} from '../../controller/vessel.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import gaPlanRouter from './gaPlan.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '..', '..', '..', 'uploads', 'vessels');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
    }
  },
});

const router = Router();
router.use(authenticate);

router.route('/')
  .get(listVessels)
  .post(createVessel);

router.route('/:id')
  .get(getVessel)
  .put(updateVessel)
  .delete(deleteVessel);

router.post('/:id/image', upload.single('image'), uploadVesselImage);

router.get('/:id/decks',        getVesselDecks);
router.get('/:id/materials',    getVesselMaterials);
router.get('/:id/certificates', getVesselCertificates);

// GA Plan routes (nested: /vessels/:vesselId/ga-plans/...)
router.use('/:vesselId/ga-plans', gaPlanRouter);

export default router;
