import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchHistory } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async()=>{
            try { setHistory(await fetchHistory()); }
            finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="min-vh-100" style={{background: "linear-gradient(135deg,#c471f5,#fa71cd)"}}>
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-white mb-0">Welcome back, @username!</h3>
                    <Link to="/generator" className="btn btn-light">Get Started</Link>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-white fw-semibold">Your progress</div>
                    <div className="card-body">
                        {loading && <div className="text-muted">Loading...</div>}
                        {!loading && history.length === 0 && <div className="text-muted">No plans yet</div>}
                        <div className="row g-3">
                            {history.map(item => (
                                <div className="col-12 col-md-6" key={item.id}>
                                    <div className="border rounded p-3 d-f;ex justify-content-between align-items-center h-100">
                                        <div>
                                            <div>
                                                <span className="badge bg-secondary me-2 text-uppercase">{item.type}</span>
                                                <span className="fw-semibold">{item.summary || item.prompt}</span>
                                            </div>
                                            <div className="small text-muted">{new Date(item.createdAt).toLocaleString()}</div>
                                        </div>
                                        <Link to={`/plans/${item.id}`} className="btn btn-sm btn-outline-dark">View</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3">
                            <Link to="/plans" className="btn btn-outline-dark btn-sm">See all</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;