'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { scrollToSection as smoothScrollToSection } from '@/lib/scroll';

const navKeys = [
  { key: 'nav.about', id: 'hakkimda' },
  { key: 'nav.projects', id: 'projeler' },
  { key: 'nav.experience', id: 'deneyimler' },
  { key: 'nav.contact', id: 'iletisim' },
];

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const scrollToSection = (id: string) => {
    // Ortak yardımcı: sabitlenmiş (pin) bölümlerin yol açtığı konum
    // kaymasını da hesaba katıyor.
    smoothScrollToSection(id);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Menü animasyonu — global sınıf seçicileri yerine ref'ler kullanılıyor,
  // böylece animasyon bu bileşenin kendi düğümleriyle sınırlı kalıyor.
  useEffect(() => {
    if (isMenuOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(panelRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
      document.body.style.overflow = 'hidden';
      const focusTimer = setTimeout(() => firstMenuItemRef.current?.focus(), 150);
      return () => clearTimeout(focusTimer);
    }

    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in' });
    gsap.to(panelRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
    document.body.style.overflow = '';
  }, [isMenuOpen]);

  // Menü açıkken Escape kapatır ve odak hamburger düğmesine döner
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  // Bileşen kaldırılırsa sayfa kaydırması kilitli kalmasın
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 px-3 py-3 md:px-6 md:py-4"
        style={{ backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)', backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Hamburger Button - Mobile Only */}
          <button
            ref={hamburgerRef}
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'color-mix(in srgb, var(--muted) 20%, transparent)' }}
            aria-label={t('nav.menu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
              style={{ backgroundColor: 'var(--foreground)' }}
            />
            <span
              className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
              style={{ backgroundColor: 'var(--foreground)' }}
            />
            <span
              className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
              style={{ backgroundColor: 'var(--foreground)' }}
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6">
            {navKeys.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--foreground)' }}
              >
                {t(item.key)}
              </button>
            ))}
          </nav>

          {/* Spacer for mobile hamburger alignment */}
          <div className="md:hidden flex-1" />

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 md:hidden"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: 0,
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      >
        {/* Menu Panel */}
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.menu')}
          className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] p-6 flex flex-col"
          style={{
            backgroundColor: 'var(--background)',
            transform: 'translateX(100%)',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                hamburgerRef.current?.focus();
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'color-mix(in srgb, var(--muted) 15%, transparent)' }}
              aria-label={t('nav.closeMenu')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--foreground)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navKeys.map((item, index) => (
              <button
                key={item.id}
                ref={index === 0 ? firstMenuItemRef : undefined}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--muted) 8%, transparent)',
                  color: 'var(--foreground)',
                }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: 'var(--accent)', color: '#000' }}
                >
                  {index + 1}
                </span>
                <span className="text-base font-medium">{t(item.key)}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-8">
            <p
              className="text-xs text-center"
              style={{ color: 'var(--muted)' }}
            >
              Portfolio Navigation
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
