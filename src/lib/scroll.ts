'use client';

/*
  Bölüme yumuşak kaydırma.

  Neden özel bir fonksiyon: sayfada GSAP `pin` kullanan bölümler var
  (Hero videosu ve Hakkımda'yı açan maske). Pin devreye girdiğinde altındaki
  her şeyin sayfa konumu kayıyor. Hedef konumu kaydırmaya başlamadan önce
  bir kez hesaplarsak, yukarıdan gelirken yanlış yere iniyoruz — çünkü
  hesaplama anında pin henüz çözülmemiş oluyor.

  Bu yüzden hedef HER KAREDE yeniden ölçülüyor, animasyon bitince de kısa
  bir yerleşme turu son farkı kapatıyor.
*/

const HEADER_GAP = 16;

function headerOffset(): number {
  const header = document.querySelector('header');
  return (header?.getBoundingClientRect().height ?? 0) + HEADER_GAP;
}

function targetFor(element: HTMLElement): number {
  return Math.max(0, element.getBoundingClientRect().top + window.scrollY - headerOffset());
}

function settle(element: HTMLElement, frame: number): void {
  const diff = targetFor(element) - window.scrollY;
  if (Math.abs(diff) < 2 || frame > 40) return;
  window.scrollTo(0, window.scrollY + diff * 0.2);
  requestAnimationFrame(() => settle(element, frame + 1));
}

export function scrollToSection(id: string, duration = 1600): void {
  const element = document.getElementById(id);
  if (!element) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetFor(element));
    return;
  }

  const startY = window.scrollY;
  const startTime = performance.now();
  const easeInOutCubic = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const target = targetFor(element);
    window.scrollTo(0, startY + (target - startY) * easeInOutCubic(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      settle(element, 0);
    }
  };

  requestAnimationFrame(step);
}
