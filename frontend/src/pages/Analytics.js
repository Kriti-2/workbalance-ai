import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function Analytics() {
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [burnouts, setBurnouts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/projects'),
      axios.get('/api/tasks'),
    ]).then(async ([p, t]) => {
      setProjects(p.data);
      setTasks(t.data);
      const bs = await Promise.all(p.data.map(proj =>
        axios.get(`/api/burnout/project/${proj._id}`).then(r => r.data).catch(() => [])
      ));
      setBurnouts(bs.flat());
      setLoading(false);
    });
  }, []);

  // Completion rate per project
  const completionData = projects.map(p => {
    const pTasks = tasks.filter(t => (t.project?._id || t.project) === p._id);
    const done   = pTasks.filter(t => t.status === 'Done').length;
    return {
      name: p.name.slice(0, 10),
      total: pTasks.length,
      done,
      rate: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0
    };
  });

  // Priority breakdown
  const priorityData = ['Low','Medium','High'].map(p => ({
    name: p,
    count: tasks.filter(t => t.priority === p).length
  }));

  // Burnout risk data
  const burnoutData = ['Low','Medium','High'].map(r => ({
    risk: r,
    count: burnouts.filter(b => b.burnoutRisk === r).length
  }));

  // Radar chart — team health
  const radarData = [
    { metric: 'Completion',  value: tasks.length ? Math.round((tasks.filter(t=>t.status==='Done').length/tasks.length)*100) : 0 },
    { metric: 'Low Risk %',  value: burnouts.length ? Math.round((burnouts.filter(b=>b.burnoutRisk==='Low').length/burnouts.length)*100) : 0 },
    { metric: 'On-Time',     value: tasks.length ? Math.round(((tasks.length-tasks.filter(t=>t.isOverdue).length)/tasks.length)*100) : 0 },
    { metric: 'Active Proj', value: Math.min(100, projects.filter(p=>p.status==='Active').length * 20) },
    { metric: 'Team Size',   value: Math.min(100, projects.reduce((s,p)=>s+(p.members?.length||0),0)*10) },
  ];

  const statCards = [
    { label: 'Total Tasks',       value: tasks.length,                                           color:'#4361ee' },
    { label: 'Completed',         value: tasks.filter(t=>t.status==='Done').length,              color:'#2dc653' },
    { label: 'In Progress',       value: tasks.filter(t=>t.status==='InProgress').length,        color:'#f4a261' },
    { label: 'Completion Rate',   value: tasks.length ? Math.round((tasks.filter(t=>t.status==='Done').length/tasks.length)*100)+'%' : '0%', color:'#3a0ca3' },
  ];

  if (loading) return <div className="page">Loading analytics...</div>;

  return (
    <div className="page">
      <h2 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>📊 Analytics Dashboard</h2>
      <p className="text-muted mb-3">Team performance & productivity insights</p>

      {/* Stat cards */}
      <div className="grid-4 mb-3">
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ borderLeft:`4px solid ${s.color}`, textAlign:'center' }}>
            <div style={{ fontSize:30, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-3">
        {/* Completion per project */}
        <div className="card">
          <h4 style={{ marginBottom:16 }}>Project Completion Rate (%)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={completionData}>
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis domain={[0,100]} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="rate" fill="#4361ee" radius={[4,4,0,0]} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task priority distribution */}
        <div className="card">
          <h4 style={{ marginBottom:16 }}>Task Priority Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4,4,0,0]} name="Tasks">
                {priorityData.map((entry, i) => (
                  <rect key={i} fill={['#2dc653','#f4a261','#e63946'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 mb-3">
        {/* Burnout risk bar */}
        <div className="card">
          <h4 style={{ marginBottom:16 }}>Burnout Risk Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={burnoutData}>
              <XAxis dataKey="risk" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4,4,0,0]} name="Members"
                fill="#4361ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar: Team Health */}
        <div className="card">
          <h4 style={{ marginBottom:16 }}>Team Health Score</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize:11 }} />
              <PolarRadiusAxis domain={[0,100]} tick={false} />
              <Radar name="Score" dataKey="value" stroke="#4361ee" fill="#4361ee" fillOpacity={0.3} />
              <Tooltip formatter={v => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="card">
        <h4 style={{ marginBottom:16 }}>Project Summary</h4>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'2px solid #f0f0f0' }}>
              {['Project','Status','Total Tasks','Completed','Overdue','Completion Rate'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'10px 12px', fontSize:12, color:'#888', fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const pt  = tasks.filter(t => (t.project?._id||t.project) === p._id);
              const done = pt.filter(t => t.status === 'Done').length;
              const over = pt.filter(t => t.isOverdue).length;
              const rate = pt.length ? Math.round((done/pt.length)*100) : 0;
              return (
                <tr key={p._id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                  <td style={{ padding:'10px 12px', fontWeight:600, fontSize:14 }}>{p.name}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ fontSize:12, padding:'3px 8px', borderRadius:20, background: p.status==='Active'?'#d4f5dc':'#e8eaf6', color: p.status==='Active'?'#1a7f37':'#3949ab', fontWeight:600 }}>{p.status}</span>
                  </td>
                  <td style={{ padding:'10px 12px', fontSize:14 }}>{pt.length}</td>
                  <td style={{ padding:'10px 12px', fontSize:14, color:'#2dc653', fontWeight:600 }}>{done}</td>
                  <td style={{ padding:'10px 12px', fontSize:14, color: over>0?'#e63946':'#aaa', fontWeight: over>0?600:400 }}>{over}</td>
                  <td style={{ padding:'10px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'#f0f0f0', borderRadius:3 }}>
                        <div style={{ height:'100%', width:`${rate}%`, background: rate>70?'#2dc653':rate>40?'#f4a261':'#e63946', borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:600, color:'#555' }}>{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
