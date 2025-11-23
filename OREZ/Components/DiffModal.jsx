import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDiffViewer from 'react-diff-viewer-continued';

export default function DiffModal({ repoId, commitId, onClose }) {
  const [changes, setChanges] = useState([]);
  const [selectedChange, setSelectedChange] = useState(null);
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  // 1. Fetch the list of what changed
  useEffect(() => {
    axios.get(`http://localhost:3001/api/repos/${repoId}/diff/${commitId}`)
      .then(res => setChanges(res.data.changes))
      .catch(err => console.error(err));
  }, [repoId, commitId]);

  // 2. Fetch content when a file is clicked
  const handleSelectFile = async (change) => {
    setSelectedChange(change);
    setLoadingContent(true);
    setOldCode('');
    setNewCode('');

    try {
      // Fetch Old Content (if it existed)
      if (change.oldHash) {
        const res = await axios.get(`http://localhost:3001/api/repos/${repoId}/blob/${change.oldHash}`);
        setOldCode(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
      }

      // Fetch New Content (if it exists)
      if (change.newHash) {
        const res = await axios.get(`http://localhost:3001/api/repos/${repoId}/blob/${change.newHash}`);
        setNewCode(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
      }
    } catch (err) {
      setNewCode("Error loading file content. It might be binary.");
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Commit Changes</h2>
          <button onClick={onClose} style={styles.closeBtn}>Close</button>
        </div>

        <div style={styles.body}>
          {/* LEFT SIDE: File List */}
          <div style={styles.sidebar}>
            {changes.length === 0 && <p style={{color:'#888'}}>No changes found.</p>}
            {changes.map((change, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSelectFile(change)}
                style={{
                  ...styles.fileItem,
                  backgroundColor: selectedChange === change ? '#333' : 'transparent',
                  color: change.type === 'added' ? '#4caf50' : 
                         change.type === 'deleted' ? '#f44336' : '#ff9800'
                }}
              >
                <span style={{fontWeight:'bold', marginRight:'8px'}}>
                  {change.type === 'added' ? '+' : change.type === 'deleted' ? '-' : 'M'}
                </span>
                {change.name}
              </div>
            ))}
          </div>

          {/* RIGHT SIDE: Diff Viewer */}
          <div style={styles.viewer}>
            {!selectedChange ? (
              <div style={styles.placeholder}>Select a file to see changes</div>
            ) : loadingContent ? (
              <div style={styles.placeholder}>Loading diff...</div>
            ) : (
              <div style={{height: '100%', overflow: 'auto'}}>
                <ReactDiffViewer 
                  oldValue={oldCode} 
                  newValue={newCode} 
                  splitView={true} 
                  useDarkTheme={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    height: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: '15px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff'
  },
  closeBtn: {
    background: '#f44336', color: '#fff', border: 'none',
    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer'
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  sidebar: {
    width: '250px',
    borderRight: '1px solid #333',
    overflowY: 'auto',
    padding: '10px'
  },
  fileItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #2a2a2a',
    fontSize: '14px'
  },
  viewer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0d1117'
  },
  placeholder: {
    color: '#666',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
};