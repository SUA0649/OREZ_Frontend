// /mnt/data/RepoDashboard.jsx
import { useState, useEffect, useCallback, memo } from 'react'
import axios from 'axios'
import './RepoDashboard.css'
import { LayoutDashboard, GitCommit, Plus } from 'lucide-react'

// -------------------------
// Memoized Create Repo Modal
// -------------------------
const MemoizedCreateRepoModal = memo(({
  name,
  desc,
  error,
  setName,
  setDesc,
  create,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="create-repo-title">
        <h3 id="create-repo-title">Create New Repository</h3>
        <input
          className="field"
          placeholder="Repository Name"
          value={name}
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
          <button className="btn cancel" onClick={onClose}>Cancel</button>
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
  )
})

// -------------------------
// Memoized Delete Confirmation Modal
// -------------------------
const MemoizedDeleteModal = memo(({ repo, onCancel, onConfirm }) => {
  return (
    <div className="modal-overlay delete-modal-overlay">
      <div className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-repo-title">
        <h3 id="delete-repo-title">Delete Repository</h3>
        <p>
          Are you sure you want to delete <strong>{repo?.name}</strong>?
          <br />
          This action <strong>cannot</strong> be undone.
        </p>

        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button className="btn cancel" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={onConfirm} style={{ marginLeft: 12 }}>Delete</button>
        </div>
      </div>
    </div>
  )
})

export default function RepoDashboard({ user, onSelectRepo, onSignOut }) {
  // ---- state ----
  const [repos, setRepos] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState('')
  const [recentCommits, setRecentCommits] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [repoToDelete, setRepoToDelete] = useState(null)
  const [busyDeleting, setBusyDeleting] = useState(false)

  // ---- fetch dashboard data ----
  const fetch = useCallback(async () => {
    try {
      const [reposRes, commitsRes] = await Promise.all([
        axios.get(`http://localhost:3001/api/repos/${user.user_id}`),
        axios.get(`http://localhost:3001/api/users/${user.user_id}/recent-commits`)
      ])
      setRepos(reposRes.data || [])
      setRecentCommits(commitsRes.data || [])
    } catch (err) {
      console.error('Fetch dashboard failed:', err)
      setError('Failed to fetch dashboard data')
    }
  }, [user.user_id])

  useEffect(() => { fetch() }, [fetch])

  // ---- create repo helpers ----
  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false)
    setError('')
    setName('')
    setDesc('')
  }, [])

  const create = useCallback(async () => {
    if (!name || !desc) return setError('Please fill repository name & description')
    try {
      await axios.post('http://localhost:3001/api/repos/create', { owner_id: user.user_id, name, description: desc })
      closeCreateModal()
      fetch()
    } catch (err) {
      console.error('Create repo error:', err)
      setError(err.response?.data?.error || 'Failed to create repo')
    }
  }, [name, desc, user.user_id, fetch, closeCreateModal])

  // ---- derived lists ----
  const ownerList = repos.filter(r => r.permission === 'Owner')
  const partList = repos.filter(r => r.permission !== 'Owner')
  const totalRepos = repos.length
  const ownedRepos = ownerList.length
  const collaboratingRepos = partList.length

  // ---- delete flow ----
  // When clicking the X: stop propagation and open delete modal
  const confirmDelete = useCallback((repo, e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    setRepoToDelete(repo)
    setShowDeleteModal(true)
  }, [])

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false)
    setRepoToDelete(null)
  }, [])

  const deleteRepository = useCallback(async () => {
    if (!repoToDelete) return
    setBusyDeleting(true)
    try {
      // call your DELETE endpoint exactly as in routes
      await axios.delete(`http://localhost:3001/api/repos/${repoToDelete.repo_id}`)
      setShowDeleteModal(false)
      setRepoToDelete(null)
      // refresh list
      await fetch()
    } catch (err) {
      console.error('Delete repo failed:', err)
      // Communicate errors to user: if 404 from DB function, show message
      const msg = err.response?.data?.error || 'Failed to delete repository'
      // You can replace alert with a nicer UI message if you prefer
      alert(msg)
    } finally {
      setBusyDeleting(false)
    }
  }, [repoToDelete, fetch])

  // ---- keyboard accessibility: delete modal confirm on Enter ----
  useEffect(() => {
    function onKey(e) {
      if (!showDeleteModal) return
      if (e.key === 'Escape') cancelDelete()
      if (e.key === 'Enter') deleteRepository()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showDeleteModal, cancelDelete, deleteRepository])

  // ---- render ----
  return (
    <div className="dashboard">

      {/* Create modal */}
      {showCreateModal && (
        <MemoizedCreateRepoModal
          name={name}
          desc={desc}
          error={error}
          setName={setName}
          setDesc={setDesc}
          create={create}
          onClose={closeCreateModal}
        />
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <MemoizedDeleteModal
          repo={repoToDelete}
          onCancel={cancelDelete}
          onConfirm={deleteRepository}
        />
      )}

      <div className="dash-header">
        <div className="header-welcome">
          <div className="subtitle">Welcome <strong>{user.user_name}</strong> — quick access</div>
        </div>

        <div className="header-center">
          <h1 className="brand-xl">OREZ</h1>
        </div>

        <div className="header-actions">
          <button className="btn ghost" onClick={onSignOut}>Sign Out</button>
        </div>
      </div>

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

      <div className="create-row">
        <button className="btn accent" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} style={{ marginRight: '8px' }} />
          Create New Repository
        </button>
      </div>

      <div className="panels-and-activity">
        <div className="panels">
          <div className="panel left">
            <h3 className="panel-title owner-panel-title">Your Repositories ({ownedRepos})</h3>
            {ownerList.length === 0 ? <div className="empty">No owned repos yet</div> : ownerList.map(r => (
              <div key={r.repo_id} className="repo-card">
                <div className="repo-info" onClick={() => onSelectRepo(r)} style={{ paddingRight: 48 }}>
                  <div className="repo-title">{r.name}</div>
                  <div className="repo-sub">{r.description}</div>
                  <div className="tag owner-tag">Owner</div>
                </div>

                {/* delete button - stops propagation so onSelectRepo isn't called */}
                <button
                  className="delete-btn"
                  onClick={(e) => confirmDelete(r, e)}
                  aria-label={`Delete repository ${r.name}`}
                  title="Delete repository"
                >
                  ✕
                </button>
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

        <div className="activity-feed">
          <h3 className="activity-title"><GitCommit size={20} style={{ marginRight: '8px' }} />Recent Activity (All Repos)</h3>
          {recentCommits.length === 0 ? (
            <div className="empty">No recent commits to display.</div>
          ) : (
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
