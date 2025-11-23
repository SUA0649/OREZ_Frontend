import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function FilePreviewModal({ repoId, blob, onClose }) {
  const [content, setContent] = useState('Loading...');
  const [type, setType] = useState('text');

  useEffect(() => {
    // (Keep your existing fetch logic here - COPY IT FROM PREVIOUS STEP)
    // Just copying the fetch logic block for completeness:
    const fetchContent = async () => {
        try {
            const extension = blob.name.split('.').pop().toLowerCase();
            const unsupportedExtensions = ['exe', 'bin', 'dll', 'zip', 'rar', 'iso', 'img', 'dat', 'msi', 'jar', '7z'];
            
            if (unsupportedExtensions.includes(extension)) {
                setType('unsupported');
                setContent('No preview available for this file type.');
                return;
            }

            const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
            const pdfExtensions = ['pdf'];
            const isImage = imageExtensions.includes(extension);
            const isPdf = pdfExtensions.includes(extension);

            const res = await axios.get(`http://localhost:3001/api/repos/${repoId}/blob/${blob.hash}`, { responseType: 'blob' });

            if (isImage) {
                setType('image');
                setContent(URL.createObjectURL(res.data));
            } else if (isPdf) {
                setType('pdf');
                const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
                setContent(URL.createObjectURL(pdfBlob));
            } else {
                setType('text');
                const fileText = await res.data.text();
                if (fileText === "") setContent("text empty file");
                else setContent(fileText);
            }
        } catch (err) {
            setType('unsupported');
            setContent('Error: Could not load file content.');
        }
    };
    fetchContent();
  }, [repoId, blob.hash, blob.name]);

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
            <h3 style={{ margin: 0, color: 'var(--color-secondary)' }}>{blob.name}</h3>
            <button onClick={onClose} style={modalStyles.closeButton}><X size={24}/></button>
        </div>
        
        <div style={modalStyles.previewArea}>
          {type === 'image' ? (
            <img src={content} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          ) : type === 'pdf' ? (
            <iframe src={content} title={blob.name} style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', color: type === 'unsupported' ? '#888' : '#e6eef8', fontFamily:'monospace', fontSize:'14px' }}>
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 2000,
  },
  content: {
    background: '#1c1f26', // Dark Panel BG
    color: '#e6eef8',
    borderRadius: '15px',
    width: '80%', height: '80%', maxWidth: '1000px',
    boxShadow: '0 0 40px rgba(0,0,0,0.6)',
    display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  header: {
      padding: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: '#15171c'
  },
  closeButton: {
    background: 'none', border: 'none', color: '#fff',
    cursor: 'pointer', display:'flex', alignItems:'center'
  },
  previewArea: {
    flex: 1,
    overflow: 'auto',
    background: '#111317', // Darker BG for code
    padding: '20px',
  }
};