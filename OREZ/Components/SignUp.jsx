import { useState } from 'react'
import axios from 'axios'

export default function SignUp({ onSignUp }){
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) =>{
    e?.preventDefault()
    setError('')
    try{
      const res = await axios.post('http://localhost:3001/api/signup', { user_name: userName, password })
      onSignUp(res.data)
    } catch(err){
      setError(err.response?.data?.error || 'Sign up failed')
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={submit}>
        <h2 className="auth-title">Create Account</h2>

        {error && <div className="auth-error">{error}</div>}

        <input className="auth-input" placeholder="Username" 
               value={userName} onChange={e=>setUserName(e.target.value)} />

        <input className="auth-input" type="password" placeholder="Password" 
               value={password} onChange={e=>setPassword(e.target.value)} />

        <button className="auth-btn accent" type="submit">Sign Up</button>
      </form>
    </div>
  )
}
