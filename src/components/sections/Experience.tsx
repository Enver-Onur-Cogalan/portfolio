'use client';

import { useEffect, useRef, useState } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import { experiences, type Experience as ExperienceItem } from '@/data/portfolio';
import { gsap } from '@/lib/gsap';
import { useLanguage } from '@/context/LanguageContext';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Vaka çalışmaları varsayılan olarak açık gelir — asıl anlatı orada,
  // kullanıcıyı tıklamaya zorlamanın anlamı yok. Her kart bağımsız açılıp
  // kapanır; iki ayrı iş deneyimi birbirini dışlamaz.
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(experiences.filter((e) => e.caseStudy?.length).map((e) => e.id))
  );

  const toggleCase = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Çeviri yoksa veri dosyasındaki Türkçe metne düş
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Ray, bölüm boyunca yukarıdan aşağı çiziliyor
      if (railRef.current) {
        gsap.fromTo(
          railRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            transformOrigin: 'top center',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 85%',
              scrub: 0.6,
            },
          }
        );
      }

      section.querySelectorAll('.exp-item').forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      section.querySelectorAll('.exp-node').forEach((node) => {
        gsap.fromTo(
          node,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.45,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: node,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper>
      <div ref={sectionRef} id="deneyimler">
        <SectionTitle>{t('experience.title')}</SectionTitle>

        {/* Ray: mobilde sola yapışık, masaüstünde dönem sütununun sağında */}
        <div className="relative">
          <div
            ref={railRef}
            aria-hidden="true"
            className="absolute top-1 bottom-1 w-px left-[7px] md:left-[10.5rem]"
            style={{
              background:
                'linear-gradient(180deg, transparent, color-mix(in srgb, var(--muted) 55%, transparent) 12%, color-mix(in srgb, var(--muted) 55%, transparent) 88%, transparent)',
            }}
          />

          <ol className="space-y-10 md:space-y-14">
            {experiences.map((exp) => (
              <ExperienceRow
                key={exp.id}
                exp={exp}
                tr={tr}
                t={t}
                periodLabel={tr(exp.periodKey, exp.period)}
                isOpen={openIds.has(exp.id)}
                onToggle={() => toggleCase(exp.id)}
              />
            ))}
          </ol>
        </div>
      </div>
    </SectionWrapper>
  );
}

interface RowProps {
  exp: ExperienceItem;
  periodLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  tr: (key: string, fallback: string) => string;
  t: (key: string) => string;
}

function ExperienceRow({ exp, periodLabel, isOpen, onToggle, tr, t }: RowProps) {
  const accent = exp.type === 'work' ? 'var(--accent)' : 'var(--secondary)';
  const isCaseStudy = Boolean(exp.caseStudy?.length);

  const subtitle = tr(`experience.${exp.id}.subtitle`, exp.subtitle);
  const description = tr(`experience.${exp.id}.desc`, exp.description);
  const headline = exp.headline ? tr(`experience.${exp.id}.headline`, exp.headline) : null;

  return (
    <li className="exp-item relative pl-9 md:pl-0 md:flex md:items-start">
      {/* Düğüm — vaka çalışmasında halkalı ve daha iri */}
      <span
        className="exp-node absolute top-1.5 left-[7px] md:left-[10.5rem] -translate-x-1/2 rounded-full z-10"
        style={{
          width: isCaseStudy ? '14px' : '10px',
          height: isCaseStudy ? '14px' : '10px',
          background: accent,
          boxShadow: isCaseStudy
            ? `0 0 0 4px color-mix(in srgb, ${accent} 22%, transparent), 0 0 0 8px var(--background)`
            : `0 0 0 4px var(--background)`,
        }}
        aria-hidden="true"
      />

      {/* Dönem — masaüstünde ayrı sütun */}
      <div className="hidden md:block md:w-[10.5rem] md:shrink-0 md:pr-8 md:text-right md:pt-0.5">
        <span
          className="text-sm font-medium tabular-nums"
          style={{ color: accent }}
        >
          {periodLabel}
        </span>
      </div>

      <div className="md:flex-1 md:min-w-0 md:pl-8">
        <article
          className="exp-card rounded-2xl border p-5 sm:p-6 transition-colors duration-300"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--background) 92%, transparent)',
            borderColor: isCaseStudy
              ? `color-mix(in srgb, ${accent} 35%, transparent)`
              : 'color-mix(in srgb, var(--muted) 35%, transparent)',
          }}
        >
          {/* Dönem — mobilde kartın içinde rozet */}
          <span
            className="md:hidden inline-block mb-3 px-2.5 py-1 rounded-full text-xs font-medium tabular-nums"
            style={{
              background: `color-mix(in srgb, ${accent} 14%, transparent)`,
              color: accent,
            }}
          >
            {periodLabel}
          </span>

          <h3
            className="text-xl sm:text-2xl font-bold font-heading leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {exp.title}
          </h3>

          <p className="text-sm mt-1 font-medium" style={{ color: accent }}>
            {subtitle}
          </p>

          {headline && (
            <p
              className="mt-3 text-base sm:text-lg font-heading leading-snug"
              style={{ color: 'var(--foreground)' }}
            >
              {headline}
            </p>
          )}

          <p
            className="text-sm mt-3 leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {description}
          </p>

          {exp.metrics && exp.metrics.length > 0 && (
            <dl
              className="mt-5 grid grid-cols-3 rounded-xl overflow-hidden border"
              style={{ borderColor: `color-mix(in srgb, ${accent} 25%, transparent)` }}
            >
              {exp.metrics.map((metric, i) => (
                <div
                  key={metric.key}
                  className="px-2 py-3 sm:px-4 sm:py-4 text-center"
                  style={{
                    background: `color-mix(in srgb, ${accent} 7%, transparent)`,
                    borderLeft: i === 0
                      ? undefined
                      : `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
                  }}
                >
                  <dt className="sr-only">
                    {t(`experience.${exp.id}.metric.${metric.key}`)}
                  </dt>
                  <dd>
                    <span
                      className="block text-lg sm:text-2xl font-bold font-heading tabular-nums leading-none"
                      style={{ color: accent }}
                    >
                      {metric.value}
                    </span>
                    <span
                      className="block mt-1.5 text-[10px] sm:text-xs leading-tight"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t(`experience.${exp.id}.metric.${metric.key}`)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {isCaseStudy && (
            <>
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`case-${exp.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 -ml-3 transition-colors hover:bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: accent, outlineColor: accent }}
              >
                {isOpen ? t('experience.collapse') : t('experience.expand')}
                <svg
                  className="w-4 h-4 transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                id={`case-${exp.id}`}
                className="grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="pt-4 space-y-5">
                    {exp.caseStudy!.map((block) => (
                      <div
                        key={block}
                        className="pl-4 border-l-2"
                        style={{ borderColor: `color-mix(in srgb, ${accent} 40%, transparent)` }}
                      >
                        <h4
                          className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
                          style={{ color: accent }}
                        >
                          {t(`experience.block.${block}`)}
                        </h4>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: 'var(--foreground)', opacity: 0.85 }}
                        >
                          {t(`experience.${exp.id}.${block}`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {exp.tech && exp.tech.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {exp.tech.map((item) => (
                <li
                  key={item}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{
                    background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
                    color: 'var(--foreground)',
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </li>
  );
}
