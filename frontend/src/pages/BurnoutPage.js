import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const RISK_COLOR  = { Low: '#2dc653', Medium: '#f4a261', High: '#e63946' };
const RISK_BG     = { Low: '#d4f5dc', Medium: '#fff0d6', High: '#ffe0e0' };
const RISK_ICON   = { Low: '🟢', Medium: '🟡', High: '🔴' };

export default function BurnoutPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects,  setProjects]  = useState([]);
  const [selProject,setSelProject]= useState(projectId || '');
  const [sprints,   setSprints]   = useState([]);
  const [selSprint, setSelSprint] = useState('');
  const [results,   setResults]   = useState([]);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [fetched,   setFetched]   = useState(false);

  useEffect(() => {
    axios.get('/api/projects').then(r => setProjects(r.data));
  }, []);

  useEffect(() => {
    if (selProject) {
      axios.get(`/api/sprints?projectId=${selProject}`).then(r => setSprints(r.data));
      // Load existing results
      axios.get(`/api/burnout/project/${selProject}`).then(r => { setResults(r.data); setFetched(true); });
    }
  }, [selProject]);

  const runPrediction = async () => {
    if (!selProject) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/burnout/predict-project/${selProject}`, {
        sprintId: selSprint || undefined
      });
      setResults(data);
      setFetched(true);
    } catch (e) {
      alert('ML service not running. Start it with: cd ml-service && python app.py');
    } finally { setLoading(false); }
  };

  const riskCount = (r) => results.filter(x => x.burnoutRisk === r).length;

  return (
    <div className="page">
      <h2 style={{ fontSize:24, fontWeight:700, marginBottom:6 }}>🔥 Burnout Risk Analysis</h2>
      <p className="text-muted mb-3">ML-powered burnout prediction for your team members</p>

      {/* Controls */}
      <div className="card mb-3">
        <div className="grid-3 gap-3">
          <div className="form-group" style={{ margin:0 }}>
            <label>Select Project</label>
            <select className="form-control" value={selProject} onChange={e => setSelProject(e.target.value)}>
              <option value="">— Choose Project —</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label>Sprint (optional)</label>
            <select className="form-control" value={selSprint} onChange={e => setSelSprint(e.target.value)}>
              <option value="">All Sprints</option>
              {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button className="btn btn-primary" style={{ width:'100%', padding:'10px' }}
              onClick={runPrediction} disabled={!selProject || loading}>
              {loading ? '⏳ Predicting...' : '🤖 Run Burnout Prediction'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {fetched && results.length > 0 && (
        <>
          <div className="grid-3 mb-3">
            {['Low','Medium','High'].map(r => (
              <div key={r} className="card" style={{ borderLeft:`4px solid ${RISK_COLOR[r]}`, textAlign:'center' }}>
                <div style={{ fontSize:32 }}>{RISK_ICON[r]}</div>
                <div style={{ fontSize:28, fontWeight:700, color:RISK_COLOR[r] }}>{riskCount(r)}</div>
                <div style={{ fontSize:13, color:'#888' }}>{r} Risk Members</div>
              </div>
            ))}
          </div>

          {/* Result cards */}
          <div className="grid-2">
            {results.filter(r => r.burnoutRisk).map((r, i) => (
              <div key={i} className="card" style={{ borderLeft:`4px solid ${RISK_COLOR[r.burnoutRisk]}` }}>
                <div className="flex-between mb-3">
                  <div>
                    <div style={{ fontWeight:700, fontSize:16 }}>{r.user?.name || 'Team Member'}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{r.user?.email}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ background: RISK_BG[r.burnoutRisk], color: RISK_COLOR[r.burnoutRisk],
                      padding:'4px 14px', borderRadius:20, fontWeight:700, fontSize:14 }}>
                      {RISK_ICON[r.burnoutRisk]} {r.burnoutRisk} Risk
                    </div>
                    <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>
                      Confidence: {((r.confidence || 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Feature bars */}
                {r.features && (
                  <div style={{ marginBottom:12 }}>
                    {[
                      { key:'tasks_assigned',     label:'Tasks Assigned',  max:20 },
                      { key:'tasks_completed',    label:'Completed',       max:20 },
                      { key:'overdue_tasks',      label:'Overdue',         max:10 },
                      { key:'sprint_pressure',    label:'Sprint Pressure', max:1  },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom:6 }}>
                        <div className="flex-between" style={{ fontSize:11, color:'#888', marginBottom:2 }}>
                          <span>{f.label}</span>
                          <span>{r.features[f.key]}</span>
                        </div>
                        <div style={{ height:5, background:'#f0f0f0', borderRadius:3 }}>
                          <div style={{
                            height:'100%', borderRadius:3,
                            width:`${Math.min(100, (r.features[f.key] / f.max) * 100)}%`,
                            background: RISK_COLOR[r.burnoutRisk]
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                <div style={{ background: RISK_BG[r.burnoutRisk], padding:'10px 14px', borderRadius:8, fontSize:13 }}>
                  💡 {r.recommendation}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {fetched && results.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48 }}>🔍</div>
          <p style={{ color:'#aaa', marginTop:12 }}>No predictions yet. Select a project and run analysis.</p>
        </div>
      )}

      {!selProject && (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48 }}>⚖️</div>
          <h3 style={{ marginTop:12, color:'#555' }}>Select a project to begin</h3>
          <p className="text-muted mt-2">Choose a project above and click "Run Burnout Prediction"</p>
        </div>
      )}
    </div>
  );
}
