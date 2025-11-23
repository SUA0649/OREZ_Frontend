import { useState } from 'react'
import SignIn from '../Components/SignIn'
import SignUp from '../Components/SignUp'
import RepoDashboard from '../Components/RepoDashboard'
import RepoPage from '../Components/RepoPage'
import HistoryPage from '../Components/HistoryPage';

// Import GSAP and CSSRulePlugin
import { gsap } from 'gsap';
import { CSSRulePlugin } from 'gsap/CSSRulePlugin';

// Register the CSSRulePlugin
gsap.registerPlugin(CSSRulePlugin);

export default function App(){
  const [user, setUser] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [authMode, setAuthMode] = useState("signin")
  const [repoView, setRepoView] = useState("files");
  const [isTransitioning, setIsTransitioning] = useState(false); 

  const handleAuthAndTransition = (userData) => {
    // 1. Set state to start transition and hide Auth form
    setIsTransitioning(true);

    const loaderEl = document.querySelector('.loader');
    
    // Get the CSS rules for the pseudo-elements
    const ruleBefore = CSSRulePlugin.getRule('body:before');
    const ruleAfter = CSSRulePlugin.getRule('body:after');

    // DEFINE THE PAUSE DURATION (1.5 seconds for a longer wait)
    const PAUSE_DURATION = 1.5; 
    
    // Create the animation timeline
    const tl = gsap.timeline({
      paused: true,
      // On animation completion, update the user state
      onComplete: () => {
        setUser(userData);
        setIsTransitioning(false);
      }
    });
    
    // 1. Close the screen and fade in the loader (Duration: 0.2s)
    // All these start at time 0 (or very close to it)
    tl.to(ruleBefore, 0.5, { cssRule: { top: '50%' }, ease: "power2.out" }, 0)
      .to(ruleAfter, 0.5, { cssRule: { bottom: '50%' }, ease: "power2.out" }, 0)
      .to(loaderEl, 0.5, { opacity: 1 }, 0.1) 
      
    // 2. Open the screen and fade out the loader.
    // This sequence starts at time 0.2s + PAUSE_DURATION (1.7s total), ensuring the loader is visible for longer.
      .to(ruleBefore, 0.5, { cssRule: { top: '-100%' }, ease: "power2.out" }, 0.2 + PAUSE_DURATION)
      .to(ruleAfter, 0.5, { cssRule: { bottom: '-100%' }, ease: "power2.out" }, 0.2 + PAUSE_DURATION)
      .to(loaderEl, 0.5, { opacity: 0 }, 0.2 + PAUSE_DURATION); 

    // Start the animation
    tl.play();
  };

  // --- AUTH SCREEN (Combined SignIn/SignUp) ---
  if(!user || isTransitioning) {
    return (
      <div className="auth-container">
        {/* Render the loader structure here */}
        <div className="loader">
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
          <div className="bar4"></div>
          <div className="bar5"></div>
          <div className="bar6"></div>
        </div>

        {/* Hide Auth forms while transitioning */}
        {!isTransitioning && (
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

            {/* Pass the new handler to both components */}
            {authMode === "signin" ? 
              <SignIn onSignIn={handleAuthAndTransition} /> : 
              <SignUp onSignUp={handleAuthAndTransition} />
            }
          </div>
        )}
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
  // Renders the dashboard once the transition completes and user is set
  return (
    <RepoDashboard 
      user={user} 
      onSelectRepo={setSelectedRepo} 
      onSignOut={() => setUser(null)}
    />
  )
}