import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell 
} from 'recharts';
import { ArrowLeft, Activity, Smile, AlertTriangle, Copy } from 'lucide-react';

export default function AnalyticsPage({ repo, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repo.repo_id}/analytics`)
      .then(res => {
        
        // --- FIX 1: LINE GRAPH (Time of Day "Heartbeat") ---
        // We map the Y-Axis to the HOUR of the commit (0-24).
        // This creates a wave pattern showing "When do I work?"
        const activity = res.data.sentiment.slice().reverse().map((s, index) => {
            const date = new Date(s.date);
            return {
                index: index + 1,
                timeLabel: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                dateLabel: date.toLocaleDateString(),
                // Y-Axis Value: The Hour + Minute fraction (e.g., 14:30 -> 14.5)
                hourVal: date.getHours() + (date.getMinutes() / 60)
            };
        });

        // --- FIX 2: BAR CHART (Visible Neutral Bars) ---
        const sentiment = res.data.sentiment.map(s => ({
            ...s,
            uniqueLabel: new Date(s.date).toLocaleTimeString() + ` (${s.message.length})`,
            displayDate: new Date(s.date).toLocaleString(),
            shortMsg: s.message.length > 20 ? s.message.substring(0,20)+'...' : s.message,
            renderScore: s.score === 0 ? 0.2 : s.score 
        }));
        
        setData({ ...res.data, activity, sentiment });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load analytics data.");
        setLoading(false);
      });
  }, [repo.repo_id]);

  if (loading) return <div className="dashboard" style={{padding:'40px', textAlign:'center'}}>Loading AI Analytics...</div>;
  if (error) return <div className="dashboard" style={{padding:'40px', textAlign:'center', color:'#f44336'}}>{error}</div>;

  return (
    <div className="dashboard" style={{ padding: '40px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
        <button className="btn ghost" onClick={onBack}>
            <ArrowLeft size={18}/> Back to Repo
        </button>
        <div>
            <h1 className="brand-xl" style={{ fontSize: '2rem' }}>AI Analytics</h1>
            <p style={{color:'var(--color-muted)', margin:0}}>Insights for {repo.name}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* --- 1. COMMIT ACTIVITY GRAPH (Time of Day) --- */}
        <div className="glass-panel" style={{ padding: '25px', minHeight: '350px' }}>
            <h3 className="panel-title" style={{ fontSize: '1.2rem', display:'flex', gap:'10px' }}>
                <Activity size={20} color="var(--color-secondary)"/> Work Rhythm (Time of Day)
            </h3>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <LineChart data={data.activity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="index" stroke="#888" fontSize={12} label={{ value: 'Commit Sequence', position: 'insideBottom', offset: -5 }} />
                        {/* Y Axis is 0 (Midnight) to 24 (Midnight next day) */}
                        <YAxis domain={[0, 24]} stroke="#888" fontSize={12} unit="h" />
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    return (
                                        <div style={{backgroundColor:'#1c1f26', border:'1px solid #333', padding:'10px', borderRadius:'5px'}}>
                                            <p style={{color:'#fff', margin:0, fontWeight:'bold'}}>Commit #{d.index}</p>
                                            <p style={{color:'#aaa', margin:0, fontSize:'0.8rem'}}>Date: {d.dateLabel}</p>
                                            <p style={{color:'var(--color-secondary)', margin:0, fontSize:'0.9rem'}}>Time: {d.timeLabel}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line 
                            type="monotone" // Curves the line nicely
                            dataKey="hourVal" 
                            stroke="var(--color-secondary)" 
                            strokeWidth={3} 
                            dot={{ r: 4, fill: '#fff' }} 
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- 2. SENTIMENT ANALYSIS (AI MOOD) --- */}
        <div className="glass-panel" style={{ padding: '25px', minHeight: '350px' }}>
            <h3 className="panel-title" style={{ fontSize: '1.2rem', display:'flex', gap:'10px' }}>
                <Smile size={20} color="var(--color-primary)"/> Project Mood (AI Sentiment)
            </h3>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <BarChart data={data.sentiment}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                        <XAxis hide />
                        <YAxis stroke="#888" fontSize={12} />
                        <ReferenceLine y={0} stroke="#666" />
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    const color = d.score > 0 ? '#4caf50' : d.score < 0 ? '#f44336' : '#888';
                                    return (
                                        <div style={{backgroundColor:'#1c1f26', border:'1px solid #333', padding:'10px', borderRadius:'5px', zIndex:1000}}>
                                            <p style={{margin:0, fontWeight:'bold', color:'#fff'}}>{d.author}</p>
                                            <p style={{margin:0, color:'#aaa', fontSize:'0.8rem'}}>{d.displayDate}</p>
                                            <p style={{margin:'5px 0', fontStyle:'italic'}}>"{d.shortMsg}"</p>
                                            <p style={{margin:0, fontWeight:'bold', color: color}}>
                                                Score: {d.score} {d.score > 0 ? '😃' : d.score < 0 ? '😡' : '😐'}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="renderScore">
                            {data.sentiment.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score > 0 ? '#4caf50' : entry.score < 0 ? '#f44336' : '#666'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- 3. CODE CLONE DETECTION --- */}
        <div className="glass-panel" style={{ padding: '25px', gridColumn: '1 / -1' }}>
            <h3 className="panel-title" style={{ fontSize: '1.2rem', display:'flex', gap:'10px', color: data.clones.length > 0 ? '#ff9800' : '#4caf50' }}>
                {data.clones.length > 0 ? <AlertTriangle size={20}/> : <Copy size={20}/>} 
                Code Clone Detection
            </h3>
            
            {data.clones.length === 0 ? (
                <div className="empty" style={{textAlign:'center', padding:'20px'}}>
                    No duplicate code files found. Great job!
                </div>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {data.clones.map(clone => (
                        <div key={clone.blob_hash} style={{background:'rgba(255,152,0,0.1)', border:'1px solid rgba(255,152,0,0.3)', padding:'15px', borderRadius:'8px'}}>
                            <div style={{fontWeight:'bold', color:'#ff9800', marginBottom:'5px'}}>
                                Warning: Identical content found in {clone.count} files
                            </div>
                            <div style={{fontSize:'0.9rem', color:'#ccc', fontFamily:'monospace'}}>
                                {clone.paths}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}