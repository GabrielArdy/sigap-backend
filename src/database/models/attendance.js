import mongoose from "mongoose";
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    attendanceId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: false,
    },
    attendanceStatus: {
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
    collection: 'sigap_attendances'
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;