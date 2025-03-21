import crypto from 'crypto';
import { QRRepository } from '../database/repository/qr_repository.js';
import qrcode from 'qrcode';

class QRService {
  constructor() {
    this.repository = new QRRepository();
    this.secretKey = process.env.QR_SECRET_KEY || 'default-secret-key-change-in-production';
    this.qrExpiryTimeMinutes = 5; // QR valid for 5 minutes
    this.qrSize = 1024; // QR size in pixels (1024x1024)
  }

  /**
   * Generate QR code with encrypted payload for a station
   * @param {string} stationId - ID of the station
   * @returns {Promise<Object>} - QR data with base64 image
   */
  async generateQR(stationId) {
    try {
      // Create expiry time (current time + 5 minutes)
      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + this.qrExpiryTimeMinutes);
      
      // Create payload
      const payload = {
        stationId,
        expiredAt: expiredAt.toISOString()
      };
      
      // Generate signature using HMAC
      const signature = this.generateSignature(payload);
      
      // Complete data with signature
      const qrData = {
        ...payload,
        signature
      };
      
      // Generate QR code as base64 with specified size
      const qrCodeBase64 = await qrcode.toDataURL(JSON.stringify(qrData), {
        width: this.qrSize,
        margin: 1,
        errorCorrectionLevel: 'H'
      });
      
      // Generate a unique QR ID
      const qrId = crypto.randomUUID();
      
      // Store QR in database with field names matching the schema
      await this.repository.createQR({
        qrId,
        qrImage: qrCodeBase64,
        qrToken: signature,
        expired_at: expiredAt, // Using the field name from the schema
        stationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        qrCode: qrCodeBase64,
        data: qrData,
        expiresIn: this.qrExpiryTimeMinutes * 60 // in seconds
      };
    } catch (error) {
      throw new Error(`Failed to generate QR: ${error.message}`);
    }
  }

  /**
   * Verify if QR data signature is valid
   * @param {Object} qrData - QR data with payload and signature
   * @returns {boolean} - True if signature is valid
   */
  verifyQR(qrData) {
    try {
      // Extract signature and payload
      const { signature, ...payload } = qrData;
      
      // Generate a new signature from the payload
      const generatedSignature = this.generateSignature(payload);
      
      // Compare signatures
      return signature === generatedSignature;
    } catch (error) {
      console.error('QR verification error:', error);
      return false;
    }
  }

  /**
   * Check if QR is expired
   * @param {string} expiredAt - Expiry datetime from QR
   * @param {string} scannedAt - Time when QR was scanned (optional, defaults to now)
   * @returns {boolean} - True if QR is still valid, false if expired
   */
  checkQRExpired(expiredAt, scannedAt = new Date().toISOString()) {
    try {
      const expiredTime = new Date(expiredAt).getTime();
      const scannedTime = new Date(scannedAt).getTime();
      
      // QR is valid if the scan time is before expiry time
      return scannedTime <= expiredTime;
    } catch (error) {
      console.error('QR expiry check error:', error);
      return false;
    }
  }

  /**
   * Generate HMAC signature from payload
   * @private
   * @param {Object} payload - Data to sign
   * @returns {string} - HMAC signature
   */
  generateSignature(payload) {
    // Sort keys to ensure consistent order
    const orderedPayload = {};
    Object.keys(payload).sort().forEach(key => {
      orderedPayload[key] = payload[key];
    });
    
    // Create string representation
    const dataString = JSON.stringify(orderedPayload);
    
    // Generate HMAC signature
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(dataString)
      .digest('hex');
  }
}

export { QRService };
