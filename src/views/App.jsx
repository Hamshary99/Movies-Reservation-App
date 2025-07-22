import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Alert,
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  Dialog,
  IconButton
} from "@mui/material";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import LoginSignupPage from "./LoginSignupPage";
import CloseIcon from '@mui/icons-material/Close';
import ShowtimesPage from "./ShowtimesPage";
import BookingDetailsPage from "./BookingDetailsPage";

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [showtimesError, setShowtimesError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("/user/showtimes");
        const moviesArr = Array.from(
          new Map((res.data.showtime || []).map((s) => [s.movie?._id, s.movie])).values()
        );
        setMovies(moviesArr);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (!selectedMovie || !selectedDay) return;
    setShowtimesLoading(true);
    setShowtimesError("");
    const fetchShowtimes = async () => {
      try {
        const res = await axios.get("/user/showtimes");
        const allShowtimes = res.data.showtime || [];
        const filtered = allShowtimes.filter(
          (s) =>
            s.movie?._id === selectedMovie._id &&
            s.date.slice(0, 10) === selectedDay.toISOString().slice(0, 10)
        );
        setShowtimes(filtered);
      } catch (err) {
        setShowtimesError(err.response?.data?.message || "Failed to load showtimes.");
      } finally {
        setShowtimesLoading(false);
      }
    };
    fetchShowtimes();
  }, [selectedMovie, selectedDay]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Movies Reservation App
      </Typography>
      {/* Movie Picker */}
      {!selectedMovie && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Pick a Movie
          </Typography>
          <Grid container spacing={3}>
            {movies.map((movie) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
                <Paper sx={{ p: 2, textAlign: "center", cursor: "pointer" }} onClick={() => setSelectedMovie(movie)}>
                  <Typography variant="h6">{movie.title}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {/* Day Picker */}
      {selectedMovie && !selectedDay && (
        <>
          <Button sx={{ mb: 2 }} onClick={() => setSelectedMovie(null)}>
            Back to Movies
          </Button>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Pick a Date for {selectedMovie.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            {getNext7Days().map((day) => (
              <Button
                key={day.toISOString()}
                variant={
                  selectedDay &&
                  day.toDateString() === selectedDay.toDateString()
                    ? "contained"
                    : "outlined"
                }
                onClick={() => setSelectedDay(day)}
              >
                {day.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Button>
            ))}
          </Box>
        </>
      )}
      {/* Showtimes List */}
      {selectedMovie && selectedDay && (
        <>
          <Button sx={{ mb: 2 }} onClick={() => setSelectedDay(null)}>
            Back to Dates
          </Button>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Showtimes for {selectedMovie.title} on {selectedDay.toLocaleDateString()}
          </Typography>
          {showtimesLoading ? (
            <CircularProgress />
          ) : showtimesError ? (
            <Alert severity="error">{showtimesError}</Alert>
          ) : showtimes.length === 0 ? (
            <Typography>No showtimes available for this day.</Typography>
          ) : (
            <Grid container spacing={3}>
              {showtimes.map((show) => (
                <Grid item xs={12} md={6} lg={4} key={show._id}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6">Time: {show.time}</Typography>
                    <Typography>Hall: {show.hall?.name || "N/A"}</Typography>
                    <Typography>Price: ${show.price}</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/showtimes?showtimeId=${show._id}`)}
                    >
                      Pick Seats
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState(0); // 0 = login, 1 = signup
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep Home tab selected if on home, otherwise none
  useEffect(() => {
    if (location.pathname === "/home" || location.pathname === "/") {
      setTabValue(0);
    } else {
      setTabValue(false);
    }
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      navigate("/home");
    } else if (newValue === 1) {
      setLoginTab(0);
      setLoginOpen(true);
    } else if (newValue === 2) {
      setLoginTab(1);
      setLoginOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <>
      <AppBar position="static" color="default" sx={{ mb: 4 }}>
        <Toolbar>
          <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
            <Tab label="Home" />
            {!isAuthenticated() && <Tab label="Login" />}
            {!isAuthenticated() && <Tab label="Sign Up" />}
          </Tabs>
          {isAuthenticated() && (
            <Button color="error" sx={{ ml: 2 }} onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/booking/:id" element={<BookingDetailsPage />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={() => setLoginOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <LoginSignupPage mode={loginTab === 0 ? "login" : "signup"} />
      </Dialog>
    </>
  );
}

export default App;
