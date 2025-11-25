import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { Folder, File, Upload, Download, Clock, ArrowLeft, Search, UserPlus, Shield, LogOut, RotateCcw, BarChart2 } from 'lucide-react';
import FileTree from './FileTree';
import FilePreviewModal from './FilePreviewModal';

export default function RepoPage({ repo, user, onBack, onShowHistory, onShowAnalytics }) {
  const [requests, setRequests] = useState([]);
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
  const [selectedFile, setSelectedFile] = useState(null);
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
      
      const myPerm = collRes.data.find(u => u.user_id === user.user_id)?.permission;
      if (myPerm === 'Owner') {
          try {
             const reqRes = await axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/rollback-requests`);
             setRequests(reqRes.data);
          } catch(e) { console.error("Failed to load requests", e); }
        }
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
      newTreeId = rootFiles.find(e => e.tree_id === rootFiles[0]?.tree_id)?.tree_id || currentTreeId;
    } else {
      const parentFolder = rootFiles.find(
        (e) => e.name === newPath[newPath.length - 1] && e.mode === "tree"
      );
      newTreeId = parentFolder?.child_tree_id || rootFiles[0]?.tree_id;
    }

    if (newPath.length === 0) {
        setCurrentFiles(rootFiles.filter((e) => e.tree_id === rootFiles[0]?.tree_id));
        setCurrentTreeId(rootFiles[0]?.tree_id);
    } else {
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
    if (!selectedFiles || selectedFiles.length === 0) return;
    if (!canUpload) { setError("You do not have permission to upload files (Viewer role)."); return; }

    const form = new FormData();
    const relativePaths = [];

    for (const f of selectedFiles) {
      const relPath = (currentPath.length > 0 ? currentPath.join("/") + "/" : "") + (f.webkitRelativePath || f.name);
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
      setMessage(""); 
      fetchUsersAndFiles();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload files");
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    if (!canUpload) { setError("You do not have permission to upload files (Viewer role)."); return; }

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
    uploadFiles(droppedFiles);
  };

  const downloadRepoZip = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/repos/${repo.repo_id}/download`,
        { responseType: "blob" } 
      );
      saveAs(res.data, `${repo.name}.zip`);
    } catch (err) {
      console.error(err);
      setError("Failed to download repo");
    }
  };

  // --- PERMISSIONS LOGIC ---
  const currentUserPermission = linked.find(l => l.user_id === user.user_id)?.permission || 'None';
  const amOwner = currentUserPermission === "Owner";
  const canUpload = amOwner || currentUserPermission === "Contributor";

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
      setUserToAdd(null);
      setShowPermissionModal(false);
    }
  };
  
  const addContributor = (u) => {
    setError(""); 
    setUserToAdd(u);
    setShowPermissionModal(true);
  };

  const handleRequestAction = async (requestId, action) => {
    try {
        await axios.post(`http://localhost:3001/api/repos/${repo.repo_id}/rollback-requests/${requestId}`, {
            action,
            owner_id: user.user_id
        });
        // Refresh data to remove the processed request
        fetchUsersAndFiles(); 
        alert(action === 'approve' ? "Rollback Approved & Executed!" : "Request Rejected");
    } catch (err) {
        alert("Action failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="dashboard" style={{ padding: '40px' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
        <button 
            className="btn ghost" 
            onClick={onBack} 
            style={{padding: '10px 15px', fontSize:'1rem'}}
        >
            <ArrowLeft size={20}/> Back
        </button>
        
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <h1 className="brand-xl" style={{ fontSize: '2.5rem' }}>{repo.name}</h1>
            {amOwner && <span className="tag owner-tag" style={{position:'static', transform:'none', fontSize:'0.8rem'}}>OWNER</span>}
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
        
        {/* --- LEFT COLUMN: FILE BROWSER --- */}
        <div className="glass-panel" style={{ padding: '25px', minHeight: '600px', display:'flex', flexDirection:'column' }}>
            
            {/* Path Bar & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'var(--color-secondary)' }}>
                    <Folder size={22} />
                    <span style={{ fontWeight: 'bold', color:'#fff' }}>/{currentPath.join("/")}</span>
                    {currentPath.length > 0 && (
                        <button className="btn ghost" style={{padding:'5px 10px', fontSize:'0.8rem', marginLeft:'10px'}} onClick={goBack}>
                            ⬆ Up
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn ghost" onClick={onShowAnalytics}>
                        <BarChart2 size={18}/> Analytics
                    </button>
                    <button className="btn ghost" onClick={onShowHistory}>
                        <Clock size={18}/> History
                    </button>
                    <button className="btn primary" onClick={downloadRepoZip} style={{boxShadow:'none'}}>
                        <Download size={18}/> ZIP
                    </button>
                </div>
            </div>

            {/* Drag & Drop Zone */}
            <div 
                onDragOver={canUpload ? (e) => { e.preventDefault(); setDragActive(true); } : undefined}
                onDragLeave={() => setDragActive(false)}
                onDrop={canUpload ? handleDrop : undefined}
                style={{ 
                    flex: 1,
                    border: dragActive ? '2px dashed var(--color-primary)' : '1px solid transparent',
                    borderRadius: '12px',
                    backgroundColor: dragActive ? 'rgba(163, 103, 255, 0.1)' : 'transparent',
                    transition: 'all 0.2s'
                }}
            >
                {/* File List */}
                <div style={{ marginBottom: '20px' }}>
                    <FileTree 
                        tree={currentFiles} 
                        onClickFolder={openFolder} 
                        onClickFile={(node) => setSelectedFile({...node.blob, name: node.name})} 
                    />
                    {currentFiles.length === 0 && <div className="empty" style={{marginTop:'50px'}}>This folder is empty.</div>}
                </div>
            </div>

            {/* Upload Area (Sticks to bottom) */}
            {canUpload ? (
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{display:'flex', gap:'10px'}}>
                        <input 
                            className="field" 
                            placeholder="Commit message (e.g., 'Updated login page')" 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            style={{ flex: 1 }} 
                        />
                        <label className="btn primary" style={{ cursor: 'pointer' }}>
                            <Upload size={18} /> Upload Folder
                            <input type="file" multiple webkitdirectory="true" hidden onChange={(e) => uploadFiles(e.target.files)} />
                        </label>
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: 'auto', padding: '15px', textAlign: 'center', color: '#666', background:'rgba(0,0,0,0.2)', borderRadius:'8px' }}>
                    Read Only Mode (Viewer)
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: MEMBERS --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {amOwner && requests.length > 0 && (
                <div className="glass-panel" style={{ padding: '20px', border: '1px solid #f44336', boxShadow:'0 0 15px rgba(244, 67, 54, 0.2)' }}>
                    <h3 className="panel-title" style={{ fontSize: '1.2rem', color:'#f44336', display:'flex', alignItems:'center', gap:'8px' }}>
                        <RotateCcw size={18}/> Pending Requests
                    </h3>
                    {requests.map(req => (
                        <div key={req.request_id} style={{marginBottom:'15px', background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'8px'}}>
                            <div style={{fontSize:'0.9rem', marginBottom:'5px'}}>
                                <span style={{fontWeight:'bold', color:'var(--color-primary)'}}>{req.user_name}</span> wants to revert to:
                            </div>
                            <div style={{fontSize:'0.8rem', color:'#888', fontStyle:'italic', marginBottom:'10px'}}>
                                "{req.commit_message}"
                            </div>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button 
                                    className="btn primary" 
                                    style={{padding:'5px 10px', fontSize:'0.8rem', flex:1}} 
                                    onClick={() => handleRequestAction(req.request_id, 'approve')}
                                >
                                    Approve
                                </button>
                                <button 
                                    className="btn cancel" 
                                    style={{padding:'5px 10px', fontSize:'0.8rem', flex:1}} 
                                    onClick={() => handleRequestAction(req.request_id, 'reject')}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Member List */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 className="panel-title" style={{ fontSize: '1.2rem', display:'flex', alignItems:'center', gap:'8px' }}>
                    <Shield size={18}/> Members
                </h3>
                <div style={{maxHeight:'300px', overflowY:'auto'}}>
                    {linked.map(u => (
                        <div key={u.user_id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                            <span style={{fontWeight:'500'}}>{u.user_name}</span>
                            <span className={u.permission === 'Owner' ? 'tag owner-tag' : 'tag part-tag'} style={{position:'static', margin:0, fontSize:'0.7rem'}}>
                                {u.permission}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Member (Owner Only) */}
            {amOwner && (
                <div className="glass-panel" style={{ padding: '20px' }}>
                    <h3 className="panel-title" style={{ fontSize: '1.2rem', display:'flex', alignItems:'center', gap:'8px' }}>
                        <UserPlus size={18}/> Add Member
                    </h3>
                    <div style={{ position: 'relative', marginBottom:'10px' }}>
                        <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: '#666' }}/>
                        <input 
                            className="field" 
                            placeholder="Search users..." 
                            style={{ paddingLeft: '38px', width: '100%' }} 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {allUsers
                            .filter(u => u.user_name.toLowerCase().includes(search.toLowerCase()) && !linked.some(l => l.user_id === u.user_id))
                            .map(u => (
                                <div 
                                    key={u.user_id} 
                                    onClick={() => addContributor(u)} 
                                    className="user-row"
                                    style={{ padding: '10px', cursor: 'pointer', borderRadius: '8px', transition: '0.2s', display:'flex', alignItems:'center', gap:'10px' }} 
                                >
                                    <div style={{width:'24px', height:'24px', borderRadius:'50%', background:'var(--color-secondary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color:'#000', fontWeight:'bold'}}>+</div>
                                    {u.user_name}
                                </div>
                            ))
                        }
                        {search && allUsers.filter(u => u.user_name.toLowerCase().includes(search.toLowerCase()) && !linked.some(l => l.user_id === u.user_id)).length === 0 && (
                            <div style={{padding:'10px', color:'#666', fontStyle:'italic', fontSize:'0.9rem'}}>No users found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* PERMISSION MODAL */}
      {showPermissionModal && userToAdd && (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth:'400px'}}>
                <h3>Add {userToAdd.user_name}</h3>
                <p style={{color:'#aaa', marginBottom:'20px'}}>Select permission level:</p>
                <div style={{display:'grid', gap:'10px'}}>
                    {['Viewer', 'Contributor', 'Owner'].map(p => (
                        <button 
                            key={p} 
                            className="btn ghost" 
                            onClick={() => handleAddCollaborator(p)}
                            style={{ justifyContent:'flex-start', textAlign:'left' }}
                        >
                            <span style={{fontWeight:'bold', minWidth:'100px'}}>{p}</span>
                            <span style={{fontSize:'0.8rem', color:'#666'}}>
                                {p==='Viewer' ? 'Read-only access' : p==='Contributor' ? 'Can upload files' : 'Full admin rights'}
                            </span>
                        </button>
                    ))}
                </div>
                <button className="btn cancel" onClick={() => setShowPermissionModal(false)} style={{marginTop:'20px', width:'100%'}}>Cancel</button>
            </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {selectedFile && (
        <FilePreviewModal
          repoId={repo.repo_id}
          blob={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {/* ERROR TOAST */}
      {error && <div className="err" style={{position:'fixed', bottom:'20px', right:'20px', zIndex:3000, boxShadow:'0 0 20px rgba(255,0,0,0.3)'}}>{error}</div>}
    </div>
  );
}

// Directory Reader Helper
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