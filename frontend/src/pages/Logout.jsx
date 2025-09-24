import { useEffect } from "react"
import { logoutUser } from "../services/api";
import { useNavigate } from "react-router-dom";


export default function Logout() {
    const navigate = useNavigate();
    useEffect(() => {
        const logoutFunc = async () => {
            try {
                await logoutUser();
            } catch {
                // blank
            } finally {
                navigate("/");
            }
        }
        logoutFunc();
    }, [navigate])
    
    return <p>Logging out...</p>
}