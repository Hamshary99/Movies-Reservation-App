import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
  showtime: {
    type: Schema.Types.ObjectId,
    ref: "Showtime",
    required: true,
  },
  seats: [
    {
      type: Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
    },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

export const bookingModel = mongoose.model("Booking", bookingSchema);
