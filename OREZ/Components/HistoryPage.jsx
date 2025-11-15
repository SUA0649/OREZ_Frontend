// src/components/HistoryPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HistoryPage({ repo, user, onBack }) {
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState('');

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

  return (
    <div className="repo-page"> {/* same css */}
      <button className="btn primary back" onClick={onBack}>
        Back to Repo
      </button>
      
      <div className="repo-header">
        <h1>Commit History: {repo.name}</h1>
      </div>

      {error && <div className="err">{error}</div>}

      {/* A simple table for the history */}
      <table className="history-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Message</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Author</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {commits.map(commit => (
            <tr key={commit.commit_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '10px' }}>{commit.message}</td>
              <td style={{ padding: '10px' }}>{commit.user_name}</td>
              <td style={{ padding: '10px' }}>{new Date(commit.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}