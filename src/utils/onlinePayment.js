import Stripe from "stripe";
import { userModel } from "../models/userModel.js";
import { StripeError } from "./errorHandler.js";

import dotenv from "dotenv";
dotenv.config();

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createClientData = async (name, email, phone) => {
  try {
    if (!name || !email) {
      throw new StripeError("All fields are required", 400, "stripe_error");
    }
    const client = await stripeClient.customers.create({
      name,
      email,
      phone: phone || undefined, // Only include phone if provided
    });
    return client;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment creation failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

// Don't see the need to update client data
// export const updateClientData = async (
//   id,
//   name,
//   email,
//   phone,
//   address,
//   balance
// ) => {
//   try {
//     const client = await stripeClient.customers.update(id, {
//       name,
//       email,
//       phone,
//       address,
//       balance,
//     });
//     return client;
//   } catch (error) {
//     throw new StripeError(
//       error.message || "Stripe payment confirmation failed",
//       error.statusCode || 400,
//       error.type || "stripe_error"
//     );
//   }
// };


// If the user decides to delete their account, or simply removing their costumer data
export const deleteClientData = async (id) => {
  try {
    const client = await stripeClient.customers.del(id);
    return client;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe refund failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

export const createPaymentIntent = async (
  amount,
  currency,
  bookingDetails,
) => {
  try {
    if (
      !amount ||
      !currency ||
      !bookingDetails
    ) {
      throw new StripeError("All fields are required", 400, "stripe_error");
    }
    const userData = await userModel.findById(bookingDetails.user);
    amount = amount * 100;
    const paymentIntent = await stripeClient.paymentIntents.create(
      {
        amount,
        currency,
        payment_method: "pm_card_visa", // Placeholder for card payment method
        confirm: true, // Automatically confirm the payment
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never"
        },
        metadata: {
          userName: userData.name,
          bookingDetails: JSON.stringify(bookingDetails),
        },
        receipt_email: userData.email,
        customer: userData.stripeCustomerId,
      },
      {
        idempotencyKey: bookingDetails._id,
      }
    );
    // Return client_secret for frontend confirmation
    return { id: paymentIntent.id, client_secret: paymentIntent.client_secret };
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment retrieval failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

// Suitable for updating and editing the seat booking, example: if the user wants to change the number of seats
export const updatePaymentIntent = async (id, amount) => {
  try {
    const paymentIntent = await stripeClient.paymentIntents.update(id, {
      amount,
    });
    return paymentIntent;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment update failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

//
export const confirmPaymentIntent = async (id) => {
  try {
    const paymentIntent = await stripeClient.paymentIntents.confirm(id);
    return paymentIntent;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment confirmation failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

export const refundPaymentIntent = async (paymentIntentId, amount = null) => {
  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = amount * 100;
    }
    const refund = await stripeClient.refunds.create(refundData);
    return refund;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe refund failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

export const retrievePaymentIntent = async (id) => {
  try {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(id);
    return paymentIntent;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment retrieval failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

// Apparently, Stripe forbidding using card details even in sandbox mode, so skip this function
export const createPaymentMethod = async (
  type,
  number,
  exp_month,
  exp_year,
  cvc,
  customerInfo
) => {
  try {
    const paymentMethod = await stripeClient.paymentMethods.create({
      type,
      card: {
        number,
        exp_month,
        exp_year,
        cvc,
      },
      billing_details: {
        name: customerInfo.name,
        email: customerInfo.email || undefined,
        phone: customerInfo.phone || undefined,
      }
    });

    // Attach the payment method to the customer
    await stripeClient.paymentMethods.attach(paymentMethod.id, { customer: customerInfo.id });
    return {paymentMethod};
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment method retrieval failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

