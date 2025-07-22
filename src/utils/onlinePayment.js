import stripe from "stripe";
import { StripeError } from "./errorHandler.js";

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

export const createClientData = async (name, email, phone) => {
  try {
    if (!name || !email) {
      throw new StripeError("All fields are required", 400, "stripe_error");
    }
    const client = await stripeClient.customers.create({
      name,
      email,
      phone,
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

export const updateClientData = async (
  id,
  name,
  email,
  phone,
  address,
  balance
) => {
  try {
    const client = await stripeClient.customers.update(id, {
      name,
      email,
      phone,
      address,
      balance,
    });
    return client;
  } catch (error) {
    throw new StripeError(
      error.message || "Stripe payment confirmation failed",
      error.statusCode || 400,
      error.type || "stripe_error"
    );
  }
};

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
  userName,
  bookingDetails,
  receipt_email,
  customerId
) => {
  try {
    if (
      !amount ||
      !currency ||
      !userName ||
      !bookingDetails ||
      !receipt_email ||
      !customerId
    ) {
      throw new StripeError("All fields are required", 400, "stripe_error");
    }
    amount = amount * 100;
    const paymentIntent = await stripeClient.paymentIntents.create(
      {
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userName,
          bookingDetails: JSON.stringify(bookingDetails),
        },
        receipt_email,
        return_url: process.env.CLIENT_URL,
        customer: customerId,
      },
      {
        idempotencyKey: bookingId,
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

export const retreivePaymentIntent = async (id) => {
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
