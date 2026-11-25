'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, getTranslation } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  pdfLanguage: 'EN' | 'KN';
  setPdfLanguage: (lang: 'EN' | 'KN') => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [pdfLanguage, setPdfLanguageState] = useState<'EN' | 'KN'>('EN');

  useEffect(() => {
    const saved = localStorage.getItem('karnataka_erp_lang') as Language;
    if (saved && (saved === 'en' || saved === 'kn')) {
      setLanguageState(saved);
    }
    const savedPdfLang = localStorage.getItem('karnataka_erp_pdf_lang') as 'EN' | 'KN';
    if (savedPdfLang && (savedPdfLang === 'EN' || savedPdfLang === 'KN')) {
      setPdfLanguageState(savedPdfLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('karnataka_erp_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const setPdfLanguage = (lang: 'EN' | 'KN') => {
    setPdfLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('karnataka_erp_pdf_lang', lang);
    }
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        pdfLanguage,
        setPdfLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
