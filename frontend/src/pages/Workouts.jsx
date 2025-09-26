import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchHistory, deleteWorkout } from '../services/api';
import { Link } from 'react-router-dom';

export default function Workouts() {
    const [items, setItems] = useState({ workouts: []});
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
        if (!window.confirm("Delete this workout?")) return;
        await deleteWorkout(id);
        setItems(items => ({ ...items, workouts: items.workouts.filter(i => i.id !== id) }));
    }

    console.log(items);

    return (
        <div className="min-vh-100">
            <Navbar />
            <div className="container py-4">
                <h3 className="text-white mb-3">Your Workouts</h3>

                <div className="card shadow-sm">
                    <div className="card-header bg-white fw-semibold">History</div>
                    <div className="card-body">
                        {loading && <div className="text-dark">Loading...</div>}
                        {!loading && items.workouts.length === 0 && <div className="text-dark">No workouts yet...</div>}
                        <div className="list-group">
                            {items.workouts.map(p => (
                                <div key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="badge bg-secondary me-2 text-uppercase">{p.type}</span>
                                        <span className="fw-semibold me-2">{p.title || "Workout"}</span>
                                        <small className="text-muted">{new Date(p.createdAt).toLocaleString()}</small>
                                    </div>
                                    <div>
                                        <Link to={`/workouts/${p.id}`} className="btn btn-sm btn-outline-success text-dark me-2">View</Link>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p.id)}>Delete</button>
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