import express from "express";
import Stripe from "stripe";
import { bookingModel } from "../models/bookingModel.js";


const webhookRouter = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

webhookRouter.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {

    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        const metadata = session.metadata;
        const userId = metadata.userId;
        const showtimeId = metadata.showtimeId;
        const seatIds = JSON.parse(metadata.seatIds || "[]");
          
        // console.log("Received booking metadata:", {
        //     userId,
        //     showtimeId,
        //     seatIds,
        // });

        // Safety checks
        if (!userId || !showtimeId || seatIds.length === 0) {
          throw new Error("Invalid metadata for booking");
        }

        // Check if already booked to avoid duplicates
        const alreadyExists = await bookingModel.findOne({ user: userId });

        if (!alreadyExists) {
          await bookingModel.create({
            user: userId,
            showtime: showtimeId,
            seats: seatIds,
            isBooked: true,
            isUsed: false,
          });

          console.log("Booking created via webhook");
        } else {
          console.log("Booking already exists, skipped");
        }

        res.status(200).json({ received: true });
      } catch (err) {
        console.error("Webhook handler failed:", err);
        res.status(500).send("Webhook handler error");
      }
    } else {
      res.status(200).send("Event ignored");
    }
  }
);

export default webhookRouter;