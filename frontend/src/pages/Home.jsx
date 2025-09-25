import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar";

export default function Home() {
    return (
        <div className="min-vh-100 d-flex flex-column">
            <Navbar />
            <div className="flex-fill d-flex flex-column justify-content-center align-items-center text-center text-white">
                <h1 className="fw-bold display-4">Welcome to Swole Buddy!</h1>
                <p className="lead">A performative AI app that generates you a customized workout workout.</p>
                <img src="/images/hero-dumbbells.jpg" alt="dumbbells" className="img-fluid rounded w-75" />
                <Link to="/login" className="btn btn-lg btn-light mt-3">Get Started</Link>
            </div>
        </div>
    );
}