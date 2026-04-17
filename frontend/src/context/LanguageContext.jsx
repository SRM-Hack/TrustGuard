import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('truthguard_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('truthguard_language', language);
    // Apply language-specific theme class to body
    document.body.className = `theme-${language}`;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: (key, translations) => {
      return translations?.[language]?.[key] || translations?.['en']?.[key] || key;
    },
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
