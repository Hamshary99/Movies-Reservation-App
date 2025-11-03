// User services
export { userMovieService } from "./user/movies";
export { userBookingService } from "./user/bookings";
// Provide aliases for showtime-related operations which live in user/movies
export { userMovieService as userShowtimeService } from "./user/movies";

// Admin services
export { adminMovieService } from "./admin/movies";
export { adminBookingService } from "./admin/bookings";
// Alias for admin showtime operations (many are under admin/movies)
export { adminMovieService as adminShowtimeService } from "./admin/movies";

// Employee services
export { employeeService } from "./employee/reception";

// Base API configuration
export { default as api } from "./apiConfig";
