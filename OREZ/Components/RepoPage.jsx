import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

// Component to render folder hierarchy (folders first)
function FileTree({ tree, onClickFolder }) {
  // Separate folders and files
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
          <span className="file">
            📄 {node.name} ({Math.round(node.blob?.size / 1024)} KB)
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function RepoPage({ repo, user, onBack }) {
  const [allUsers, setAllUsers] = useState([]);
  const [linked, setLinked] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [rootFiles, setRootFiles] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentTreeId, setCurrentTreeId] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchUsersAndFiles = async () => {
    try {
      const [ures, collRes, fileRes] = await Promise.all([
        axios.get("http://localhost:3001/api/users"),
        axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/collaborators`),
        axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/files`),
      ]);

      setAllUsers(ures.data);
      setLinked(collRes.data);

      const entries = fileRes.data.entries;
      const rootTreeId = fileRes.data.root_tree_id;
      setRootFiles(entries);
      setCurrentTreeId(rootTreeId);

      // Show root folder contents
      setCurrentFiles(entries.filter((e) => e.tree_id === rootTreeId));
      setCurrentPath([]);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to load users/files");
    }
  };

  useEffect(() => {
    fetchUsersAndFiles();
  }, []);

  const openFolder = async (node) => {
    if (!node.child_tree_id) return;
    const entries = rootFiles.filter((e) => e.tree_id === node.child_tree_id);
    setCurrentFiles(entries);
    setCurrentPath((prev) => [...prev, node.name]);
    setCurrentTreeId(node.child_tree_id);
  };

  const goBack = () => {
    if (currentPath.length === 0) return;
    const newPath = [...currentPath];
    newPath.pop();

    let newTreeId;
    if (newPath.length === 0) {
      newTreeId = rootFiles[0]?.tree_id;
    } else {
      const parentFolder = rootFiles.find(
        (e) => e.name === newPath[newPath.length - 1] && e.mode === "tree"
      );
      newTreeId = parentFolder?.child_tree_id || rootFiles[0]?.tree_id;
    }

    setCurrentFiles(rootFiles.filter((e) => e.tree_id === newTreeId));
    setCurrentPath(newPath);
    setCurrentTreeId(newTreeId);
  };

  const uploadFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const form = new FormData();
    const relativePaths = [];

    for (const f of selectedFiles) {
      const relPath =
        (currentPath.length > 0 ? currentPath.join("/") + "/" : "") +
        (f.webkitRelativePath || f.name);
      form.append("files", f);
      relativePaths.push(relPath);
    }

    form.append("filePathsJson", JSON.stringify(relativePaths));
    form.append("uploaded_by", user.user_id);

    try {
      await axios.post(
        `http://localhost:3001/api/repos/${repo.repo_id}/upload-folder`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      fetchUsersAndFiles();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload files");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = [];

    for (const item of e.dataTransfer.items) {
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          const files = await readDirEntry(entry);
          droppedFiles.push(...files);
        }
      } else {
        const file = item.getAsFile();
        if (file) droppedFiles.push(file);
      }
    }

    uploadFiles(droppedFiles.filter((f) => f));
  };

  const downloadRepoZip = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/api/repos/${repo.repo_id}/download`,
      { responseType: "blob" } // important
    );
    saveAs(res.data, `${repo.name}.zip`);
  } catch (err) {
    console.error(err);
    setError("Failed to download repo");
  }
};


  const amOwner = linked.some(
    (l) => l.user_id === user.user_id && l.permission === "Owner"
  );

  const addContributor = async (u) => {
    try {
      await axios.post(
        `http://localhost:3001/api/repos/${repo.repo_id}/collaborators`,
        { user_name: u.user_name, permission: "Contributor" }
      );
      fetchUsersAndFiles();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add contributor");
    }
  };

  return (
    <div className="repo-page">
      <button
        className="btn primary back"
        onClick={onBack}
        style={{
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.boxShadow = "0 4px 15px rgba(123,92,255,0.5)")}
        onMouseLeave={(e) => (e.target.style.boxShadow = "")}
      >
        ← Back
      </button>

      <div className="repo-header">
        <h1>{repo.name}</h1>
        {amOwner && <div className="owner-badge">YOU ARE OWNER</div>}
      </div>

      {/* Directory path bar */}
      <div
        className="current-path-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          padding: "10px 14px",
          background: "rgba(20,20,40,0.5)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <div>
          {currentPath.length > 0 && (
            <button
              className="btn ghost"
              onClick={goBack}
              style={{
                marginRight: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.boxShadow = "0 0 8px var(--accent-2)")}
              onMouseLeave={(e) => (e.target.style.boxShadow = "")}
            >
              ⬅
            </button>
          )}
          <span style={{ fontWeight: 600, color: "#fff" }}>
            /{currentPath.join("/")}
          </span>
        </div>
        <button
          className="btn accent"
          onClick={downloadRepoZip}
          style={{ boxShadow: "0 4px 12px rgba(0,198,255,0.4)" }}
        >
          📥 Download ZIP
        </button>
      </div>

      <div className="repo-main">
        {/* LEFT MEMBERS */}
        <div className="left-col">
          <h4>Members</h4>
          {linked.map((u) => (
            <div key={u.user_id} className="member-row">
              {u.user_name} <span className="perm">({u.permission})</span>
            </div>
          ))}
        </div>

        {/* CENTER FILES */}
        <div
          className={`editor-box ${dragActive ? "drag-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <FileTree tree={currentFiles} onClickFolder={openFolder} />

          {/* Upload button below the box */}
          <label
            className="upload-btn"
            style={{ boxShadow: "0 4px 12px rgba(123,92,255,0.3)" }}
          >
            Select Folder
            <input
              type="file"
              multiple
              webkitdirectory="true"
              hidden
              onChange={(e) => uploadFiles(e.target.files)}
            />
          </label>
        </div>

        {/* RIGHT USER LIST */}
        {amOwner && (
          <div className="right-col">
            <input
              className="field"
              placeholder="search user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="user-list">
              {allUsers
                .filter((u) =>
                  u.user_name.toLowerCase().includes(search.toLowerCase())
                )
                .map((u) => (
                  <div
                    key={u.user_id}
                    className="user-row"
                    onClick={() => addContributor(u)}
                  >
                    {u.user_name}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="err">{error}</div>}
    </div>
  );
}

// Helper to recursively read dropped directories
async function readDirEntry(entry, path = "") {
  return new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file) => {
        file.webkitRelativePath = path + entry.name;
        resolve([file]);
      });
    } else if (entry.isDirectory) {
      entry.createReader().readEntries(async (entries) => {
        let files = [];
        for (const subEntry of entries) {
          const subFiles = await readDirEntry(subEntry, path + entry.name + "/");
          files = files.concat(subFiles);
        }
        resolve(files);
      });
    } else {
      resolve([]);
    }
  });
}
