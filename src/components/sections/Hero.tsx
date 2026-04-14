'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/context/LanguageContext';

interface HeroProps {
  onVideoEnd: () => void;
}

export default function Hero({ onVideoEnd }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const glassCardRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const hasLeftRef = useRef(false);
  const { t } = useLanguage();

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const welcome = welcomeRef.current;
    const blackout = blackoutRef.current;
    const nameEl = nameRef.current;
    const subtitle = subtitleRef.current;

    if (!container || !video || !welcome || !blackout || !glassCardRef.current) return;

    video.pause();
    video.currentTime = 0;

    gsap.fromTo(
      welcome,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power2.out' }
    );

    gsap.fromTo(
      glassCardRef.current,
      { opacity: 0, x: -50, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 0.8, delay: 0.8, ease: 'power2.out' }
    );

    if (nameEl) {
      const name = 'Enver Onur Çoğalan';
      nameEl.textContent = '';
      const chars = name.split('');
      chars.forEach((char) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'name-char';
        span.style.opacity = '0';
        nameEl.appendChild(span);
      });

      gsap.to('.name-char', {
        opacity: 1,
        duration: 0.05,
        stagger: 0.08,
        delay: 1,
        ease: 'none',
      });
    }

    if (subtitle) {
      const words = subtitle.textContent?.split(' ') || [];
      subtitle.textContent = words.join(' ');

      const glitchWord = () => {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        const randomIndex = Math.floor(Math.random() * words.length);
        const originalWord = words[randomIndex];
        const glitchedWord = originalWord.split('').map(c =>
          Math.random() > 0.7 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c
        ).join('');

        const tempText = words.map((w, i) => i === randomIndex ? glitchedWord : w).join(' ');
        subtitle.textContent = tempText;

        setTimeout(() => {
          subtitle.textContent = words.join(' ');
        }, 150);

        setTimeout(glitchWord, 2000 + Math.random() * 3000);
      };

      setTimeout(glitchWord, 2500);
    }

    let ctx: gsap.Context;
    let rafId: number;

    const setupScrollTrigger = () => {
      if (!video.duration) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: '+=3000',
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              if (video.duration) {
                video.currentTime = self.progress * video.duration;
              }
              gsap.to(welcome, {
                opacity: Math.max(0, 1 - self.progress * 3),
                duration: 0.1,
              });
              gsap.to(glassCardRef.current, {
                opacity: Math.max(0, 1 - self.progress * 3),
                duration: 0.1,
              });
            });
          },
          onLeave: () => {
            hasLeftRef.current = true;
            blackout.style.opacity = '1';
            video.pause();
            onVideoEnd();
          },
          onEnterBack: () => {
            hasLeftRef.current = false;
            blackout.style.opacity = '0';
          },
          onLeaveBack: () => {
            hasLeftRef.current = false;
          },
        });
      }, container);
    };

    if (video.readyState >= 1) {
      setupScrollTrigger();
    } else {
      video.addEventListener('loadedmetadata', setupScrollTrigger);
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, [onVideoEnd]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen"
      style={{ backgroundColor: '#000' }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/scroll-video-opt.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div
        ref={blackoutRef}
        className="absolute inset-0 bg-background z-20 opacity-0"
      />

      <div
        ref={welcomeRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-0"
      >
        <div
          ref={glassCardRef}
          className="glass-card relative px-8 py-5 rounded-2xl border border-white/20 backdrop-blur-md mb-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.05)',
          }}
        >
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/30 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/30 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/30 rounded-br-xl" />

          <h2
            ref={nameRef}
            className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading text-white tracking-wide text-center"
          />

          <p
            ref={subtitleRef}
            className="text-sm md:text-base text-[var(--accent)] tracking-widest uppercase mt-1 text-center"
          >
            {t('hero.subtitle')}
          </p>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white font-heading">
          {t('hero.welcome')}
        </h1>
        <p className="text-white/70 mt-8 text-lg">
          {t('hero.scroll')}
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
