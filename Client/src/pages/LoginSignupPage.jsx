import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import "../styles/pages/LoginSignupPage.css";

const LoginSignupPage = () => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form fields
    if (tab === 1 && !form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password.trim()) {
      setError("Password is required");
      return;
    }
    if (tab === 1) {
  if (!form.name?.trim()) {
    setError("Name is required");
    return;
  }
  if (!form.confirmPassword?.trim()) {
    setError("Confirm password is required");
    return;
  }
  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match");
    return;
  }
  if (form.phone?.trim() && !/^\+?[0-9]{7,15}$/.test(form.phone)) {
    setError("Invalid phone number");
    return;
  }
}
    try {
      if (tab === 0) {
        // Login
        console.log("Attempting login with:", { email: form.email });
        const result = await login(form.email, form.password);
        if (result.success) {
          console.log("Login successful");
          navigate("/");
        }
      } else {
        // Register
        console.log("Attempting registration with:", {
          email: form.email,
          name: form.name,
        });
        const result = await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          phone: form.phone,
          role: "user", // Explicitly set the role
        });
        if (result.success) {
          console.log("Registration successful");
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    }
  };

  return (
    <Container className="auth-container">
      <Paper className="auth-paper">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          className="auth-tabs"
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>

        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 1 && (
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="form-field"
              />
          )}

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="form-field"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="form-field"
          />

          {tab === 1 && (
            <>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="form-field"
              />
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="form-field"
                inputProps={{
                  pattern: "[0-9]{7,15}",
                  title: "Please enter a valid phone number",
                }}
              />
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="submit-button"
            >
            {tab === 0 ? "Login" : "Sign Up"}
          </Button>
            </form>
      </Paper>
    </Container>
  );
};

export default LoginSignupPage;
