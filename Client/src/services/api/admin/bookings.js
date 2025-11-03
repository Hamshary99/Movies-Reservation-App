import api from "../apiConfig";

export const adminBookingService = {
  getAllBookings: async () => {
    const response = await api.get("/admin/bookings");
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await api.get(`/admin/booking/${bookingId}`);
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await api.put(`/admin/booking/${bookingId}/status`, {
      status,
    });
    return response.data;
  },

  deleteBooking: async (bookingId) => {
    const response = await api.delete(`/admin/booking/${bookingId}`);
    return response.data;
  },

  getBookingStats: async (startDate, endDate) => {
    const response = await api.get("/admin/bookings/stats", {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
