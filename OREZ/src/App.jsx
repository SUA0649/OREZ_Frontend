import { useState } from 'react'
import SignIn from '../Components/SignIn'
import SignUp from '../Components/SignUp'
import RepoDashboard from '../Components/RepoDashboard'
import RepoPage from '../Components/RepoPage'

export default function App(){
  const [user, setUser] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [authMode, setAuthMode] = useState("signin")

  // --- AUTH SCREEN ---
  if(!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-switcher">
            <button 
              className={authMode === "signin" ? "active-switch" : ""} 
              onClick={() => setAuthMode("signin")}
            >
              Sign In
            </button>

            <button 
              className={authMode === "signup" ? "active-switch" : ""} 
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {authMode === "signin" ? 
            <SignIn onSignIn={setUser} /> : 
            <SignUp onSignUp={setUser} />
          }
        </div>
      </div>
    )
  }

  // --- REPO PAGE ---
  if(selectedRepo) {
    return <RepoPage repo={selectedRepo} user={user} onBack={() => setSelectedRepo(null)} />
  }

  // --- DASHBOARD ---
  return (
    <RepoDashboard 
      user={user} 
      onSelectRepo={setSelectedRepo} 
      onSignOut={() => setUser(null)} 
    />
  )
}
