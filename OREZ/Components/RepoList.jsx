import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RepoList({ user }) {
  const [repos, setRepos] = useState([]);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/repos/${user.user_id}`);
      setRepos(res.data);
    } catch (err) {
      setError('Failed to fetch repositories');
    }
  };

  const handleCreateRepo = async () => {
    try {
      const res = await axios.post('http://localhost:3001/api/repos/create', {
        name: newRepoName,
        description: newRepoDesc,
        owner_id: user.user_id
      });
      setRepos([...repos, res.data]);
      setNewRepoName('');
      setNewRepoDesc('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create repo');
    }
  };

  const handleAddCollaborator = async () => {
    if (!selectedRepo) return;
    try {
      await axios.post(`http://localhost:3001/api/repos/${selectedRepo.repo_id}/add-collaborator`, {
        user_name: collaboratorName,
        permission: 'Contributor'
      });
      setCollaboratorName('');
      fetchRepos();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add collaborator');
    }
  };

  return (
    <div className="repo-container">
      <h2>Welcome, {user.user_name}</h2>
      {error && <div className="error">{error}</div>}

      <div className="repo-form">
        <input
          type="text"
          value={newRepoName}
          onChange={e => setNewRepoName(e.target.value)}
          placeholder="New Repository Name"
        />
        <input
          type="text"
          value={newRepoDesc}
          onChange={e => setNewRepoDesc(e.target.value)}
          placeholder="Description"
        />
        <button onClick={handleCreateRepo}>Create Repository</button>
      </div>

      <div className="repo-list">
        {repos.map(r => (
          <div key={r.repo_id} className="repo-item" onClick={() => setSelectedRepo(r)}>
            <strong>{r.name}</strong> - {r.description}
          </div>
        ))}
      </div>

      {selectedRepo && (
        <div className="collaborator-form">
          <h3>Add Collaborator to {selectedRepo.name}</h3>
          <input
            type="text"
            value={collaboratorName}
            onChange={e => setCollaboratorName(e.target.value)}
            placeholder="Username"
          />
          <button onClick={handleAddCollaborator}>Add</button>
        </div>
      )}
    </div>
  );
}
