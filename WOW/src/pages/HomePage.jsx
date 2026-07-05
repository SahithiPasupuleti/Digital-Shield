import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShieldCheck, 
  Search, 
  Globe, 
  QrCode, 
  MessageSquare, 
  AlertOctagon, 
  TrendingUp, 
  HelpCircle,
  Users,
  ChevronRight
} from 'lucide-react';

export default function HomePage({ setActiveTab }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      id: 'analyze',
      title: 'AI Threat Analyzer',
      desc: 'Paste suspicious recruiters texts, upload email screenshots, or scan PDF offers.',
      icon: Search,
      color: 'var(--primary-blue)'
    },
    {
      id: 'analyze', // Redirects to URL tab
      title: 'URL Security Analyzer',
      desc: 'Verify if a website URL is safe, caution, or dangerous before visiting.',
      icon: Globe,
      color: '#8B5CF6'
    },
    {
      id: 'analyze', // Redirects to QR tab
      title: 'QR Code Scanner',
      desc: 'Upload recruitment QR codes from flyers to safely extract and analyze target links.',
      icon: QrCode,
      color: '#10B981'
    },
    {
      id: 'assistant',
      title: 'AI Cyber Assistant',
      desc: 'Ask questions to our educational cybersecurity chatbot about safety standards.',
      icon: MessageSquare,
      color: '#06B6D4'
    },
    {
      id: 'community',
      title: 'Community Dashboard',
      desc: 'Browse recent trends, anonymized scam statistics, and active weekly alerts.',
      icon: Users,
      color: '#F59E0B'
    }
  ];

  const handleActionClick = (tabId) => {
    if (user) {
      setActiveTab(tabId);
    } else {
      setActiveTab('login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '60px' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', paddingTop: '60px', paddingBottom: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }}>
          Protect Before You Click
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
          Verify suspicious messages, websites, QR codes, emails and online scams before you trust them.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button 
            className="btn-primary" 
            onClick={() => handleActionClick('analyze')}
            style={{ fontSize: '1.05rem', padding: '12px 28px' }}
          >
            Analyze Now
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="section-header">
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Security Defense Tools</h2>
          <p style={{ color: 'var(--text-muted)' }}>Empower your digital safety with customized verification modules.</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px',
          marginTop: '32px'
        }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="glass-card feature-card" 
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
                onClick={() => handleActionClick(f.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div className="feature-icon-wrapper" style={{ color: f.color, background: `${f.color}15` }}>
                    <Icon size={24} />
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', flexGrow: 1 }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Cybercrime is Growing Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div className="glass-card" style={{ padding: '40px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--high-risk)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Why Recruitment Cybercrime Is Growing</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Online employment scams have surged by over <strong>150%</strong> in the past year. Fraudsters impersonate famous tech corporations, creating fake recruiters, cloned sites, and camp-flyer QR codes. They target freshers and college students who are looking for internships or remote roles.
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                These scams leverage advanced psychological tactics like artificial urgency, professional-looking certificates, and refund guarantees to steal money (via deposit fees) or harvest identity documents (Aadhaar, SSN) for loan frauds.
              </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Students Targeted</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--high-risk)' }}>74%</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>of victim group</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Average Financial Loss</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--medium-risk)' }}>₹12,400</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>per incident</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div className="section-header">
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Security Testimonials</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real stories from student users saved by Digital Shield.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
          <div className="glass-card">
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              "Digital Shield flagged a remote data entry offer letter asking for ₹1,500 security deposit. It saved me from my first job scam! The explanation was so clear."
            </p>
            <strong style={{ fontSize: '0.85rem', color: 'var(--primary-blue)' }}>- Amit Verma, IIT Kharagpur</strong>
          </div>
          <div className="glass-card">
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              "I scanned a hiring QR code on campus, and Digital Shield warned me that it redirected to an insecure domain designed for credential harvesting. A lifesaver!"
            </p>
            <strong style={{ fontSize: '0.85rem', color: 'var(--primary-blue)' }}>- Priya Rao, BITS Pilani</strong>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '40px', 
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontSize: '0.85rem',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginBottom: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: 800 }}>
          <ShieldCheck size={22} style={{ color: 'var(--primary-blue)' }} />
          Digital Shield
        </div>
        <p>&copy; 2026 Digital Shield - Protect Before You Click. Hackathon Edition.</p>
      </footer>

    </div>
  );
}
