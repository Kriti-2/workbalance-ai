import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'Manager' ? '/' : '/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }}>
      <div style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>⚖️</div>
          <h1 style={{ color: 'white', fontSize: 28, marginTop: 8 }}>WorkBalance AI</h1>
          <p style={{ color: '#7986cb', marginTop: 4 }}>Sign in to your account</p>
        </div>
        <div className="card">
          {error && <div style={{ background: '#ffe0e0', color: '#c0392b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handle}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }}
              disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
            No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
