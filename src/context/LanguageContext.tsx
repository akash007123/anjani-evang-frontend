import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export type Language = 'EN' | 'HI';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t: i18nT } = useTranslation('common');
  
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    if (saved === 'HI' || saved === 'hi') return 'HI';
    return 'EN';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    const i18nLang = lang.toLowerCase();
    i18n.changeLanguage(i18nLang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = i18nLang;
  }, []);

  useEffect(() => {
    // Synchronize initial state with i18n
    const initialI18nLang = language.toLowerCase();
    if (i18n.language !== initialI18nLang) {
      i18n.changeLanguage(initialI18nLang);
    }
    document.documentElement.lang = initialI18nLang;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'EN' ? 'HI' : 'EN');
  }, [language, setLanguage]);

  // Enhanced t function that can look up common keys or fallback to i18n.t
  const t = useCallback((key: string, options?: any): string => {
    if (!key) return '';
    // If key contains namespace colon (e.g. "home:heroTitle"), use i18next directly
    if (key.includes(':')) {
      return (i18n.t(key, options) as string) || key;
    }
    // Try in common namespace first
    const translated = i18nT(key, options) as string;
    if (translated && translated !== key) {
      return translated;
    }
    // Fallback search across loaded namespaces
    return (i18n.t(key, options) as string) || key;
  }, [i18nT]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
