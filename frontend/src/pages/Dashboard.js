import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const RISK_COLORS = { Low: '#2dc653', Medium: '#f4a261', High: '#e63946' };

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [myTasks, setMyTasks]     = useState([]);
  const [burnouts, setBurnouts]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const userId = user?.id || user?._id;
    Promise.all([
      axios.get('/api/projects'),
      axios.get('/api/tasks'),
      userId ? axios.get(`/api/tasks?assigneeId=${userId}`) : Promise.resolve({ data: [] }),
    ]).then(([p, t, mine]) => {
      setProjects(p.data);
      setTasks(t.data);
      setMyTasks(mine.data);
      // Fetch burnout for all projects
      Promise.all(p.data.map(proj => axios.get(`/api/burnout/project/${proj._id}`)))
        .then(results => setBurnouts(results.flatMap(r => r.data)))
        .finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [user]);

  const isManager = user?.role === 'Manager';

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: '📁', color: '#4361ee' },
    { label: isManager ? 'Total Tasks' : 'My Tasks', value: isManager ? tasks.length : myTasks.length, icon: '✅', color: '#2dc653' },
    { label: 'Overdue Tasks',  value: (isManager ? tasks : myTasks).filter(t => t.isOverdue).length, icon: '⚠️', color: '#f4a261' },
    { label: 'High Risk Members', value: burnouts.filter(b => b.burnoutRisk === 'High').length, icon: '🔥', color: '#e63946' },
  ];

  // Task status breakdown
  const taskStatusData = [
    { name: 'Todo',       value: tasks.filter(t => t.status === 'Todo').length },
    { name: 'In Progress',value: tasks.filter(t => t.status === 'InProgress').length },
    { name: 'Done',       value: tasks.filter(t => t.status === 'Done').length },
  ];

  // Burnout distribution
  const burnoutData = ['Low','Medium','High'].map(r => ({
    name: r, value: burnouts.filter(b => b.burnoutRisk === r).length
  }));

  // Per-project task count
  const projectTaskData = projects.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0,12)+'…' : p.name,
    tasks: tasks.filter(t => t.project === p._id || t.project?._id === p._id).length
  }));

  if (loading) return <div className="page flex-center" style={{fontSize:18}}>Loading dashboard...</div>;

  return (
    <div className="page">
      <div className="flex-between mb-3">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Welcome back, {user?.name} 👋</h2>
          <p className="text-muted">Here's your team overview</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4 mb-3">
        {stats.map(s => (
          <div className="card" key={s.label} style={{ borderLeft: `4px solid ${s.color}` }}>
            <div className="flex-between">
              <div>
                <div className="text-muted text-sm">{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 32 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2 mb-3">
        <div className="card">
          <h4 style={{ marginBottom: 16 }}>Task Status Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {taskStatusData.map((_, i) => (
                  <Cell key={i} fill={['#4361ee','#f4a261','#2dc653'][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: 16 }}>Burnout Risk Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={burnoutData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {burnoutData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project tasks bar chart */}
      {projectTaskData.length > 0 && (
        <div className="card mb-3">
          <h4 style={{ marginBottom: 16 }}>Tasks per Project</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectTaskData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#4361ee" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* My Tasks — shown to Members */}
      {!isManager && (
        <div className="card mb-3" style={{ borderLeft: '4px solid #4361ee' }}>
          <h4 style={{ marginBottom: 16 }}>📋 My Assigned Tasks ({myTasks.length})</h4>
          {myTasks.length === 0 ? (
            <p className="text-muted">No tasks assigned to you yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Task', 'Project', 'Status', 'Priority', 'Due Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#888', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myTasks.map(t => {
                  const statusCls = { Todo: 'todo', InProgress: 'inprogress', Done: 'done' }[t.status] || 'todo';
                  const prioColor = { Low: '#2dc653', Medium: '#f4a261', High: '#e63946' }[t.priority];
                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 14 }}>{t.title}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#666' }}>{t.project?.name || '—'}</td>
                      <td style={{ padding: '10px 12px' }}><span className={`badge badge-${statusCls}`}>{t.status}</span></td>
                      <td style={{ padding: '10px 12px', color: prioColor, fontWeight: 600, fontSize: 13 }}>{t.priority}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: t.isOverdue ? '#e63946' : '#aaa' }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                        {t.isOverdue && ' ⚠️'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* High-risk alerts — shown to Managers */}
      {isManager && burnouts.filter(b => b.burnoutRisk === 'High').length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #e63946' }}>
          <h4 style={{ marginBottom: 12, color: '#e63946' }}>🔥 High Risk Alerts</h4>
          {burnouts.filter(b => b.burnoutRisk === 'High').map((b, i) => (
            <div key={i} style={{ padding: '10px 14px', background: '#fff5f5', borderRadius: 8, marginBottom: 8 }}>
              <strong>{b.user?.name || 'Team Member'}</strong>
              <span className="badge badge-high" style={{ marginLeft: 8 }}>HIGH</span>
              <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{b.recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
