import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchHistory, getSession } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [history, setHistory] = useState({ workouts: []});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async()=>{
            try { setHistory(await fetchHistory()); }
            finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="min-vh-100">
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-white mb-0">Welcome back, @{getSession()["userName"] || "user!"}</h3>
                    <Link to="/generator" className="btn btn-light">Get Started</Link>
                </div>
                <img src="/images/login-illustration.jpg" alt="dumbbells" className="img-fluid rounded" />
                <div className="card shadow-sm">
                    <div className="card-header bg-white fw-semibold">Your progress</div>
                    <div className="card-body">
                        {loading && <div className="text-muted">Loading...</div>}
                        {!loading && history.length === 0 && <div className="text-muted">No workouts yet</div>}
                        <div className="row g-3">
                            {history.workouts.map(item => (
                                <div className="col-12 col-md-6" key={item.id}>
                                    <div className="border rounded p-3 d-flex justify-content-between align-items-center h-100">
                                        <div>
                                            <div>
                                                <span className="badge bg-secondary p-0 text-uppercase text-dark">{item.title}</span>
                                            </div>
                                            <div className="small text-dark">{new Date(item.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <Link to={`/workouts/${item.id}`} className="btn btn-sm btn-outline-dark text-success">View</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3">
                            <Link to="/workouts" className="btn btn-outline-dark btn-sm text-dark">See all</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;