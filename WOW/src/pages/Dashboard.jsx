import React, { useEffect, useState } from 'react';
import { 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle,
  Eye
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    scamsIntercepted: 14820,
    blockedDomains: 894,
    savedFunds: '₹1.84 Crores',
    communityReports: 3412
  });

  const recentThreats = [
    { id: 1, title: 'Telegram Remote Task scam', detail: 'Recruiters offering high daily wages for rating merchants, redirected to Telegram. Demands upfront deposit.', level: 'Dangerous', time: '2 hours ago' },
    { id: 2, title: 'TCS typosquatting domain', detail: 'Phishing domain "tcs-hiring-portal.in" created to harvest resumes and personal credentials.', level: 'Dangerous', time: '5 hours ago' },
    { id: 3, title: 'Google Form ID collection', detail: 'WhatsApp offers requesting scans of Aadhaar and PAN cards via unverified Google Forms links.', level: 'Caution', time: '1 day ago' },
    { id: 4, title: 'Amazon Package Handler scam', detail: 'Flyers showing package coordinator openings with direct WhatsApp link QR codes.', level: 'Caution', time: '2 days ago' }
  ];

  const scamCategories = [
    { name: 'Task / Like Share Schemes', percentage: 42, count: '1,433 reported', color: 'var(--high-risk)' },
    { name: 'Advance Onboarding Fees', percentage: 28, count: '955 reported', color: 'var(--high-risk)' },
    { name: 'Credential Phishing Portals', percentage: 18, count: '614 reported', color: 'var(--medium-risk)' },
    { name: 'Identity Document Harvesting', percentage: 12, count: '410 reported', color: 'var(--medium-risk)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Title */}
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '0px' }}>
        <h2 style={{ fontSize: '1.75rem' }}>Community Threat Intelligence Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Real-time anonymous metrics and trends aggregated from global user verification scans.
        </p>
      </div>

      {/* Community Stats Cards */}
      <div className="dashboard-grid">
        <div className="glass-card dashboard-card">
          <div className="dashboard-card-info">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scams Intercepted</span>
            <div className="value" style={{ color: 'var(--primary-blue)' }}>{stats.scamsIntercepted.toLocaleString()}</div>
          </div>
          <div className="dashboard-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-blue)' }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="glass-card dashboard-card">
          <div className="dashboard-card-info">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Malicious Links Blocked</span>
            <div className="value" style={{ color: 'var(--medium-risk)' }}>{stats.blockedDomains}</div>
          </div>
          <div className="dashboard-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--medium-risk)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="glass-card dashboard-card">
          <div className="dashboard-card-info">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Saved Funds</span>
            <div className="value" style={{ color: 'var(--safe-green)' }}>{stats.savedFunds}</div>
          </div>
          <div className="dashboard-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--safe-green)' }}>
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="glass-card dashboard-card">
          <div className="dashboard-card-info">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Community Reports Filed</span>
            <div className="value">{stats.communityReports.toLocaleString()}</div>
          </div>
          <div className="dashboard-card-icon" style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-primary)' }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Scam Categories Chart Section */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary-blue)' }} />
            Trending Scam Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {scamCategories.map((c, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.count} ({c.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: `${c.percentage}%`, height: '100%', background: c.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Threat alerts */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--high-risk)' }}>
            <AlertTriangle size={18} />
            Recent Threats Filed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '300px', overflowY: 'auto' }}>
            {recentThreats.map((t) => (
              <div 
                key={t.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px', 
                  paddingBottom: '12px', 
                  borderBottom: '1px solid rgba(255,255,255,0.04)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t.title}</span>
                  <span className={`threat-badge ${t.level}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{t.level}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{t.detail}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right' }}>{t.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Community Info Note */}
      <div className="glass-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(59, 130, 246, 0.02)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
        <Eye size={24} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <strong>Privacy Safeguard</strong>: All scanned data and submissions processed by Digital Shield are strictly anonymized. Personal user metrics, names, emails, and device parameters are never shared publicly or stored in the database.
        </p>
      </div>

    </div>
  );
}
