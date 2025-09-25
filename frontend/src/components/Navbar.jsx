import { Link, useNavigate } from 'react-router-dom';
import { isAuthed, clearSession } from '../services/session';

export default function Navbar() {
    const authed = isAuthed();
    const nav = useNavigate();

    function handleLogout() {
        clearSession();
        nav("/login");
    }

    return (
        <nav className="navbar navbar-expand bg-light border-bottom">
            <div className="container">
                <Link to="/" className="navbar-brand">Swole Buddy</Link>

                {authed ? (
                    <div className="d-flex gap-2 ms-auto">
                        <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">Dashboard</Link>
                        <Link to="/generator" className="btn btn-outline-secondary btn-sm">Generator</Link>
                        <Link to="/workouts" className="btn btn-outline-secondary btn-sm">Workouts</Link>
                        <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
                    </div>
                ) : (
                    <div className="d-flex gap-2 ms-auto">
                        <Link to="/about" className="btn btn-outline-secondary btn-sm">About</Link>
                        <Link to="/credits" className="btn btn-outline-secondary btn-sm">Credits</Link>
                        <Link to="/login" className="btn btn-outline-secondary btn-sm">Login</Link>
                        <Link to="/register" className="btn btn-outline-secondary btn-sm">Register</Link>
                    </div>
                )}
            </div>
        </nav>
    )
}