'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { translate, type Language } from '@/i18n/translations';

export type { Language };

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Dil de React dışında bir kaynakta (localStorage / tarayıcı tercihi)
// yaşıyor. Bunu useState başlangıç değerinde okumak sunucuda üretilen
// HTML ile istemcinin farklı dilde render etmesine — yani hydration
// uyuşmazlığına — yol açıyordu. useSyncExternalStore sunucu için ayrı bir
// anlık görüntü (getServerSnapshot) kullanarak bunu doğru yapıyor.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// localStorage yazılamadığında (gizli sekme, kısıtlı tarayıcı) dil
// değişikliğinin yine de bu oturumda geçerli olmasını sağlar.
let sessionOverride: Language | null = null;

function getSnapshot(): Language {
  if (sessionOverride) return sessionOverride;
  try {
    const stored = localStorage.getItem('lang');
    if (stored === 'tr' || stored === 'en') return stored;
  } catch {
    // localStorage erişilemiyorsa tarayıcı diline düş
  }
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

function getServerSnapshot(): Language {
  return 'tr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    sessionOverride = newLang;
    try {
      localStorage.setItem('lang', newLang);
    } catch {
      // Yazılamasa da sessionOverride sayesinde bu oturumda geçerli
    }
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({ lang, setLang, t: (key: string) => translate(lang, key) }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
