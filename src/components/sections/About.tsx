'use client';

import { useEffect, useRef } from 'react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import { bio, techStack } from '@/data/portfolio';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bio = bioRef.current;
    const tagsContainer = tagsRef.current;

    if (!section || !bio || !tagsContainer) return;

    const ctx = gsap.context(() => {
      // Bio animation
      gsap.fromTo(
        bio,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bio,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Tech tags staggered animation
      const tags = tagsContainer.querySelectorAll('.tech-tag');
      gsap.fromTo(
        tags,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: tagsContainer,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper>
      <div ref={sectionRef} id="hakkimda">
        <SectionTitle>Hakkımda</SectionTitle>
        <p
          ref={bioRef}
          className="text-lg md:text-xl leading-relaxed mb-12 max-w-3xl"
          style={{ color: 'var(--foreground)', opacity: 0 }}
        >
          {bio}
        </p>
        <div ref={tagsRef} className="flex flex-wrap gap-3">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="tech-tag px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000',
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
