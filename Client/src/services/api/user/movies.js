import api from "../apiConfig";
import { format } from "date-fns";

export const userMovieService = {
  getAllMovies: async () => {
    const response = await api.get("/user/movies");
    return response.data;
  },

  getMovieById: async (movieId) => {
    const response = await api.get(`/user/movies/${movieId}`);
    return response.data;
  },

  // Get all showtimes for a specific movie (filter by date on client)
  getShowtimesByMovie: async (movieId) => {
    const response = await api.get(`/user/showtime/movie/${movieId}`);
    return response.data;
  },

  // Alternative method using path parameters if needed
  getShowtimesByMoviePath: async (movieId, date) => {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const response = await api.get(
      `/user/movies/${movieId}/showtimes/${formattedDate}`
    );
    return response.data;
  },

  // Get details of a specific showtime
  getShowtimeDetails: async (showtimeId) => {
    const response = await api.get(`/user/showtime/${showtimeId}`);
    return response.data;
  },

  // Get available seats for a showtime
  getAvailableSeats: async (showtimeId) => {
    const response = await api.get(`/user/showtime/${showtimeId}/seats`);
    return response.data;
  },
};
