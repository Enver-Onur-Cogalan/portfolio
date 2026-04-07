'use client';

import { useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import { experiences } from '@/data/portfolio';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);

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
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper>
      <div ref={sectionRef} id="deneyimler">
        <SectionTitle>Deneyimler</SectionTitle>
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
                className={`timeline-item relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div
                    className="rounded-2xl p-6 border"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--muted)',
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--accent)' }}
                    >
                      {exp.period}
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
                      {exp.subtitle}
                    </p>
                    <p
                      className="text-sm mt-3"
                      style={{ color: 'var(--muted)' }}
                    >
                      {exp.description}
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
