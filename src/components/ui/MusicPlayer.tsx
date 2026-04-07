'use client';

import { useState, useRef, useEffect } from 'react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/portfolio-music.mp3');
      audioRef.current.loop = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-6 right-6 p-3 rounded-full z-50 transition-all hover:scale-110"
      style={{
        backgroundColor: isPlaying ? 'var(--accent)' : 'var(--muted)',
        color: 'var(--background)',
      }}
      aria-label={isPlaying ? 'Stop music' : 'Play music'}
    >
      {isPlaying ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-4 6v12l10-6z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 13.223l-2.016 1.194V8.583l2.016 1.194v3.446zm-4 0l-2 1.194V8.583l2 1.194v3.446z" />
        </svg>
      )}
    </button>
  );
}
