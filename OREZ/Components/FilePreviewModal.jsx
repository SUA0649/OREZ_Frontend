// src/Components/FilePreviewModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FilePreviewModal({ repoId, blob, onClose }) {
  const [content, setContent] = useState('Loading...');
  const [type, setType] = useState('text');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const extension = blob.name.split('.').pop().toLowerCase();

        const unsupportedExtensions = [
          'exe', 'bin', 'dll', 'zip', 'rar', 'iso', 'img', 'dat', 'msi', 'jar',
          '7z', 'pkg', 'deb', 'rpm'
        ];
        
        if (unsupportedExtensions.includes(extension)) {
          setType('unsupported');
          setContent('No preview available for this file type.');
          return;
        }

        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'];
        const pdfExtensions = ['pdf'];

        const isImage = imageExtensions.includes(extension);
        const isPdf = pdfExtensions.includes(extension);

        const res = await axios.get(
          `http://localhost:3001/api/repos/${repoId}/blob/${blob.hash}`,
          { responseType: 'blob' }
        );

        if (isImage) {
          setType('image');
          setContent(URL.createObjectURL(res.data));
        } else if (isPdf) {
          setType('pdf');
          setContent(URL.createObjectURL(res.data));
        } else {
          setType('text');
          const fileText = await res.data.text();
          
          if (fileText === "") {
            setContent("text empty file");
          } else {
            setContent(fileText);
          }
        }

      } catch (err) {
        setType('unsupported');
        setContent('Error: Could not load file content.');
      }
    };

    fetchContent();
  }, [repoId, blob.hash, blob.name]);

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      style={modalStyles.backdrop}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={modalStyles.content}
      >
        <button 
          onClick={onClose} 
          style={modalStyles.closeButton}
        >
          &times;
        </button>
        <h3 style={{ marginTop: 0 }}>{blob.name}</h3>
        
        <div style={modalStyles.previewArea}>
          {type === 'image' ? (
            <img src={content} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          ) : type === 'pdf' ? (
            <iframe src={content} title={blob.name} style={{ width: '100%', height: '100%', border: 'none' }} />
          ) : (
            <pre style={{ whiteSpace: 'pre-wrap', color: type === 'unsupported' ? '#888' : '#e6eef8' }}>
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
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    background: '#12131a',
    color: '#e6eef8',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    height: '80%',
    maxWidth: '900px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
  },
  previewArea: {
    flex: 1,
    overflow: 'auto',
    background: 'rgba(0,0,0,0.3)',
    padding: '10px',
    borderRadius: '4px',
  }
};