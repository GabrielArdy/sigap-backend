import mongoose from "mongoose";
const { Schema } = mongoose;

const stationSchema = new Schema({
    stationId: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    stationName: {
        type: String,
        required: true,
        trim: true,
    },
    stationLocation: {
        type: {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            }
        },
        required: true,
    },
    radiusThreshold: {
        type: Number,
        required: true,
    },
    lastActive: {
        type: Date,
        required: false,
    },

    stationStatus: {
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
    collection: 'sigap_stations'
})

const Station = mongoose.model('Station', stationSchema);
export default Station;