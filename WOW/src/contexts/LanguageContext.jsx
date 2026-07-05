import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translate';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('cybersentinel_lang') || 'English';
  });

  useEffect(() => {
    localStorage.setItem('cybersentinel_lang', language);
  }, [language]);

  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || translations['English'][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
