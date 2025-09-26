import Home from './Home';
import { Link } from 'react-router-dom';
export default function About () {
    return (
        <div className="min-vh-100">
            <div className="container py-5">
                <div className="card shadow-sm mx-auto" style={{ maxWidth: 900 }}>
                    <div className="card-body">
                    <Link to="/" className="btn btn-outline-secondary btn-sm w-25 text-dark text-center d-block mx-auto">Home</Link>
                        <h3 className="mb-3 text-center d-block mx-auto">About Swole Buddy</h3>
                        <p className="text-bg-primary">
                        Welcome to your new Personal Trainer! Swole Buddy is the premier app that creates personalized training programs, adapts to your progress and current requirements, and helps you stay motivated with smart recommendations.
                        </p>

                        <h6 className="mt-3">Features:</h6>
                            <ul>
                                <li>Create workout plans personalized to you and your personal needs</li>
                                <li>View past workouts and rate them, so you can remember which best fit</li>
                                <li>New to working out? No problem! Swole Buddy adjusts to your skill level</li>
                            </ul>

                        <h6 className="mt-3">Front End:</h6>
                            <ul>
                                <li>Vite - Project Scaffolding and Deployment</li>
                                <li>React - UI Library</li>
                                <li>Bootstrap - Component Library and Styling framework</li>
                            </ul>

                        <h6 className="mt-3">Back End:</h6>
                            <ul>
                                <li>ASP.NET - Framework</li>
                                <li>JWT (Json Web Tokens) - Authentication and Authorization</li>
                                <li>Infrastructure</li>
                            </ul>

                        <p>
                            Database: Supabase
                            Deployment: Docker (hopefully....)
                        </p>

                        <p>
                            Languages:
                                Javascript
                                C#
                        </p>

                        <h6 className="mt-4">Meet the Team</h6>
                            <ul>
                                <li>Ursula Deese - Front End, Design</li>
                                <li>Sampson Ma - AI Integration, Support</li>
                                <li>Dan Carpenter - Backend, Integration, Authentication</li>
                            </ul>

                        <p>Credits to Dan for the README!</p>
                        <div className="row g-3 mt-3">
                            <div className="col-md-6">
                                <img src="/images/into-gym.jpg" alt="workouts"
                                    className="img-fluid rounded" />
                            </div>
                            <div className="col-md-6">
                                <ul className="list-group">
                                    <li className="list-group-item">Prompt - AI - JSON Plan</li>
                                    <li className="list-group-item">Save & browse your workouts</li>
                                    <li className="list-group-item">Simple, clean UI with an intensive backend + AI implementation for a cool demo.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}