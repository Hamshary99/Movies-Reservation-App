import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:3000"; // Update with your API URL

// Add token to requests if it exists
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const movieService = {
  getAllMovies: () => axios.get("/user/movies"),
  getMovie: (id) => axios.get(`/user/movies/${id}`),
  getShowtimesByDate: (movieId, date) =>
    axios.get(`/user/movies/${movieId}/showtimes/${date}`),
};

export const showtimeService = {
  getShowtime: (id) => axios.get(`/user/showtime/${id}`),
  getAvailableSeats: (id) => axios.get(`/user/showtime/${id}/seats`),
};

export const bookingService = {
  createBooking: (data) => axios.post("/user/booking", data).then((res) => res.data),
  getBooking: (id) => axios.get(`/user/booking/${id}`).then((res) => res.data),
  getUserBookings: () => axios.get("/user/booking").then((res) => res.data),
  updateBooking: (id, data) => axios.put(`/user/booking/${id}`, data).then((res) => res.data),
  cancelBooking: (id) => axios.delete(`/user/booking/${id}`).then((res) => res.data),
};

export const userService = {
  getProfile: (id) => axios.get(`/user/profile/${id}`),
  updateProfile: (id, data) => axios.put(`/user/profile/${id}`, data),
};

export const stripeService = {
  createPaymentIntent: (bookingData) =>
    axios.post("/stripe/create-payment-intent", bookingData),
};

// Axios interceptor for handling errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Re-export role-based services from the `services/api` folder so importing
// from '../services/api' works consistently across the app. This keeps the
// existing axios setup above while enabling named imports like
// `userMovieService`, `userBookingService`, `adminMovieService`, etc.
// Import the named role-based services and re-export them explicitly. Using
// explicit re-exports avoids potential circular/static-analysis issues with
// some bundlers when mixing a file and a folder with the same name.
import {
  userMovieService,
  userBookingService,
  userShowtimeService,
  adminMovieService,
  adminBookingService,
  adminShowtimeService,
  employeeService,
  api as apiConfig,
} from "./api/index.js";

export {
  userMovieService,
  userBookingService,
  userShowtimeService,
  adminMovieService,
  adminBookingService,
  adminShowtimeService,
  employeeService,
  apiConfig,
};
