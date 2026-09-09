'use client';

import { useEffect, useRef, useState } from 'react';
import { tint, type Project } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';
import { gsap } from '@/lib/gsap';

/*
  Öne çıkan proje kartı.

  Diğer proje kartları tek cümlelik işleri anlatıyor; bu kart bir tek
  cümleye sığmayan iş için var. Yapı Deneyim bölümündeki vaka çalışması
  kalıbının aynısı — metrikler her zaman görünür, Problem/Yaklaşım/Sonuç
  bir tıklama arkasında. Böylece kart bölümü ezmiyor ama derinlik kayıp
  da olmuyor.

  Renk Projeler'in mavisinde kalıyor: ızgaradaki kartlarla aynı hue,
  ayrıcalığı renk değil boyut ve içerik veriyor.
*/
export default function FeaturedProject({ project }: { project: Project }) {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    /*
      Kart ve metrikler `opacity: 0` ile başlıyor çünkü açılışlarını GSAP
      sürüyor. Hareket kısıtlıysa animasyon hiç kurulmuyor — o durumda
      görünürlüğü elle vermezsek kart kalıcı olarak görünmez kalırdı.
    */
    const metrics = card.querySelectorAll('.featured-metric');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set([card, ...metrics], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
      });

      tl.fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });

      // Metrikler kart yerine oturduktan sonra tek tek beliriyor.
      tl.fromTo(
        metrics,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
        '-=0.25'
      );
    }, card);

    return () => ctx.revert();
  }, []);

  const label = (suffix: string) => t(`projects.${project.id}.${suffix}`);

  return (
    <article
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden bg-background/60 backdrop-blur-md mb-5"
      style={{ opacity: 0, border: `1px solid ${tint('var(--secondary)', 32)}` }}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, var(--secondary), var(--navy))' }}
      />

      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-md mb-3"
              style={{
                background: tint('var(--secondary)', 14),
                border: `1px solid ${tint('var(--secondary)', 42)}`,
                color: 'var(--secondary)',
              }}
            >
              {t('projects.featured.badge')}
            </span>
            <h3
              className="text-3xl sm:text-4xl font-bold font-heading tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              {project.title}
            </h3>
            {project.headline && (
              <p
                className="mt-2 text-base sm:text-lg font-medium"
                style={{ color: 'var(--secondary)' }}
              >
                {label('headline')}
              </p>
            )}
          </div>

          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-2.5 rounded-xl transition-transform duration-300 hover:scale-110"
            style={{
              background: tint('var(--secondary)', 14),
              border: `1px solid ${tint('var(--secondary)', 42)}`,
            }}
            aria-label={`${project.title} GitHub`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>

        <p
          className="text-sm sm:text-base leading-relaxed max-w-3xl"
          style={{ color: 'var(--foreground)', opacity: 0.85 }}
        >
          {label('desc')}
        </p>

        {project.metrics && project.metrics.length > 0 && (
          <dl className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.metrics.map((metric) => (
              <div
                key={metric.key}
                className="featured-metric rounded-xl p-4"
                style={{
                  background: tint('var(--secondary)', 8),
                  border: `1px solid ${tint('var(--secondary)', 28)}`,
                }}
              >
                <dt
                  className="text-2xl sm:text-3xl font-bold font-heading tabular-nums"
                  style={{ color: 'var(--secondary)' }}
                >
                  {metric.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug" style={{ color: 'var(--muted)' }}>
                  {label(`metric.${metric.key}`)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {project.caseStudy && project.caseStudy.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls={`case-${project.id}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 -ml-3 transition-colors hover:bg-[color-mix(in_srgb,var(--muted)_10%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: 'var(--secondary)', outlineColor: 'var(--secondary)' }}
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

            {/*
              Yükseklik yerine `grid-template-rows` geçişi: içeriğin
              yüksekliğini önceden ölçmeye gerek kalmıyor ve metin
              uzunluğu dile göre değiştiğinde animasyon bozulmuyor.
            */}
            <div
              id={`case-${project.id}`}
              className="grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="pt-4 space-y-5 max-w-3xl">
                  {project.caseStudy.map((block) => (
                    <div
                      key={block}
                      className="pl-4 border-l-2"
                      style={{ borderColor: tint('var(--secondary)', 40) }}
                    >
                      <h4
                        className="text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5"
                        style={{ color: 'var(--secondary)' }}
                      >
                        {t(`experience.block.${block}`)}
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--foreground)', opacity: 0.85 }}
                      >
                        {label(block)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{
                background: tint('var(--secondary)', 14),
                border: `1px solid ${tint('var(--secondary)', 40)}`,
                color: 'var(--foreground)',
              }}
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
