// -- Report Routes ---------------------------------------------------------
// Mounted under /vessels/:vesselId/reports
//   GET  /                               -> list historical reports
//   GET  /:type/download                  -> generate + stream PDF
//   GET  /file/:reportId                  -> re-stream archived PDF

import { Router } from 'express';
import {
  listReports, downloadReport, streamReportFile,
} from '../../controller/report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/',                      listReports);
router.get('/:type/download',        downloadReport);
router.get('/file/:reportId',        streamReportFile);

export default router;
