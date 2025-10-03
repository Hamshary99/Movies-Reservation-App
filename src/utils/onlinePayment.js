import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

import { StripeError } from "./errorHandler.js";
import { db } from "../repository/dbConfig.js";


const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkoutPayment = async (bookingDetails, seatIds, showtimeId, user) => {
  try {
    if (!bookingDetails) {
      throw new StripeError("Booking details are required", 400);
    }

    const session = await stripeClient.checkout.sessions.create({
      client_reference_id: user.id,
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY || "usd",
            product_data: {
              name: "Booking Payment",
            },
            unit_amount: (bookingDetails.totalPrice) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        userName: user.name,
        email: user.email,
        showtimeId: showtimeId,
        seatIds: JSON.stringify(seatIds.map((seat) => seat.toString())),
        bookingId: bookingDetails.id.toString(),
      },
      mode: "payment",
      success_url: "http://localhost:5173/payment-success",
      cancel_url: "http://localhost:5173/payment-cancel",
    });

    if(!session || !session.url) {
      throw new StripeError("Stripe session creation failed", 500);
    }


    return session;
  } catch (error) {
    // await db.rollback();
    throw new StripeError(
      error.message || "Stripe payment method confirmation failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};
