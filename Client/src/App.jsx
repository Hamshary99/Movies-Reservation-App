import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "./context/AuthContext";
import "./styles/App.css";

// Pages
import MoviesPage from "./pages/MoviesPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import ShowtimesPage from "./pages/ShowtimesPage";
import ShowtimeDetailsPage from "./pages/ShowtimeDetailsPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import LoginSignupPage from "./pages/LoginSignupPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccess from "./pages/PaymentSuccess";
import MyBookingsPage from "./pages/MyBookingsPage";

const App = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Set active tab based on current route
    if (location.pathname === "/movies" || location.pathname === "/") {
      setTabValue(0);
    } else if (location.pathname.startsWith("/my-bookings")) {
      setTabValue(1);
    } else {
      setTabValue(false);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      navigate("/movies");
    } else if (newValue === 1) {
      navigate("/my-bookings");
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/");
  };

  return (
    <div className="app">
      <AppBar position="static" color="default" className="app-header">
        <Toolbar>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            className="app-title"
          >
            <Tab label="Movies" />
            <Tab label="My Bookings" disabled={!user} />
          </Tabs>

          {user ? (
            <div>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <div className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/movies" replace />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
          <Route path="/login" element={<LoginSignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              user ? (
                <ProfilePage />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/movies/:movieId/showtimes"
            element={<ShowtimesPage />}
          />
          <Route
            path="/showtimes/:showtimeId"
            element={
              user ? (
                <ShowtimeDetailsPage />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/booking/:bookingId"
            element={
              user ? (
                <BookingDetailsPage />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/payment/success"
            element={
              user ? (
                <PaymentSuccess />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />
          <Route
            path="/my-bookings"
            element={
              user ? (
                <MyBookingsPage />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/movies" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
