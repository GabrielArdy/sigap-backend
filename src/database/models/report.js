import mongoose from "mongoose";
const { Schema } = mongoose;

const reportSchema = new Schema({
    schoolName: {
        type: String,
        required: true,
        trim: true,
    },
    schoolAddress: {
        type: String,
        required: true,
        trim: true,
    },
    schoolPhone: {
        type: String,
        required: true,
        trim: true,
    },
    schoolDistrict: {
        type: String,
        required: true,
        trim: true,
    },
    npsn: {
        type: String,
        required: true,
        trim: true,
    },
    nss: {
        type: String,
        required: true,
        trim: true,
    },
    pricipalName: {
        type: String,
        required: true,
        trim: true,
    },
    principalNip: {
        type: String,
        required: true,
        trim: true,
    },
    schoolEmblem: {
        type: String,
        required: true,
        trim: true,
    },
    ministryEmblem: {
        type: String,
        required: true,
        trim: true,
    },
    UpdatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'sigap_reports'
})

const ReportInfo = mongoose.model('ReportInfo', reportSchema);
export default ReportInfo;