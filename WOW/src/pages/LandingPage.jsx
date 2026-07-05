import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, ShieldAlert, Zap, Lock, QrCode, Search, Award } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Navbar placeholder for landing page */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(3, 7, 18, 0.7)',
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 800 }}>
          <ShieldCheck size={26} style={{ color: 'var(--primary-cyan)' }} />
          <span className="gradient-text">{t('brandName')}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn-secondary" onClick={() => onNavigate('login')}>Login</button>
          <button className="btn-primary" onClick={() => onNavigate('signup')}>{t('getStarted')}</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero float-animation">
        <h1 className="gradient-text">{t('tagline')}</h1>
        <p>{t('subheading')}</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => onNavigate('signup')}>{t('getStarted')}</button>
          <button className="btn-secondary" onClick={() => onNavigate('login')}>{t('verifyNow')}</button>
        </div>
      </section>

      {/* Statistics */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        <div className="stats-grid glass-card">
          <div className="stat-card">
            <div className="stat-value">50,000+</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('statVerified')}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
            <div className="stat-value">98%</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('statAccuracy')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">20,000+</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('statProtected')}</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" style={{ padding: '60px 24px' }}>
        <div className="section-header">
          <h2 className="gradient-text">Proactive Threat Detection Modules</h2>
          <p style={{ color: 'var(--text-muted)' }}>Protecting students from job scams with real-time AI security vetting.</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3>Job & Internship Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Paste requirements or upload offer letters in PDF/Image formats. Gemini scans for advance deposits, spoof domains, and unrealistic payouts.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <Lock size={24} />
            </div>
            <h3>Website Vetting</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Detect brand typosquatting, phishing subdomains, and fake login pages masquerading as authentic corporate recruitment domains.
            </p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <QrCode size={24} />
            </div>
            <h3>QR Code URL Decode</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Scan flyer barcodes. The engine extracts the destination routing URL, vetting redirect loops and malicious forms.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }}>
        <div className="section-header">
          <h2 className="gradient-text">How It Works</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>1</div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Submit Offer details</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paste the email body, job description, company link, or upload an offer document.</p>
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>2</div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Multi-modal AI Vetting</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Google Gemini 2.5 Flash analyzes linguistic features, domain registrations, and credential harvesting forms.</p>
            </div>
          </div>
          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-cyan)' }}>3</div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Review Safety Explanations</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get a simplified, risk-scored breakdown in your selected language indicating safe steps to follow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
        <div className="section-header">
          <h2 className="gradient-text">Protected Student Testimonials</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)' }}>
              "CyberSentinel flagged a remote data entry offer letter asking for ₹1,500 security deposit. Saved me from my first job scam!"
            </p>
            <strong style={{ fontSize: '0.85rem' }}>- Amit Verma, IIT Kharagpur</strong>
          </div>
          <div className="glass-card">
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)' }}>
              "I scanned a hiring QR code on campus and it redirected to an insecure forms page. The tool warned me of credential harvesting."
            </p>
            <strong style={{ fontSize: '0.85rem' }}>- Priya Rao, BITS Pilani</strong>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '800px', margin: '60px auto', padding: '0 24px' }}>
        <div className="section-header">
          <h2 className="gradient-text">{t('faqTitle')}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card">
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>{t('faq1Q')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{t('faq1A')}</p>
          </div>
          <div className="glass-card">
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>{t('faq2Q')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{t('faq2A')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '12px', color: '#fff', fontSize: '1rem', fontWeight: 700 }}>
          <ShieldCheck size={20} style={{ color: 'var(--primary-cyan)' }} />
          CyberSentinel AI
        </div>
        &copy; 2026 CyberSentinel AI - Hackathon Edition. All rights reserved.
      </footer>
    </div>
  );
}
