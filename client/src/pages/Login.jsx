import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    // Save token + userId
    localStorage.setItem("token", data.token)
    localStorage.setItem("userId", data.user.id)

    navigate("/account")  // redirect to profile page
  }

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
  )
}
