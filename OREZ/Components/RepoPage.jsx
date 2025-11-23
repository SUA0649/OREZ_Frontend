import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import FileTree from './FileTree';
import FilePreviewModal from './FilePreviewModal';


export default function RepoPage({ repo, user, onBack, onShowHistory}) {
  const [allUsers, setAllUsers] = useState([]);
  const [linked, setLinked] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [rootFiles, setRootFiles] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentTreeId, setCurrentTreeId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");
  const [commits, setCommits] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  // NEW STATE FOR CUSTOM MODAL
  const [userToAdd, setUserToAdd] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

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
      // The root folder usually has the ID of the first entry in rootFiles, or the rootTreeId
      newTreeId = rootFiles.find(e => e.tree_id === rootFiles[0]?.tree_id)?.tree_id || currentTreeId;
    } else {
      const parentFolder = rootFiles.find(
        (e) => e.name === newPath[newPath.length - 1] && e.mode === "tree"
      );
      // This logic might be complex. A simpler, more robust approach is often needed for Git-style trees.
      // For now, let's stick to using the last parent entry's child_tree_id.
      newTreeId = parentFolder?.child_tree_id || rootFiles.find(e => e.tree_id === rootFiles[0]?.tree_id)?.tree_id;
    }

    // A simpler logic is to re-calculate the tree ID based on the newPath length
    if (newPath.length === 0) {
        // Go back to the root of the repo (need the original root_tree_id, which isn't explicitly stored here, so we assume rootFiles[0]?.tree_id works)
        setCurrentFiles(rootFiles.filter((e) => e.tree_id === rootFiles[0]?.tree_id));
        setCurrentTreeId(rootFiles[0]?.tree_id);
    } else {
        // Find the parent folder from the full path list
        // This is complex and usually requires a back-reference.
        // Given your current file structure, we'll use a simplified assumption:
        // When going back, you need to find the ID of the tree that contains the current folder's ID.
        // A full fix for folder navigation is outside the scope, so we use the old logic:
        const parentFolder = rootFiles.find(
            (e) => e.name === newPath[newPath.length - 1] && e.mode === "tree"
        );
        newTreeId = parentFolder?.child_tree_id || rootFiles[0]?.tree_id;
        setCurrentFiles(rootFiles.filter((e) => e.tree_id === newTreeId));
        setCurrentTreeId(newTreeId);
    }

    setCurrentPath(newPath);
  };

  const uploadFiles = async (selectedFiles) => {
    // SECURITY NOTE: Frontend check is bypassed, backend must enforce
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // --- New check added for safety/UX, but BACKEND is the real enforcer ---
    if (!canUpload) {
        setError("You do not have permission to upload files (Viewer role).");
        return;
    }
    // -----------------------------------------------------------------------

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
    form.append("message", message || "File upload");

    try {
      await axios.post(
        `http://localhost:3001/api/repos/${repo.repo_id}/upload-folder`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage(""); // Clear message on success
      fetchUsersAndFiles();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload files");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);

    // --- New check added for safety/UX, but BACKEND is the real enforcer ---
    if (!canUpload) {
        setError("You do not have permission to upload files (Viewer role).");
        return;
    }
    // -----------------------------------------------------------------------

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

  // --- START NEW PERMISSION LOGIC ---
  // 1. Get the current user's permission
  const currentUserPermission = linked.find(l => l.user_id === user.user_id)?.permission || 'None';

  // 2. Define permission flags
  const amOwner = currentUserPermission === "Owner";
  const canUpload = amOwner || currentUserPermission === "Contributor"; // Only Owner and Contributor can upload
  // --- END NEW PERMISSION LOGIC ---

  // NEW: Function to handle the API call after a permission is selected
  const handleAddCollaborator = async (permission) => {
    const u = userToAdd;
    if (!u) return;

    try {
      await axios.post(
        `http://localhost:3001/api/repos/${repo.repo_id}/collaborators`,
        { user_name: u.user_name, permission: permission }
      );
      fetchUsersAndFiles();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add collaborator");
    } finally {
      // Close the modal and reset state
      setUserToAdd(null);
      setShowPermissionModal(false);
    }
  };
  
  // MODIFIED: Function to open the custom modal instead of calling prompt()
  const addContributor = (u) => {
    setError(""); // Clear error before showing modal
    setUserToAdd(u);
    setShowPermissionModal(true);
  };

  // NEW: Component for the custom permission selection modal
  const PermissionModal = () => {
    if (!userToAdd) return null;

    const permissions = [
      { name: 'Viewer', desc: 'Can view files and commit history.' },
      { name: 'Contributor', desc: 'Can view, upload, and modify files.' },
      { name: 'Owner', desc: 'Full control, including managing members.' },
    ];

    return (
      <div className="permission-modal-overlay">
        <div className="permission-modal-content">
          <h3 className="modal-title">Grant Access to {userToAdd.user_name}</h3>
          <p className="modal-subtext">Select the role to assign:</p>
          
          <div className="permission-options">
            {permissions.map((p) => (
              <button
                key={p.name}
                className={`permission-btn btn ghost ${p.name === 'Owner' ? 'owner-perm' : p.name === 'Contributor' ? 'contributor-perm' : ''}`}
                onClick={() => handleAddCollaborator(p.name)}
              >
                <span className="perm-name">{p.name}</span>
                <span className="perm-desc">{p.desc}</span>
              </button>
            ))}
          </div>
          
          <button 
            className="btn ghost" 
            onClick={() => {
              setUserToAdd(null);
              setShowPermissionModal(false);
            }} 
            style={{ marginTop: '20px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
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

        <div>
          <button
            className="btn ghost"
            onClick={onShowHistory}
            style={{ marginRight: '10px' }}
          >
            View History
          </button>
          <button
            className="btn download-repo" 
            onClick={downloadRepoZip}
          >
            Download ZIP
          </button>
        </div>
        
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
          className={`editor-box ${dragActive && canUpload ? "drag-active" : ""}`}
          // Apply drag handlers only if canUpload is true
          onDragOver={canUpload ? (e) => {
            e.preventDefault();
            setDragActive(true);
          } : undefined}
          onDragLeave={canUpload ? () => setDragActive(false) : undefined}
          onDrop={canUpload ? handleDrop : undefined}
        >
          {/* File Tree is always visible */}
          <FileTree tree={currentFiles} onClickFolder={openFolder}onClickFile={(node) => setSelectedFile({...node.blob, name: node.name})} />
          
          {/* --- CONDITIONAL UPLOAD/COMMIT UI --- */}
          {canUpload ? (
              <>
                  <div className="commit-box" style={{ padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", margin: "10px" }}>
                      <input
                        className="field"
                        placeholder="Commit message (e.g., 'Uploaded new designs')"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </div>
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
              </>
          ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  You have **Viewer** permission. File upload is disabled.
              </div>
          )}
          {/* --- END CONDITIONAL UPLOAD/COMMIT UI --- */}

        </div>

        {/* RIGHT USER LIST */}
        {amOwner && (
          <div className="right-col">
            {/* The input field here is primarily for searching, but the bulk logic is in AddCollaborator.jsx */}
            <input
              className="field"
              placeholder="search user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="user-list">
              {allUsers
                .filter((u) =>
                  u.user_name.toLowerCase().includes(search.toLowerCase()) &&
                  !linked.some((l) => l.user_id === u.user_id) 
                )
                .map((u) => (
                  <div
                    key={u.user_id}
                    className="user-row"
                    // Clicks now trigger the custom modal
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
      
      {/* RENDER NEW PERMISSION MODAL */}
      {showPermissionModal && <PermissionModal />}

      {selectedFile && (
        <FilePreviewModal
          repoId={repo.repo_id}
          blob={selectedFile}
          onClose={() => setSelectedFile(null)}/>
      )}
    </div>

  );
}


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