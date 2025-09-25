import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
    const nav = useNavigate();
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

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="userName" className="form-label"
                </div>
            </form>
            <small className="text-muted text-center">
            Don't have an account? <Link to="/register">Sign Up</Link>
            </small>
        </div>
        </div>
    );
}

