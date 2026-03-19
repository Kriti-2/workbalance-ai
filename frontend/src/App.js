import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Kanban from './pages/Kanban';
import BurnoutPage from './pages/BurnoutPage';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{height:'100vh'}}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Sidebar />}
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
        <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
        <Route path="/projects/:id/kanban" element={<PrivateRoute><Kanban /></PrivateRoute>} />
        <Route path="/burnout" element={<PrivateRoute><BurnoutPage /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
