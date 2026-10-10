'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';

export type Language = 'en' | 'ur' | 'hi' | 'bn' | 'ps' | 'pa' | 'fa' | 'ar';

export const isRtlLanguage = (l: Language) =>
  l === 'ur' || l === 'ps' || l === 'pa' || l === 'fa' || l === 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

function applyDocumentLanguage(l: Language) {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = isRtlLanguage(l) ? 'rtl' : 'ltr';
  document.documentElement.lang =
    l === 'ur'
      ? 'ur'
      : l === 'hi'
        ? 'hi'
        : l === 'bn'
          ? 'bn'
          : l === 'ps'
            ? 'ps'
            : l === 'pa'
              ? 'pa'
              : l === 'fa'
                ? 'fa'
                : l === 'ar'
                  ? 'ar'
                  : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('cloudexify_lang') as Language;
    if (
      saved === 'en' ||
      saved === 'ur' ||
      saved === 'hi' ||
      saved === 'bn' ||
      saved === 'ps' ||
      saved === 'pa' ||
      saved === 'fa' ||
      saved === 'ar'
    ) {
      setLangState(saved);
      applyDocumentLanguage(saved);
    }
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudexify_lang', l);
    }
    applyDocumentLanguage(l);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[lang] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
