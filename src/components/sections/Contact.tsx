'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Eye, X, ExternalLink } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionTitle from '@/components/ui/SectionTitle';
import SocialLinks from '@/components/ui/SocialLinks';
import Folder from '@/components/ui/Folder';
import { socialLinks } from '@/data/portfolio';
import { useLanguage } from '@/context/LanguageContext';

const CV_PATH = '/cv.pdf';
const CV_DOWNLOAD_NAME = 'Enver-Onur-Cogalan-CV.pdf';

export default function Contact() {
  const { t } = useLanguage();
  const [previewOpen, setPreviewOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Önizleme açıkken sayfa kaymasın, Escape kapatsın, odak içeride başlasın
  useEffect(() => {
    if (!previewOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = setTimeout(() => closeButtonRef.current?.focus(), 100);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(focusTimer);
    };
  }, [previewOpen]);

  const paperFace = (icon: React.ReactNode, text: string) => (
    <span className="flex flex-col items-center justify-center gap-1 text-[#0A0A0A]">
      <span aria-hidden="true">{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider">{text}</span>
    </span>
  );

  const paperClass =
    'w-full h-full flex items-center justify-center rounded-[10px] focus-visible:outline-none';

  return (
    <SectionWrapper>
      <div id="iletisim" className="text-center">
        <SectionTitle>{t('contact.title')}</SectionTitle>

        <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
          {t('contact.desc')}
        </p>

        {/* CV klasörü — açılınca kâğıtlar yukarı doğru açıldığı için
            üstte onlara yer bırakılıyor, yoksa açıklama metnine biniyorlar */}
        <div className="flex flex-col items-center pt-36 pb-10 mb-10">
          <Folder
            color="var(--accent)"
            size={1.5}
            label={t('resume.folderLabel')}
            openLabel={t('resume.folderOpen')}
            closeLabel={t('resume.folderClose')}
            items={[
              <a
                key="download"
                href={CV_PATH}
                download={CV_DOWNLOAD_NAME}
                className={paperClass}
                style={{ outlineColor: 'var(--accent)' }}
              >
                {paperFace(<Download className="w-4 h-4" />, t('resume.download'))}
              </a>,
              <button
                key="preview"
                type="button"
                onClick={() => setPreviewOpen(true)}
                className={paperClass}
                style={{ outlineColor: 'var(--accent)' }}
              >
                {paperFace(<Eye className="w-4 h-4" />, t('resume.preview'))}
              </button>,
            ]}
          />
        </div>

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

      {/* Önizleme — tablet çerçevesi içinde PDF */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPreviewOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('resume.preview')}
        >
          <div
            className="relative w-full max-w-4xl h-[86vh] rounded-[1.6rem] p-2 sm:p-3"
            style={{
              background: 'linear-gradient(150deg,#4a4a52 0%,#16161a 30%,#0d0d10 65%,#3a3a42 100%)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="absolute top-1/2 -translate-y-1/2 left-[7px] w-[5px] h-[5px] rounded-full"
              style={{ background: '#2a2a30' }}
              aria-hidden="true"
            />

            {/* iframe, <object>'e göre daha güvenilir: object fallback içeriği
                varken bazı tarayıcılar gömülü görüntüleyiciyi hiç yüklemeyip
                boş bir alan bırakıyordu. */}
            <div className="relative w-full h-full rounded-[1.1rem] overflow-hidden bg-white">
              <iframe
                src={CV_PATH}
                title={t('resume.preview')}
                className="w-full h-full border-0"
              />
            </div>

            {/* PDF'i sayfa içinde gösteremeyen tarayıcılar için her zaman
                erişilebilir bir çıkış yolu */}
            <a
              href={CV_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap"
              style={{ background: 'var(--accent)', color: '#0A0A0A' }}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              {t('resume.openNewTab')}
            </a>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: 'var(--accent)', color: '#0A0A0A', outlineColor: 'var(--accent)' }}
              aria-label={t('resume.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
