import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, GraduationCap, Calendar, Mail, FileText, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    total: 14,
    safe: 11,
    high: 3,
    ratio: 78
  });

  useEffect(() => {
    if (user) {
      // Calculate active stats
      const total = user.totalReports || 0;
      const safe = user.safeReports || 0;
      const high = user.highRiskReports || 0;
      const ratio = total > 0 ? Math.round((safe / total) * 100) : 100;
      setStats({ total, safe, high, ratio });
    }
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Profile Header Card */}
      <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-cyan) 0%, var(--primary-purple) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
        }}>
          <User size={40} />
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.firstName} {user.lastName}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <ShieldCheck size={14} /> Digital Shield Verified Member
          </span>
        </div>
      </div>

      {/* User Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <GraduationCap size={24} style={{ color: 'var(--primary-purple)' }} />
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>COLLEGE / UNIVERSITY</span>
            <strong style={{ fontSize: '0.9rem' }}>{user.college}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Mail size={24} style={{ color: 'var(--primary-blue)' }} />
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>EMAIL ADDRESS</span>
            <strong style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{user.email}</strong>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <Calendar size={24} style={{ color: 'var(--primary-cyan)' }} />
          <div>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>MEMBER SINCE</span>
            <strong style={{ fontSize: '0.9rem' }}>{user.memberSince || 'July 2026'}</strong>
          </div>
        </div>
      </div>

      {/* Scanning Summary Analytics Card */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Scan Vetting Statistics</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <FileText size={24} style={{ color: 'var(--primary-cyan)', margin: '0 auto 8px auto' }} />
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL SCANS RUN</span>
            <strong style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total}</strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <CheckCircle size={24} style={{ color: 'var(--safe-green)', margin: '0 auto 8px auto' }} />
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>SAFE OPPORTUNITIES</span>
            <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--safe-green)' }}>{stats.safe}</strong>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <AlertTriangle size={24} style={{ color: 'var(--high-risk)', margin: '0 auto 8px auto' }} />
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>HIGH RISK SCAMS BLOCKED</span>
            <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--high-risk)' }}>{stats.high}</strong>
          </div>
        </div>

        {/* Safety Ratio Gauge indicator */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
            <span>Verified Safety Ratio</span>
            <strong>{stats.ratio}% Safe</strong>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${stats.ratio}%`,
              background: 'linear-gradient(90deg, var(--primary-cyan), var(--safe-green))',
              borderRadius: '4px',
              transition: 'width 1s ease'
            }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
            A higher safety ratio indicates that most analyzed recruitment emails and links were verified as authentic. Keep scanning to prevent identity theft.
          </p>
        </div>
      </div>

    </div>
  );
}
