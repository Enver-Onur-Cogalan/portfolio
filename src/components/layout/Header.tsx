'use client';

import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/context/LanguageContext';

const navKeys = [
  { key: 'nav.about', id: 'hakkimda' },
  { key: 'nav.projects', id: 'projeler' },
  { key: 'nav.experience', id: 'deneyimler' },
  { key: 'nav.contact', id: 'iletisim' },
];

export default function Header() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
      style={{ backgroundColor: 'rgba(var(--background), 0.8)', backdropFilter: 'blur(10px)' }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <nav className="hidden md:flex gap-6">
          {navKeys.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--foreground)' }}
            >
              {t(item.key)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
