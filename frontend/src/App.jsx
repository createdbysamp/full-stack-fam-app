import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Workouts from './pages/Workouts';
import WorkoutDetail from './pages/WorkoutDetail';;
import ProtectedRoute from './components/ProtectedRoute';
import Logout from './pages/Logout';
import About from './pages/About';
import Credits from './pages/Credits';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/logout" element={<Logout />} />

        {/* private */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/generator" element={<ProtectedRoute><Generator /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/workouts/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
