'use client';

import { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({ children, className = '' }: SectionWrapperProps) {
  return (
    <section className={`min-h-screen py-20 px-6 md:px-12 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
