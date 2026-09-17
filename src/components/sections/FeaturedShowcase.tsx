'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Project } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';
import { gsap, Flip, ScrollTrigger } from '@/lib/gsap';
import FeaturedProject from '@/components/sections/FeaturedProject';

/*
  Öne çıkan projeler vitrini.

  Bir proje geniş hâlde gösterilir, diğerleri altında tek satır kalır.
  Süre dolunca geniş olan küçülüp sona geçer, sıradaki yukarı çıkıp
  genişler; döngü böyle sürer. İki geniş kartı alt alta koymak ızgarayı
  çok aşağı itiyordu, vitrin aynı alanda ikisini de gösteriyor.

  Otomatik dönen içeriğin bilinen sorunları için sayaç şu durumlarda
  DURUR, koşul kalkınca kaldığı yerden devam eder:
    · imleç vitrinin üzerindeyse          → okuyan kişinin elinden çekilmez
    · klavye odağı vitrinin içindeyse      → sekmeyle gezen kaybolmaz
    · geniş kartın detayları açıksa        → uzun metin yarıda kesilmez
    · vitrin ekranda değilse               → görülmeden dönmez
    · hareket kısıtlıysa                   → hiç otomatik dönmez
  Küçük karta tıklamak her durumda onu hemen öne çıkarır.
*/

const HOLD_SECONDS = 10;
const FLIP_SECONDS = 0.7;

export default function FeaturedShowcase({ projects }: { projects: Project[] }) {
  const { t } = useLanguage();
  const stageRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(() => projects.map((project) => project.id));

  const flipState = useRef<Flip.FlipState | null>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const tallest = useRef(0);

  // Duraklatma sebepleri. Değişimleri yeniden render gerektirmiyor,
  // yalnızca sayacı durdurup başlatıyor; bu yüzden state değil ref.
  const hovered = useRef(false);
  const focused = useRef(false);
  const detailsOpen = useRef(false);
  const visible = useRef(false);
  const reducedMotion = useRef(false);

  const rotates = projects.length > 1;
  const byId = new Map(projects.map((project) => [project.id, project]));

  const syncTimer = useCallback(() => {
    const tween = timer.current;
    if (!tween) return;
    const shouldRun =
      visible.current && !hovered.current && !focused.current && !detailsOpen.current;
    if (shouldRun) tween.resume();
    else tween.pause();
  }, []);

  /*
    Vitrin yüksekliğini şimdiye kadarki en uzun hâline kilitler. Geniş
    kartlar aynı boyda değil; kilit olmasa her değişimde alttaki ızgara
    ve Deneyim bölümü oynar, onların scroll animasyonları da kayardı.
    Yükseklik yalnızca artar — ilk tur en fazla bir kez büyür, sonra
    sabit kalır. Detaylar açıkken ölçülmez, yoksa kapanınca boşluk kalır.
  */
  const lockHeight = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || detailsOpen.current) return;
    const height = stage.offsetHeight;
    if (height > tallest.current) {
      tallest.current = height;
      stage.style.minHeight = `${height}px`;
      ScrollTrigger.refresh();
    }
  }, []);

  const moveTo = useCallback((nextOrder: (prev: string[]) => string[]) => {
    const stage = stageRef.current;
    if (!stage) return;

    const cards = stage.querySelectorAll<HTMLElement>('[data-featured]');
    // Hover yükselmesi Flip'in ölçtüğü konuma karışmasın
    gsap.killTweensOf(cards);
    gsap.set(cards, { y: 0 });

    flipState.current = Flip.getState(cards);
    detailsOpen.current = false;
    timer.current?.kill();
    timer.current = null;
    setOrder(nextOrder);
  }, []);

  const rotate = useCallback(() => {
    moveTo((prev) => [...prev.slice(1), prev[0]]);
  }, [moveTo]);

  const promote = useCallback(
    (id: string) => {
      moveTo((prev) => (prev[0] === id ? prev : [id, ...prev.filter((other) => other !== id)]));
    },
    [moveTo]
  );

  // Her sıra değişiminden sonra: yer değiştirme animasyonu ve yeni sayaç.
  // Layout effect, çünkü Flip yeni DOM'u tarayıcı boyamadan önce ölçmeli.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Burada okunuyor, aşağıdaki useEffect'te değil: layout effect ilk
    // açılışta ondan ÖNCE çalışır ve sayaç bu bilgi olmadan kurulurdu.
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const state = flipState.current;
    flipState.current = null;

    const wideFill = stage.querySelector<HTMLElement>('[data-variant="wide"] .featured-progress');
    stage
      .querySelectorAll<HTMLElement>('[data-variant="compact"] .featured-progress')
      .forEach((fill) => gsap.set(fill, { scaleX: 1 }));

    if (state) {
      /*
        Kartlar yer değiştirirken yolları kesişiyor. Küçülen kart üstte
        kalınca arkasındaki büyüyen kart, yarı saydam zemin ve
        backdrop-blur yüzünden bulanık bir hayalet gibi görünüyordu.
        Büyüyen kart öne alınıyor, küçülen de kesişme anında sönükleşiyor.
      */
      const wideCard = stage.querySelector<HTMLElement>('[data-variant="wide"]');
      const compactCards = stage.querySelectorAll<HTMLElement>('[data-variant="compact"]');
      if (wideCard) gsap.set(wideCard, { zIndex: 2, position: 'relative' });

      Flip.from(state, {
        duration: reducedMotion.current ? 0 : FLIP_SECONDS,
        ease: 'power3.inOut',
        nested: true,
        onComplete: () => {
          if (wideCard) gsap.set(wideCard, { clearProps: 'zIndex' });
          lockHeight();
        },
      });

      if (!reducedMotion.current) {
        gsap.fromTo(
          compactCards,
          { opacity: 1 },
          { opacity: 0.35, duration: FLIP_SECONDS / 2, ease: 'power1.in', yoyo: true, repeat: 1 }
        );
      }

      if (!reducedMotion.current) {
        // Genişleyen kartın içeriği, kart yerine yaklaşınca belirir
        gsap.fromTo(
          stage.querySelectorAll('[data-variant="wide"] .featured-fade'),
          { opacity: 0 },
          { opacity: 1, duration: 0.4, delay: FLIP_SECONDS * 0.55, ease: 'power2.out' }
        );
      }
    }

    if (!rotates || reducedMotion.current || !wideFill) {
      if (wideFill) gsap.set(wideFill, { scaleX: 1 });
      return;
    }

    timer.current = gsap.fromTo(
      wideFill,
      { scaleX: 0 },
      { scaleX: 1, duration: HOLD_SECONDS, ease: 'none', paused: true, onComplete: rotate }
    );
    syncTimer();

    return () => {
      timer.current?.kill();
      timer.current = null;
    };
  }, [order, rotates, rotate, syncTimer, lockHeight]);

  // Vitrinin girişi: kartlar tek tek değil, bütün olarak beliriyor
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(stage, { opacity: 1 });
      return;
    }
    const tween = gsap.fromTo(
      stage,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: stage, start: 'top 85%', toggleActions: 'play none none none' },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  // Duraklatma sebeplerini dinleyen tek seferlik kurulum
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    lockHeight();
    if (!rotates) return;

    // Dokunmatikte "pointerenter" dokununca gelir ama "leave" gelmeyebilir;
    // sayaç sonsuza dek durmasın diye yalnızca fare hover sayılıyor.
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      hovered.current = true;
      syncTimer();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      hovered.current = false;
      syncTimer();
    };
    // Yalnızca klavye odağı sayılıyor. Fareyle bir düğmeye tıklamak da
    // odak bırakır; onu saysaydık sayaç, ziyaretçi başka bir yere
    // tıklayana kadar sebepsizce dururdu.
    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target as Element).matches(':focus-visible')) return;
      focused.current = true;
      syncTimer();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (stage.contains(e.relatedTarget as Node | null)) return;
      focused.current = false;
      syncTimer();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        syncTimer();
      },
      // Düşük eşik: mobilde vitrin ekrandan uzun olabiliyor ve yüksek
      // bir oran hiç yakalanamazsa vitrin hiç dönmezdi.
      { threshold: 0.2 }
    );

    // Genişlik değişince satır kırılımları ve yükseklikler değişir;
    // kilit sıfırlanıp yeniden ölçülüyor.
    let lastWidth = stage.offsetWidth;
    const onResize = () => {
      if (stage.offsetWidth === lastWidth) return;
      lastWidth = stage.offsetWidth;
      tallest.current = 0;
      stage.style.minHeight = '';
      lockHeight();
    };

    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('focusin', onFocusIn);
    stage.addEventListener('focusout', onFocusOut);
    window.addEventListener('resize', onResize);
    observer.observe(stage);

    return () => {
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('focusin', onFocusIn);
      stage.removeEventListener('focusout', onFocusOut);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, [rotates, syncTimer, lockHeight]);

  const handleDetailsChange = useCallback(
    (open: boolean) => {
      detailsOpen.current = open;
      syncTimer();
      // Kapanınca yükseklik yeniden ÖLÇÜLMÜYOR: kapanma geçişi 500 ms
      // sürüyor ve erken ölçüm açık hâlin yüksekliğine kilitlenip vitrinin
      // altında kalıcı bir boşluk bırakıyordu. Kapalı hâlin yüksekliği
      // detay açılmadan önce zaten ölçülmüş oluyor, değişmiyor.
    },
    [syncTimer]
  );

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={t('projects.showcase.label')}
      className="flex flex-col gap-4 mb-5"
      style={{ opacity: 0 }}
    >
      {order.map((id, index) => {
        const project = byId.get(id);
        if (!project) return null;
        return (
          <FeaturedProject
            key={id}
            project={project}
            variant={index === 0 ? 'wide' : 'compact'}
            onPromote={rotates ? () => promote(id) : undefined}
            onDetailsChange={handleDetailsChange}
            entrance={false}
          />
        );
      })}
    </div>
  );
}
