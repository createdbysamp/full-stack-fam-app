import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
    const nav = useNavigate();
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState("");

    async function handleSubmit(e){
        e.preventDefault();
        setErr("");
        if (!userName || !email || !password || !confirm) return setErr("Please fill in all the fields");
        if (password !== confirm) return setErr("Passwords do not match");
        setLoading(true);
        try {
            await registerUser({ userName, email, password });
            nav("/login");
        } catch {
            setErr("Could not register");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100"
            style={{background: "linear-gradient(135deg,#c471f5,#fa71cd)"}}>
            <div className="card p-4 shadow" style={{minWidth: "320px"}}>
                <h4 className="mb-3 text-center">Sign Up</h4>
                <form onSubmit={handleSubmit}>
                    <input className="form-control mb-3" placeholder="Username" value={userName} onChange={e=>setUserName(e.target.value)} />
                    <input className="form-control mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                    <input type="password" className="form-control mb-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
                    <input type="password" className="form-control mb-3" placeholder="Confirm Password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
                    {err && <div className="alert alert-danger py-2">{err}</div>}
                    <button className="btn btn-primary w-100 mb-2" disabled={loading}>
                        {loading ? "Creating..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}