import mongoose, { Schema } from "mongoose";

const showtimeSchema = new Schema({
    movie: {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
    hall: {
        type: Schema.Types.ObjectId,
        ref: 'Hall',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
});

export const showtimeModel = mongoose.model('Showtime', showtimeSchema);