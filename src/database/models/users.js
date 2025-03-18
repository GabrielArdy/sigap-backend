import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    nip: {
        type: String,
        required: false,
        trim: true,
        unique: true,
    },
    position : {
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
})

const User = mongoose.model('User', userSchema);
export default User;