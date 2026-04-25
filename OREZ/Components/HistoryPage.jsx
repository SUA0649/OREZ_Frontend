import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, Clock, RotateCcw, GitCompare, Folder, Search, Calendar, X } from 'lucide-react';
import FileTree from './FileTree';
import FilePreviewModal from './FilePreviewModal';
import DiffModal from './DiffModal';

export default function HistoryPage({ repo, user, onBack }) {
  const amOwner = repo.permission === 'Owner';
  const amContributor = repo.permission === 'Contributor';
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); 
  const [snapshotFiles, setSnapshotFiles] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffCommit, setDiffCommit] = useState(null);

  // --- SEARCH STATE ---
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- FETCH WITH SEARCH FILTERS ---
  const fetchCommits = useCallback(async () => {
    try {
      const params = {};
      if (searchKeyword) params.keyword = searchKeyword;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // If filters exist, use the Search Endpoint. Otherwise, use standard list.
      const endpoint = (searchKeyword || startDate || endDate) 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repo.repo_id}/search-commits`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repo.repo_id}/commits`;

      const res = await axios.get(endpoint, { params });
      setCommits(res.data);
    } catch (err) { setError('Failed to load history'); }
  }, [repo.repo_id, searchKeyword, startDate, endDate]);

  // Fetch on mount and whenever search criteria change
  useEffect(() => {
    // Add a small debounce so we don't search on every keystroke instantly
    const delay = setTimeout(() => {
        fetchCommits();
    }, 300);
    return () => clearTimeout(delay);
  }, [fetchCommits]);

  // ... (Keep viewSnapshot, openFolder, goBackFolder logic exactly as is) ...
  // [OMITTED FOR BREVITY - PASTE YOUR EXISTING LOGIC FUNCTIONS HERE]
  const viewSnapshot = async (commit) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repo.repo_id}/tree/${commit.tree_id}`);
      const entries = res.data.entries;
      setSnapshotFiles(entries);
      setCurrentFiles(entries.filter(e => e.tree_id === commit.tree_id));
      setCurrentPath([]);
      setSelectedCommit(commit);
      setView('browse');
    } catch (err) { setError('Failed to load snapshot'); }
  };

  const openFolder = (node) => {
    if (!node.child_tree_id) return;
    const entries = snapshotFiles.filter(e => e.tree_id === node.child_tree_id);
    setCurrentFiles(entries);
    setCurrentPath(prev => [...prev, node.name]);
  };

  const goBackFolder = () => {
    if (currentPath.length === 0) return;
    const newPath = [...currentPath];
    newPath.pop();
    
    let newTreeId;
    if (newPath.length === 0) {
        newTreeId = selectedCommit.tree_id;
    } else {
        // Simple logic to find parent (simplified for snippet)
        newTreeId = selectedCommit.tree_id;
    }
    setCurrentFiles(snapshotFiles.filter((e) => e.tree_id === newTreeId));
    setCurrentPath(newPath);
  };

  const handleRollback = async (commitId, e) => {
    e.stopPropagation();
    if (!window.confirm("Revert to this version?")) return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repo.repo_id}/rollback/${commitId}`, { user_id: user.user_id });
      alert("Restored successfully!");
      fetchCommits(); // Refresh list
    } catch (err) { alert("Failed to rollback"); }
  };

  const clearSearch = () => {
      setSearchKeyword('');
      setStartDate('');
      setEndDate('');
  };

  return (
    <div className="dashboard" style={{ padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
        <button className="btn ghost" onClick={view === 'list' ? onBack : () => setView('list')}>
            <ArrowLeft size={18}/> {view === 'list' ? 'Back to Repo' : 'Back to History'}
        </button>
        <h1 style={{ fontSize: '2rem', margin:0, color:'var(--color-primary)', textShadow:'0 0 15px var(--color-primary)' }}>
            {view === 'list' ? 'Commit History' : `Snapshot: ${selectedCommit?.message}`}
        </h1>
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        {view === 'list' ? (
            <div>
                {/* --- SEARCH MODULE --- */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap:'wrap', alignItems:'center', background:'rgba(0,0,0,0.2)', padding:'15px', borderRadius:'12px' }}>
                    
                    {/* Keyword Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth:'200px' }}>
                        <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#666' }}/>
                        <input 
                            className="field" 
                            placeholder="Search by message or author..." 
                            style={{ paddingLeft: '38px' }}
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                        />
                    </div>

                    {/* Date Range */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{position:'relative'}}>
                            <Calendar size={16} style={{position:'absolute', top:'12px', left:'10px', color:'#666'}}/>
                            <input type="date" className="field" style={{paddingLeft:'35px', width:'160px'}} 
                                   value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <span style={{color:'#666'}}>to</span>
                        <div style={{position:'relative'}}>
                            <Calendar size={16} style={{position:'absolute', top:'12px', left:'10px', color:'#666'}}/>
                            <input type="date" className="field" style={{paddingLeft:'35px', width:'160px'}} 
                                   value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    {/* Clear Button */}
                    {(searchKeyword || startDate || endDate) && (
                        <button className="btn ghost" onClick={clearSearch} style={{padding:'10px'}}>
                            <X size={16} /> Clear
                        </button>
                    )}
                </div>
                {/* ------------------- */}

                {/* Header Row */}
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', paddingBottom:'15px', borderBottom:'1px solid #333', marginBottom:'15px', color:'var(--color-muted)', fontWeight:'bold', textTransform:'uppercase', fontSize:'0.8rem' }}>
                    <div>Message</div>
                    <div>Author</div>
                    <div>Date</div>
                    <div style={{textAlign:'right'}}>Actions</div>
                </div>

                {commits.map((commit) => (
                    <div 
                        key={commit.commit_id} 
                        style={{ 
                            display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', 
                            padding:'15px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', 
                            alignItems:'center', transition:'0.2s', cursor:'pointer' 
                        }}
                        className="history-row"
                        onClick={() => viewSnapshot(commit)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{fontWeight:'bold', color:'#fff'}}>{commit.message}</div>
                        <div style={{color:'var(--color-primary)'}}>{commit.user_name}</div>
                        <div style={{fontSize:'0.9rem', color:'#888'}}>{new Date(commit.created_at).toLocaleDateString()}</div>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent:'flex-end' }}>
                            
                            {/* 1. COMPARE BUTTON*/}
                            <button 
                                className="btn ghost" 
                                style={{padding:'6px 12px', fontSize:'0.8rem'}}
                                onClick={(e) => { e.stopPropagation(); setDiffCommit(commit.commit_id); }}
                            >
                                <GitCompare size={14}/> Compare
                            </button>
                            
                            {/* 2. RESTORE BUTTON*/}
                            {amOwner && (
                                <button 
                                    className="btn primary" 
                                    style={{ background: '#f44336', boxShadow:'none', padding:'6px 12px', fontSize:'0.8rem', border:'none' }}
                                    onClick={(e) => handleRollback(commit.commit_id, e)}
                                >
                                    <RotateCcw size={14}/> Restore
                                </button>
                            )}

                            {/* 3. REQUEST BUTTON*/}
                            {amContributor && (
                                <button 
                                    className="btn ghost" 
                                    style={{ borderColor: '#f44336', color:'#f44336', padding:'6px 12px', fontSize:'0.8rem' }}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if(!window.confirm("Request rollback to this version?")) return;
                                        try {
                                            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repo.repo_id}/rollback-request`, {
                                                user_id: user.user_id,
                                                commit_id: commit.commit_id
                                            });
                                            alert("Request sent to Owner.");
                                        } catch(err) { alert("Failed to send request"); }
                                    }}
                                >
                                    <Clock size={14}/> Request
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {commits.length === 0 && <div className="empty">No commits matching your search.</div>}
            </div>
        ) : (
            // Browser View
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--color-secondary)' }}>
                    <Folder size={20}/>
                    <span style={{fontWeight:'bold'}}>/{currentPath.join("/")}</span>
                    {currentPath.length > 0 && <button className="btn ghost" onClick={goBackFolder}>⬆ Up</button>}
                </div>
                
                <div style={{ border: '1px solid #333', borderRadius: '10px', padding: '20px', minHeight:'400px' }}>
                    <FileTree 
                        tree={currentFiles} 
                        onClickFolder={openFolder} 
                        onClickFile={(node) => setSelectedFile({...node.blob, name: node.name})} 
                    />
                </div>
            </div>
        )}
      </div>

      {selectedFile && <FilePreviewModal repoId={repo.repo_id} blob={selectedFile} onClose={() => setSelectedFile(null)} />}
      {diffCommit && <DiffModal repoId={repo.repo_id} commitId={diffCommit} onClose={() => setDiffCommit(null)} />}
    </div>
  );
}