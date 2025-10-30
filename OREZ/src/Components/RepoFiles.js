// frontend/src/components/RepoFiles.js
import { useState, useEffect } from 'react';

export default function RepoFiles({ repoId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/repos/${repoId}/files`)
      .then(r => r.json())
      .then(data => setFiles(data.files))
      .finally(() => setLoading(false));
  }, [repoId]);

  if (loading) return <p>Loading files...</p>;

  return (
    <div>
      <h3>Files</h3>
      <ul>
        {files.map(f => (
          <li key={f.sha}>{f.path} ({(f.size_bytes / 1024).toFixed(2)} KB)</li>
        ))}
      </ul>
    </div>
  );
}