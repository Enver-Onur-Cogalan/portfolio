'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface HeroProps {
  onVideoEnd: () => void;
}

export default function Hero({ onVideoEnd }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const welcome = welcomeRef.current;

    if (!container || !video || !welcome) return;

    // Start video paused
    video.pause();
    video.currentTime = 0;

    // Welcome text animation
    gsap.fromTo(
      welcome,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power2.out' }
    );

    let ctx: gsap.Context;

    const setupScrollTrigger = () => {
      if (!video.duration) return;

      ctx = gsap.context(() => {
        // Main scroll trigger for video control
        ScrollTrigger.create({
          trigger: container,
          start: 'top top',
          end: '+=3000',
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            if (video.duration) {
              // Set video currentTime based on scroll progress
              video.currentTime = self.progress * video.duration;
            }
            // Fade welcome text
            gsap.to(welcome, {
              opacity: Math.max(0, 1 - self.progress * 3),
              duration: 0.1,
            });
          },
          onLeave: () => {
            // Video section ended - cleanup
            video.pause();
            onVideoEnd();
          },
        });
      }, container);
    };

    // Wait for video to be ready
    if (video.readyState >= 1) {
      setupScrollTrigger();
    } else {
      video.addEventListener('loadedmetadata', setupScrollTrigger);
    }

    return () => {
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
        src="/scroll-video.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div
        ref={welcomeRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-10"
        style={{ opacity: 0 }}
      >
        <h1 className="text-5xl md:text-7xl font-bold text-white font-heading">
          Hoş Geldiniz
        </h1>
        <p className="text-white/70 mt-4 text-lg">
          Keşfetmek için aşağı kaydır
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
