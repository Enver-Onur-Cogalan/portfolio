'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { tint, type ProjectMedia as Media } from '@/data/portfolio';
import { SITE_URL } from '@/data/site';
import { useLanguage } from '@/context/LanguageContext';

/*
  Proje vitrinindeki kısa video, projenin doğduğu ortamın çerçevesinde:
  telefon, masaüstü penceresi ya da tarayıcı.

  Dosyalar scripts/encode-project-media.sh ile üretiliyor ve
  public/projects/<id>/ altında duruyor.

  Oynatma kuralları:
  · Sayfa açılışında hiçbir şey indirilmiyor (preload="none"); video
    ancak ekrana gelince istenir.
  · Yalnızca ekrandayken oynuyor, çıkınca duruyor.
  · Hareket azaltma tercihi varsa kendiliğinden başlamıyor; poster kalıyor.
  · 5 saniyeden uzun, kendiliğinden oynayan içerik durdurulabilmeli
    (WCAG 2.2.2); köşedeki düğme bunun için.
*/

interface ProjectMediaProps {
  projectId: string;
  title: string;
  media: Media;
}

export default function ProjectMedia({ projectId, title, media }: ProjectMediaProps) {
  const { t } = useLanguage();
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Ziyaretçi durdurduysa, ekrana tekrar gelince kendiliğinden başlamasın
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const video = videoRef.current;
    if (!box || !video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || userPaused) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Sessiz video; tarayıcı yine de reddederse poster kalır
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [userPaused]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  const src = `/projects/${projectId}/demo.mp4`;
  const poster = `/projects/${projectId}/poster.webp`;

  const video = (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      width={media.width}
      height={media.height}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      className="block w-full h-auto"
    />
  );

  const button = (
    <button
      type="button"
      onClick={toggle}
      className="absolute bottom-2.5 right-2.5 z-10 p-2 rounded-full bg-black/55 text-white backdrop-blur-sm transition-opacity opacity-70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: 'var(--secondary)' }}
      aria-label={`${title} — ${playing ? t('projects.media.pause') : t('projects.media.play')}`}
    >
      {playing ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
    </button>
  );

  if (media.frame === 'phone') {
    return (
      <div ref={boxRef} className="relative mx-auto w-[200px] sm:w-[220px]">
        {/* Telefon gövdesi: hero'daki maketin sade hâli */}
        <div
          className="rounded-[2rem] p-[3px]"
          style={{
            background: 'linear-gradient(150deg, #4a4a52 0%, #16161a 28%, #0d0d10 60%, #3a3a42 100%)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
          }}
        >
          <div className="relative rounded-[1.8rem] overflow-hidden bg-black">
            {video}
            {button}
          </div>
        </div>
      </div>
    );
  }

  // Masaüstü penceresi ve tarayıcı: aynı başlık çubuğu, tarayıcıda adres
  const host = new URL(SITE_URL).host;
  return (
    <div
      ref={boxRef}
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${tint('var(--secondary)', 32)}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        background: '#0d0d10',
      }}
    >
      <div className="flex items-center gap-1.5 px-3 h-7" style={{ background: '#16161a' }} aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        {media.frame === 'browser' && (
          <span className="ml-3 flex-1 max-w-[60%] truncate rounded-md px-2.5 py-0.5 text-[10px] text-white/55 bg-white/[0.06]">
            {host}
          </span>
        )}
      </div>
      <div className="relative">
        {video}
        {button}
      </div>
    </div>
  );
}
