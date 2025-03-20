import mongoose from "mongoose";
const { Schema } = mongoose;

const qrSchema = new Schema({
    qrId : {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    qrImage : {
        type: String,
        required: true,
        trim: true,
    },
    qrToken : {
        type: String,
        required: true,
        trim: true,
    },
    expired_at : {
        type: Date,
        required: true,
    },
    stationId : {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    collection: 'sigap_qrs'
});

const QR = mongoose.model('QR', qrSchema);
export default QR;