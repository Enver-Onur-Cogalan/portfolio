'use client';

import { useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import Skills from '@/components/sections/Skills';
import { aboutStats, aboutPrinciples } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from '@/lib/gsap';
import { Brain, Code, Coffee } from 'lucide-react';

const statIcons: Record<string, typeof Brain> = {
  '#22C55E': Brain,
  '#3B82F6': Code,
  '#8B5CF6': Coffee,
};

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

    const ctx = gsap.context(() => {
      // Stats cards animation
      const statCards = statsRef.current?.querySelectorAll('.stat-card');
      gsap.fromTo(
        statCards || [],
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Corner glow animation for stat cards
      const glowElements = statsRef.current?.querySelectorAll('.glow-corner');
      glowElements?.forEach((glow) => {
        gsap.set(glow, { opacity: 0 });

        // Continuous corner glow animation
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(glow, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.in',
        })
          .to(glow, {
            opacity: 0.6,
            duration: 1.5,
            ease: 'power1.inOut',
          })
          .to(glow, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
          })
          .to(glow, {
            opacity: 0.3,
            duration: 1,
            ease: 'power1.inOut',
          })
          .to(glow, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
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

    return () => ctx.revert();
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
          {aboutStats.map((stat) => {
            const IconComponent = statIcons[stat.color] || Brain;
            return (
              <div key={stat.labelKey} className="stat-card relative">
                {/* Corner glow effect */}
                <div
                  className="glow-corner absolute -inset-0.5 rounded-2xl pointer-events-none"
                  style={{
                    background: `linear-gradient(45deg, transparent 40%, ${stat.color} 50%, transparent 60%)`,
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 3s ease-in-out infinite',
                  }}
                />

                <div
                  className="relative p-6 rounded-2xl border"
                  style={{
                    background: 'var(--background)',
                    borderColor: `${stat.color}40`,
                  }}
                >
                  <div className="text-center">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${stat.color}15`,
                        border: `1px solid ${stat.color}40`,
                      }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <div
                      className="text-3xl md:text-4xl font-bold font-heading mb-1"
                      style={{ color: stat.color }}
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
                borderColor: 'var(--muted)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg,
                    color-mix(in srgb, var(--accent) 8%, transparent),
                    color-mix(in srgb, var(--secondary) 5%, transparent)
                  )`,
                }}
              />

              {/* Top accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${principle.color}, transparent)`,
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
