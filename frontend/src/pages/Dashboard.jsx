import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../services/api';

const Dashboard = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory().then(setHistory).catch(console.error);
    }, []);

    return (
        <div>
            <ul>
                {history.map((item, idx) => (
                    <li key={idx}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;