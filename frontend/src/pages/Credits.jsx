export default function Credits() {

    const team = [
        { name: "Ursula", role: "Frontend Developer", github: "https://github.com/udeese" },
        { name: "Sampson", role: "AI Coordinator", github: "https://github.com/createdbysamp"},
        { name: "Dan", role: "Backend Developer", github: "https://github.com/iqunlim"}
    ];
    
    return (
        <div className="min-vh-100" style={{background: "linear-gradient(135deg,#c471f5,#fa71cd"}}>
            <div className="container py-5">
                <div className="card shadow-sm mx-auto" style={{ maxWidth: 900 }}>
                    <div className="card-body">
                        <h3 className="mb-3">Credits</h3>
                        
                        <p>
                            Built by the <strong>Full-Stack Fam Team</strong>, for our Capstone Project.
                        </p>

                        <ul className="list-group list-group-flush">
                            {team.map((member) => (
                                <li
                                    key={member.name}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <strong>{member.name}</strong> - {member.role}
                                    </div>
                                    <a
                                        href={member.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-dark"
                                    >
                                        GitHub
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <p className="text-muted small mt-4">
                            Stack: Vite + React + Bootstrap + .NET + Supabase + AI
                        </p>
                    </div>
                    <img src="/images/nice-words.jpg" alt="words" className="img-fluid rounded w-100 mx-auto" />
                </div>
            </div>
        </div>
    );
}