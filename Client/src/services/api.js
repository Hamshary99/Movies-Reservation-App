// services/api.js
import axios from "axios";

// Configure base URL
axios.defaults.baseURL = "http://localhost:3000";

// Add token if exists (note: this only runs ONCE at load time)
const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// 401 interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Re-export the NEW modular services (this is what you're using now)
export {
  userMovieService,
  userBookingService,
  userShowtimeService,
  userProfileService,
  adminMovieService,
  adminBookingService,
  adminShowtimeService,
  employeeService,
  api as apiConfig,
} from "./api/index.js";
