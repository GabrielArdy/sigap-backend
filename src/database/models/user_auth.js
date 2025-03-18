import mongoose from "mongoose";
const { Schema } = mongoose;

const userAuthSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String,
        required: false,
    },
    token_expired: {
        type: Date,
        required: false,
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
    collection: 'sigap_authdata'
});

const UserAuth = mongoose.model('UserAuth', userAuthSchema);
export default UserAuth;