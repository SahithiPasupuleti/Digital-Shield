import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import RiskGauge from '../components/RiskGauge';
import { 
  Search, 
  Globe, 
  QrCode, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  FileText,
  AlertOctagon,
  Loader2,
  HelpCircle,
  Link,
  Upload
} from 'lucide-react';

export default function AnalyzePage() {
  const { t, language } = useLanguage();
  const { updateUserStats } = useAuth();
  const { addToast } = useNotifications();

  // Active Sub-tab State: 'analyzer' | 'url' | 'qr'
  const [activeSubTab, setActiveSubTab] = useState('analyzer');

  // Common State
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  // 1. AI Threat Analyzer States
  const [manualText, setManualText] = useState('');
  const [analyzerResult, setAnalyzerResult] = useState(null);

  // 2. URL Analyzer States
  const [inputUrl, setInputUrl] = useState('');
  const [urlResult, setUrlResult] = useState(null);

  // 3. QR Code Scanner States
  const [qrImageBase64, setQrImageBase64] = useState('');
  const [qrResult, setQrResult] = useState(null);

  // --- 1. AI Threat Analyzer Actions ---

  // Handle PDF text extraction
  const handlePdfUpload = (file) => {
    setFileName(file.name);
    setLoading(true);
    
    const fileReader = new FileReader();
    fileReader.onload = async function() {
      try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        setManualText(extractedText);
        addToast('PDF Text Extracted', 'Successfully read content from ' + file.name, 'Safe');
      } catch (err) {
        console.error('PDF extraction failed:', err);
        addToast('PDF Parsing Failed', 'Could not extract text from document', 'High');
      } finally {
        setLoading(false);
      }
    };
    fileReader.readAsArrayBuffer(file);
  };

  // Handle Image upload
  const handleImageUpload = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = function(e) {
      setManualText('__IMAGE_UPLOADED__' + e.target.result + '|' + file.type);
      addToast('Image Loaded', 'Press Analyze to scan the file screenshot.', 'Safe');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      handlePdfUpload(file);
    } else if (file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      const reader = new FileReader();
      reader.onload = function(e) {
        setManualText(e.target.result);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeThreat = async () => {
    if (!manualText.trim()) return;
    setLoading(true);
    setAnalyzerResult(null);

    try {
      let payload = { language };
      
      if (manualText.startsWith('__IMAGE_UPLOADED__')) {
        const raw = manualText.replace('__IMAGE_UPLOADED__', '');
        const [base64, mimeType] = raw.split('|');
        payload.image = base64;
        payload.mimeType = mimeType;
      } else {
        payload.text = manualText;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMsg = 'Threat analysis failed.';
        try {
          const errData = await response.json();
          errMsg = errData.detail || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setAnalyzerResult(data);

      // Save report context
      const newReport = {
        id: 'rep_' + Date.now(),
        type: 'General Threat',
        timestamp: new Date().toLocaleString(),
        input: manualText.startsWith('__IMAGE_UPLOADED__') ? `Screenshot: ${fileName}` : manualText.substring(0, 300) + '...',
        result: data
      };

      const savedReports = JSON.parse(localStorage.getItem('digitalshield_reports') || '[]');
      localStorage.setItem('digitalshield_reports', JSON.stringify([...savedReports, newReport]));

      // Update user statistics
      const isSafe = data.threatLevel === 'Safe';
      updateUserStats(isSafe);

      // Toast notification
      if (data.threatLevel === 'Dangerous') {
        addToast('Dangerous Risk Detected!', `Immediate caution advised: ${data.threatCategory}`, 'High');
      } else if (data.threatLevel === 'Suspicious') {
        addToast('Suspicious Activity Found', 'AI flagged potential red flags.', 'Medium');
      } else {
        addToast('Safe Vetting Complete', 'No major cyber risks observed.', 'Safe');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection Failed', err.message || 'Failed to communicate with AI server.', 'High');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. URL Analyzer Actions ---
  const handleAnalyzeUrl = async () => {
    if (!inputUrl.trim()) return;
    setLoading(true);
    setUrlResult(null);

    try {
      const response = await fetch('/api/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, language })
      });

      if (!response.ok) {
        let errMsg = 'URL verification failed.';
        try {
          const errData = await response.json();
          errMsg = errData.detail || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setUrlResult(data);

      addToast('URL Vetting Complete', `Vetted as: ${data.status}`, data.status === 'Dangerous' ? 'High' : data.status === 'Caution' ? 'Medium' : 'Safe');
    } catch (err) {
      console.error(err);
      addToast('Connection Failed', err.message || 'Could not verify URL safety.', 'High');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. QR Code Scanner Actions ---
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = function(e) {
      setQrImageBase64(e.target.result);
      addToast('QR Image Loaded', 'Press Scan QR to inspect link.', 'Safe');
    };
    reader.readAsDataURL(file);
  };

  const handleScanQr = async () => {
    if (!qrImageBase64) return;
    setLoading(true);
    setQrResult(null);

    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: qrImageBase64,
          language
        })
      });

      if (!response.ok) {
        let errMsg = 'QR scan failed.';
        try {
          const errData = await response.json();
          errMsg = errData.detail || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setQrResult(data);

      addToast('QR Scanned Successfully', 'Extracted payload analyzed.', 'Safe');
    } catch (err) {
      console.error(err);
      addToast('Scan Failed', err.message || 'Failed to analyze QR code.', 'High');
    } finally {
      setLoading(false);
    }
  };

  // --- Report Download Utility ---
  const downloadReport = (resultData, typeName) => {
    const content = `================================================
DIGITAL SHIELD AI SECURITY ANALYSIS REPORT
================================================
Report Type: ${typeName}
Generated: ${new Date().toLocaleString()}
Language: ${language}

Verdict: ${resultData.threatLevel || resultData.status || 'Verified'}
Threat Category: ${resultData.threatCategory || 'URL / Domain Inspection'}
Confidence: ${resultData.confidenceScore || '95'}%
Risk Score: ${resultData.riskScore || 'N/A'}

SUMMARY & EXPLANATION:
${resultData.explanation || resultData.reason || 'Safety vetting complete.'}

HIGHLIGHTED RISK CONTENT:
${resultData.highlightedContent || 'None'}

RED FLAGS INTERCEPTED:
${resultData.reasons ? resultData.reasons.map((r, i) => `${i+1}. ${r}`).join('\n') : 'None detected'}

RECOMMENDED ACTIONS:
${resultData.recommendations ? resultData.recommendations.map((r, i) => `${i+1}. ${r}`).join('\n') : resultData.recommendation || 'Proceed with normal caution.'}

CYBERSECURITY EDUCATION TIPS:
${resultData.tips ? resultData.tips.map((t, i) => `${i+1}. ${t}`).join('\n') : 'Always verify links and email sender domains before trusting.'}

================================================
Protect Before You Click - Digital Shield
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DigitalShield_Report_${typeName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="module-container">
      
      {/* Page Header */}
      <div className="module-header">
        <div className="module-icon">
          <Search size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>AI Cyber Analysis Terminal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Verify screenshots, emails, PDFs, URLs, and campus flyers before you trust them.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation Selector */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeSubTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('analyzer'); setFileName(''); }}
        >
          🔍 AI Threat Analyzer
        </button>
        <button 
          className={`tab-button ${activeSubTab === 'url' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('url'); setFileName(''); }}
        >
          🌐 URL Analyzer
        </button>
        <button 
          className={`tab-button ${activeSubTab === 'qr' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('qr'); setFileName(''); }}
        >
          📱 QR Code Scanner
        </button>
      </div>

      {/* ================= 1. AI THREAT ANALYZER ================= */}
      {activeSubTab === 'analyzer' && (
        <div className="module-grid">
          {/* Input Controls Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Input Content</h3>
              
              <textarea
                className="form-input"
                rows={10}
                placeholder="Paste suspicious text, recruitment emails, chat logs, or upload screenshots / PDFs below..."
                value={manualText.startsWith('__IMAGE_UPLOADED__') ? `[Attached Image Screenshot: ${fileName}]` : manualText}
                onChange={(e) => {
                  if (manualText.startsWith('__IMAGE_UPLOADED__')) {
                    setManualText('');
                    setFileName('');
                  } else {
                    setManualText(e.target.value);
                  }
                }}
                style={{ width: '100%', resize: 'vertical', fontSize: '0.9rem', marginBottom: '16px', background: 'rgba(0,0,0,0.2)' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <input type="file" accept=".pdf,image/*,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                  <Upload size={16} />
                  <span>Upload PDF or Image</span>
                </label>

                {fileName && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                    File: {fileName}
                  </span>
                )}

                <button 
                  className="btn-primary"
                  onClick={handleAnalyzeThreat}
                  disabled={loading || !manualText.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Analyzing
                    </>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
            </div>

            {loading && (
              <div className="glass-card">
                <div className="skeleton-title skeleton"></div>
                <div className="skeleton-text skeleton" style={{ width: '90%' }}></div>
                <div className="skeleton-text skeleton" style={{ width: '80%' }}></div>
                <div className="skeleton-text skeleton" style={{ width: '85%' }}></div>
              </div>
            )}

            {/* Results Rendering Card */}
            {analyzerResult && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>AI Threat Verdict</h3>
                  <span className={`threat-badge ${analyzerResult.threatLevel}`}>
                    {analyzerResult.threatLevel}
                  </span>
                </div>

                {analyzerResult.threatLevel === 'Safe' && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid var(--safe-green)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--safe-green)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                    <span>Verified source / No phishing indicators detected</span>
                  </div>
                )}
                {analyzerResult.threatLevel === 'Suspicious' && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid var(--medium-risk)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--medium-risk)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <span>Some suspicious indicators detected / Proceed with caution</span>
                  </div>
                )}
                {analyzerResult.threatLevel === 'Dangerous' && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid var(--high-risk)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--high-risk)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    <AlertOctagon size={20} style={{ flexShrink: 0 }} />
                    <span>High probability of scam / Phishing detected / Do not enter personal information</span>
                  </div>
                )}

                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Threat Category</strong>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: analyzerResult.threatLevel === 'Dangerous' ? 'var(--high-risk)' : 'var(--text-primary)' }}>
                    {analyzerResult.threatCategory}
                  </span>
                </div>

                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Explanation</strong>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{analyzerResult.explanation}</p>
                </div>

                {analyzerResult.highlightedContent && analyzerResult.highlightedContent !== 'None' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid var(--high-risk)', padding: '12px', borderRadius: '4px' }}>
                    <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--high-risk)', marginBottom: '4px' }}>Suspicious Element Found</strong>
                    <span style={{ fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'monospace' }}>"{analyzerResult.highlightedContent}"</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    className="btn-secondary"
                    onClick={() => downloadReport(analyzerResult, 'Threat Vetting Report')}
                    style={{ fontSize: '0.85rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Download size={14} />
                    Download Report
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Meter & Recommendations Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {analyzerResult ? (
              <>
                {/* Risk Gauge */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Threat Risk Meter</h3>
                  <RiskGauge score={analyzerResult.riskScore} threatLevel={analyzerResult.threatLevel} confidence={analyzerResult.confidenceScore} />
                </div>

                {/* Red Flags List */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--high-risk)', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
                    <AlertTriangle size={18} />
                    Red Flags Intercepted
                  </h3>
                  {analyzerResult.reasons && analyzerResult.reasons.length > 0 ? (
                    <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analyzerResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No risks detected.</span>
                  )}
                </div>

                {/* Recommendations */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--safe-green)', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
                    <ShieldCheck size={18} />
                    Recommended Actions
                  </h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analyzerResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                {/* Cybersecurity Tips */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-blue)', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px' }}>
                    <AlertOctagon size={18} />
                    Cybersecurity Tips
                  </h3>
                  <ul style={{ paddingLeft: '16px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analyzerResult.tips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </>
            ) : (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', color: 'var(--text-muted)', textAlign: 'center', gap: '12px' }}>
                <HelpCircle size={44} style={{ opacity: 0.2 }} />
                <p style={{ fontSize: '0.9rem' }}>Paste details on the left and run analysis to view the security vetting gauge and recommendations.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. URL SECURITY ANALYZER ================= */}
      {activeSubTab === 'url' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Vetting URL Domain</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste URL link here (e.g. http://tcs-hiring-portal.net)..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  style={{ width: '100%', paddingLeft: '38px' }}
                />
                <Link size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
              <button 
                className="btn-primary"
                onClick={handleAnalyzeUrl}
                disabled={loading || !inputUrl.trim()}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Verify URL'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="glass-card">
              <div className="skeleton-title skeleton"></div>
              <div className="skeleton-text skeleton"></div>
            </div>
          )}

          {urlResult && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>URL Security Vetting</h3>
                <span className={`threat-badge ${urlResult.status === 'Dangerous' ? 'Dangerous' : urlResult.status === 'Caution' ? 'Caution' : 'Safe'}`}>
                  {urlResult.status}
                </span>
              </div>

              {urlResult.status === 'Safe' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--safe-green)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--safe-green)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                  <span>Website appears safe / No phishing indicators detected</span>
                </div>
              )}
              {urlResult.status === 'Caution' && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid var(--medium-risk)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--medium-risk)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span>Verify before continuing / Proceed with caution</span>
                </div>
              )}
              {urlResult.status === 'Dangerous' && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid var(--high-risk)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--high-risk)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <AlertOctagon size={20} style={{ flexShrink: 0 }} />
                  <span>Avoid interacting with this website / Phishing detected</span>
                </div>
              )}
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Security Findings</strong>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{urlResult.reason}</p>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Safety Recommendation</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', fontWeight: 600 }}>{urlResult.recommendation}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => downloadReport(urlResult, 'URL Safety Vetting')}
                  style={{ fontSize: '0.85rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                >
                  <Download size={14} />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. QR CODE SCANNER ================= */}
      {activeSubTab === 'qr' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Decode Hiring Flyer QR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
              Upload QR codes found on campus boards. Digital Shield decodes the destination link and inspects it <em>without automatically visiting</em> it to prevent browser attacks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                <input type="file" accept="image/*" onChange={handleQrUpload} style={{ display: 'none' }} />
                <Upload size={18} />
                <span>Upload QR Image Flyer</span>
              </label>

              {fileName && (
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                  Selected: {fileName}
                </span>
              )}

              {qrImageBase64 && (
                <div style={{ marginTop: '10px', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px', background: '#000' }}>
                  <img src={qrImageBase64} alt="QR code preview" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }} />
                </div>
              )}

              <button 
                className="btn-primary"
                onClick={handleScanQr}
                disabled={loading || !qrImageBase64}
                style={{ padding: '10px 24px' }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Scan QR Target'}
              </button>
            </div>
          </div>

          {loading && (
            <div className="glass-card">
              <div className="skeleton-title skeleton"></div>
              <div className="skeleton-text skeleton"></div>
            </div>
          )}

          {qrResult && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>QR Security Diagnostics</h3>
                <span className={`threat-badge ${qrResult.riskScore > 75 ? 'Dangerous' : qrResult.riskScore > 30 ? 'Caution' : 'Safe'}`}>
                  {qrResult.riskScore > 75 ? 'Dangerous' : qrResult.riskScore > 30 ? 'Caution' : 'Safe'}
                </span>
              </div>

              {qrResult.riskScore <= 30 && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid var(--safe-green)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--safe-green)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                  <span>Website appears safe / Verified source</span>
                </div>
              )}
              {qrResult.riskScore > 30 && qrResult.riskScore <= 75 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid var(--medium-risk)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--medium-risk)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span>Verify before continuing / Proceed with caution</span>
                </div>
              )}
              {qrResult.riskScore > 75 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid var(--high-risk)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--high-risk)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}>
                  <AlertOctagon size={20} style={{ flexShrink: 0 }} />
                  <span>Avoid interacting with this website / High probability of scam</span>
                </div>
              )}
              
              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Decoded Link target</strong>
                <span style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: 'var(--primary-blue)', wordBreak: 'break-all' }}>
                  {qrResult.decodedUrl}
                </span>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Risk Score</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  {qrResult.riskScore} / 100
                </span>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Safety Recommendation</strong>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{qrResult.recommendation}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  className="btn-secondary"
                  onClick={() => downloadReport(qrResult, 'QR Code Vetting')}
                  style={{ fontSize: '0.85rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                >
                  <Download size={14} />
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
