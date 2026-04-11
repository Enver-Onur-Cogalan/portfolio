'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
        color: 'var(--accent)',
        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
      }}
      title={lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <span className="text-sm">{lang === 'tr' ? '🇬🇧' : '🇹🇷'}</span>
      <span>{lang === 'tr' ? 'EN' : 'TR'}</span>
    </button>
  );
}
