import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import "../styles/index.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleSearch = (query) => {
    if (!query) return;

    // ohjaa search-parametrilla varustetulle sivulle
    navigate(`/SearchResult?search=${encodeURIComponent(query)}`);
  };

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
  );
}
