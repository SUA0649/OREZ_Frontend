import React from 'react';
import { Trash2 } from 'lucide-react';

export default function FileTree({ tree, onClickFolder, onClickFile, onDelete }) {
  const folders = tree.filter((n) => n.mode === "tree");
  const files = tree.filter((n) => n.mode !== "tree");

  const handleDelete = (e, node) => {
    e.stopPropagation(); // Prevent folder/file click
    if (onDelete) onDelete(node);
  };

  return (
    <ul className="tree-list file-display">
      {folders.map((node) => (
        <li key={node.name} className="file-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: '6px' }}>
          <span
            className="folder"
            onClick={() => onClickFolder(node)}
            style={{ cursor: "pointer" }}
          >
            📁 {node.name}
          </span>
          <Trash2 size={16} color="red" style={{ cursor: 'pointer' }} onClick={(e) => handleDelete(e, node)} />
        </li>
      ))}
      {files.map((node) => (
        <li key={node.name} className="file-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 10px', borderRadius: '6px' }}>
          <span
            className="file"
            onClick={() => onClickFile ? onClickFile(node) : null}
            style={{ cursor: onClickFile ? "pointer" : "default" }}
          >
            📄 {node.name} ({Math.round(node.blob?.size / 1024)} KB)
          </span>
          <Trash2 size={16} color="red" style={{ cursor: 'pointer' }} onClick={(e) => handleDelete(e, node)} />
        </li>
      ))}
    </ul>
  );
}
