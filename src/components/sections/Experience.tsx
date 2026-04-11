'use client';

import { useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import { experiences } from '@/data/portfolio';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useLanguage } from '@/context/LanguageContext';

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll('.timeline-item');
      items.forEach((item, index) => {
        const isFromRight = index % 2 === 1;
        gsap.fromTo(
          item,
          { opacity: 0, x: isFromRight ? 60 : -60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Wind sway animation - flag in the wind effect (on hover)
        const card = item.querySelector('.experience-card');
        if (card) {
          let tween: gsap.core.Tween | null = null;

          card.addEventListener('mouseenter', () => {
            tween = gsap.to(card, {
              x: 18,
              skewX: 6,
              duration: 0.6,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            });
          });

          card.addEventListener('mouseleave', () => {
            if (tween) {
              tween.kill();
            }
            gsap.to(card, {
              x: 0,
              skewX: 0,
              duration: 0.4,
              ease: 'power2.out',
            });
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const expTranslations: Record<string, { subtitle: string; desc: string }> = {
    'Ege Üniversitesi': { subtitle: t('experience.ege.subtitle'), desc: t('experience.ege.desc') },
    'Patika+ React Native Bootcamp': { subtitle: t('experience.patika.subtitle'), desc: t('experience.patika.desc') },
    'Appisode': { subtitle: t('experience.appisode.subtitle'), desc: t('experience.appisode.desc') },
    'Envagro': { subtitle: t('experience.current.subtitle'), desc: t('experience.current.desc') },
  };

  const periodTranslations: Record<string, string> = {
    '2020 - 2024': t('exp.period.2020-2024'),
    '2025': t('exp.period.2025'),
    'Ağustos 2025 - Eylül 2025': t('exp.period.aug-sep-2025'),
    'Aralık 2025 - Devam Ediyor': t('exp.period.dec-present'),
  };

  return (
    <SectionWrapper>
      <div ref={sectionRef} id="deneyimler">
        <SectionTitle>{t('experience.title')}</SectionTitle>
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full"
            style={{ backgroundColor: 'var(--muted)' }}
          />
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className={`timeline-item relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div
                    className="experience-card rounded-2xl p-6 border transition-transform duration-300"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--muted)',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--accent)' }}
                    >
                      {periodTranslations[exp.period] || exp.period}
                    </span>
                    <h3
                      className="text-xl font-bold mt-1 font-heading"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {exp.title}
                    </h3>
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--secondary)' }}
                    >
                      {expTranslations[exp.title]?.subtitle || exp.subtitle}
                    </p>
                    <p
                      className="text-sm mt-3"
                      style={{ color: 'var(--muted)' }}
                    >
                      {expTranslations[exp.title]?.desc || exp.description}
                    </p>
                  </div>
                </div>
                {/* Timeline dot */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10"
                  style={{
                    backgroundColor: exp.type === 'work' ? 'var(--accent)' : 'var(--secondary)',
                    borderColor: 'var(--background)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
