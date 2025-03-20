import QRModel from '../models/qr.js';

class QRRepository {
  async createQR(qrData) {
    try {
      const qr = new QRModel(qrData);
      return await qr.save();
    } catch (error) {
      throw new Error(`Error creating QR code: ${error.message}`);
    }
  }

  async findQRById(id) {
    try {
      return await QRModel.findById(id);
    } catch (error) {
      throw new Error(`Error finding QR code by ID: ${error.message}`);
    }
  }

  async findAllQRs(filters = {}, options = {}) {
    try {
      return await QRModel.find(filters, null, options);
    } catch (error) {
      throw new Error(`Error finding QR codes: ${error.message}`);
    }
  }

  async updateQR(id, qrData) {
    try {
      return await QRModel.findByIdAndUpdate(
        id,
        qrData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating QR code: ${error.message}`);
    }
  }

  async deleteQR(id) {
    try {
      return await QRModel.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting QR code: ${error.message}`);
    }
  }

  // Additional utility methods
  async findQRByCode(code) {
    try {
      return await QRModel.findOne({ code });
    } catch (error) {
      throw new Error(`Error finding QR by code: ${error.message}`);
    }
  }

  async countQRs(filters = {}) {
    try {
      return await QRModel.countDocuments(filters);
    } catch (error) {
      throw new Error(`Error counting QR codes: ${error.message}`);
    }
  }
}

export { QRRepository };
