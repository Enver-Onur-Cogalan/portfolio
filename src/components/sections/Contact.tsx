'use client';

import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import SocialLinks from '@/components/ui/SocialLinks';
import { socialLinks } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();
  return (
    <SectionWrapper>
      <div id="iletisim" className="text-center">
        <SectionTitle>{t('contact.title')}</SectionTitle>
        <p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          style={{ color: 'var(--muted)' }}
        >
          {t('contact.desc')}
        </p>
        <a
          href={`mailto:${socialLinks.email}`}
          className="inline-block px-8 py-4 rounded-full text-lg font-medium mb-12 transition-transform hover:scale-105"
          style={{ backgroundColor: 'var(--accent)', color: '#000' }}
        >
          {socialLinks.email}
        </a>
        <div className="flex justify-center">
          <SocialLinks />
        </div>
        <footer
          className="mt-20 pt-8 border-t text-sm"
          style={{ borderColor: 'var(--muted)', color: 'var(--muted)' }}
        >
          <p>&copy; {new Date().getFullYear()} Enver Onur Çoğalan. {t('contact.footer')}</p>
        </footer>
      </div>
    </SectionWrapper>
  );
}
