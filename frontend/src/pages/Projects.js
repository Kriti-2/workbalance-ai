import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/projects').then(r => { setProjects(r.data); setLoading(false); });
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const { data } = await axios.post('/api/projects', form);
    setProjects([...projects, data]);
    setShowModal(false);
    setForm({ name: '', description: '' });
  };

  const statusColor = { Active: '#2dc653', Completed: '#4361ee', 'On Hold': '#f4a261' };

  return (
    <div className="page">
      <div className="flex-between mb-3">
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Projects</h2>
        {user?.role === 'Manager' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="grid-3">
          {projects.map(p => (
            <div key={p._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', borderTop: `3px solid ${statusColor[p.status] || '#4361ee'}` }}
              onClick={() => navigate(`/projects/${p._id}`)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div className="flex-between mb-3">
                <h3 style={{ fontSize: 16 }}>{p.name}</h3>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f0f4ff', color: '#4361ee', fontWeight: 600 }}>{p.status}</span>
              </div>
              <p className="text-muted" style={{ fontSize: 13, marginBottom: 16, minHeight: 36 }}>
                {p.description || 'No description'}
              </p>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                <span className="text-sm" style={{ color: '#666' }}>👤 {p.manager?.name}</span>
                <span className="text-sm" style={{ color: '#666' }}>• 👥 {p.members?.length || 0} members</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); navigate(`/projects/${p._id}/kanban`); }}>
                  Kanban
                </button>
                <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); navigate(`/burnout?projectId=${p._id}`); }}>
                  🔥 Burnout
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#aaa' }}>
              <div style={{ fontSize: 48 }}>📁</div>
              <p style={{ marginTop: 12 }}>No projects yet. Create one to get started!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create New Project</h3>
            <form onSubmit={create}>
              <div className="form-group">
                <label>Project Name</label>
                <input className="form-control" placeholder="e.g. E-Commerce Platform"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} placeholder="Brief project description..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
