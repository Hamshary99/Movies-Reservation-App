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
            unit_amount: bookingDetails.totalPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        userName: user.name,
        email: user.email,
        showtimeId: showtimeId,
        seatIds: seatIds.join(","),
        bookingId: bookingDetails.id,
      },
      mode: "payment",
      // success_url: `${process.env.CLIENT_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `http://localhost:5173/payment/success?bookingId=${bookingDetails.id}`,
      cancel_url: `${process.env.CLIENT_URL}/booking-cancel`,
    });

    if(!session || !session.url) {
      throw new StripeError("Stripe session creation failed", 500);
    }

    // console.log("session: ", session);

    return session;
  } catch (error) {
    // await db.rollback();
    throw new StripeError(
      error.message || "Stripe payment method confirmation failed",
      error.statusCode || 400,
      error.type || "stripe_error",
      error
    );
  }
};

export const refundPayment = async (checkoutSessionId, bookingDetails) => {
  try {
    if (!checkoutSessionId) {
      throw new StripeError("Checkout session ID is required", 400);
    }

    const session = await stripeClient.checkout.sessions.retrieve(checkoutSessionId);

    if (!session) {
      throw new StripeError("Checkout session not found", 404);
    }

    const paymentIntentId = session.payment_intent;

    if (!paymentIntentId) {
      throw new StripeError("No payment intent found for this session", 404);
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        bookingId: bookingDetails.id,
      },
    });

    if (session.metadata && session.metadata.bookingId) {
      console.log(`Booking ${session.metadata.bookingId} has been refunded`);
    }

    return {
      refundId: refund.id,
      amount: refund.amount / 100, 
      status: refund.status,
      sessionId: checkoutSessionId,
      metadata: session.metadata,
    };
  } catch (error) {
    throw new StripeError(
      error.message || "Refund failed",
      error.statusCode || 400,
      error.type || "stripe_error",
      error
    );
  }
};
