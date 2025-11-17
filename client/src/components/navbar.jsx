import { Link } from "react-router-dom"
import SearchBar from "./SearchBar"
import "../styles/index.css";

export default function Navbar() {
  const handleSearch = (query) => {
    console.log("Search query:", query)
    // tänne: navigate(`/movies?search=${query}`)
  }

  return (
    <nav className="navbar">
      <h1 className="logo1">Movie Project</h1>

      <ul className="links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/movies">Movies</Link></li>
        <li><Link to="/groups">Groups</Link></li>
        <li><Link to="/account">Account</Link></li>
      </ul>

      <SearchBar onSearch={handleSearch} />
    </nav>
  )
}
