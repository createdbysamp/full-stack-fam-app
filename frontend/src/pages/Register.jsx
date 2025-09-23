import { Link } from 'react-router-dom';

export default function Register() {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100"
            style={{background: "linear-gradient(135deg,#c471f5,#fa71cd)"}}>
            <div className="card p-4 shadow" style={{minWidth: "320px"}}>
                <h4 className="mb-3 text-center">Sign Up</h4>
                <input className="form-control mb-3" placeholder="Email" />
                <input type="password" className="form-control mb-3" placeholder="Password" />
                <button className="btn btn-primary w-100 mb-2">Sign Up</button>
            </div>
        </div>
    );
}