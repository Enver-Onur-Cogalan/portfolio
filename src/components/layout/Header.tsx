'use client';

import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
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
          {['Hakkımda', 'Projeler', 'Deneyimler', 'İletişim'].map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace('ı', 'i'))}
              className="text-sm font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--foreground)' }}
            >
              {item}
            </button>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
