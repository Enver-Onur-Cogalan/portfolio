'use client';

import { useLanguage } from '@/context/LanguageContext';

/**
 * Klavyeyle gezinen için "içeriğe geç" bağlantısı. Kök düzen sunucu
 * bileşeni olduğu için metni oradan çeviremiyorduk ve İngilizce
 * ziyaretçiye de Türkçe görünüyordu; dili bilen bu küçük bileşen var.
 */
export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#hakkimda"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--accent)] focus:text-black focus:font-medium"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
