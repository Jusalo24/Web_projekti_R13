import { Link } from "react-router-dom"

export default function Navbar () {
    return (
        <nav className="Navbar">
            <h1 className="logo1">Movie Project</h1>
            <ul className="Links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/">Movies</Link></li>
                <li><Link to="/">Groups</Link></li>
                <li><Link to="/">Account</Link></li>
            </ul>
        </nav>
    )
}