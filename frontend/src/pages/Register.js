import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }}>
      <div style={{ width: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>⚖️</div>
          <h1 style={{ color: 'white', fontSize: 28, marginTop: 8 }}>Create Account</h1>
        </div>
        <div className="card">
          {error && <div style={{ background: '#ffe0e0', color: '#c0392b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handle}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" placeholder="Kriti Sharma"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="Member">Team Member</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 8 }}
              disabled={loading} type="submit">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
            Already registered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
