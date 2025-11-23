// src/components/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileTree from './FileTree';
import FilePreviewModal from './FilePreviewModal';
import DiffModal from './DiffModal';

export default function HistoryPage({ repo, user, onBack }) {
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'browse'
  const [snapshotFiles, setSnapshotFiles] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffCommit, setDiffCommit] = useState(null);
  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/commits`);
        setCommits(res.data);
      } catch (err) {
        setError('Failed to load commit history');
      }
    };
    fetchCommits();
  }, [repo.repo_id]);
  const viewSnapshot = async (commit) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/tree/${commit.tree_id}`);

      const entries = res.data.entries;
      setSnapshotFiles(entries); // Save all files
      setCurrentFiles(entries.filter(e => e.tree_id === commit.tree_id)); // Show root
      setCurrentPath([]);
      setSelectedCommit(commit); // Save which commit we're looking at
      setView('browse'); // Switch to the file browser view

    } catch (err) {
      setError('Failed to load snapshot files');
    }
  };

  const openFolder = (node) => {
    if (!node.child_tree_id) return;
    const entries = snapshotFiles.filter(e => e.tree_id === node.child_tree_id);
    setCurrentFiles(entries);
    setCurrentPath(prev => [...prev, node.name]);
  };

  const goBackFolder = () => {
    if (currentPath.length === 0) return; // root
    
    const newPath = [...currentPath];
    newPath.pop();

    let newTreeId;
    if (newPath.length === 0) {
      newTreeId = selectedCommit.tree_id;
    } else {
      let parentNode = null;
      let tempTreeId = selectedCommit.tree_id;
      let entries = snapshotFiles.filter(e => e.tree_id === tempTreeId);

      for (const part of newPath) {
          parentNode = entries.find(e => e.name === part && e.mode === 'tree');
          if (!parentNode) { 
              newTreeId = selectedCommit.tree_id; 
              break;
          }
          tempTreeId = parentNode.child_tree_id;
          entries = snapshotFiles.filter(e => e.tree_id === tempTreeId);
      }
      newTreeId = tempTreeId;
    }

    setCurrentFiles(snapshotFiles.filter((e) => e.tree_id === newTreeId));
    setCurrentPath(newPath);
  };
  // Function to handle the rollback button click
  const handleRollback = async (commitId, e) => {
    e.stopPropagation(); // Stop the click from opening the "Browse" view
    
    if (!window.confirm("Are you sure you want to revert to this version? This will create a new commit.")) {
      return;
    }

    try {
      await axios.post(`http://localhost:3001/api/repos/${repo.repo_id}/rollback/${commitId}`, {
        user_id: user.user_id
      });
      
      alert("Restored successfully! A new commit has been created.");
      
      // Refresh the list to see the new commit immediately
      const res = await axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/commits`);
      setCommits(res.data);
      
    } catch (err) {
      console.error(err);
      alert("Failed to rollback");
    }
  };

  return (
    <div className="repo-page">
        <button className="btn primary back" onClick={view === 'list' ? onBack : () => setView('list')}>
        {view === 'list' ? 'Back to Repo' : 'Back to History'}
        </button>

        <div className="repo-header">
        <h1>
            {view === 'list' 
            ? `Commit History: ${repo.name}` 
            : `Browsing: ${selectedCommit.message}`
            }
        </h1>
        {view === 'browse' && (
            <div className="commit-meta" style={{ fontSize: '14px', color: 'var(--muted)' }}>
            by {selectedCommit.user_name} on {new Date(selectedCommit.created_at).toLocaleString()}
            </div>
        )}
        </div>

        {error && <div className="err">{error}</div>}


        {view === 'list' ? (
        // VIEW 1: COMMIT LIST
        <table className="history-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Message</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Author</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {commits.map(commit => (
                <tr 
                key={commit.commit_id} 
                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                onClick={() => viewSnapshot(commit)}
                >
                <td style={{ padding: '10px', color: 'var(--accent-2)' }}>{commit.message}</td>
                <td style={{ padding: '10px' }}>{commit.user_name}</td>
                <td style={{ padding: '10px' }}>{new Date(commit.created_at).toLocaleString()}</td>

                <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button 
                      className="btn ghost" 
                      style={{ fontSize: '12px', padding: '5px 10px', border: '1px solid #00c6ff', color: '#00c6ff', marginRight: '5px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiffCommit(commit.commit_id);
                      }}
                    >
                      Compare
                    </button>
                    <button 
                    className="btn ghost" 
                    style={{ fontSize: '12px', padding: '5px 10px', border: '1px solid #555' }}
                    onClick={(e) => handleRollback(commit.commit_id, e)}
                    >
                    Restore
                    </button>
                </td>
                
                </tr>
            ))}
            </tbody>
        </table>

        ) : (
        // VIEW 2: FILE BROWSER
        <div className="editor-box" style={{ marginTop: '20px' }}>
            <div
                className="current-path-bar"
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                padding: "10px 14px",
                background: "rgba(20,20,40,0.5)",
                borderRadius: "12px",
                }}
            >
                <div>
                {currentPath.length > 0 && (
                    <button
                    className="btn ghost"
                    onClick={goBackFolder} // Use the new function
                    style={{ marginRight: 8 }}
                    >
                    ⬅
                    </button>
                )}
                <span style={{ fontWeight: 600, color: "#fff" }}>
                    /{currentPath.join("/")}
                </span>
                </div>
            </div>
            <FileTree tree={currentFiles} onClickFolder={openFolder} onClickFile={(node) => setSelectedFile({...node.blob, name: node.name})} />
        </div>
        )}
        {selectedFile && (
            <FilePreviewModal
            repoId={repo.repo_id}
            blob={selectedFile}
            onClose={() => setSelectedFile(null)}
            />
        )}
        {diffCommit && (
          <DiffModal 
            repoId={repo.repo_id} 
            commitId={diffCommit} 
            onClose={() => setDiffCommit(null)} 
          />
        )}
    </div>
    );
}