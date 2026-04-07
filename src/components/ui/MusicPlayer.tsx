'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { musicLyrics } from '@/data/music';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [currentLyric, setCurrentLyric] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const lyricRef = useRef<HTMLSpanElement>(null);
  const prevLyricIndexRef = useRef(-1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioRef.current = new Audio('/portfolio-music.mp3');
    audioRef.current.loop = true;

    audioRef.current.addEventListener('timeupdate', () => {
      if (!audioRef.current || !audioRef.current.duration) return;

      const time = audioRef.current.currentTime;
      setProgress((time / audioRef.current.duration) * 100);
      setCurrentTime(time);

      const currentIdx = musicLyrics.findIndex((lyric, idx) => {
        const nextLyric = musicLyrics[idx + 1];
        return time >= lyric.time && (!nextLyric || time < nextLyric.time);
      });

      if (currentIdx !== -1 && currentIdx !== prevLyricIndexRef.current) {
        prevLyricIndexRef.current = currentIdx;
        setCurrentLyricIndex(currentIdx);
        setCurrentLyric(musicLyrics[currentIdx].text);
      }
    });

    audioRef.current.addEventListener('loadedmetadata', () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    });

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (showCard && cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [showCard]);

  useEffect(() => {
    if (showInfo && infoRef.current) {
      gsap.fromTo(infoRef.current,
        { opacity: 0, y: 10, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );

      const timeout = setTimeout(() => {
        gsap.to(infoRef.current, {
          opacity: 0,
          y: 10,
          scale: 0.9,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => setShowInfo(false),
        });
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [showInfo]);

  useEffect(() => {
    if (!barsRef.current) return;

    const bars = barsRef.current.querySelectorAll('.sound-bar');
    let animation: gsap.core.Tween;

    if (isPlaying) {
      animation = gsap.to(bars, {
        scaleY: () => Math.random() * 0.6 + 0.4,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: 0.05,
      });
    } else {
      gsap.to(bars, {
        scaleY: 0.3,
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0.03,
      });
    }

    return () => {
      if (animation) animation.kill();
    };
  }, [isPlaying]);

  useEffect(() => {
    if (lyricRef.current && currentLyric) {
      // Premium fade-in with scale and blur
      gsap.fromTo(lyricRef.current,
        {
          opacity: 0,
          y: 15,
          scale: 0.85,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
        }
      );
    }
  }, [currentLyric]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const toggleCard = useCallback(() => {
    if (showCard) {
      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 20,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setShowCard(false),
      });
    } else {
      setShowCard(true);
      setShowInfo(false);
    }
  }, [showCard]);

  const toggleInfo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCard && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        gsap.to(cardRef.current, {
          opacity: 0,
          scale: 0.8,
          y: 20,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => setShowCard(false),
        });
        setShowInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCard]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Info Tooltip */}
      <div
        ref={infoRef}
        className={`absolute bottom-full right-0 mb-3 px-5 py-4 rounded-2xl text-sm leading-relaxed transition-all duration-300 ${
          showInfo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          minWidth: '280px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 60,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: 'var(--accent)', color: '#000' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p>Bu şarkı Enver Onur Çoğalan tarafından Suno AI ile oluşturuldu.</p>
        </div>
      </div>

      {/* Music Player Card */}
      <div
        ref={cardRef}
        className={`absolute bottom-full right-0 mb-3 w-80 rounded-3xl p-5 transition-all duration-300 ${
          showCard ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          opacity: showCard ? 1 : 0,
          transform: showCard ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
          zIndex: 50,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated Sound Bars */}
            <div ref={barsRef} className="flex items-end gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="sound-bar w-1.5 rounded-full"
                  style={{
                    height: '24px',
                    backgroundColor: 'var(--accent)',
                    transformOrigin: 'bottom',
                    transform: `scaleY(0.3)`,
                  }}
                />
              ))}
            </div>
            <div>
              <p className="font-semibold text-base">Portfolio Music</p>
            </div>
          </div>

          {/* Info Button */}
          <button
            onClick={toggleInfo}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
            style={{
              backgroundColor: showInfo ? 'var(--accent)' : 'rgba(128, 128, 128, 0.3)',
              color: '#000',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Lyrics Section */}
        <div
          className="h-20 rounded-2xl mb-4 px-4 py-3 flex items-center justify-center text-center"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
        >
          <span
            ref={lyricRef}
            className="text-sm font-medium px-2"
            style={{ color: currentLyric ? '#22C55E' : 'var(--background)', opacity: currentLyric ? 1 : 0.4 }}
          >
            {currentLyric || '♪ Müzik başladığında sözler burada gözükecek ♪'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="h-1 rounded-full overflow-hidden cursor-pointer"
            style={{ backgroundColor: 'rgba(128, 128, 128, 0.3)' }}
            onClick={handleProgressClick}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: 'var(--accent)',
                transition: 'width 0.1s linear'
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs opacity-60" style={{ color: 'var(--background)' }}>{formatTime(currentTime)}</span>
            <span className="text-xs opacity-60" style={{ color: 'var(--background)' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={skipBackward}
            className="p-2 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--background)' }}
            title="10 saniye geri"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>
          <button
            onClick={toggleMusic}
            className="p-4 rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000',
              boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
            }}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={skipForward}
            className="p-2 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--background)' }}
            title="10 saniye ileri"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Button */}
      <button
        onClick={toggleCard}
        className="p-4 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
        style={{
          backgroundColor: isPlaying ? 'var(--accent)' : 'var(--muted)',
          color: isPlaying ? '#000' : '#fff',
          boxShadow: isPlaying
            ? '0 8px 30px rgba(34, 197, 94, 0.4)'
            : '0 8px 30px rgba(0,0,0,0.3)',
        }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 13.223l-2.016 1.194V8.583l2.016 1.194v3.446zm-4 0l-2 1.194V8.583l2 1.194v3.446z" />
        </svg>
      </button>
    </div>
  );
}
