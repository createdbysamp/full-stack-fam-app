import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { deleteWorkout, getworkout } from '../services/api';
import  WorkoutDetails  from "../components/WorkoutDetails";


export default function WorkoutDetail() {
    const { id } = useParams();
    const nav = useNavigate();
    const [workout, setWorkout] = useState(null);
    const [parsedExercise, setParsedExercise] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const workout = await getworkout(id);
            setWorkout(workout);
            setParsedExercise(JSON.parse(workout.exercises))
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
                    <h1 className="text-white mb-0">Workout Details</h1>
                    <div className="d-flex gap-2">
                        <Link to="/workouts" className="btn btn-light -me-2">Back</Link>
                        <button className="btn btn-danger" onClick={remove}>Delete</button>
                    </div>
                </div>

                <div className="card shadow-sm">
                <div className="card-header">
                        <h3 className="fw-semibold">Workout: {parsedExercise.title || "workout"}</h3>
                </div>
                    <div className="card-body">
                        {loading && <div>Loading...</div>}
                        {!loading && !workout && <div>Workout not found.</div>}
                        {!loading && workout && (
                            <>
                                <div className="mb-3">
                                    <span className="badge bg-secondary me-2 text-uppercase">{workout.type}</span>
                                </div>
                                
                                {parsedExercise?.exercises && (
                                    <WorkoutDetails parsedExercise={parsedExercise} />
                                )}
                                <div className="small text-dark">{new Date(workout.createdAt).toLocaleDateString()}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}