'use client';

/*
  Çizgi-sanat şeridinin React'teki yeri.

  Çizimin kendisi React'in dışında: `createStrip` kendi SVG'sini kurup
  kendi döngüsünü çeviriyor, bileşen yalnızca ona bir yer açıyor ve
  sökülürken kapatıyor. Sahne kare başına yüzlerce öznitelik yazıyor;
  bunu React ağacından geçirmek hem gereksiz hem pahalı olurdu.
*/
import { useEffect, useMemo, useRef } from 'react';
import { createStrip, type Strip, type StripLabels } from './strip';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollTrigger } from '@/lib/gsap';

/** Kullanıcı kaydırdıktan sonra kameranın beklediği süre. */
const HOLD_MS = 5000;

const STATION_KEYS = [
  'ink.station.lab',
  'ink.station.desk',
  'ink.station.coffee',
  'ink.station.bike',
  'ink.station.gaming',
] as const;

export default function InkStrip() {
  const host = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const strip = useRef<Strip | null>(null);
  const { t } = useLanguage();

  /*
    Durak adları ipucu balonunda ve ekran okuyucuda görünüyor, yani
    sayfanın diline bağlılar. Dil değişince sahne yeniden kurulmuyor —
    kişi yürüdüğü yerde kalıyor, yalnızca metinler değişiyor.
  */
  const labels: StripLabels = useMemo(
    () => ({
      scene: t('ink.scene'),
      stations: STATION_KEYS.map((key) => t(key)),
      action: (name) => t('ink.goTo').replace('{name}', name),
    }),
    [t]
  );
  const first = useRef(labels);

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

    strip.current = createStrip(node, {
      labels: first.current,
      onMove(x, viewW) {
        const max = scroller.scrollWidth - scroller.clientWidth;
        if (max < 8 || performance.now() < hold) return;
        const want = (x / viewW) * scroller.scrollWidth - scroller.clientWidth / 2;
        const to = Math.max(0, Math.min(max, want));
        // Kare başına aradaki farkın bir kısmı: ani sıçrama yerine kayma
        scroller.scrollLeft += (to - scroller.scrollLeft) * 0.06;
      },
    });

    /*
      Şerit sayfaya yaklaşık 170 piksel ekliyor ve bunu React
      bağlandıktan sonra yapıyor. Sayfadaki pin'li bölümler (Hero,
      Hakkımda maskesi) ölçülerini önbelleğe aldığı için ScrollTrigger'a
      haber veriliyor; bölüm bağlantıları zaten hedefi her karede
      yeniden ölçüyor, bu da pin'lerin kendi hesabını güncelliyor.
    */
    ScrollTrigger.refresh();

    return () => {
      scroller.removeEventListener('pointerdown', bump);
      scroller.removeEventListener('wheel', bump);
      strip.current?.destroy();
      strip.current = null;
    };
  }, []);

  useEffect(() => {
    strip.current?.setLabels(labels);
  }, [labels]);

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
