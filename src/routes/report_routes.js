import express from 'express';
import ReportController from '../controllers/report_controller.js';
const router = express.Router();

router.get('/', (req, res) => ReportController.getReportInfo(req, res));
router.post('/', (req, res) => ReportController.createOrUpdateReportInfo(req, res));

export default router;