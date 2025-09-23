import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar";

export default function Home() {
    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: "linear-gradient(135deg, #c471f5, #fa71cd)" }}>
            <Navbar />
            <div className="flex-fill d-flex flex-column justify-content-center align-items-center text-center text-white">
                <h1 className="fw-bold display-4">Welcome to Swole Buddy!</h1>
                <p className="lead">A performative AI app that generates you a customized workout plan.</p>
                <Link to="/login" className="btn btn-lg btn-light mt-3">Get Started</Link>
            </div>
        </div>
    );
}