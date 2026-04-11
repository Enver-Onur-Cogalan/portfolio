'use client';

import { useTheme } from '@/context/ThemeContext';
import { gsap } from '@/lib/gsap';
import { useEffect, useRef } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconContainerRef.current) return;

    const sunIcon = iconContainerRef.current.querySelector('.sun-icon');
    const moonIcon = iconContainerRef.current.querySelector('.moon-icon');

    if (theme === 'light') {
      gsap.set(sunIcon, { scale: 1, rotate: 0, opacity: 1 });
      gsap.set(moonIcon, { scale: 0, rotate: -180, opacity: 0 });
    } else {
      gsap.set(sunIcon, { scale: 0, rotate: 180, opacity: 0 });
      gsap.set(moonIcon, { scale: 1, rotate: 0, opacity: 1 });
    }
  }, [theme]);

  const handleToggle = () => {
    if (!buttonRef.current || !iconContainerRef.current) {
      toggleTheme();
      return;
    }

    const sunIcon = iconContainerRef.current.querySelector('.sun-icon');
    const moonIcon = iconContainerRef.current.querySelector('.moon-icon');

    const tl = gsap.timeline();

    // 360° rotate pulse
    tl.to(buttonRef.current, {
      rotate: 360,
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
    })
    .to(buttonRef.current, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.in',
    });

    // Sun morphs to Moon or vice versa
    if (theme === 'light') {
      // Sun → Moon
      tl.to(sunIcon, {
        scale: 0,
        rotate: 180,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      }, '-=0.3')
      .to(moonIcon, {
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }, '-=0.2')
      .call(() => toggleTheme());
    } else {
      // Moon → Sun
      tl.to(moonIcon, {
        scale: 0,
        rotate: -180,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      }, '-=0.3')
      .to(sunIcon, {
        scale: 1,
        rotate: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.7)',
      }, '-=0.2')
      .call(() => toggleTheme());
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className="p-2 rounded-full transition-all hover:scale-110"
      style={{ backgroundColor: 'var(--muted)', color: 'var(--background)' }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div ref={iconContainerRef} className="relative w-5 h-5">
        {/* Sun Icon */}
        <svg
          className="sun-icon absolute inset-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {/* Moon Icon */}
        <svg
          className="moon-icon absolute inset-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>
    </button>
  );
}
