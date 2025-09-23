import React, { useState } from 'react';
import { generateWorkout } from '../services/api';

function Generator() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState(null);
    const [prompt, setPrompt] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await generateWorkout({ prompt });
            setOutput(res);
        } catch {
            setError("Failed to generate workout.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter your workout prompt"
                />
                <button type="submit" disabled={loading}>Generate</button>
            </form>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {output && <div>{output}</div>}
        </div>
    );
}

export default Generator;