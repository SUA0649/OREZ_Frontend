// src/Components/FileTree.jsx
import React from 'react';

export default function FileTree({ tree, onClickFolder, onClickFile }) {
  const folders = tree.filter((n) => n.mode === "tree");
  const files = tree.filter((n) => n.mode !== "tree");

  return (
    <ul className="tree-list file-display">
      {folders.map((node) => (
        <li key={node.name} className="file-card">
          <span
            className="folder"
            onClick={() => onClickFolder(node)}
            style={{ cursor: "pointer" }}
          >
            📁 {node.name}
          </span>
        </li>
      ))}
      {files.map((node) => (
        <li key={node.name} className="file-card">
          <span
            className="file"
            onClick={() => onClickFile ? onClickFile(node) : null}
            style={{ cursor: onClickFile ? "pointer" : "default" }}
          >
            📄 {node.name} ({Math.round(node.blob?.size / 1024)} KB)
          </span>
        </li>
      ))}
    </ul>
  );
}