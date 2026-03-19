import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/',          icon: '🏠', label: 'Dashboard' },
  { to: '/projects',  icon: '📁', label: 'Projects' },
  { to: '/burnout',   icon: '🔥', label: 'Burnout Risk' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-w)',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0', zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>⚖️ WorkBalance</div>
        <div style={{ fontSize: 11, color: '#7986cb', marginTop: 2 }}>AI Burnout Detection</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', borderRadius: 8, marginBottom: 4,
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(67,97,238,0.4)' : 'transparent',
              fontSize: 14, fontWeight: 500, transition: 'all 0.2s'
            })}>
            <span style={{ fontSize: 18 }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
        <div style={{ color: '#7986cb', fontSize: 11, marginBottom: 10 }}>{user?.role}</div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm"
          style={{ color: '#ef9a9a', borderColor: '#ef9a9a', width: '100%' }}>
          Logout
        </button>
      </div>
    </aside>
  );
}
