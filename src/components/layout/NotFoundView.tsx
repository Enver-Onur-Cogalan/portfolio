'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Oyun ancak "Oyna"ya basılınca indiriliyor; 404'ün açılışını yavaşlatmıyor
const BikeGame = dynamic(() => import('@/components/game/BikeGame'), { ssr: false });

/** 404 içeriği; dili bildiği için istemci bileşeni. */
export default function NotFoundView() {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const links = [
    { href: '/', label: t('notFound.home'), primary: true },
    { href: '/#projeler', label: t('nav.projects') },
    { href: '/#iletisim', label: t('nav.contact') },
  ];

  return (
    <section className="min-h-[100svh] flex items-center justify-center px-6 pt-20 pb-28">
      <div className="max-w-2xl w-full text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- 2 KB SVG, logo ile aynı dosya */}
        <img src="/icon.svg" alt="" width={56} height={56} className="mx-auto mb-8 rounded-2xl" />
        <p className="font-heading font-bold text-7xl md:text-8xl tracking-tight" style={{ color: 'var(--accent)' }}>
          404
        </p>
        <h1 className="mt-4 font-heading font-bold text-2xl md:text-3xl text-balance" style={{ color: 'var(--foreground)' }}>
          {t('notFound.title')}
        </h1>
        <p className="mt-4 text-base md:text-lg text-pretty" style={{ color: 'var(--muted)' }}>
          {t('notFound.desc')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={
                link.primary
                  ? { background: 'var(--accent)', color: '#05140b' }
                  : { border: '1.5px solid var(--accent)', color: 'var(--foreground)' }
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mini oyun: 404'ün düzenine dokunmadan altta, basılınca açılıyor */}
        <div className="mt-14 w-full">
          {playing ? (
            <BikeGame onClose={() => setPlaying(false)} />
          ) : (
            <div
              className="rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
              style={{ border: '1.5px dashed color-mix(in srgb, var(--foreground) 25%, transparent)' }}
            >
              <div className="flex-1">
                <p className="font-heading font-bold" style={{ color: 'var(--foreground)' }}>
                  {t('game.teaserTitle')}
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  {t('game.teaserDesc')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 shrink-0"
                style={{ background: 'var(--accent)', color: '#05140b' }}
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                {t('game.play')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
