import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { generateWorkout, generateMeal, savePlan } from '../services/api';

export default function Generator() {
    const [type, setType] = useState("workout");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!prompt.trim()) return setError("Enter a prompt");
        setLoading(true);
        setLoading(true);
        try {
            const res = type === "workout"
            ? await generateWorkout({ prompt })
            : await generateMeal({ prompt });
            setOutput(res);
        } catch {
            setError("Failed to generate.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!output) return;
        try {
            await savePlan({ type, prompt, output });
            alert("Saved! Check Plans page");
        } catch {
            alert("Failed to save");
        }
    }

    return (
        <div className="min-vh-100" style={{background: "linear-gradient(135deg,#c471f5,#fa71cd)"}}>
            <Navbar />
            <div className="container py-4">
                <div className="card shadow-sm mx-auto" style={{maxWidth: 820}}>
                    <div className="card-header bg-white fw-semibold">Hey, @username, what's up?</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-9">
                                <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
                                    <option value="workout">Workout</option>
                                    <option value="meal">Meal Plan</option>
                                </select>
                            </div>
                            <div className="col-md-9">
                                <input className="form-control"
                                    placeholder="Build me a workout plan..."
                                    value={prompt} onChange={e=>setPrompt(e.target.value)} />
                            </div>
                            <div className="col-12">
                                {error && <div className="alert alert-danger py-2 mb-2">{error}</div>}
                                <button className="btn btn-primary" disabled={loading}>
                                    {loading ? "Generating..." : "Submit"}
                                </button>
                            </div>
                        </form>

                        <hr />
                        {loading && <div className="text-muted">Generating...</div>}
                        {!loading && output && (
                            <div>
                                <h6 className="fw-semibold">AI Plan</h6>
                                <pre className="bg-light p-3 rounded small" style={{whiteSpace: 'pre-wrap'}}>
                                    {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
                                </pre>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-secondary btn-sm">Refine</button>
                                    <button className="btn btn-outline-success btn-sm" onCLick={handleSave}>Save</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}