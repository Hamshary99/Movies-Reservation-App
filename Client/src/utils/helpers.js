// Date formatting
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Time formatting
export const formatTime = (time) => {
  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Calculate total price
export const calculateTotalPrice = (seats, pricePerSeat) => {
  return seats.length * pricePerSeat;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Generate seat label
export const getSeatLabel = (seat) => {
  return `${seat.row}${seat.number}`;
};

// Get next N days
export const getNextNDays = (n = 7) => {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });
};

// Validate booking data
export const validateBookingData = (data) => {
  const errors = {};

  if (!data.showtimeId) errors.showtimeId = "Showtime is required";
  if (!data.seats || data.seats.length === 0)
    errors.seats = "Select at least one seat";
  if (data.seats?.length > 6) errors.seats = "Maximum 6 seats allowed";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      console.error("Error reading from localStorage:", err);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error("Error removing from localStorage:", err);
    }
  },
};
