import { Link } from "react-router-dom"

export default function Navbar () {
    return (
        <nav className="Navbar">
            <h1 className="logo1">Movie Project</h1>
            <ul className="Links">
                <li>Movies</li>
                <li>Series</li>
                <li>Home</li>
                <li>Groups</li>
                <li>Account</li>
            </ul>
        </nav>
    )
}