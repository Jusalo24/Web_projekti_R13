import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Password validation
  const isValidPassword = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // FRONTEND VALIDATION BEFORE SENDING TO SERVER
    if (!email || !username || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long and contain one uppercase letter and one number."
      );
      return;
    }

    // SEND DATA TO BACKEND
    const res = await fetch("http://localhost:3001/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error || "Registration failed.");
      return;
    }

    // SUCCESS
    setSuccessMessage("Account created successfully! Redirecting...");
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <form className="auth-form" onSubmit={handleRegister}>
        <label>Email</label>
        <input type="email" placeholder="Enter email..." value={email}
         onChange={(e) => setEmail(e.target.value)}/>

        <label>Username</label>
        <input type="text" placeholder="Choose username..." value={username}
          onChange={(e) => setUsername(e.target.value)}/>

        <label>Password</label>
        <input type="password" placeholder="Create password..." value={password}
          onChange={(e) => setPassword(e.target.value)}/>

        {/* Show error message */}
        {errorMessage && <p className="auth-error">{errorMessage}</p>}

        {/* Show success message */}
        {successMessage && <p className="auth-success">{successMessage}</p>}

        <button type="submit" className="auth-btn">
          Create Account
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
