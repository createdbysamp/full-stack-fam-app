import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchHistory, deletePlan } from '../services/api';

export default function PlanDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        (async () => {
            const all = await fetchHistory();
            setPlan(all.find(p => String(p.id) === String(id)) || null);
            setLoading(false);
        })();
    }, [id]);

    async function remove() {
        if (!window.confirm("Delete this plan?")) return;
        await deletePlan(id);
        nav("/plans");
    }

    return (
        <div className="min-vh-100" style={{background: "linear-gradient(135deg,#c471f5#fa71cd"}}>
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-white mb-0">Plan Details</h3>
                    <div>
                        <Link to="/plans" className="btn btn-light -me-2">Back</Link>
                        <button className="btn btn-danger" onClick={remove}>Delete</button>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body">
                        {loading && <div className="text-muted">Loading...</div>}
                        {!loading && !plan && <div className="text-muted">Plan not found.</div>}
                        {!loading && plan && (
                            <>
                                <div className="mb-3">
                                    <span className="badge bg-secondary me-2 text-uppercase">{plan.type}</span>
                                    <span className="fw-semibold">{plan.summary || plan.prompt || "Plan"}</span>
                                    <div className="small text-muted">{new Date(plan.createdAt).toLocaleString()}</div>
                                </div>

                                {plan.output?.days && (
                                    <div className="row g-3">
                                        {plan.output.days.map((d, i) => (
                                            <div className="col-12 col-md-6" key={i}>
                                                <div className="border rounded p-3 h-100">
                                                    <div className="fw-semibold mb-2">Day {d.day}; {d.focus || "Routine"}</div>
                                                    <ul className="mb-0">
                                                        {(d.moves || d.excercises || []).map((m, j) => <li key={j}>{m}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* show JSON if unknown shape for fallback */}
                                {!plan.output?.days && (
                                    <pre className="bg-light p-3 rounded small" style={{whiteSpace: 'pre-wrap'}}>
                                        {JSON.stringify(plan.output, null, 2)}
                                    </pre>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}