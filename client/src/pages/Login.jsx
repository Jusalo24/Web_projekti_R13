import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const handleLogin = async () => {
    try {
      const res = await fetch(`${baseURL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // Oletus: backend palauttaa { user: {...}, token: "..." }
      if (!data.user || !data.token) {
        alert("Invalid login response from server.");
        return;
      }

      // ⭐ TÄRKEÄ: käytä AuthContextia
      login(data.user, data.token);

      navigate("/account"); // tai "/" jos haluat etusivulle
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <label>Email</label>
      <input
        type="email"
        placeholder="Enter email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Enter password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} className="auth-btn">
        Login
      </button>

      <p>
        Don't have an account?{" "}
        <Link to="/register">Create Account</Link>
      </p>
    </div>
  );
}
