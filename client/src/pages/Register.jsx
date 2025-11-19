import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";


export default function Register() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleRegister = async () => {
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    // Onnistunut luonti -> mennään login-näkymään
    navigate("/login")
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

      <label>Email</label>
      <input
        type="email"
        placeholder="Enter email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Username</label>
      <input
        type="text"
        placeholder="Choose username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        placeholder="Create password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister} className="auth-btn">
        Create Account
      </button>

      <p>
        Already have an account?{" "}
        <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}
