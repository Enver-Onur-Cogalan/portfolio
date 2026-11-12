'use client';

/*
  Çizgi-sanat şeridinin React'teki yeri.

  Çizimin kendisi React'in dışında: `createStrip` kendi SVG'sini kurup
  kendi döngüsünü çeviriyor, bileşen yalnızca ona bir yer açıyor ve
  sökülürken kapatıyor. Sahne kare başına yüzlerce öznitelik yazıyor;
  bunu React ağacından geçirmek hem gereksiz hem pahalı olurdu.
*/
import { useEffect, useRef } from 'react';
import { createStrip } from './strip';

/** Kullanıcı kaydırdıktan sonra kameranın beklediği süre. */
const HOLD_MS = 5000;

export default function InkStrip() {
  const host = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    const scroller = box.current;
    if (!node || !scroller) return;

    /*
      Dar ekranda kamera kişiyi takip ediyor.

      900 birimlik şerit telefon genişliğine sıkıştırılınca figür otuz
      piksele iniyor; ne giydiği ne yaptığı okunuyor. Bu yüzden şerit
      en az 680 piksel ve taşan kısım yatayda kayıyor. Ama kaydırmayı
      tümüyle ziyaretçiye bırakınca kişi ilk duraktan sonra görüş
      alanından çıkıp dönene kadar kayboluyordu — bant boş bir
      mobilya sırasına dönüyordu.

      Takip yumuşak ve ısrarsız: ziyaretçi şeridi eline aldığı anda
      kamera beş saniye kenara çekiliyor. Geniş ekranda kayacak yer
      olmadığı için hiç çalışmıyor.
    */
    let hold = 0;
    const bump = (): void => {
      hold = performance.now() + HOLD_MS;
    };
    scroller.addEventListener('pointerdown', bump);
    scroller.addEventListener('wheel', bump, { passive: true });

    const close = createStrip(node, {
      onMove(x, viewW) {
        const max = scroller.scrollWidth - scroller.clientWidth;
        if (max < 8 || performance.now() < hold) return;
        const want = (x / viewW) * scroller.scrollWidth - scroller.clientWidth / 2;
        const to = Math.max(0, Math.min(max, want));
        // Kare başına aradaki farkın bir kısmı: ani sıçrama yerine kayma
        scroller.scrollLeft += (to - scroller.scrollLeft) * 0.06;
      },
    });

    return () => {
      scroller.removeEventListener('pointerdown', bump);
      scroller.removeEventListener('wheel', bump);
      close();
    };
  }, []);

  return (
    <div
      ref={box}
      className="mb-20 overflow-x-auto overflow-y-hidden rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ border: '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)' }}
    >
      <div ref={host} className="min-w-[680px]" />
    </div>
  );
}
