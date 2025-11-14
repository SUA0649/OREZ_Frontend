import { useState, useEffect } from 'react'
import axios from 'axios'


export default function RepoPage({ repo, user, onBack }){
const [allUsers, setAllUsers] = useState([])
const [linked, setLinked] = useState([]) // users linked to repo
const [search, setSearch] = useState('')
const [error, setError] = useState('')


const fetchAll = async ()=>{
try{
const ures = await axios.get('http://localhost:3001/api/users')
const linkedRes = await axios.get(`http://localhost:3001/api/repos/${user.user_id}`)
setAllUsers(ures.data)
// linked users for this repo: we need a backend endpoint to get collaborators of repo
const collRes = await axios.get(`http://localhost:3001/api/repos/${repo.repo_id}/collaborators`)
setLinked(collRes.data)
}catch(err){ setError('Failed to load users') }
}


useEffect(()=>{ fetchAll() }, [])


const add = async (u, permission='Contributor')=>{
try{
await axios.post(`http://localhost:3001/api/repos/${repo.repo_id}/collaborators`, { user_name: u.user_name, permission })
fetchAll()
}catch(err){ setError(err.response?.data?.error || 'Failed to add') }
}
const amOwner = linked.some(l=> l.user_id === user.user_id && l.permission === 'Owner')


return (
<div className="repo-page">
<button className="btn back" onClick={onBack}>← Back</button>
<div className="repo-header">
<h1>{repo.name}</h1>
{amOwner && <div className="owner-badge">YOU ARE OWNER</div>}
</div>


<div className="repo-main">
<div className="left-col">
<h4>Members</h4>
{linked.map(u => (
<div key={u.user_id} className="member-row">{u.user_name} <span className="perm">({u.permission})</span></div>
))}
</div>


<div className="editor-box">
{/* empty grey box for future file view */}
</div>


{amOwner && (
<div className="right-col">
<input className="field" placeholder="search user" value={search} onChange={e=>setSearch(e.target.value)} />
<div className="user-list">
{allUsers.filter(u=>u.user_name.toLowerCase().includes(search.toLowerCase())).map(u=> (
<div key={u.user_id} className="user-row" onClick={()=>add(u)}>{u.user_name}</div>
))}
</div>
</div>
)}
</div>


{error && <div className="err">{error}</div>}
</div>
)
}

