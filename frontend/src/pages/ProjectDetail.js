import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [sprints,  setSprints]  = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [users,    setUsers]    = useState([]);
  const [tab,      setTab]      = useState('sprints');
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showTaskModal,   setShowTaskModal]   = useState(false);
  const [sprintForm, setSprintForm] = useState({ name:'', startDate:'', endDate:'', goal:'' });
  const [taskForm,   setTaskForm]   = useState({ title:'', description:'', assignee:'', priority:'Medium', dueDate:'', sprint:'' });

  useEffect(() => {
    axios.get(`/api/projects/${id}`).then(r => setProject(r.data));
    axios.get(`/api/sprints?projectId=${id}`).then(r => setSprints(r.data));
    axios.get(`/api/tasks?projectId=${id}`).then(r => setTasks(r.data));
    axios.get('/api/users').then(r => setUsers(r.data));
  }, [id]);

  const createSprint = async (e) => {
    e.preventDefault();
    const { data } = await axios.post('/api/sprints', { ...sprintForm, project: id });
    setSprints([...sprints, data]);
    setShowSprintModal(false);
    setSprintForm({ name:'', startDate:'', endDate:'', goal:'' });
  };

  const createTask = async (e) => {
    e.preventDefault();
    const payload = { ...taskForm, project: id };
    if (!payload.assignee) delete payload.assignee;
    if (!payload.sprint)   delete payload.sprint;
    if (!payload.dueDate)  delete payload.dueDate;
    const { data } = await axios.post('/api/tasks', payload);
    setTasks([...tasks, data]);
    setShowTaskModal(false);
    setTaskForm({ title:'', description:'', assignee:'', priority:'Medium', dueDate:'', sprint:'' });
  };

  const statusBadge = (s) => {
    const cls = { Todo:'todo', InProgress:'inprogress', Done:'done' }[s] || 'todo';
    return <span className={`badge badge-${cls}`}>{s}</span>;
  };

  const priorityColor = { Low:'#2dc653', Medium:'#f4a261', High:'#e63946' };

  if (!project) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="flex-between mb-3">
        <div>
          <button onClick={() => navigate('/projects')} style={{ background:'none', color:'#888', fontSize:13, marginBottom:8, cursor:'pointer', border:'none' }}>← Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>{project.name}</h2>
          <p className="text-muted">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => navigate(`/projects/${id}/kanban`)}>📋 Kanban</button>
          <button className="btn btn-outline" onClick={() => navigate(`/burnout?projectId=${id}`)}>🔥 Burnout Risk</button>
        </div>
      </div>

      {/* Members */}
      <div className="card mb-3">
        <div className="flex-between">
          <h4>👥 Team Members ({project.members?.length || 0})</h4>
          {user?.role === 'Manager' && (
            <select className="form-control" style={{ width:200, padding:'6px 10px', fontSize:13 }}
              onChange={async (e) => {
                if (!e.target.value) return;
                const { data } = await axios.post(`/api/projects/${id}/members`, { userId: e.target.value });
                setProject(data);
                e.target.value = '';
              }}>
              <option value="">+ Add Member</option>
              {users.filter(u => u._id !== project.manager?._id && !project.members?.find(m => m._id === u._id))
                .map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-2 mt-2" style={{ flexWrap:'wrap' }}>
          {project.members?.map(m => (
            <span key={m._id} style={{ background:'#f0f4ff', padding:'5px 12px', borderRadius:20, fontSize:13, color:'#4361ee', fontWeight:500 }}>
              {m.name}
            </span>
          ))}
          {project.members?.length === 0 && <span className="text-muted">No members added yet. Use the dropdown above.</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {['sprints','tasks'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={tab === t ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
            {t === 'sprints' ? '🏃 Sprints' : '✅ Tasks'}
          </button>
        ))}
      </div>

      {/* Sprints Tab */}
      {tab === 'sprints' && (
        <>
          <div className="flex-between mb-3">
            <h3 style={{ fontSize: 16 }}>Sprints ({sprints.length})</h3>
            {user?.role === 'Manager' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowSprintModal(true)}>+ New Sprint</button>
            )}
          </div>
          {sprints.map(s => (
            <div key={s._id} className="card mb-3" style={{ borderLeft: `4px solid ${s.status === 'Active' ? '#2dc653' : '#4361ee'}` }}>
              <div className="flex-between">
                <h4>{s.name}</h4>
                <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, background: s.status==='Active'?'#d4f5dc':'#e8eaf6', color: s.status==='Active'?'#1a7f37':'#3949ab', fontWeight:600 }}>{s.status}</span>
              </div>
              {s.goal && <p className="text-muted mt-2">{s.goal}</p>}
              <div className="flex gap-3 mt-2 text-sm" style={{ color:'#888' }}>
                <span>📅 {new Date(s.startDate).toLocaleDateString()} → {new Date(s.endDate).toLocaleDateString()}</span>
                <span>✅ {tasks.filter(t => t.sprint?._id === s._id || t.sprint === s._id).length} tasks</span>
              </div>
            </div>
          ))}
          {sprints.length === 0 && <p className="text-muted">No sprints yet.</p>}
        </>
      )}

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <>
          <div className="flex-between mb-3">
            <h3 style={{ fontSize:16 }}>All Tasks ({tasks.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>+ New Task</button>
          </div>
          <div className="card" style={{ overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'2px solid #f0f0f0' }}>
                  {['Title','Assignee','Status','Priority','Due Date'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:13, color:'#888', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                    <td style={{ padding:'10px 12px', fontSize:14 }}>{t.title}</td>
                    <td style={{ padding:'10px 12px', fontSize:13 }}>{t.assignee?.name || '—'}</td>
                    <td style={{ padding:'10px 12px' }}>{statusBadge(t.status)}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ color: priorityColor[t.priority], fontWeight:600, fontSize:13 }}>{t.priority}</span>
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13, color:'#888' }}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'#aaa' }}>No tasks yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Sprint Modal */}
      {showSprintModal && (
        <div className="modal-overlay" onClick={() => setShowSprintModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create Sprint</h3>
            <form onSubmit={createSprint}>
              <div className="form-group"><label>Sprint Name</label>
                <input className="form-control" placeholder="Sprint 1" value={sprintForm.name}
                  onChange={e => setSprintForm({...sprintForm, name:e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Start Date</label>
                  <input type="date" className="form-control" value={sprintForm.startDate}
                    onChange={e => setSprintForm({...sprintForm, startDate:e.target.value})} required />
                </div>
                <div className="form-group"><label>End Date</label>
                  <input type="date" className="form-control" value={sprintForm.endDate}
                    onChange={e => setSprintForm({...sprintForm, endDate:e.target.value})} required />
                </div>
              </div>
              <div className="form-group"><label>Sprint Goal</label>
                <textarea className="form-control" rows={2} placeholder="What should be achieved?"
                  value={sprintForm.goal} onChange={e => setSprintForm({...sprintForm, goal:e.target.value})} />
              </div>
              <div className="flex gap-2" style={{ justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowSprintModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Create Task</h3>
            <form onSubmit={createTask}>
              <div className="form-group"><label>Task Title</label>
                <input className="form-control" placeholder="Task description..." value={taskForm.title}
                  onChange={e => setTaskForm({...taskForm, title:e.target.value})} required />
              </div>
              <div className="form-group"><label>Description</label>
                <textarea className="form-control" rows={2} value={taskForm.description}
                  onChange={e => setTaskForm({...taskForm, description:e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Assignee</label>
                  <select className="form-control" value={taskForm.assignee}
                    onChange={e => setTaskForm({...taskForm, assignee:e.target.value})}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Priority</label>
                  <select className="form-control" value={taskForm.priority}
                    onChange={e => setTaskForm({...taskForm, priority:e.target.value})}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Sprint</label>
                  <select className="form-control" value={taskForm.sprint}
                    onChange={e => setTaskForm({...taskForm, sprint:e.target.value})}>
                    <option value="">No Sprint</option>
                    {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Due Date</label>
                  <input type="date" className="form-control" value={taskForm.dueDate}
                    onChange={e => setTaskForm({...taskForm, dueDate:e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2" style={{ justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
