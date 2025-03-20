import express from 'express';
import QRController from '../controllers/qr_controller.js';

const router = express.Router();

/**
 * @route POST /api/qr/generate
 * @desc Generate QR code for a station
 * @access Private
 */
router.post('/generate', QRController.generateQR.bind(QRController));

export default router;
