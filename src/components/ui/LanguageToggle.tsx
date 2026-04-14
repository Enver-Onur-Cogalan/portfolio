'use client';

import { useLanguage } from '@/context/LanguageContext';
import { gsap } from '@/lib/gsap';
import { useEffect, useRef } from 'react';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shimmerRef.current) return;

    // Shimmer animation on active language
    gsap.to(shimmerRef.current, {
      backgroundPosition: '200% center',
      duration: 2,
      ease: 'none',
      repeat: -1,
    });
  }, []);

  const handleToggle = () => {
    setLang(lang === 'tr' ? 'en' : 'tr');
  };

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    }
  };

  const handleMouseLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] rounded-full text-xs font-bold tracking-wide transition-all duration-300 overflow-hidden"
      style={{
        background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
        color: 'var(--accent)',
        border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
      }}
      title={lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      {/* Shimmer overlay */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          backgroundSize: '200% 100%',
        }}
      />

      <span className="relative z-10">
        {lang === 'tr' ? 'EN' : 'TR'}
      </span>
    </button>
  );
}
