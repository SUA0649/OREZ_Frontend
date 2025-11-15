import { useState } from 'react'
import SignIn from '../Components/SignIn'
import SignUp from '../Components/SignUp'
import RepoDashboard from '../Components/RepoDashboard'
import RepoPage from '../Components/RepoPage'
import HistoryPage from '../Components/HistoryPage';

export default function App(){
  const [user, setUser] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [authMode, setAuthMode] = useState("signin")
  const [repoView, setRepoView] = useState("files");

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
  if (selectedRepo) {
    // If 'history' view, show HistoryPage
    if (repoView === "history") {
      return (
        <HistoryPage
          repo={selectedRepo}
          user={user}
          onBack={() => setRepoView("files")} 
        />
      );
    }

    // Otherwise, show the normal RepoPage
    return (
      <RepoPage
        repo={selectedRepo}
        user={user}
        onBack={() => setSelectedRepo(null)}
        onShowHistory={() => setRepoView("history")}
      />
    );
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
