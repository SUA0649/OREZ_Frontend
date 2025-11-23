import { useState, useEffect, useCallback, memo } from 'react' // Import memo
import axios from 'axios'
import './RepoDashboard.css'
import { LayoutDashboard, GitCommit, Plus } from 'lucide-react'; 

// --- 1. MEMOIZED MODAL COMPONENT (Defined OUTSIDE RepoDashboard) ---
// This component only re-renders if its props change.
const MemoizedCreateRepoModal = memo(({ 
    name, 
    desc, 
    error, 
    setName, 
    setDesc, 
    create, 
    onClose 
}) => {
    // Note: error state is passed from the parent because create() modifies it.
    
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Create New Repository</h3>
                <input
                    className="field"
                    placeholder="Repository Name"
                    value={name}
                    // This update causes RepoDashboard to re-render, but MemoizedCreateRepoModal 
                    // won't re-render itself because its props (the functions) don't change 
                    // and its state is managed outside.
                    onChange={e => setName(e.target.value)}
                    key="repo-name-input"
                />
                <input
                    className="field"
                    placeholder="Short Description"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    key="repo-desc-input"
                />
                {error && <div className="err">{error}</div>}

                <div className="modal-actions">
                    <button
                        className="btn cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn primary"
                        onClick={create}
                        disabled={!name || !desc}
                    >
                        Create Repository
                    </button>
                </div>
            </div>
        </div>
    );
});
// ------------------------------------------------------------------

export default function RepoDashboard({ user, onSelectRepo, onSignOut }) {

    const [repos, setRepos] = useState([])
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [error, setError] = useState('')
    const [recentCommits, setRecentCommits] = useState([]);
    const [showModal, setShowModal] = useState(false);


    const fetch = useCallback(async () => {
        try {
            const [reposRes , commitsRes] = await Promise.all([
                axios.get(`http://localhost:3001/api/repos/${user.user_id}`),
                axios.get(`http://localhost:3001/api/users/${user.user_id}/recent-commits`),
            ]);
            setRepos(reposRes.data)
            setRecentCommits(commitsRes.data);
        } catch (err) { setError('Failed to fetch dashboard data') }
    }, [user.user_id])


    useEffect(() => { fetch() }, [fetch])

    // Use useCallback for functions passed as props to memoized components
    const closeModal = useCallback(() => {
        setShowModal(false);
        setError(''); // Clear error when closing
        setName(''); // Clear inputs when closing
        setDesc(''); 
    }, [])

    const create = useCallback(async () => {
        // Clear previous error first if it wasn't a validation error
        if (error && error !== 'Please fill repository name & description') setError(''); 

        if (!name || !desc) return setError('Please fill repository name & description')

        try {
            await axios.post('http://localhost:3001/api/repos/create', { owner_id: user.user_id, name, description: desc })

            // Reset inputs and close modal on success
            closeModal(); // Use the memoized close function
            fetch()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create repo')
        }
    }, [error, name, desc, user.user_id, fetch, closeModal]) // Dependencies updated

    const ownerList = repos.filter(r => r.permission === 'Owner')
    const partList = repos.filter(r => r.permission !== 'Owner')
    const totalRepos = repos.length;
    const ownedRepos = ownerList.length;
    const collaboratingRepos = partList.length;

    // The modal definition is now replaced by the Memoized component call below.


    return (
        <div className="dashboard">

            {/* --- RENDER MEMOIZED MODAL HERE --- */}
            {showModal && (
                <MemoizedCreateRepoModal
                    name={name}
                    desc={desc}
                    error={error}
                    setName={setName}
                    setDesc={setDesc}
                    create={create}
                    onClose={closeModal}
                />
            )}
            {/* ---------------------------------- */}


            <div className="dash-header">
                {/* LEFT SIDE: Welcome message */}
                <div className="header-welcome">
                    <div className="subtitle">Welcome <strong>{user.user_name}</strong> — quick access</div>
                </div>
                
                {/* CENTER: OREZ Brand Title (Uses auto margins for centering) */}
                <div className="header-center">
                    <h1 className="brand-xl">OREZ</h1>
                </div>
                
                {/* RIGHT SIDE: Sign Out Button (Uses auto margin to push right) */}
                <div className="header-actions">
                    <button className="btn ghost" onClick={onSignOut}>Sign Out</button>
                </div>
            </div>

            {/* Stats at a Glance */}
            <div className="stats-card top-stats-card">
                <h3 className="stats-title"><LayoutDashboard size={20} style={{ marginRight: '8px' }} />Stats at a Glance</h3>
                <div className="stats-row">
                    <div className="stat-item">
                        <div className="stat-value">{totalRepos}</div>
                        <div className="stat-label">Total Repositories</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value accent-color">{ownedRepos}</div>
                        <div className="stat-label">Owned</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value accent-color-2">{collaboratingRepos}</div>
                        <div className="stat-label">Collaborating</div>
                    </div>
                </div>
            </div>

            {/* CREATE REPOSITORY ROW - Button that opens the modal */}
            <div className="create-row">
                <button className="btn accent" onClick={() => setShowModal(true)}>
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    Create New Repository
                </button>
            </div>


            <div className="panels-and-activity"> 
                <div className="panels">
                    <div className="panel left">
                        <h3 className="panel-title owner-panel-title">Your Repositories ({ownedRepos})</h3>
                        {ownerList.length === 0 ? <div className="empty">No owned repos yet</div> : ownerList.map(r => (
                            <div key={r.repo_id} className="repo-card" onClick={() => onSelectRepo(r)}>
                                <div className="repo-title">{r.name}</div>
                                <div className="repo-sub">{r.description}</div>
                                <div className="tag owner-tag">Owner</div>
                            </div>
                        ))}
                    </div>


                    <div className="panel right">
                        <h3 className="panel-title">Participator Of ({collaboratingRepos})</h3>
                        {partList.length === 0 ? <div className="empty">Not participating in any repos</div> : partList.map(r => (
                            <div key={r.repo_id} className="repo-card" onClick={() => onSelectRepo(r)}>
                                <div className="repo-title">{r.name}</div>
                                <div className="repo-sub">{r.description}</div>
                                <div className="tag part-tag">{r.permission}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="activity-feed">
                    <h3 className="activity-title"><GitCommit size={20} style={{ marginRight: '8px' }} />Recent Activity (All Repos)</h3>
                    {recentCommits.length === 0 ? (
                            <div className="empty">No recent commits to display.</div>
                        ) : (
                            // CHANGE slice(0, 5) to slice(0, 3) to match request
                            recentCommits.slice(0, 3).map(commit => (
                                <div key={commit.commit_id} className="commit-item">
                                    <div className="commit-message">{commit.message}</div>
                                    <div className="commit-details">
                                        <span className="commit-repo">{commit.repo_name}</span>
                                        • {new Date(commit.timestamp).toLocaleDateString()}
                                        • <span className="commit-author">{commit.author_name}</span>
                                    </div>
                                </div>
                            ))
                        )}
                </div>
            </div>
        </div>
    )
}