import mongoose, { Schema } from 'mongoose';

const hallSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        // lowercase: true
    },
    rows: {
        type: Number,
        required: true,
        min: 1,
    },
    columns: {
        type: Number,
        required: true,
        min: 1,
    }
});

export const hallModel = mongoose.model('Hall', hallSchema);
