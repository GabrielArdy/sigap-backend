import mongoose from "mongoose";
import constant from "../../utils/constant.js";
const { Schema } = mongoose;

const leaveRequestSchema = new Schema({
    requestId: {
        type: String,
        required: true,
        unique: true,
    },
    requestType: {
        type: String,
        required: true,
        trim: true,
    },
    requesterId: {
        type: String,
        required: true,
        trim: true,
    },
    requestedStartDate: {
        type: Date,
        required: true,
    },
    requestedEndDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    attachment: {
        type: String,
        trim: true,
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    approvalStatus: {
        type: String,
        enum: [constant.PENDING, constant.APPROVED, constant.REJECTED],
        default: constant.PENDING,
    },
    approverId: {
        type: String,
        required: true,
        trim: true,
    },
    approverComment: {
        type: String,
        trim: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isOpen: {
        type: Boolean,
        default: false,
    }
}, {
    collection: "sigap_leave_requests",
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
export default LeaveRequest;