import api from "../apiConfig";

export const employeeService = {
  scanTicket: async (ticketId) => {
    const response = await api.post(`/reception/scanTicketQR`, { ticketId });
    return response.data;
  },

  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/reception/bookingDetails/${bookingId}`);
    return response.data;
  },

  getTodayShowtimes: async () => {
    const response = await api.get("/reception/showtimes");
    return response.data;
  },

  getShowtimeDetails: async (showtimeId) => {
    const response = await api.get(`/reception/showtime/${showtimeId}`);
    return response.data;
  },

  verifyTicket: async (ticketId) => {
    const response = await api.post(`/reception/verifyTicket`, { ticketId });
    return response.data;
  },
};
