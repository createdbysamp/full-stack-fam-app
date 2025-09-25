import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
    const [userName, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);

    try {
        await loginUser({ userName, password });
        navigate("/dashboard");
    } catch (err) {
        setErr(err.message || "Login failed");
    }
}

    return (
        <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{ background: "linear-gradient(135deg,#c471f5,#fa71cd)" }}
        >
        <div className="card p-4 shadow-lg" style={{ minWidth: "400px", wdith: "100%" }}>
            <h4 className="mb-4 text-center">Login</h4>
            {err && <div className="alert alert-danger">{err}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="userName" className="form-label">
                        Username
                    </label>
                    <input 
                        type="text"
                        className="form-control"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                    Log In
                </button>
            </form>
            <p className="text-muted text-center mt-3">
            Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
            <img src="/images/pink-dude.jpg" alt="guy lifting" className="img-fluid rounded w-50 mx-auto" />
        </div>
        </div>
    );
}

