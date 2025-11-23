import { useState } from 'react'
import SignIn from '../Components/SignIn'
import SignUp from '../Components/SignUp'
import RepoDashboard from '../Components/RepoDashboard'
import RepoPage from '../Components/RepoPage'
import HistoryPage from '../Components/HistoryPage'
import { User, UserPlus } from 'lucide-react' // Make sure you have lucide-react installed

export default function App() {
  const [user, setUser] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [authMode, setAuthMode] = useState("signin")
  const [repoView, setRepoView] = useState("files")

  // --- AUTH SCREEN (Redesigned) ---
  if (!user) {
    return (
      <div className="auth-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          {/* Brand Logo/Title */}
          <h1 className="brand-xl" style={{ fontSize: '3rem', marginBottom: '10px' }}>OREZ</h1>

          {/* The Switcher Buttons */}
          <div className="glass-panel" style={{ padding: '5px', display: 'flex', borderRadius: '12px', gap: '5px' }}>
            <button
              onClick={() => setAuthMode("signin")}
              style={{
                padding: '10px 25px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: authMode === "signin" ? 'var(--color-primary)' : 'transparent',
                color: authMode === "signin" ? '#081018' : 'var(--color-muted)',
                fontWeight: 'bold',
                transition: '0.3s'
              }}
            >
              <User size={18} /> Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              style={{
                padding: '10px 25px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: authMode === "signup" ? 'var(--color-secondary)' : 'transparent',
                color: authMode === "signup" ? '#081018' : 'var(--color-muted)',
                fontWeight: 'bold',
                transition: '0.3s'
              }}
            >
              <UserPlus size={18} /> Sign Up
            </button>
          </div>

          {/* The Form */}
          <div style={{ marginTop: '10px' }}>
            {authMode === "signin" ? 
              <SignIn onSignIn={setUser} /> : 
              <SignUp onSignUp={setUser} />
            }
          </div>

        </div>
      </div>
    )
  }

  // --- REPO PAGE ---
  if (selectedRepo) {
    if (repoView === "history") {
      return (
        <HistoryPage
          repo={selectedRepo}
          user={user}
          onBack={() => setRepoView("files")}
        />
      );
    }
    return (
      <RepoPage
        repo={selectedRepo}
        user={user}
        onBack={() => setSelectedRepo(null)}
        onShowHistory={() => setRepoView("history")}
      />
    )
  }

  // --- DASHBOARD ---
  return (
    <RepoDashboard 
      user={user} 
      onSelectRepo={(repo) => {
        setSelectedRepo(repo);
        setRepoView("files");
      }} 
      onSignOut={() => setUser(null)} 
    />
  )
}