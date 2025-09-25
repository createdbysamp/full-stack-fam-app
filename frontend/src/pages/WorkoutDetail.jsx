import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchHistory, deleteWorkout } from '../services/api';

export default function WorkoutDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const all = await fetchHistory();
            setWorkout(all.find(p => String(p.id) === String(id)) || null);
            setLoading(false);
        })();
    }, [id]);

    async function remove() {
        if (!window.confirm("Delete this workout?")) return;
        await deleteWorkout(id);
        nav("/workouts");
    }

    return (
        <div className="min-vh-100">
            <Navbar />
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-white mb-0">Workout Details</h3>
                    <div>
                        <Link to="/workouts" className="btn btn-light -me-2">Back</Link>
                        <button className="btn btn-danger" onClick={remove}>Delete</button>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body">
                        {loading && <div className="text-muted">Loading...</div>}
                        {!loading && !workout && <div className="text-muted">Workout not found.</div>}
                        {!loading && workout && (
                            <>
                                <div className="mb-3">
                                    <span className="badge bg-secondary me-2 text-uppercase">{workout.type}</span>
                                    <span className="fw-semibold">{workout.summary || workout.prompt || "workout"}</span>
                                    <div className="small text-muted">{new Date(workout.createdAt).toLocaleString()}</div>
                                </div>

                                {workout.output?.days && (
                                    <div className="row g-3">
                                        {workout.output.days.map((d, i) => (
                                            <div className="col-12 col-md-6" key={i}>
                                                <div className="border rounded p-3 h-100">
                                                    <div className="fw-semibold mb-2">Day {d.day}; {d.focus || "Routine"}</div>
                                                    <ul className="mb-0">
                                                        {(d.moves || d.exercises || []).map((m, j) => <li key={j}>{m}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* show JSON if unknown shape for fallback */}
                                {!workout.output?.days && (
                                    <pre className="bg-light p-3 rounded small" style={{whiteSpace: 'pre-wrap'}}>
                                        {JSON.stringify(workout.output, null, 2)}
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