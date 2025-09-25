import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    let tokens = null;
    try {
        tokens = JSON.parse(localStorage.getItem("auth_tokens") || "null");
    } catch {
        tokens = null;
    }
    if (!tokens?.token) return <Navigate to="/login" replace />;
    return children;
}