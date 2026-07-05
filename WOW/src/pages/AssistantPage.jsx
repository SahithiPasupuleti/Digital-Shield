import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Bot, Send, Loader2, MessageSquare, Shield } from 'lucide-react';

export default function AssistantPage() {
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Suggested questions based on language settings
  const suggestions = {
    English: [
      "What is a registration fee scam?",
      "How do I recognize a fake recruiter email?",
      "What is a QR code redirection scam?",
      "Why do scammers ask for bank details early?"
    ],
    Hindi: [
      "रजिस्ट्रेशन शुल्क घोटाला क्या है?",
      "फ़र्ज़ी रिक्रूटर की पहचान कैसे करें?",
      "क्यूआर कोड घोटाला क्या है?",
      "स्कैमर बैंक विवरण पहले क्यों मांगते हैं?"
    ],
    Telugu: [
      "రిక్రూట్‌మెంట్ ఫీజు మోసం అంటే ఏమిటి?",
      "నకిలీ రిక్రూటర్‌ను ఎలా గుర్తించాలి?",
      "QR కోడ్ భద్రతా చిట్కాలు ఏమిటి?",
      "బ్యాంకు వివరాలు ముందే అడిగితే ఏం చేయాలి?"
    ]
  };

  const getGreeting = () => {
    switch (language) {
      case 'Hindi':
        return 'नमस्ते! मैं आपका डिजिटल शील्ड सहायक हूँ। मैं भर्ती घोटालों, फ़िशिंग और क्यूआर कोड सुरक्षा के बारे में आपकी कैसे मदद कर सकता हूँ?';
      case 'Telugu':
        return 'నమస్తే! నేను మీ డిజిటల్ షీల్డ్ సహాయకుడిని. రిక్రూట్‌మెంట్ మోసాలు, ఈమెయిల్ ఫిషింగ్ లేదా QR కోడ్ భద్రతను తెలుసుకోవడానికి నేను మీకు ఎలా సహాయపడగలను?';
      default:
        return 'Hello! I am your Digital Shield Assistant. How can I help you check recruitment scams, email phishing, or QR code safety today?';
    }
  };

  useEffect(() => {
    // Reset conversation with localized greeting
    setMessages([
      {
        role: 'assistant',
        content: getGreeting()
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (customText) => {
    const text = customText || input;
    if (!text.trim()) return;

    if (!customText) setInput('');

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          language
        })
      });

      if (!response.ok) throw new Error('Chat connectivity issue.');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'Hindi' 
          ? 'क्षमा करें, सर्वर कनेक्शन समस्या। कृपया फिर से प्रयास करें।' 
          : language === 'Telugu'
          ? 'క్షమించండి, సర్వర్ కనెక్షన్ లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.'
          : 'Oops! I am having trouble connecting to my database. Please check your network and try again!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-container" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div className="module-header">
        <div className="module-icon">
          <Bot size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>AI Cyber Assistant</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Learn how to stay protected from digital scams with real-time educational advice.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(59, 130, 246, 0.02)', borderColor: 'rgba(59, 130, 246, 0.1)' }}>
        <Shield size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Educational Safe Zone</strong>: I provide security answers to build digital literacy. I will never ask for your passwords, OTP codes, or personal files.
        </span>
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        {/* Message Window */}
        <div className="chat-history">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Loader2 size={16} className="skeleton" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompt Pills */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px', 
          padding: '12px 20px', 
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.01)'
        }}>
          {suggestions[language]?.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--primary-blue)'; e.target.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-muted)'; }}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Form Input Footer */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="chat-input-bar"
        >
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a cyber safety question..."
            disabled={loading}
          />
          <button 
            type="submit"
            className="btn-primary"
            disabled={loading || !input.trim()}
            style={{ width: '42px', height: '42px', padding: 0, justifyContent: 'center', flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}
