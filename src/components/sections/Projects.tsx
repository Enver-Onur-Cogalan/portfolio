'use client';

import { useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import { projects } from '@/data/portfolio';
import { gsap } from '@/lib/gsap';
import { useLanguage } from '@/context/LanguageContext';

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll('.project-card');

      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Card hover lift animation + dot pulse
      cards.forEach((card) => {
        const dot = card.querySelector('.status-dot');
        const githubLink = card.querySelector('.github-link');
        const githubIcon = card.querySelector('.github-link svg');

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -8,
            duration: 0.4,
            ease: 'power2.out',
          });
          // Dot pulse animation
          if (dot) {
            gsap.to(dot, {
              opacity: 1,
              duration: 0.8,
              yoyo: true,
              repeat: -1,
              ease: 'power1.inOut',
            });
          }
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.5)',
          });
          // Stop dot animation
          if (dot) {
            gsap.killTweensOf(dot);
            gsap.to(dot, {
              opacity: 0.3,
              duration: 0.3,
            });
          }
        });

        // GitHub icon hover animation (only when hovering the link itself)
        if (githubLink && githubIcon) {
          githubLink.addEventListener('mouseenter', () => {
            gsap.to(githubIcon, {
              rotation: 10,
              duration: 0.1,
              yoyo: true,
              repeat: -1,
              ease: 'power1.inOut',
              transformOrigin: 'center center',
            });
          });
          githubLink.addEventListener('mouseleave', () => {
            gsap.killTweensOf(githubIcon);
            gsap.to(githubIcon, {
              rotation: 0,
              duration: 0.3,
            });
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleTitleHover = (e: React.MouseEvent<HTMLHeadingElement>, isEnter: boolean) => {
    const title = e.currentTarget;
    const letters = title.querySelectorAll('.title-letter');

    if (isEnter) {
      gsap.to(letters, {
        x: () => gsap.utils.random(-35, 35),
        y: () => gsap.utils.random(-20, 20),
        rotation: () => gsap.utils.random(-30, 30),
        opacity: 0.4,
        scale: () => gsap.utils.random(0.8, 1.2),
        duration: 0.4,
        stagger: {
          amount: 0.25,
          from: 'random',
        },
        ease: 'power3.out',
      });
    } else {
      gsap.to(letters, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.02,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  };

  const projectDescKeys: Record<string, string> = {
    'Portfolio': 'projects.portfolio.desc',
    'Jarvis': 'projects.jarvis.desc',
    'ChatApp': 'projects.chatapp.desc',
    'MovieApp': 'projects.movieapp.desc',
  };

  return (
    <SectionWrapper>
      <div ref={sectionRef} id="projeler">
        <SectionTitle>{t('projects.title')}</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, index) => {
            const accentColors = ['#22C55E', '#3B82F6', '#8B5CF6'];
            const accent = accentColors[index % accentColors.length];

            return (
              <div
                key={project.title}
                className="project-card group relative bg-background/60 backdrop-blur-md rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  opacity: 0,
                  border: `1px solid ${accent}20`,
                }}
              >
                {/* Top colored bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }}
                />

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      {/* Status dot */}
                      <span
                        className="status-dot w-2.5 h-2.5 rounded-full opacity-30"
                        style={{ background: accent }}
                      />
                      <h3
                        className="text-2xl font-bold font-heading tracking-tight"
                        style={{ color: 'var(--foreground)' }}
                        onMouseEnter={(e) => handleTitleHover(e, true)}
                        onMouseLeave={(e) => handleTitleHover(e, false)}
                      >
                        {project.title.split('').map((letter, i) => (
                          <span
                            key={i}
                            className="title-letter inline-block"
                            style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
                          >
                            {letter === ' ' ? '\u00A0' : letter}
                          </span>
                        ))}
                      </h3>
                    </div>

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="github-link p-2 rounded-xl transition-all duration-300 hover:scale-110"
                      style={{
                        background: `${accent}10`,
                        border: `1px solid ${accent}30`,
                      }}
                      aria-label={`${project.title} GitHub`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </a>
                  </div>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: 'var(--muted)' }}
                  >
                    {t(projectDescKeys[project.title]) || project.description}
                  </p>

                  {/* Tech Stack - Full display */}
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{
                          background: `${accent}12`,
                          border: `1px solid ${accent}25`,
                          color: 'var(--foreground)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                  style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
