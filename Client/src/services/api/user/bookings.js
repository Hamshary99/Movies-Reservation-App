import api from "../apiConfig";

export const userBookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post("/user/booking", bookingData);
    console.log("Booking response from service:", response);
    return response.data;
  },

  getBooking: async (bookingId) => {
    const response = await api.get(`/user/booking/${bookingId}`);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get("/user/booking");
    return response.data;
  },

  initiatePayment: async (bookingId) => {
    const response = await api.post("/user/payments/create-checkout-session", {
      bookingId,
    });
    return response.data;
  },

  verifyPayment: async (sessionId) => {
    const response = await api.post("/user/payments/verify", {
      sessionId,
    });
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/user/booking/${bookingId}`);
    return response.data;
  },
};
