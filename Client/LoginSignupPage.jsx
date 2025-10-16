import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";

function LoginSignupPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setAlert({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });
    setLoading(true);
    try {
      if (tab === 1) {
        // Register
        const res = await axios.post("/signup", { ...form, role: "user" });
        // if (res.data.token) {
        //   localStorage.setItem("token", res.data.token);
        // }
        const { token, user } = res.data;
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user)); 
        }
        setAlert({
          type: "success",
          message: res.data.message || "Signup successful!",
        });
        setTimeout(() => navigate("/showtimes"), 800);
      } else {
        // Login
        const { email, password } = form;
        const res = await axios.post("/login", { email, password });
        // if (res.data.token) {
        //   localStorage.setItem("token", res.data.token);
        // }
        const { token, user } = res.data;
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user)); 
        }
        setAlert({
          type: "success",
          message: res.data.message || "Login successful!",
        });
        setTimeout(() => navigate("/showtimes"), 800);
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to show login status and decode token
  const [decoded, setDecoded] = useState(null);
  const token = localStorage.getItem("token");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper elevation={6} sx={{ p: 4, minWidth: 350 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        {token && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Logged in as JWT:{" "}
            <Button size="small" onClick={() => setDecoded(jwtDecode(token))}>
              Show Info
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
            >
              Logout
            </Button>
          </Alert>
        )}
        {decoded && (
          <Alert severity="info" sx={{ mb: 2, wordBreak: "break-all" }}>
            <pre style={{ margin: 0 }}>{JSON.stringify(decoded, null, 2)}</pre>
          </Alert>
        )}
        {alert.message && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {tab === 1 && (
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
            />
          )}
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
            type="email"
          />
          <TextField
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            type="password"
          />
          {tab === 1 && (
            <>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                fullWidth
                type="password"
              />
              <TextField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                fullWidth
              />
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading
              ? tab === 0
                ? "Logging in..."
                : "Signing up..."
              : tab === 0
                ? "Login"
                : "Sign Up"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginSignupPage;
