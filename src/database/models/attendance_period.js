import mongoose from "mongoose";
const { Schema } = mongoose;

const attendancePeriodSchema = new Schema({
    periodId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    periodName: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

const AttendancePeriod = mongoose.model('AttendancePeriod', attendancePeriodSchema);
export default AttendancePeriod;