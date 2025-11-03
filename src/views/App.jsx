import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MoviesPage from "./views/MoviesPage";
import ShowtimesPage from "./views/ShowtimesPage";
import MyBookingsPage from "./views/MyBookingsPage";
import LoginSignupPage from "./views/LoginSignupPage";
import BookingDetailsPage from "./views/BookingDetailsPage";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/movies" replace />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:movieId/showtimes" element={<ShowtimesPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/login" element={<LoginSignupPage />} />
          <Route path="/booking/:id" element={<BookingDetailsPage />} />
          <Route path="*" element={<Navigate to="/movies" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
