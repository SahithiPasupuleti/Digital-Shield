import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Import Pages
import HomePage from './pages/HomePage';
import AuthPages from './pages/AuthPages';
import AnalyzePage from './pages/AnalyzePage';
import AssistantPage from './pages/AssistantPage';
import Dashboard from './pages/Dashboard'; // Reused as Community Dashboard
import Profile from './pages/Profile';

// Import Lucide Icons
import { ShieldCheck, Globe, LogOut, User, Menu, X } from 'lucide-react';

function AppContent() {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto redirect from Auth page once logged in
  useEffect(() => {
    if (user) {
      if (activeTab === 'login' || activeTab === 'signup') {
        setActiveTab('home');
      }
    } else {
      if (activeTab !== 'login' && activeTab !== 'signup' && activeTab !== 'home' && activeTab !== 'about' && activeTab !== 'contact') {
        setActiveTab('home');
      }
    }
  }, [user]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'analyze':
        return <AnalyzePage />;
      case 'assistant':
        return <AssistantPage />;
      case 'community':
        return <Dashboard />; // Community Dashboard
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'profile':
        return <Profile />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  const AboutPage = () => (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>About Digital Shield</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
        Digital Shield is a modern, student-focused cyber defense platform designed to protect everyday internet users from online fraud, recruitment scams, malicious websites, and phishing threats.
      </p>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Leveraging advanced Gemini AI scanning models, our objective is to analyze suspicious items <em>before</em> you click or trust them. By providing explanations and actionable tips, we educate users while protecting their digital identity.
      </p>
    </div>
  );

  const ContactPage = () => (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Contact Support</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Have questions or need assistance? Reach out to our cyber defense team.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" placeholder="Your Name" required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" placeholder="name@domain.com" required />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-input" rows={4} placeholder="Describe your inquiry..." required style={{ resize: 'vertical' }} />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Send Inquiry</button>
      </form>
    </div>
  );



  return (
    <div className="app-container">
      {/* Top Navigation Header */}
      <header className="top-navbar">
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => setActiveTab('home')}
        >
          <ShieldCheck size={28} style={{ color: 'var(--primary-blue)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>Digital Shield</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PROTECT BEFORE YOU CLICK</span>
          </div>
        </div>

        {/* Desktop Navbar Links */}
        <nav className="nav-links" style={{ display: window.innerWidth > 950 ? 'flex' : 'none' }}>
          <span className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>{t('navDashboard') || 'Home'}</span>
          {user && (
            <>
              <span className={`nav-link ${activeTab === 'analyze' ? 'active' : ''}`} onClick={() => setActiveTab('analyze')}>Analyze</span>
              <span className={`nav-link ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => setActiveTab('assistant')}>AI Assistant</span>
              <span className={`nav-link ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>Community Stats</span>
            </>
          )}
          <span className={`nav-link ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</span>
          <span className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>Contact</span>
        </nav>

        {/* Right Header Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Globe size={16} style={{ color: 'var(--primary-blue)' }} />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="English" style={{ background: 'var(--bg-midnight-card)' }}>English</option>
              <option value="Hindi" style={{ background: 'var(--bg-midnight-card)' }}>हिन्दी</option>
              <option value="Telugu" style={{ background: 'var(--bg-midnight-card)' }}>తెలుగు</option>
            </select>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                onClick={() => setActiveTab('profile')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
              >
                <User size={16} style={{ color: 'var(--primary-blue)' }} />
                <span style={{ fontWeight: 600, display: window.innerWidth > 600 ? 'inline' : 'none' }}>{user.firstName}</span>
              </div>
              <button 
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}
              >
                <LogOut size={16} />
                <span style={{ display: window.innerWidth > 600 ? 'inline' : 'none' }}>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              className="btn-primary" 
              onClick={() => setActiveTab('login')}
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              Login
            </button>
          )}

          {/* Mobile Menu Icon */}
          <div 
            style={{ display: window.innerWidth <= 950 ? 'block' : 'none', cursor: 'pointer' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          background: 'var(--bg-midnight-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 99
        }}>
          <span className="nav-link" onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}>Home</span>
          {user && (
            <>
              <span className="nav-link" onClick={() => { setActiveTab('analyze'); setMobileMenuOpen(false); }}>Analyze</span>
              <span className="nav-link" onClick={() => { setActiveTab('assistant'); setMobileMenuOpen(false); }}>AI Assistant</span>
              <span className="nav-link" onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}>Community Stats</span>
            </>
          )}
          <span className="nav-link" onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}>About</span>
          <span className="nav-link" onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}>Contact</span>
        </div>
      )}

      {/* Main Pages Content */}
      <main className="main-content">
        {activeTab === 'login' || activeTab === 'signup' ? (
          <AuthPages mode={activeTab} onNavigate={setActiveTab} />
        ) : (
          renderActivePage()
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
