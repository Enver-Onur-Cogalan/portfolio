'use client';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2
      className={`text-4xl md:text-5xl font-bold mb-12 font-heading ${className}`}
      style={{ color: 'var(--foreground)' }}
    >
      {children}
    </h2>
  );
}
