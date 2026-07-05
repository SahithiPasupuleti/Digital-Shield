import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, Lock, User, GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';

export default function AuthPages({ mode = 'login', onNavigate }) {
  const { login, signup, googleSignIn, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState(mode); // 'login' | 'signup' | 'forgot'
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [college, setCollege] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot Password Email State
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    // Load remembered email
    const savedEmail = localStorage.getItem('cybersentinel_remembered_email');
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!loginEmail.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!loginPassword.trim()) {
      setError('Password is required.');
      return;
    }
    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('cybersentinel_remembered_email', loginEmail);
      } else {
        localStorage.removeItem('cybersentinel_remembered_email');
      }

      await login(loginEmail, loginPassword);
      onNavigate('home');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setError('Last name is required.');
      return;
    }
    if (!college.trim()) {
      setError('College/University is required.');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!signupPassword.trim()) {
      setError('Password is required.');
      return;
    }
    if (!confirmPassword.trim()) {
      setError('Please confirm your password.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        firstName,
        lastName,
        college,
        email: signupEmail,
        password: signupPassword
      });
      onNavigate('home');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      await googleSignIn();
      onNavigate('home');
    } catch (err) {
      console.error(err);
      setError('Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    if (!forgotEmail.trim()) {
      setError('Email address is required.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(forgotEmail);
      setInfoMessage('A password reset link has been dispatched to your email address.');
      setForgotEmail('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card auth-card" style={{ border: '1px solid var(--border-color)' }}>
        
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
            <ShieldCheck size={30} style={{ color: 'var(--primary-blue)' }} />
            <span>Digital Shield</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Verify Before You Trust
          </p>
        </div>

        {/* Tab Selection */}
        {activeTab !== 'forgot' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <button
              onClick={() => { setActiveTab('login'); setError(''); setInfoMessage(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '12px',
                color: activeTab === 'login' ? 'var(--primary-blue)' : 'var(--text-muted)',
                borderBottom: activeTab === 'login' ? '2px solid var(--primary-blue)' : 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-main)'
              }}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); setInfoMessage(''); }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                padding: '12px',
                color: activeTab === 'signup' ? 'var(--primary-blue)' : 'var(--text-muted)',
                borderBottom: activeTab === 'signup' ? '2px solid var(--primary-blue)' : 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-main)'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Info or Error Banners */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--high-risk)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        {infoMessage && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-green)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
            {infoMessage}
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="name@college.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label">Password</label>
                <span 
                  style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { setActiveTab('forgot'); setError(''); setInfoMessage(''); }}
                >
                  Forgot Password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show Password
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Log In'}
            </button>
          </form>
        )}

        {/* 2. SIGNUP MODE */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Sahithi"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Pasupuleti"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">College / University</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="National University of Tech"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                />
                <GraduationCap size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="name@college.edu"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="Create password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create Account'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', cursor: 'pointer', color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => { setActiveTab('login'); setError(''); setInfoMessage(''); }}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Password Recovery</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4', marginBottom: '20px' }}>
              Enter your registered email address and we will dispatch a link to reset your account password.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '38px', width: '100%' }}
                  placeholder="name@college.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Google Authentication & Decoupled Logins */}
        {activeTab !== 'forgot' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            <button 
              onClick={handleGoogleSignIn}
              className="btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '10px' }}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ fill: 'currentColor' }}>
                <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.35 0-4.33-1.59-5.04-3.73H.95v2.3C2.43 15.89 5.5 18 9 18z" fill="#34A853"/>
                <path d="M3.96 10.67c-.18-.54-.28-1.12-.28-1.71s.1-1.17.28-1.71V4.95H.95C.35 6.16 0 7.54 0 9s.35 2.84.95 4.05l3.01-2.38z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.47.89 11.43 0 9 0 5.5 0 2.43 2.11.95 5.09l3.01 2.38c.71-2.14 2.69-3.73 5.04-3.73z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Tip: You can use default login: <br/>
              <strong style={{ color: 'var(--primary-blue)' }}>sahithi@digitalshield.ai</strong> (password can be anything)
            </div>
          </>
        )}

      </div>
    </div>
  );
}
