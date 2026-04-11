'use client';

import { socialLinks } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';

const socialData = [
  {
    href: socialLinks.medium,
    label: 'Medium',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0124 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 0120.96 12zm.38-6.68c-.08-1.78-.96-2.66-2.64-2.66h-2.08V12h2.32c1.86 0 2.48-.9 2.48-2.34v-.34zm-.32 3.44c0 .9-.42 1.36-1.24 1.36h-1.84V8.94h2.04c.82 0 1.24.46 1.24 1.36v.9z" />
      </svg>
    ),
    color: 'var(--foreground)',
    tooltip: 'Medium',
  },
  {
    href: socialLinks.github,
    label: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    color: 'var(--foreground)',
    tooltip: 'GitHub',
  },
  {
    href: socialLinks.linkedin,
    label: 'LinkedIn',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: 'var(--foreground)',
    tooltip: 'LinkedIn',
  },
  {
    href: `mailto:${socialLinks.email}`,
    label: 'Email',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'var(--foreground)',
    tooltipKey: 'social.email',
  },
];

export default function SocialLinks() {
  const { t } = useLanguage();
  return (
    <div className="flex gap-6">
      {socialData.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center gap-2"
          aria-label={social.label}
        >
          {/* Icon */}
          <div
            className="p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            style={{
              backgroundColor: 'var(--muted)',
              color: 'var(--background)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            }}
          >
            {social.icon}
          </div>
          {/* Tooltip */}
          <span
            className="absolute -bottom-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap px-2 py-1 rounded bg-black/80 text-white"
          >
            {social.tooltipKey ? t(social.tooltipKey) : social.tooltip}
          </span>
        </a>
      ))}
    </div>
  );
}
