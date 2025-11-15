import React, { useState } from 'react';
import axios from 'axios';

export default function AddCollaborator({ repoId, onAdded }) {
  const [searchUser, setSearchUser] = useState('');
  const [permission, setPermission] = useState('Viewer');

  const handleAdd = async () => {
    try {
      await axios.post(`http://localhost:3001/api/repos/${repoId}/collaborators`, {
        user_name: searchUser,
        permission
      });
      alert('Collaborator added');
      onAdded();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding collaborator');
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <input
        placeholder="Username to add"
        value={searchUser}
        onChange={e => setSearchUser(e.target.value)}
      />
      <select value={permission} onChange={e => setPermission(e.target.value)}>
        <option value="Viewer">Viewer</option>
        <option value="Contributor">Contributor</option>
        <option value="Owner">Owner</option>
      </select>
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
