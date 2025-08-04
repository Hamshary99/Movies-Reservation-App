import Stripe from "stripe";
import { userModel } from "../models/userModel.js";

import { StripeError } from "./errorHandler.js";
import { showtimeModel } from "../models/showtimeModel.js";
import { seatModel } from "../models/seatModel.js";
import dotenv from "dotenv";

dotenv.config();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkoutPayment = async (bookingDetails) => {
  try {
    if (!bookingDetails) {
      throw new StripeError("Booking details are required", 400);
    }

    const userData = await userModel.findById(bookingDetails.user);

    const showtimeDetails = await showtimeModel.findById(
      bookingDetails.showtime
    );

    const seatDetails = await seatModel.find({
      _id: { $in: bookingDetails.seats.map((seat) => seat) },
    });

    // console.log("Booking details:", bookingDetails);
    // console.log("Showtime details:", showtimeDetails);
    // console.log("Seat details:", seatDetails);
    // console.log("User data:", userData);

    const session = await stripeClient.checkout.sessions.create({
      client_reference_id: userData._id.toString(),
      customer_email: userData.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY || "usd",
            product_data: {
              name: "Booking Payment",
            },
            unit_amount: showtimeDetails.price * 100, // Convert to cents
          },
          quantity: bookingDetails.seats.length,
        },
      ],
      metadata: {
        userName: userData.name,
        email: userData.email,
        showtimeId: showtimeDetails._id.toString(),
        seatIds: JSON.stringify(seatDetails.map((seat) => seat._id.toString())),
        userId: userData._id.toString(),
      },
      mode: "payment",
      success_url: "http://localhost:5173/payment-success",
      cancel_url: "http://localhost:5173/payment-cancel",
    });

    return session;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment method confirmation failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};
