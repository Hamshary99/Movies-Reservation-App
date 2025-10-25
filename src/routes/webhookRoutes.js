import express from "express";
import Stripe from "stripe";
import * as bookingRepository from "../repository/bookingRepository.js";
import { db } from "../repository/dbConfig.js";

const webhookRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("Webhook called");

    const sig = req.headers["stripe-signature"];
    let event;

    // Verify Stripe signature
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Event received:", event.type);

    try {
      switch (event.type) {
        // SUCCESS: Payment completed
        case "checkout.session.completed": {
          const session = event.data.object;
          const metadata = session.metadata || {};
          const { showtimeId, bookingId } = metadata;
          const seatIds = metadata.seatIds
            ? metadata.seatIds.split(",").map((id) => Number(id))
            : [];

          if (!showtimeId || !seatIds.length || !bookingId) {
            return res
              .status(400)
              .send("Missing essential metadata in webhook");
          }

          console.log(
            `Payment completed for booking ${bookingId}`,
            `with seats ${seatIds}`,
            `for showtime ${showtimeId}`
          );

          await bookingRepository.confirmBooking(bookingId);
          await bookingRepository.addSeatsToBooking(
            bookingId,
            showtimeId,
            seatIds
          );

          break;
        }

        // FAILED or EXPIRED payments
        case "payment_intent.payment_failed":
        case "checkout.session.expired": {
          const session = event.data.object;
          const metadata = session.metadata || {};
          const bookingId = metadata.bookingId;

          if (!bookingId) {
            return res
              .status(400)
              .send("Missing bookingId for failed/expired payment");
          }

          await bookingRepository.cancelBooking(bookingId);
          break;
        }

        // REFUNDS
        case "charge.refunded": {
          const charge = event.data.object;

          const paymentIntentId = charge.payment_intent;

          if (!paymentIntentId) {
            console.warn(
              "Refund received but missing payment_intent in charge"
            );
            return res.status(400).send("Missing payment_intent in charge");
          }

          // Retrieve the Checkout Session using the Payment Intent
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntentId,
            limit: 1,
          });

          // Get the Checkout Session data
          const session = sessions.data[0];

          if (!session) {
            console.warn(
              `No Checkout Session found for paymentIntent ${paymentIntentId}`
            );
            return res
              .status(400)
              .send("Session not found for refunded charge");
          }

          const metadata = session.metadata || {};
          const bookingId = metadata.bookingId;

          if (!bookingId) {
            console.warn(
              "Refund received but missing bookingId in session metadata"
            );
            return res
              .status(400)
              .send("Missing bookingId in session metadata");
          }

          console.log(`Refund processed successfully for booking ${bookingId}`);

          // Revoke the booking from booking seats table, while switching booking status to false in booking table
          await bookingRepository.revokeBookingAfterRefund(bookingId);

          break;
        }

        default:
          console.log(`Event ignored: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Webhook handler failed:", err);
      res.status(500).send("Webhook handler error");
    }
  }
);

export default webhookRouter;
