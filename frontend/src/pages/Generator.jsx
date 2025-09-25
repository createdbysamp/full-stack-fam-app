import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { generateWorkout, saveworkout, getSession } from '../services/api';
import WorkoutDetails from '../components/WorkoutDetails';

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
            const res = await generateWorkout(prompt).then(res => JSON.parse(res))
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
        let unparsedJson = JSON.stringify(output);
        await saveworkout(
            {
                title: output.title,
                exercises: unparsedJson,
                userId: getSession()["currentUserId"]
            }
        )
      alert("Saved! Check workouts page");
    } catch {
      alert("Failed to save");
    }
  }

//   async function displayWorkout() {
//     <div className="card">
//       <div className="card-title">{output.title}</div>
//       <div className="card-body">
//         {Array(output.exercises).map((values) => {
//           return values.exercises.map((val) => {
//             return (
//               <div>
//                 <span>Exercise name: {val.name}</span>
//                 <span>Sets: {val.sets}</span>
//                 <span>Reps: {val.reps}</span>
//                 <span>Description: {val.description}</span>
//                 <span>Instructions: {val.instructions}</span>
//               </div>
//             );
//           });
//         })}
//       </div>
//       <div className="card-footer">{output.exercises}</div>
//     </div>;
//   }

    return (
        <div className="min-vh-100">
            <Navbar />
            <div className="container py-4">
                <div className="card shadow-sm mx-auto" style={{maxWidth: 820}}>
                    <div className="card-header bg-white fw-semibold">Hey, @{getSession()["userName"]}, what's up?</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-9">
                                <select className="form-select" value={type} onChange={e=>setType(e.target.value)}>
                                    <option value="workout">Workout</option>
                                </select>
                            </div>
                            <div className="col-md-9">
                                <input className="form-control"
                                    placeholder="Build me a workout workout..."
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
                                <h6 className="fw-semibold">AI workout</h6>
                                <pre className="bg-light p-3 rounded small" style={{whiteSpace: 'pre-wrap'}}>
                                  <WorkoutDetails parsedExercise={output} />
                                </pre>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-secondary btn-sm">Refine</button>
                                    <button className="btn btn-outline-success btn-sm" onClick={handleSave}>Save</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <img src="/images/blue-cycle.jpg" alt="blue" className="img-fluid rounded w-100 mx-auto" />
                </div>
            </div>
        </div>
    )
}