import express from "express";
import Stripe from "stripe";
import * as bookingRepository from "../repository/bookingRepository.js";

const webhookRouter = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

import { StripeError } from "../utils/errorHandler.js";

webhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // console.log("⚡ Webhook hit!");
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      // console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    if (event.type === "checkout.session.completed") {
      try {
        const session = event.data.object;
        const metadata = session.metadata || {};
        // const userId = metadata.userId;
        const showtimeId = metadata.showtimeId;
        const seatIds = metadata.seatIds ? JSON.parse(metadata.seatIds) : [];
        const bookingId = metadata.bookingId;

        if (!showtimeId || seatIds.length === 0 || !bookingId) {
          // throw new StripeError("Missing essential metadata in webhook", 400, "stripe_error");
          return res.status(400).send("Missing essential metadata in webhook");
        }

        await bookingRepository.confirmBooking(bookingId);
        await bookingRepository.addSeatsToBooking(
          bookingId,
          showtimeId,
          seatIds
        );

        res.status(200).json({ received: true });
      } catch (err) {
        // console.error("Webhook handler failed:", err);
        res.status(500).send("Webhook handler error");
      }
    } else if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      try {
        await bookingRepository.cancelBooking(bookingId);

        res.status(200).json({ received: true });
      } catch (err) {
        res.status(500).send("Webhook handler error");
      }
    } else {
      res.status(200).send("Event ignored");
    }
  }
);

export default webhookRouter;
