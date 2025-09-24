import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchHistory, deletePlan } from '../services/api';
import { Link } from 'react-router-dom';

export default function Plans() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const data = await fetchHistory();
            setItems(data || []);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    async function remove(id) {
        if (!window.confirm("Delete this plan?")) return;
        await deletePlan(id);
        setItems(items.filter(i => i.id !== id));
    }

    return (
        <div className="min-vh-100" style={{background: "linear-gradient(135deg,#c471f5#fa71cd"}}>
            <Navbar />
            <div className="container py-4">
                <h3 className="text-white mb-3">Your Plans</h3>

                <div className="card shadow-sm">
                    <div className="card-header bg-white fw-semibold">History</div>
                    <div className="card-body">
                        {loading && <div className="text-muted">Loading...</div>}
                        {!loading && items.length === 0 && <div className="text-muted">No plans yet...</div>}
                        <div className="list-group">
                            {items.map(p => (
                                <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="badge bg-secondary me-2 text-uppercase">{p.type}</span>
                                        <span className="fw-semibold me-2">{p.summary || p.prompt || "Plan"}</span>
                                        <small className="text-muted">{new Date(p.createdAt).toLocaleString()}</small>
                                    </div>
                                    <div>
                                        <Link to={`/plans/${p.id}`} className="btn btn-sm btn-outline-dark me-2">View</Link>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove.apply(p.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}