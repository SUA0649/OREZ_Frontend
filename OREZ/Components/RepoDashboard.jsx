import { useState, useEffect } from 'react'
import axios from 'axios'


export default function RepoDashboard({ user, onSelectRepo, onSignOut }){
const [repos, setRepos] = useState([])
const [name, setName] = useState('')
const [desc, setDesc] = useState('')
const [error, setError] = useState('')


const fetch = async ()=>{
try{
const res = await axios.get(`http://localhost:3001/api/repos/${user.user_id}`)
setRepos(res.data)
}catch(err){ setError('Failed to fetch repos') }
}


useEffect(()=>{ fetch() }, [])


const create = async ()=>{
setError('')
if(!name || !desc) return setError('Please fill name & description')
try{
const res = await axios.post('http://localhost:3001/api/repos/create', { owner_id: user.user_id, name, description: desc })
setName(''); setDesc('')
fetch()
}catch(err){ setError(err.response?.data?.error || 'Failed to create repo') }
}

const ownerList = repos.filter(r=> r.permission === 'Owner')
const partList = repos.filter(r=> r.permission !== 'Owner')


return (
<div className="dashboard">
<div className="dash-header">
<div>
<h1 className="brand-xl">{user.user_name}</h1>
<div className="subtitle">Your repositories — quick access</div>
</div>
<div className="header-actions">
<button className="btn ghost" onClick={onSignOut}>Sign Out</button>
</div>
</div>


<div className="create-row">
<input className="field small" placeholder="repository name" value={name} onChange={e=>setName(e.target.value)} />
<input className="field small" placeholder="short description" value={desc} onChange={e=>setDesc(e.target.value)} />
<button className="btn accent" onClick={create}>Create</button>
{error && <div className="err">{error}</div>}
</div>


<div className="panels">
<div className="panel left">
<h3 className="panel-title">Owner Of</h3>
{ownerList.length===0 ? <div className="empty">No owned repos yet</div> : ownerList.map(r=> (
<div key={r.repo_id} className="repo-card" onClick={()=>onSelectRepo(r)}>
<div className="repo-title">{r.name}</div>
<div className="repo-sub">{r.description}</div>
<div className="tag owner-tag">Owner</div>
</div>
))}
</div>


<div className="panel right">
<h3 className="panel-title">Participator Of</h3>
{partList.length===0 ? <div className="empty">Not participating in any repos</div> : partList.map(r=> (
<div key={r.repo_id} className="repo-card" onClick={()=>onSelectRepo(r)}>
<div className="repo-title">{r.name}</div>
<div className="repo-sub">{r.description}</div>
<div className="tag small">{r.permission}</div>
</div>
))}
</div>
</div>
</div>
)
}

