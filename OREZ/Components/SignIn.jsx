import { useState } from 'react'
import axios from 'axios'

export default function SignIn({ onSignIn }){
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) =>{
    e?.preventDefault()
    setError('')
    try{
      const res = await axios.post('http://localhost:3001/api/signin', { user_name: userName, password })
      onSignIn(res.data)
    }catch(err){
      setError(err.response?.data?.error || 'Sign in failed')
    }
  }

  return (
    <form 
      className="glass-panel" 
      onSubmit={submit}
      style={{ padding:'40px', width:'350px', display:'flex', flexDirection:'column', gap:'20px' }}
    >
      <h2 style={{ textAlign:'center', color:'var(--color-text-light)', margin:0, fontSize:'1.8rem' }}>
        Welcome Back
      </h2>
      <p style={{ textAlign:'center', color:'var(--color-muted)', margin:0, fontSize:'0.9rem' }}>
        Enter your credentials to access OREZ
      </p>

      {error && <div className="err">{error}</div>}

      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <input className="field" placeholder="Username" 
               value={userName} onChange={e=>setUserName(e.target.value)} />

        <input className="field" type="password" placeholder="Password" 
               value={password} onChange={e=>setPassword(e.target.value)} />
      </div>

      <button className="btn primary" type="submit" style={{marginTop:'10px', width:'100%'}}>
        Sign In
      </button>
    </form>
  )
}