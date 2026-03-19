import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const COLUMNS = [
  { id: 'Todo',       label: '📋 Todo',        color: '#4361ee' },
  { id: 'InProgress', label: '⚡ In Progress',  color: '#f4a261' },
  { id: 'Done',       label: '✅ Done',          color: '#2dc653' },
];

const PRIORITY_COLOR = { Low: '#2dc653', Medium: '#f4a261', High: '#e63946' };

export default function Kanban() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    axios.get(`/api/projects/${id}`).then(r => setProject(r.data));
    axios.get(`/api/tasks?projectId=${id}`).then(r => setTasks(r.data));
  }, [id]);

  const onDrop = async (status) => {
    if (!dragging || dragging.status === status) return;
    try {
      const { data } = await axios.put(`/api/tasks/${dragging._id}`, { status });
      setTasks(prev => prev.map(t => t._id === dragging._id ? { ...t, status } : t));
    } catch (e) { console.error(e); }
    setDragging(null);
  };

  const colTasks = (colId) => tasks.filter(t => t.status === colId);

  return (
    <div className="page">
      <div className="flex-between mb-3">
        <div>
          <button onClick={() => navigate(`/projects/${id}`)} style={{ background:'none', color:'#888', fontSize:13, marginBottom:8, cursor:'pointer', border:'none' }}>← Back to Project</button>
          <h2 style={{ fontSize:24, fontWeight:700 }}>📋 {project?.name} — Kanban Board</h2>
        </div>
        <div className="text-muted">{tasks.length} total tasks</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, alignItems:'start' }}>
        {COLUMNS.map(col => (
          <div key={col.id}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(col.id)}
            style={{ background:'#f8f9fb', borderRadius:12, padding:16, minHeight:500, borderTop:`3px solid ${col.color}` }}>

            <div className="flex-between" style={{ marginBottom:16 }}>
              <span style={{ fontWeight:700, fontSize:14, color:col.color }}>{col.label}</span>
              <span style={{ background:col.color, color:'white', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:700 }}>
                {colTasks(col.id).length}
              </span>
            </div>

            {colTasks(col.id).map(task => (
              <div key={task._id}
                draggable
                onDragStart={() => setDragging(task)}
                onDragEnd={() => setDragging(null)}
                style={{
                  background:'white', borderRadius:10, padding:14, marginBottom:12,
                  boxShadow:'0 2px 8px rgba(0,0,0,0.07)', cursor:'grab',
                  opacity: dragging?._id === task._id ? 0.5 : 1,
                  borderLeft:`3px solid ${PRIORITY_COLOR[task.priority]}`
                }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:8 }}>{task.title}</div>
                {task.description && (
                  <p style={{ fontSize:12, color:'#888', marginBottom:8, lineHeight:1.4 }}>
                    {task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}
                  </p>
                )}
                <div className="flex-between" style={{ marginTop:8 }}>
                  <span style={{ fontSize:11, color: PRIORITY_COLOR[task.priority], fontWeight:600 }}>
                    {task.priority}
                  </span>
                  {task.assignee && (
                    <span style={{ fontSize:11, background:'#f0f4ff', color:'#4361ee', padding:'2px 8px', borderRadius:20, fontWeight:500 }}>
                      {task.assignee.name}
                    </span>
                  )}
                </div>
                {task.dueDate && (
                  <div style={{ fontSize:11, color: new Date(task.dueDate) < new Date() ? '#e63946' : '#aaa', marginTop:6 }}>
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                    {new Date(task.dueDate) < new Date() && task.status !== 'Done' && ' ⚠️ Overdue'}
                  </div>
                )}
              </div>
            ))}

            {colTasks(col.id).length === 0 && (
              <div style={{ textAlign:'center', color:'#ccc', padding:'40px 0', fontSize:13 }}>
                Drop tasks here
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
