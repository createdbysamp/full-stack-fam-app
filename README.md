# Swole Buddy

Welcome to your new Personal Trainer! 
Swole Buddy is the premier app that creates personalized training programs, 
adapts to your progress and current requirements, 
and helps you stay motivated with smart recommendations. 

## Features

- Create workout workouts personalized to you and your personal needs
- View past workouts and rate them, so you can remember which best fit
- New to working out? No problem! Swole Buddy adjusts to your skill level

### TODO - Example

--- 

## Technologies

Front End:
- Vite - Project Scaffolding and Deployment
- React - UI Library
- Bootstrap - Component Library and Styling framework

Back End:
- ASP.NET - Framework
- JWT (Json Web Tokens) - Authentication and Authorization

Infrastructure
- Database: Supabase
- Deployment: Docker (hopefully....)

Languages:
- Javascript
- C#

--- 

## Setup / Installation

### Prerequisites
- `npm`
- `.NET SDK v9.0`
- `Supabase` Project to add database tables
### Development Setup

1. Within the `WorkoutApi/` folder
    1. Set up user secrets
        - `dotnet user-secrets set Supabase:Key "<your supabase key here>"`
        - `dotnet user-secrets set Supabase:Url "<your supabase Url here>"`
    2. Launch the API
       - `dotnet run -lp https`
2. Within the `frontend/` folder
      - `npm install` to install dependencies
      - `npm run dev` to launch the front end server
3. Set up Supabase Database Tables
    - Follow the image below 
    - <TODO: image here>

### TODO - Prod Setup

### Configuration
- `WorkoutApi/appsettings.json` - JWT settings, including JWT Key

--- 

## Roadmap
- Finish MVP
- Progress Tracking - Goals and Badges
- Add Meal workoutning

---

### Meet the Team
- Ursula Deese - Front End, Design
- Sampson Ma - AI Integration, Support
- Dan Carpenter - Backend, Integration, Authentication

### LICENSE 
This software is licensed under MIT. see [LICENSE](./LICENSE) for details.