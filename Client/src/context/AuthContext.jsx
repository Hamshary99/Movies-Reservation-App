// AuthContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

// Set baseURL to your API (adjust if needed)
axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // loading indicates "we're resolving initial auth state" — keep true until refresh attempt finishes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent double initialization when React StrictMode runs effects twice in dev
  const initializedRef = useRef(false);
  // Track if we already tried refresh (so we don't spam refresh endpoint)
  const refreshTriedRef = useRef(false);
  // Track current axios request so we can cancel it on unmount
  const cancelSourceRef = useRef(null);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const controller = new AbortController();
    cancelSourceRef.current = controller;

    const initializeAuth = async () => {
      try {
        // 1) restore cached user/token immediately (fast UI restore)
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem("user");
          }
        }

        if (savedToken) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
        }

        // 2) Only attempt a cookie-based silent refresh if there's no saved token.
        //    This prevents repeated refresh calls on every page load.
        if (!savedToken && !refreshTriedRef.current) {
          refreshTriedRef.current = true; // ensure single attempt
          try {
            const res = await axios.get("/auth/refresh", {
              withCredentials: true,
              signal: controller.signal,
            });

            const newToken = res?.data?.accessToken;
            const newUser = res?.data?.user;

            if (newToken) {
              localStorage.setItem("token", newToken);
              axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            }

            if (newUser) {
              localStorage.setItem("user", JSON.stringify(newUser));
              setUser(newUser);
            }
          } catch (err) {
            // handle network / 401 / 429 cases gracefully
            const status = err?.response?.status;
            // 401 => refresh token invalid => fully clear auth
            if (status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
            // 429 => rate limited, don't clear cached user; log and stop retrying
            } else if (status === 429) {
              console.warn("Silent refresh rate-limited (429). Not retrying immediately.");
            } else if (err.name === "CanceledError" || err.message === "canceled") {
              // aborted intentionally on component unmount — ignore
            } else {
              // network error: keep cached user (if any) and don't clear immediately
              console.warn("Silent refresh network error:", err.message || err);
            }
          }
        }
      } catch (outerErr) {
        console.warn("initializeAuth unexpected error:", outerErr);
      } finally {
        // only flip loading after the (possible) refresh attempt finishes
        setLoading(false);
      }
    };

    initializeAuth();

    // keep token in sync across tabs
    const handleStorage = (e) => {
      if (e.key === "token") {
        const newToken = e.newValue;
        if (newToken) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        } else {
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
        }
      }
      if (e.key === "user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      // Cancel any pending refresh request when unmounting
      if (cancelSourceRef.current) cancelSourceRef.current.abort();
      window.removeEventListener("storage", handleStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post(
        "/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = res.data?.accessToken || res.data?.token;
      const userData = res.data?.user;

      if (!token || !userData) throw new Error("Invalid login response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed";
      setError(msg);
      throw new Error(msg);
    }
  };

  // REGISTER
  const register = async (userData) => {
    setError(null);
    try {
      const res = await axios.post("/auth/register", userData);
      const token = res.data?.accessToken || res.data?.token;
      const newUser = res.data?.user;

      if (!token || !newUser) throw new Error("Invalid registration response");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(newUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      throw new Error(msg);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error (ignored):", err?.message || err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  };

  const value = { user, loading, error, login, logout, register };

  // Prevent rendering the app until initial refresh attempt finishes
  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
