'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Download } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';
import { scrollToSection as smoothScrollToSection, scrollToTop } from '@/lib/scroll';
import { CV_PATH, CV_DOWNLOAD_NAME } from '@/data/site';

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
        className="fixed top-0 left-0 right-0 z-40 px-3 py-1.5 md:px-6 md:py-4"
        style={{ backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)', backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Hamburger Button - Mobile Only */}
          <button
            ref={hamburgerRef}
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: 'color-mix(in srgb, var(--muted) 20%, transparent)' }}
            aria-label={t('nav.menu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
              style={{ backgroundColor: 'var(--foreground)' }}
            />
            <span
              className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
              style={{ backgroundColor: 'var(--foreground)' }}
            />
            <span
              className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
              style={{ backgroundColor: 'var(--foreground)' }}
            />
          </button>

          {/*
            Logo: favicon'la aynı dosya (src/app/icon.svg), ikisi hep
            birebir aynı. Tıklanınca sayfanın başına dönüyor.
          */}
          <button
            type="button"
            onClick={() => {
              scrollToTop();
              setIsMenuOpen(false);
            }}
            className="ml-2 md:ml-0 md:mr-8 shrink-0 rounded-lg transition-transform hover:scale-105 active:scale-95"
            aria-label={t('nav.home')}
            title={t('nav.home')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 2 KB SVG; Image optimizasyonu gerekmiyor */}
            <img src="/icon.svg" alt="" width={32} height={32} className="block w-8 h-8 md:w-9 md:h-9 rounded-lg" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 mr-auto">
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

          <div className="flex items-center gap-2 md:gap-3">
            {/* CV: hero'daki dolgulu düğmeyle yarışmasın diye çerçeveli */}
            <a
              href={CV_PATH}
              download={CV_DOWNLOAD_NAME}
              className="inline-flex items-center gap-1.5 h-9 md:h-11 px-3 md:px-4 rounded-full text-xs md:text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]"
              style={{ border: '1.5px solid var(--accent)', color: 'var(--foreground)' }}
              aria-label={t('nav.resumeDownload')}
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: 'var(--accent)' }} aria-hidden="true" />
              {t('nav.resume')}
            </a>
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
              {t('nav.footer')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
