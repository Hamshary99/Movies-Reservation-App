import mongoose, { Schema } from "mongoose";

const seatSchema = new Schema({
    hall: {
        type: Schema.Types.ObjectId,
        ref: 'Hall',
        required: true,
    },
    row: {
        type: Number,
        required: true,
        min: 1,
    },
    column: {
        type: Number,
        required: true,
        min: 1,
    },
    label: {
        type: String,
        required: false,
        trim: true,
    },
    booked: {
        type: Boolean,
        default: false,
    },
});

export const seatModel = mongoose.model('Seat', seatSchema);