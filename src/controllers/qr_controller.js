import { QRService } from '../services/qr_service.js';

class QRController {
  constructor() {
    this.service = new QRService();
  }

  /**
   * Generate QR code for a station
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateQR(req, res) {
    try {
      const { stationId } = req.body;

      if (!stationId) {
        return res.status(400).json({
          success: false,
          message: 'Station ID is required'
        });
      }

      const qrData = await this.service.generateQR(stationId);

      return res.status(200).json({
        success: true,
        data: qrData,
        message: 'QR code generated successfully'
      });
    } catch (error) {
      console.error('QR generation error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to generate QR: ${error.message}`
      });
    }
  }
}

export default new QRController();

