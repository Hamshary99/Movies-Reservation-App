import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user ID from localStorage user object
    const userObj = localStorage.getItem("user");
    let userId = null;
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        userId = parsed._id || parsed.id;
        // console.log("✅ userId from localStorage:", userId);
      } catch (e) {
          // console.error("❌ Failed to parse user from localStorage:", e);
      }
      }
      // console.log("userId: ", userId);
      // console.log("userObj: ", userObj);
      const token = localStorage.getItem("token");
      // console.log("TOKEN: ", token);

    if (userId && token) {
      axios
        .get(`/user/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          setForm(res.data.user);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Failed to load profile.");
          setLoading(false);
        });
    } else {
      setError("Not authenticated");
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const userObj = localStorage.getItem("user");
    let userId = null;
    if (userObj) {
      try {
        userId = JSON.parse(userObj)._id || JSON.parse(userObj).id;
      } catch {}
    }
    const token = localStorage.getItem("token");
    if (userId && token) {
      axios
        .put(`/user/profile/${userId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setEditMode(false);
        });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: 40 }}>
        {error}
      </div>
    );
  if (!user) return <div>No user data found.</div>;

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <h2>User Profile</h2>
      {editMode ? (
        <>
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Name"
          />
          <br />
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Email"
          />
          <br />
          {/* Add more fields as needed */}
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p>
            <b>Name:</b> {user.name}
          </p>
          <p>
            <b>Email:</b> {user.email}
          </p>
          {/* Add more fields as needed */}
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
