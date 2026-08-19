'use client';

import { useEffect, useRef } from 'react';
import HeroPhone from '@/components/ui/HeroPhone';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/context/LanguageContext';

interface HeroProps {
  /** Video kaydırması bittiğinde tetiklenir */
  onVideoEnd?: () => void;
}

export default function Hero({ onVideoEnd }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const blackoutRef = useRef<HTMLDivElement>(null);
  const hasLeftRef = useRef(false);
  const { t } = useLanguage();

  // Set correct video source based on device
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mobile = window.innerWidth < 768;
    const correctSrc = mobile ? '/scroll-video-mobile.mp4' : '/scroll-video-opt.mp4';

    if (!video.src.endsWith(correctSrc)) {
      video.src = correctSrc;
      video.load();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const welcome = welcomeRef.current;
    const blackout = blackoutRef.current;

    if (!container || !video || !welcome || !blackout) return;

    const mobile = window.innerWidth < 768;

    video.pause();
    video.currentTime = 0;

    gsap.fromTo(
      welcome,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power2.out' }
    );

    let ctx: gsap.Context;
    let rafId: number;
    let lastProgress = 0;

    const setupScrollTrigger = () => {
      if (!video.duration) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: mobile ? '+=1500' : '+=3000',
          pin: true,
          // Sayfadaki ilk pin — ScrollMask'ten önce ölçülmeli
          refreshPriority: 2,
          scrub: mobile ? 2 : 0.5,
          onUpdate: (self) => {
            // On mobile, skip tiny progress changes to reduce decode calls
            if (mobile && Math.abs(self.progress - lastProgress) < 0.008) return;
            lastProgress = self.progress;

            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              if (video.duration) {
                video.currentTime = self.progress * video.duration;
              }
              gsap.to(welcome, {
                opacity: Math.max(0, 1 - self.progress * 3),
                duration: 0.1,
              });
            });
          },
          onLeave: () => {
            hasLeftRef.current = true;
            blackout.style.opacity = '1';
            video.pause();
            onVideoEnd?.();
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
      video.removeEventListener('loadedmetadata', setupScrollTrigger);
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
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/30" />


      <div
        ref={blackoutRef}
        className="absolute inset-0 bg-background z-20 opacity-0"
      />

      {/*
        Telefon masaüstünde solda duruyor; ortada dursaydı arkadaki videonun
        asıl öznesini (mikroskop) kapatıyordu. Mobilde yan yana yer olmadığı
        için alt alta geçer.
      */}
      <div
        ref={welcomeRef}
        className="absolute inset-0 z-10 opacity-0 px-6 md:px-12"
      >
        <div className="h-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-start gap-7 md:gap-14">
          <HeroPhone />

          <div className="text-center md:text-left">
            <p className="text-2xl sm:text-4xl md:text-6xl font-bold text-white font-heading leading-tight">
              {t('hero.welcome')}
            </p>
            <p className="text-white/70 mt-3 md:mt-5 text-base md:text-lg">
              {t('hero.scroll')}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-white"
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
