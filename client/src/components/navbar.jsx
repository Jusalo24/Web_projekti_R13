import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo1">Movie Project</h1>
      <ul className="links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/movies">Movies</Link></li>
        <li><Link to="/groups">Groups</Link></li>
        <li><Link to="/account">Account</Link></li>
      </ul>
    </nav>
  )
}