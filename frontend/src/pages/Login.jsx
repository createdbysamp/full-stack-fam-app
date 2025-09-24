import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

export default function Login() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setErr("");
        if(!email || !password) return setErr("Enter email and password please");
        setLoading(true);
        try {
            await loginUser({ userName: email, password });
            nav("/dashboard");
        } catch {
            setErr("Invalid credentials");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100"
            style={{background: "linear-gradient(135deg,#c471f5,#fa71cd)"}}>
            <div className="card p-4 shadow" style={{minWidth: "320px"}}>
                <h4 className="mb-3 text-center">Login</h4>
                <form onSubmit={handleSubmit}>
                    <input className="form-control mb-3" placeholder="Email" 
                        value={email} onChange={e=>setEmail(e.target.value)} />
                    <input type="password" className="form-control mb-3" placeholder="Password" 
                        value={password} onChange={e=>setPassword(e.target.value)} />
                    {err && <div className="alert alert-danger py-2">{err}</div>}
                    <button className="btn btn-primary w-100 mb-2" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <small className="text-muted text-center">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </small>
            </div>
        </div>
    );
}