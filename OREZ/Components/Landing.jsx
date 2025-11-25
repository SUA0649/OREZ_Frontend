import React, { useState } from 'react';
import { Database, GitBranch, Clock, Layers, Code2, Zap, ChevronRight, Github, Play } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <Layers size={24} />,
      title: "Snapshot Storage",
      description: "Immutable blob-based storage with SHA-1 hashing. Every file version is tracked and retrievable."
    },
    {
      icon: <GitBranch size={24} />,
      title: "Hash-Based Tracking",
      description: "Content-addressable storage using SHA-1. Identical files share the same blob—deduplicated and efficient."
    },
    {
      icon: <Database size={24} />,
      title: "Folder Structure Uploads",
      description: "Upload entire directories with preserved hierarchy. Trees and blobs replicate Git's internal model."
    },
    {
      icon: <Clock size={24} />,
      title: "Time-Machine Rollbacks",
      description: "Jump to any commit in history. Full workspace state restoration with one click."
    },
    {
      icon: <Code2 size={24} />,
      title: "Commit History Visualization",
      description: "Beautiful timeline view of your project's evolution. See diffs, messages, and authorship."
    },
    {
      icon: <Zap size={24} />,
      title: "Database-Enforced Logic",
      description: "Triggers and stored procedures handle auditing, validation, and tree traversal at the DB layer."
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    nav: {
      position: 'fixed',
      top: 0,
      width: '100%',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      zIndex: 1000
    },
    navContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      letterSpacing: '-0.5px'
    },
    navLinks: {
      display: 'flex',
      gap: '24px',
      alignItems: 'center'
    },
    navLink: {
      fontSize: '14px',
      color: '#e2e8f0',
      textDecoration: 'none',
      transition: '0.3s',
      cursor: 'pointer'
    },
    button: {
      background: '#22d3ee',
      color: '#0f172a',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: '0.3s'
    },
    hero: {
      paddingTop: '128px',
      paddingBottom: '80px',
      textAlign: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '128px 24px 80px'
    },
    badge: {
      display: 'inline-block',
      padding: '8px 16px',
      background: 'rgba(34, 211, 238, 0.1)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '20px',
      color: '#22d3ee',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '16px'
    },
    heroTitle: {
      fontSize: '72px',
      fontWeight: 'bold',
      marginBottom: '24px',
      background: 'linear-gradient(to right, #22d3ee, #60a5fa, #a78bfa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: '1.1'
    },
    heroSubtitle: {
      fontSize: '20px',
      color: '#cbd5e1',
      maxWidth: '800px',
      margin: '0 auto 40px',
      lineHeight: '1.6'
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    primaryButton: {
      background: '#22d3ee',
      color: '#0f172a',
      border: 'none',
      padding: '16px 32px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: '0.3s',
      boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
    },
    secondaryButton: {
      background: '#1e293b',
      color: 'white',
      border: '1px solid #475569',
      padding: '16px 32px',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: '0.3s'
    },
    visualBox: {
      marginTop: '64px',
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '32px'
    },
    visualGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      textAlign: 'left'
    },
    visualCard: {
      background: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '8px',
      padding: '16px'
    },
    section: {
      padding: '80px 24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    sectionAlt: {
      padding: '80px 24px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'rgba(15, 23, 42, 0.5)'
    },
    sectionTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '16px'
    },
    sectionSubtitle: {
      textAlign: 'center',
      color: '#94a3b8',
      maxWidth: '700px',
      margin: '0 auto 48px',
      fontSize: '16px'
    },
    grid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    featureCard: {
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px',
      transition: '0.3s',
      cursor: 'pointer'
    },
    featureCardHovered: {
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid #22d3ee',
      borderRadius: '12px',
      padding: '24px',
      transition: '0.3s',
      cursor: 'pointer',
      transform: 'scale(1.05)',
      boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)'
    },
    featureIcon: {
      color: '#22d3ee',
      marginBottom: '16px'
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    featureDesc: {
      color: '#94a3b8',
      fontSize: '14px',
      lineHeight: '1.6'
    },
    techCard: {
      background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(30, 41, 59, 0.3))',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '12px',
      padding: '32px',
      textAlign: 'center'
    },
    whyCard: {
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    },
    footer: {
      padding: '48px 24px',
      background: '#0f172a',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <Database size={32} color="#22d3ee" />
            <span style={styles.logoText}>OREZ</span>
          </div>
          <div style={styles.navLinks}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#tech" style={styles.navLink}>Tech a Stack</a>
            <a href="#why" style={styles.navLink}>Why</a>
            <button 
              onClick={() => window.open('https://github.com/yourusername/orez', '_blank')}
              style={styles.button}
              onMouseOver={(e) => e.currentTarget.style.background = '#06b6d4'}
              onMouseOut={(e) => e.currentTarget.style.background = '#22d3ee'}
            >
              <Github size={16} />
              Explore Repo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.badge}>Database-Powered Version Control</div>
        <h1 style={styles.heroTitle}>
          Version Control,<br />Rethought from the Database Up
        </h1>
        <p style={styles.heroSubtitle}>
          OREZ is a Git-like VCS built entirely on PostgreSQL. Snapshot-based file storage, SHA-1 hashing, and recursive tree structures—all powered by relational database primitives.
        </p>
        <div style={styles.buttonGroup}>
          <button 
            onClick={onGetStarted}
            style={styles.primaryButton}
            onMouseOver={(e) => e.currentTarget.style.background = '#06b6d4'}
            onMouseOut={(e) => e.currentTarget.style.background = '#22d3ee'}
          >
            <Play size={20} />
            Try the Demo
          </button>
          <button 
            onClick={onGetStarted}
            style={styles.secondaryButton}
            onMouseOver={(e) => e.currentTarget.style.background = '#334155'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1e293b'}
          >
            See How It Works
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Visual */}
        <div style={styles.visualBox}>
          <div style={styles.visualGrid}>
            <div style={styles.visualCard}>
              <div style={{color: '#22d3ee', fontSize: '12px', fontFamily: 'monospace', marginBottom: '8px'}}>BLOB</div>
              <div style={{fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8'}}>SHA-1: a3f9b...</div>
              <div style={{fontSize: '12px', color: '#64748b', marginTop: '8px'}}>index.js (v1)</div>
            </div>
            <div style={{...styles.visualCard, borderColor: 'rgba(168, 85, 247, 0.3)'}}>
              <div style={{color: '#a78bfa', fontSize: '12px', fontFamily: 'monospace', marginBottom: '8px'}}>TREE</div>
              <div style={{fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8'}}>SHA-1: 8c2e4...</div>
              <div style={{fontSize: '12px', color: '#64748b', marginTop: '8px'}}>/src directory</div>
            </div>
            <div style={{...styles.visualCard, borderColor: 'rgba(59, 130, 246, 0.3)'}}>
              <div style={{color: '#60a5fa', fontSize: '12px', fontFamily: 'monospace', marginBottom: '8px'}}>COMMIT</div>
              <div style={{fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8'}}>SHA-1: 7d1a9...</div>
              <div style={{fontSize: '12px', color: '#64748b', marginTop: '8px'}}>Initial commit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Built for Real Version Control</h2>
        <p style={styles.sectionSubtitle}>
          All the primitives you expect from Git, implemented with PostgreSQL's power and precision.
        </p>
        <div style={styles.grid3}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={hoveredFeature === idx ? styles.featureCardHovered : styles.featureCard}
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" style={styles.section}>
        <h2 style={styles.sectionTitle}>The Stack</h2>
        <p style={styles.sectionSubtitle}>
          Modern web technologies meet database-first architecture.
        </p>
        <div style={styles.grid3}>
          <div style={styles.techCard}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>⚛️</div>
            <h3 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>React</h3>
            <p style={{color: '#94a3b8', fontSize: '14px'}}>Modern, component-based frontend with hooks and state management</p>
          </div>
          <div style={{...styles.techCard, background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.3), rgba(30, 41, 59, 0.3))', borderColor: 'rgba(34, 197, 94, 0.3)'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🟢</div>
            <h3 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>Node.js</h3>
            <p style={{color: '#94a3b8', fontSize: '14px'}}>Lightweight backend API layer connecting React to PostgreSQL</p>
          </div>
          <div style={{...styles.techCard, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(30, 41, 59, 0.3))', borderColor: 'rgba(34, 211, 238, 0.3)'}}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🐘</div>
            <h3 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>PostgreSQL</h3>
            <p style={{color: '#94a3b8', fontSize: '14px'}}>Thick-database architecture with PL/pgSQL procedures and triggers</p>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" style={styles.sectionAlt}>
        <h2 style={styles.sectionTitle}>Why OREZ Exists</h2>
        <p style={styles.sectionSubtitle}>
          An experiment in bridging file systems and databases—and understanding Git's internals.
        </p>
        <div style={{maxWidth: '900px', margin: '0 auto'}}>
          <div style={styles.whyCard}>
            <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#22d3ee'}}>Reduce Abstraction</h3>
            <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>
              Git's .git folder is a black box for most developers. OREZ makes those concepts—blobs, trees, commits—explicit and queryable in SQL.
            </p>
          </div>
          <div style={styles.whyCard}>
            <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#a78bfa'}}>Learn by Building</h3>
            <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>
              Perfect for CS students exploring recursive data structures, content-addressable storage, or database automation with triggers and procedures.
            </p>
          </div>
          <div style={styles.whyCard}>
            <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#60a5fa'}}>Database as the Source of Truth</h3>
            <p style={{color: '#cbd5e1', lineHeight: '1.6'}}>
              What if version control wasn't a filesystem hack? OREZ explores what happens when the DB enforces consistency, auditing, and history natively.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div  style={{justifyContent: 'center', marginBottom: '16px'}}>
          <Database size={24} color="#22d3ee" />
          <span style={{fontSize: '20px', fontWeight: 'bold'}}>OREZ</span>
        </div>
        <p style={{color: '#94a3b8', fontSize: '14px', marginBottom: '8px'}}>
          Database-Powered Version Control • Built with React, Node.js, and PostgreSQL
        </p>
        <p style={{color: '#64748b', fontSize: '12px'}}>
          Built by devs, for devs. Open source and always learning.
        </p>
      </footer>
    </div>
  );
}