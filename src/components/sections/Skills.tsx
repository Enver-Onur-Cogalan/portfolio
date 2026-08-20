'use client';

import { useEffect, useRef, useState } from 'react';
import { skillCategories, trackColor, tint } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from '@/lib/gsap';
import ElectricBorder from '@/components/ui/ElectricBorder';

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  // Elektrik kenarlık yalnızca imlecin üzerinde olduğu kartta çalışır —
  // beş kartta birden animasyon döndürmek boşuna CPU harcıyor.
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container.querySelectorAll('.skill-card'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} id="yetenekler" className="skills-container relative scroll-mt-24">
      <h3
        className="text-2xl font-bold font-heading text-center mb-2"
        style={{ color: 'var(--foreground)' }}
      >
        {t('about.techTitle')}
      </h3>
      <p className="text-sm text-center mb-10" style={{ color: 'var(--muted)' }}>
        {t('about.techSubtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories.map((category) => {
          const color = trackColor[category.track];
          return (
          <div
            key={category.id}
            className={`skill-card flex flex-col ${category.fullWidth ? 'md:col-span-2' : ''}`}
            style={{ position: 'relative', zIndex: hoveredId === category.id ? 10 : 1 }}
            onMouseEnter={() => setHoveredId(category.id)}
            onMouseLeave={() => setHoveredId((prev) => (prev === category.id ? null : prev))}
          >
            <ElectricBorder
              color={color}
              active={hoveredId === category.id}
              chaos={0.09}
              speed={1.1}
              borderRadius={16}
              style={{ flex: 1 }}
            >
              <div
                className="flex-1 rounded-2xl border p-5 sm:p-6"
                style={{
                  background: 'var(--background)',
                  borderColor: tint(color, 45),
                }}
              >
                <h4
                  className="text-xs font-bold uppercase tracking-[0.16em] mb-4"
                  style={{ color }}
                >
                  {t(category.titleKey)}
                </h4>

                <ul className="flex flex-wrap gap-2.5">
                  {/* Zemin/kenarlık/gölge oranları `.neo-chip` içinde tanımlı;
                      bileşen yalnızca hangi hattın rengi olduğunu söylüyor. */}
                  {category.skills.map((skill) => (
                    <li
                      key={skill}
                      tabIndex={0}
                      className="neo-chip text-xs sm:text-sm px-3 py-1.5 rounded-lg font-semibold cursor-default"
                      style={{ '--chip-accent': color } as React.CSSProperties}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </ElectricBorder>
          </div>
          );
        })}
      </div>
    </div>
  );
}
