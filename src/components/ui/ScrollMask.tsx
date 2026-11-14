'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export type ScrollMaskVariant = 'iris' | 'wipe' | 'curtain' | 'slats' | 'grid';

interface ScrollMaskProps {
  children: ReactNode;
  /** Maskenin açılma biçimi */
  variant?: ScrollMaskVariant;
  /** Açılma için gereken kaydırma mesafesi (ekran yüksekliği katı) */
  scrollLength?: number;
  /** Kenar yumuşaklığı, yüzde */
  feather?: number;
  /** slats için şerit, grid için sütun sayısı */
  columns?: number;
  /** grid için satır sayısı */
  rows?: number;
  /** wipe yönü, derece */
  angle?: number;
  /** Parçalar arası gecikme yayılımı (0–0.9) */
  stagger?: number;
  /** Kaydırma ile maske arasındaki yumuşatma; 0 = anlık */
  smooth?: number;
  /**
   * Kaydırmayı yok sayıp maskeyi verilen ilerlemede (0–1) dondurur.
   * Yalnızca geliştirme ve görsel doğrulama içindir.
   */
  frozenProgress?: number;
}

/**
 * Kaydırma ilerledikçe üstteki örtüyü açarak altındaki bölümü ortaya çıkarır.
 *
 * Yaklaşım: içeriği maskelemek yerine üstüne arka plan renginde bir örtü
 * koyup onu açıyoruz. Böylece içerik hiçbir zaman yeniden boyanmıyor,
 * yalnızca örtünün parçaları hareket ediyor — bu da animasyonu GPU'da
 * ucuz tutuyor. Örtü açılırken bölüm sabitlenir (pin), açılma bitince
 * sayfa normal akışına döner.
 */
export default function ScrollMask({
  children,
  variant = 'iris',
  scrollLength = 1.6,
  feather = 12,
  columns = 9,
  rows = 6,
  angle = 108,
  stagger = 0.5,
  smooth = 0.4,
  frozenProgress,
}: ScrollMaskProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const overlay = overlayRef.current;
    if (!wrapper || !overlay) return;

    // Hareket duyarlılığı: örtüyü hiç göstermeyip içeriği doğrudan bırak
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      overlay.style.display = 'none';
      return;
    }

    // Parçalar DOM'dan okunuyor. Ref dizisi ile toplandığında variant
    // değişimlerinde eski girdiler dizide kalıyor ve eşleşme bozuluyordu.
    // data-order, grid'in merkezden dışa açılma sırasını taşır.
    const pieces = Array.from(
      overlay.querySelectorAll<HTMLElement>('[data-piece]')
    ).sort(
      (a, b) => Number(a.dataset.order ?? 0) - Number(b.dataset.order ?? 0)
    );

    // Bir parçanın kendi ilerlemesi — stagger, parçaları zamana yayar
    const pieceProgress = (progress: number, index: number, count: number) => {
      if (count <= 1) return progress;
      const spread = Math.min(Math.max(stagger, 0), 0.9);
      const start = (index / (count - 1)) * spread;
      return gsap.utils.clamp(0, 1, (progress - start) / (1 - spread));
    };

    const apply = (progress: number) => {
      switch (variant) {
        case 'iris': {
          // Ortadan açılan dairesel delik
          const radius = progress * 150;
          const mask = `radial-gradient(circle at 50% 50%, transparent ${radius}%, black ${radius + feather}%)`;
          overlay.style.maskImage = mask;
          overlay.style.webkitMaskImage = mask;
          break;
        }
        case 'wipe': {
          const edge = progress * (100 + feather) - feather;
          const mask = `linear-gradient(${angle}deg, transparent ${edge}%, black ${edge + feather}%)`;
          overlay.style.maskImage = mask;
          overlay.style.webkitMaskImage = mask;
          break;
        }
        case 'curtain':
        case 'slats':
        case 'grid': {
          pieces.forEach((piece, index) => {
            const local = pieceProgress(progress, index, pieces.length);
            if (variant === 'curtain') {
              piece.style.transform = `translateX(${index === 0 ? -local * 100 : local * 100}%)`;
            } else if (variant === 'slats') {
              piece.style.transform = `scaleY(${1 - local})`;
            } else {
              piece.style.transform = `scale(${1 - local})`;
              piece.style.opacity = `${1 - local}`;
            }
          });
          break;
        }
      }
    };

    // Geliştirme/doğrulama yolu: kaydırmayı yok sayıp maskeyi sabitler
    if (frozenProgress !== undefined) {
      apply(gsap.utils.clamp(0, 1, frozenProgress));
      return;
    }

    apply(0);

    // Bölüm, maske açılırken ekranda sabit tutulur (pin). Pin olmadan
    // sayfa açılma boyunca kaymaya devam ediyor ve maske tamamlandığında
    // bölümün başlığı çoktan ekranın üstünde kalmış oluyordu.
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        // Fonksiyon olarak veriliyor: ekran yeniden boyutlandığında
        // (telefonu yatırmak, pencereyi büyütmek) mesafe yeniden hesaplanır.
        end: () => `+=${scrollLength * window.innerHeight}`,
        invalidateOnRefresh: true,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        // Sayfada birden fazla pin varsa GSAP'in bunları yukarıdan aşağıya
        // sırayla ölçmesi gerekir. Hero daha yukarıda olduğu için ondan
        // düşük bir öncelik alıyoruz.
        refreshPriority: 1,
        scrub: smooth,
        onUpdate: (self) => apply(self.progress),
        onLeave: () => {
          overlay.style.visibility = 'hidden';
        },
        onEnterBack: () => {
          overlay.style.visibility = 'visible';
        },
      });
    }, wrapper);

    // Pin, kendisinden sonraki her şeyin sayfa konumunu kaydırır. İçerideki
    // diğer ScrollTrigger'lar (istatistik kartları, yetenek kartları) bu
    // kaymayı hesaba katmadan ölçüm yaptığı için bölüm geçişlerinde
    // bozulma oluyordu; kurulum bittikten sonra hepsini yeniden ölçtürüyoruz.
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 0);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [variant, scrollLength, feather, columns, rows, angle, stagger, smooth, frozenProgress]);

  // grid parçaları merkeze olan uzaklığa göre sıralanır; böylece açılma
  // rastgele değil, dışa doğru yayılan bir dalga gibi ilerler.
  const gridPieces = Array.from({ length: columns * rows }, (_, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const dx = col - (columns - 1) / 2;
    const dy = row - (rows - 1) / 2;
    return { i, col, row, distance: Math.hypot(dx, dy) };
  });
  const gridOrder = [...gridPieces].sort((a, b) => a.distance - b.distance);
  const orderIndex = new Map(gridOrder.map((piece, order) => [piece.i, order]));

  return (
    <div ref={wrapperRef} className="relative">
      {children}

      {/*
        Bölüm pin ile sabitlendiği için örtü doğrudan ilk ekranı kaplar.
      */}
      <div
        ref={overlayRef}
        data-mask-overlay=""
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-screen z-30 pointer-events-none overflow-hidden"
      >
        {(variant === 'iris' || variant === 'wipe') && (
          <div className="absolute inset-0" style={{ background: 'var(--background)' }} />
        )}

        {variant === 'curtain' &&
          [0, 1].map((side) => (
            <div
              key={side}
              data-piece=""
              data-order={side}
              className="absolute top-0 bottom-0 w-1/2 will-change-transform"
              style={{
                background: 'var(--background)',
                left: side === 0 ? 0 : '50%',
              }}
            />
          ))}

        {variant === 'slats' &&
          Array.from({ length: columns }, (_, i) => (
            <div
              key={i}
              data-piece=""
              data-order={i}
              className="absolute top-0 bottom-0 will-change-transform"
              style={{
                background: 'var(--background)',
                left: `${(i * 100) / columns}%`,
                width: `${100 / columns + 0.2}%`,
                transformOrigin: i % 2 === 0 ? 'top' : 'bottom',
              }}
            />
          ))}

        {variant === 'grid' &&
          gridPieces.map(({ i, col, row }) => (
            <div
              key={i}
              data-piece=""
              data-order={orderIndex.get(i) ?? i}
              className="absolute will-change-transform"
              style={{
                background: 'var(--background)',
                left: `${(col * 100) / columns}%`,
                top: `${(row * 100) / rows}%`,
                width: `${100 / columns + 0.3}%`,
                height: `${100 / rows + 0.3}%`,
              }}
            />
          ))}
      </div>
    </div>
  );
}
