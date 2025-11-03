import api from "../apiConfig";
import { format } from "date-fns";

export const adminMovieService = {
  // Movie Management
  getAllMovies: async () => {
    const response = await api.get("/admin/movies");
    return response.data;
  },

  getMovieById: async (movieId) => {
    const response = await api.get(`/admin/movie/${movieId}`);
    return response.data;
  },

  createMovie: async (movieData) => {
    const response = await api.post("/admin/movie", movieData);
    return response.data;
  },

  updateMovie: async (movieId, movieData) => {
    const response = await api.put(`/admin/movie/${movieId}`, movieData);
    return response.data;
  },

  deleteMovie: async (movieId) => {
    const response = await api.delete(`/admin/movie/${movieId}`);
    return response.data;
  },

  // Showtime Management
  getAllShowtimes: async () => {
    const response = await api.get("/admin/showtimes");
    return response.data;
  },

  getShowtimesByMovie: async (movieId, date) => {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    // Using query parameters
    const response = await api.get(`/admin/showtime`, {
      params: { movieId, date: formattedDate },
    });
    return response.data;
  },

  // Alternative method using path parameters if needed
  getShowtimesByMoviePath: async (movieId, date) => {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const response = await api.get(
      `/admin/movie/${movieId}/showtimes/${formattedDate}`
    );
    return response.data;
  },

  getShowtimeById: async (showtimeId) => {
    const response = await api.get(`/admin/showtime/${showtimeId}`);
    return response.data;
  },

  createShowtime: async (showtimeData) => {
    // Ensure date is properly formatted
    if (showtimeData.date) {
      showtimeData.date = format(new Date(showtimeData.date), "yyyy-MM-dd");
    }
    const response = await api.post("/admin/showtime", showtimeData);
    return response.data;
  },

  updateShowtime: async (showtimeId, showtimeData) => {
    // Ensure date is properly formatted
    if (showtimeData.date) {
      showtimeData.date = format(new Date(showtimeData.date), "yyyy-MM-dd");
    }
    const response = await api.put(
      `/admin/showtime/${showtimeId}`,
      showtimeData
    );
    return response.data;
  },

  deleteShowtime: async (showtimeId) => {
    const response = await api.delete(`/admin/showtime/${showtimeId}`);
    return response.data;
  },

  // Batch operations for showtimes
  createMultipleShowtimes: async (movieId, showtimesData) => {
    const response = await api.post(
      `/admin/movie/${movieId}/showtimes/batch`,
      showtimesData
    );
    return response.data;
  },

  deleteAllShowtimesForMovie: async (movieId) => {
    const response = await api.delete(`/admin/movie/${movieId}/showtimes`);
    return response.data;
  },
};
