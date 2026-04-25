import React, { useState } from 'react';
import axios from 'axios';

export default function AddCollaborator({ repoId, onAdded }) {
  const [searchUser, setSearchUser] = useState('');
  const [permission, setPermission] = useState('Viewer');

  const handleAdd = async () => {
    if (!searchUser.trim()) return;

    try {
      // CHECK: Are there multiple users separated by comma?
      if (searchUser.includes(',')) {
        // --- BULK MODE (Uses TCL Savepoints) ---
        const users = searchUser.split(',').map(u => u.trim()).filter(u => u);
        
        const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repoId}/collaborators/bulk`, {
          user_names: users,
          permission
        });

        // Format the result message
        const added = res.data.results.added.join(', ');
        const failed = res.data.results.failed.map(f => f.user).join(', ');
        
        let msg = `Processed!`;
        if (added) msg += `\n✅ Added: ${added}`;
        if (failed) msg += `\n❌ Skipped (Not Found): ${failed}`;
        
        alert(msg);
        
      } else {
        // --- SINGLE MODE (Uses Stored Procedure) ---
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/repos/${repoId}/collaborators`, {
          user_name: searchUser,
          permission
        });
        alert('Collaborator added');
      }
      
      setSearchUser('');
      onAdded(); // Refresh the member list
      
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding collaborator');
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <input
        placeholder="Username (e.g. 'alice, bob')"
        value={searchUser}
        onChange={e => setSearchUser(e.target.value)}
        style={{ marginRight: '10px', padding: '5px' }}
      />
      <select value={permission} onChange={e => setPermission(e.target.value)} style={{ marginRight: '10px', padding: '5px' }}>
        <option value="Viewer">Viewer</option>
        <option value="Contributor">Contributor</option>
        <option value="Owner">Owner</option>
      </select>
      <button onClick={handleAdd} className="btn accent">Add</button>
    </div>
  );
}