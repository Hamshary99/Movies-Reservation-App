import { all } from "axios";

export const cacheKeys = {
    hall: (HallId) => `hall:${HallId}`,
    allHalls: () => `allHalls`,
    seatsOfHall: (HallId) => `seatsOfHall:${HallId}`,
    availableSeats: (showtimeId) => `availableSeats:${showtimeId}`,
    user: (userId) => `user:${userId}`,
    movie: (movieId) => `movie:${movieId}`,
    allMovies: () => `allMovies`,
    showtime: (showtimeId) => `showtime:${showtimeId}`,
    allShowtimes: () => `allShowtimes`,
    showtimesOfMovie: (movieId) => `showtimesOfMovie:${movieId}`,
    showtimesOfMovieByDate: (movieId, date) => `showtimesByMovieAndDate:${movieId}:${date}`,
    booking: (userId, bookingId) => `booking:${userId}:${bookingId}`,
    userBookings: (userId) => `bookings:${userId}`,
    allBookings: () => `allBookings`,
};
