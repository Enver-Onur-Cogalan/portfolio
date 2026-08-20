'use client';

import { useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import Skills from '@/components/sections/Skills';
import { aboutStats, aboutPrinciples, tint } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from '@/lib/gsap';
import { Brain, Code, Coffee } from 'lucide-react';

// Eskiden bu eşleme hex renk koduyla anahtarlanıyordu; renk değişince
// sessizce bozulan bir bağdı. Artık verideki `icon` alanına bakıyor.
const statIcons = { brain: Brain, code: Code, coffee: Coffee } as const;

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // Hareket duyarlılığı olan ziyaretçide animasyonlar atlanır; içerik
    // doğrudan görünür kalır (Skills bileşeniyle aynı davranış).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // GSAP context yalnızca kendi tween'lerini geri alır; elle eklenen
    // DOM dinleyicileri burada toplanıp effect sökülürken kaldırılıyor.
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      /*
        İstatistik kartları. Eskiden kartların üzerinde sonsuz döngüde
        bir köşe parıltısı vardı: sürekli oynuyor ama hiçbir şey
        anlatmıyordu, dikkati sayıdan çalıyordu. Yerine göze girdiği anda
        bir kez çalışan iki hareket var:
          1. Sayı sıfırdan gerçek değerine sayıyor.
          2. Accent kenarlık soldan sağa çizilerek beliriyor.
        İkisi de içerikle ilgili; bitince kart sabit duruyor.
      */
      const statCards = statsRef.current?.querySelectorAll('.stat-card');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      tl.fromTo(
        statCards || [],
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' }
      );

      // Kenarlığın çizilmesi: aynı köşe yarıçapına sahip ikinci bir
      // çerçeve, clip-path ile soldan sağa açılıyor.
      const outlines = statsRef.current?.querySelectorAll('.stat-outline');
      if (outlines?.length) {
        tl.fromTo(
          outlines,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.7, stagger: 0.12, ease: 'power2.inOut' },
          '-=0.25'
        );
      }

      // Sayaç. '1+' gibi son ekler korunuyor; '∞' gibi sayısal olmayan
      // değerler sayılmaz, onun yerine kısa bir ölçek vuruşu alır.
      statsRef.current?.querySelectorAll<HTMLElement>('.stat-value').forEach((el, index) => {
        const raw = el.dataset.value ?? '';
        const digits = raw.match(/\d+/)?.[0];

        if (!digits) {
          tl.fromTo(
            el,
            { scale: 0.6, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' },
            0.3 + index * 0.12
          );
          return;
        }

        const target = Number(digits);
        const counter = { value: 0 };
        el.textContent = raw.replace(digits, '0');

        tl.to(
          counter,
          {
            value: target,
            duration: 0.9,
            ease: 'power2.out',
            snap: { value: 1 },
            onUpdate: () => {
              el.textContent = raw.replace(digits, String(Math.round(counter.value)));
            },
          },
          0.25 + index * 0.12
        );
      });

      /*
        İmleci takip eden ışık. `quickTo` her harekette yeni tween
        kurmak yerine tek bir tween'i güncelliyor; pointermove sık
        tetiklendiği için fark ölçülebilir.
      */
      statsRef.current?.querySelectorAll<HTMLElement>('.stat-card').forEach((card) => {
        const glow = card.querySelector<HTMLElement>('.stat-glow');
        const dot = card.querySelector<HTMLElement>('.stat-glow__dot');
        if (!glow || !dot) return;

        const moveX = gsap.quickTo(dot, 'x', { duration: 0.45, ease: 'power3.out' });
        const moveY = gsap.quickTo(dot, 'y', { duration: 0.45, ease: 'power3.out' });

        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          moveX(event.clientX - rect.left);
          moveY(event.clientY - rect.top);
        };
        const onEnter = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          // İlk konumu anında ver, yoksa ışık kartın köşesinden kayarak geliyor
          gsap.set(dot, { x: event.clientX - rect.left, y: event.clientY - rect.top });
          gsap.to(glow, { opacity: 1, duration: 0.3, ease: 'power2.out' });
        };
        const onLeave = () => {
          gsap.to(glow, { opacity: 0, duration: 0.4, ease: 'power2.out' });
        };

        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          card.removeEventListener('pointerenter', onEnter);
          card.removeEventListener('pointermove', onMove);
          card.removeEventListener('pointerleave', onLeave);
        });
      });

      // Bio animation
      gsap.fromTo(
        bioRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bioRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Principles cards animation
      const principleCards = principlesRef.current?.querySelectorAll('.principle-card');
      gsap.fromTo(
        principleCards || [],
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: principlesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

    }, section);

    return () => {
      cleanups.forEach((remove) => remove());
      ctx.revert();
    };
  }, []);

  return (
    <SectionWrapper>
      <div ref={sectionRef} id="hakkimda">
        <SectionTitle>{t('about.title')}</SectionTitle>

        {/* Stats Cards */}
        <div
          ref={statsRef}
          className="grid grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {/*
            Üç kart eskiden üç ayrı renk taşıyordu; bu sayılar farklı
            hatları temsil etmediği için renk burada bilgi değil gürültüydü.
            Artık hepsi tek accent kullanıyor, kartları birbirinden ayıran
            şey ikon ve sayı.
          */}
          {aboutStats.map((stat) => {
            const IconComponent = statIcons[stat.icon];
            return (
              <div key={stat.labelKey} className="stat-card relative">
                {/*
                  Çizilen kenarlık. Kartın kendi kenarlığı sönük duruyor;
                  bu ikinci çerçeve accent renginde ve clip-path ile
                  açılıyor. Hareket kısıtlıysa GSAP hiç çalışmaz ve
                  çerçeve olduğu gibi görünür — varsayılanı açık.
                */}
                <div
                  className="stat-outline absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ border: `1.5px solid var(--accent)` }}
                />

                <div
                  className="relative p-6 rounded-2xl border overflow-hidden"
                  style={{
                    background: 'var(--background)',
                    borderColor: tint('var(--muted)', 30),
                  }}
                >
                  {/*
                    İmleci takip eden ışık. Konumu transform ile sürülüyor
                    (CSS değişkeni yerine), böylece GSAP'ın quickTo'su
                    doğrudan GPU üzerinde çalışıyor.
                  */}
                  <div
                    className="stat-glow absolute inset-0 pointer-events-none opacity-0"
                    aria-hidden="true"
                  >
                    <div
                      className="stat-glow__dot absolute w-44 h-44 -ml-22 -mt-22 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${tint(
                          'var(--accent)',
                          30
                        )}, transparent 70%)`,
                      }}
                    />
                  </div>

                  <div className="relative text-center">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{
                        background: tint('var(--accent)', 16),
                        border: `1px solid ${tint('var(--accent)', 45)}`,
                      }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div
                      className="stat-value text-3xl md:text-4xl font-bold font-heading mb-1 tabular-nums"
                      data-value={stat.value}
                      style={{ color: 'var(--foreground)' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm opacity-60">{t(stat.labelKey)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Biyografi — metin paragraflara bölünüp okunur genişlikte sunulur */}
        <div
          ref={bioRef}
          className="mb-16 max-w-3xl mx-auto"
        >
          <div className="space-y-5 mb-10">
            {t('about.bio')
              .split('\n\n')
              .map((paragraph, index) =>
                index === 0 ? (
                  <p
                    key={index}
                    className="text-2xl md:text-3xl font-bold font-heading text-center"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {paragraph}
                  </p>
                ) : (
                  <p
                    key={index}
                    className="text-base md:text-lg leading-relaxed"
                    style={{ color: 'var(--foreground)', opacity: 0.82 }}
                  >
                    {paragraph}
                  </p>
                )
              )}
          </div>

          {/* Signature element */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16" style={{ background: 'var(--accent)' }} />
            <span className="text-2xl" style={{ color: 'var(--accent)' }}>✦</span>
            <div className="h-px w-16" style={{ background: 'var(--accent)' }} />
          </div>
        </div>

        {/* Principles / Philosophy Cards */}
        <div ref={principlesRef} className="grid md:grid-cols-3 gap-6 mb-20">
          {aboutPrinciples.map((principle) => (
            <div
              key={principle.titleKey}
              className="principle-card group relative p-6 rounded-2xl border cursor-pointer"
              style={{
                background: 'var(--background)',
                borderColor: tint('var(--muted)', 35),
              }}
            >
              {/* Hover parıltısı */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: tint('var(--accent)', 10) }}
              />

              {/*
                Üst şerit. Eskiden karta göre değişen tam doygunlukta bir
                renkti; artık nötr duruyor ve yalnızca imleç kartın
                üzerindeyken accent'e dönüyor.
              */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full transition-colors duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tint(
                    'var(--muted)',
                    50
                  )}, transparent)`,
                }}
              />
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, var(--accent), transparent)`,
                }}
              />

              <div className="relative z-10 pt-4">
                <h4
                  className="text-lg font-bold mb-3 font-heading"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t(principle.titleKey)}
                </h4>
                <p className="text-sm opacity-70 italic">&ldquo;{t(principle.quoteKey)}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>

        <Skills />
      </div>
    </SectionWrapper>
  );
}
