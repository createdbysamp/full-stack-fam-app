import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <Link className="navbar-brand fw-bold" to="/">Swole Buddy</Link>
            <div className="ms-auto">
            <Link className="nav-link-light d-inline px-2" to="/register">Register</Link>
            <Link className="nav-link-light d-inline px-2" to="/login">Login</Link>
            <Link className="nav-link-light d-inline px-2" to="/Credits">Credits</Link>
            <Link className="nav-link-light d-inline px-2" to="/About">About</Link>
            </div>
        </nav>
    );
}