import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { X, FileDiff } from 'lucide-react';

export default function DiffModal({ repoId, commitId, onClose }) {
  const [changes, setChanges] = useState([]);
  const [selectedChange, setSelectedChange] = useState(null);
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [fileType, setFileType] = useState('text'); // 'text' or 'binary'

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repoId}/diff/${commitId}`)
      .then(res => setChanges(res.data.changes))
      .catch(err => console.error(err));
  }, [repoId, commitId]);

  const handleSelectFile = async (change) => {
    setSelectedChange(change);
    setLoadingContent(true);
    setOldCode('');
    setNewCode('');
    
    // 1. Check for Binary Files (Images/PDFs/Exes)
    const extension = change.name.split('.').pop().toLowerCase();
    const binaryExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'zip', 'exe', 'bin'];
    
    if (binaryExtensions.includes(extension)) {
      setFileType('binary');
      setLoadingContent(false);
      return; // Stop here! Don't fetch binary data for text diffing.
    }

    setFileType('text');

    try {
      // 2. Fetch Text Content Only
      if (change.oldHash) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repoId}/blob/${change.oldHash}`);
        setOldCode(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
      }
      if (change.newHash) {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repoId}/blob/${change.newHash}`);
        setNewCode(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2));
      }
    } catch (err) {
      setNewCode("Error loading content (Binary or Deleted).");
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{margin:0, display:'flex', alignItems:'center', gap:'10px'}}>
            <FileDiff size={24} color="var(--color-primary)"/> Commit Changes
          </h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20}/></button>
        </div>

        <div style={styles.body}>
          {/* SIDEBAR */}
          <div style={styles.sidebar}>
            {changes.length === 0 && <p style={{color:'#888', padding:'20px'}}>No changes found.</p>}
            {changes.map((change, idx) => (
              <div 
                key={idx} 
                onClick={() => handleSelectFile(change)}
                style={{
                  ...styles.fileItem,
                  backgroundColor: selectedChange === change ? 'rgba(163, 103, 255, 0.2)' : 'transparent',
                  borderLeft: selectedChange === change ? '3px solid var(--color-primary)' : '3px solid transparent',
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

          {/* VIEWER */}
          <div style={styles.viewer}>
            {!selectedChange ? (
              <div style={styles.placeholder}>Select a file to see changes</div>
            ) : loadingContent ? (
              <div style={styles.placeholder}>Loading diff...</div>
            ) : fileType === 'binary' ? (
              // --- BINARY FILE MESSAGE ---
              <div style={{...styles.placeholder, flexDirection:'column', gap:'10px'}}>
                <p style={{color:'#e6eef8', fontSize:'1.1rem'}}>Binary File Changed</p>
                <p style={{color:'#888', fontSize:'0.9rem'}}>(Diffing images/PDFs is not supported. View the file directly to see content.)</p>
              </div>
            ) : (
              // --- TEXT DIFF VIEWER ---
              <div style={{height: '100%', overflow: 'auto'}}>
                <ReactDiffViewer 
                  oldValue={oldCode} 
                  newValue={newCode} 
                  splitView={true} 
                  useDarkTheme={true}
                  styles={{
                    variables: {
                        dark: {
                            diffViewerBackground: '#111317',
                            diffViewerColor: '#fff',
                            addedBackground: '#004d1a',
                            removedBackground: '#660000',
                            wordAddedBackground: '#006622',
                            wordRemovedBackground: '#990000',
                        }
                    }
                  }}
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
    backdropFilter: 'blur(5px)',
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    height: '90%',
    backgroundColor: '#1c1f26', // Matches Panel BG
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 0 30px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    backgroundColor: '#15171c'
  },
  closeBtn: {
    background: 'transparent', color: '#fff', border: 'none',
    cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center'
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid rgba(255,255,255,0.1)',
    overflowY: 'auto',
    backgroundColor: '#15171c'
  },
  fileItem: {
    padding: '12px 15px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '14px',
    transition: '0.2s'
  },
  viewer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#111317'
  },
  placeholder: {
    color: '#666',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
};