import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
    const nav = useNavigate();
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [err, setErr] = useState("");
    // const [loading, setLoading] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setErr("");

        if (!userName || !email || !password || !confirm) {
            setErr("All fields are required.");
        return;
        }
        if (password !== confirm) {
            setErr("Passwords do not match.");
            return;
        }

        try {
            await registerUser({ userName, email, password }); // POST /auth/register
            nav("/login");
        } catch (err) {
            setErr(err.message || "Could not register");
        } 
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100"
            style={{background: "linear-gradient(135deg,#c471f5,#fa71cd)"}}>
            <div className="card shadow-sm" style={{ width: 480 }}>
                <div className="card-body">
                    <h3 className="text-center mb-4">Sign Up</h3>
                    {err && <div className="alert alert-danger">{err}</div>}

                    <form onSubmit={handleSubmit}  noValidate>
                        <div className="mb-3">
                            <input className="form-control" placeholder="username"
                                    autoComplete="username"
                                    value={userName} onChange={e=>setUserName(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input className="form-control" placeholder="example@email.com"
                                    type="email" autoComplete="email"
                                    value={email} onChange={e=>setEmail(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input className="form-control" placeholder="password"
                                    type="password" autoComplete="new-password"
                                    value={password} onChange={e=>setPassword(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input className="form-control" placeholder="confirm password"
                                    type="password" autoComplete="new-password"
                                    value={confirm} onChange={e=>setConfirm(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
                    </form>

                    <div className="text-center mt-3">
                        <small>Already swole? <Link to="/login">Log in, Buddy</Link></small>
                    </div>
                </div>
            </div>
                
        </div>
    );
}