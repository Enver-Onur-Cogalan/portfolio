'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

/*
  Sayfa içindeki bir hata. Menü, tema ve dil (kök düzen) ayakta kalıyor;
  yalnızca içerik yerine bu görünüyor. `retry` içeriği yeniden çekip
  yeniden çizmeyi deniyor.
*/
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { t } = useLanguage();

  useEffect(() => {
    // Üretimde mesaj gizli; digest sunucu kayıtlarıyla eşleştirmek için
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[100svh] flex items-center justify-center px-6 pt-20 pb-16">
      <div className="max-w-xl text-center">
        <h1 className="font-heading font-bold text-2xl md:text-3xl" style={{ color: 'var(--foreground)' }}>
          {t('error.title')}
        </h1>
        <p className="mt-4 text-base md:text-lg" style={{ color: 'var(--muted)' }}>
          {t('error.desc')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ background: 'var(--accent)', color: '#05140b' }}
          >
            {t('error.retry')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ border: '1.5px solid var(--accent)', color: 'var(--foreground)' }}
          >
            {t('notFound.home')}
          </Link>
        </div>
      </div>
    </section>
  );
}
