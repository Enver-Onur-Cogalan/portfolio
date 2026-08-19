'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Hero'daki telefon maketi. Ekranda fotoğraf, isim ve unvan var.
 * Mobil geliştirici kimliğini doğrudan anlatan bir çerçeve — üstelik
 * tamamen CSS, hiçbir ek bağımlılık gerektirmiyor.
 */
export default function HeroPhone() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Girişte hafifçe belirip yerine otururken, imleç yaklaştıkça
  // yumuşak bir eğim alır. Hareket azaltma tercihinde ikisi de kapalı.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const phone = phoneRef.current;
    if (!wrapper || !phone) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Dönüş eksenlerini önce tanımla: quickTo, üzerinde daha önce
    // değer atanmamış bir özelliği "sıfırlamaya uygun değil" diye
    // uyarıyor ve giriş animasyonuyla çakışıyordu.
    gsap.set(phone, { rotateX: 0, rotateY: 0, transformPerspective: 1200 });

    gsap.fromTo(
      phone,
      { opacity: 0, y: 40, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.6, ease: 'power3.out' }
    );

    const quickX = gsap.quickTo(phone, 'rotateY', { duration: 0.6, ease: 'power2.out' });
    const quickY = gsap.quickTo(phone, 'rotateX', { duration: 0.6, ease: 'power2.out' });

    const onMove = (event: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      quickX(gsap.utils.clamp(-14, 14, dx * 26));
      quickY(gsap.utils.clamp(-10, 10, -dy * 18));
    };

    const onLeave = () => {
      quickX(0);
      quickY(0);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(phone);
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ perspective: '1200px' }}>
      <div
        ref={phoneRef}
        className="relative w-[208px] sm:w-[236px] md:w-[262px] aspect-[9/17.5] rounded-[2.4rem] p-[3px]"
        style={{
          transformStyle: 'preserve-3d',
          // Metal gövde: köşelerden gelen ışık çizgileri
          background: 'linear-gradient(150deg, #4a4a52 0%, #16161a 28%, #0d0d10 60%, #3a3a42 100%)',
          boxShadow:
            '0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Yan tuşlar */}
        <span className="absolute -left-[2px] top-[22%] w-[3px] h-9 rounded-l-sm" style={{ background: 'linear-gradient(90deg,#3f3f47,#1a1a1e)' }} />
        <span className="absolute -left-[2px] top-[33%] w-[3px] h-14 rounded-l-sm" style={{ background: 'linear-gradient(90deg,#3f3f47,#1a1a1e)' }} />
        <span className="absolute -right-[2px] top-[28%] w-[3px] h-16 rounded-r-sm" style={{ background: 'linear-gradient(270deg,#3f3f47,#1a1a1e)' }} />

        {/* Ekran */}
        <div className="relative w-full h-full rounded-[2.15rem] overflow-hidden bg-black">
          <Image
            src="/photo.jpg"
            alt="Enver Onur Çoğalan"
            fill
            priority
            sizes="(max-width: 640px) 208px, (max-width: 768px) 236px, 262px"
            className="object-cover object-top"
          />

          {/* Alt yarıya doğru koyulaşan katman — yazı okunur kalsın */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.92) 100%)',
            }}
          />

          {/* Durum çubuğu */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-2.5 text-[10px] font-semibold text-white/90">
            <span className="tabular-nums">9:41</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              <svg viewBox="0 0 18 12" className="w-3.5 h-2.5" fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="4.5" y="5.5" width="3" height="6.5" rx="1" />
                <rect x="9" y="3" width="3" height="9" rx="1" />
                <rect x="13.5" y="0" width="3" height="12" rx="1" />
              </svg>
              <svg viewBox="0 0 24 12" className="w-5 h-3" fill="none" stroke="currentColor">
                <rect x="0.5" y="1" width="18" height="10" rx="2.5" strokeWidth="1" opacity="0.6" />
                <rect x="2" y="2.5" width="13" height="7" rx="1.5" fill="currentColor" />
                <path d="M21 4.5v3" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              </svg>
            </span>
          </div>

          {/* Dynamic island */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 h-[22px] w-[76px] rounded-full bg-black"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
            aria-hidden="true"
          >
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full" style={{ background: '#14141a', boxShadow: 'inset 0 0 2px rgba(120,180,255,0.5)' }} />
          </div>

          {/* İsim ve unvan */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-7">
            <span className="block h-[3px] w-9 rounded-full mb-3" style={{ background: 'var(--accent)' }} />
            <h1 className="text-white font-heading font-bold text-lg sm:text-xl leading-tight">
              Enver Onur Çoğalan
            </h1>
            <p
              className="mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] leading-snug"
              style={{ color: 'var(--accent)' }}
            >
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Ana ekran göstergesi */}
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-[88px] rounded-full bg-white/45" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
