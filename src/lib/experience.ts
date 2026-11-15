import type { Experience } from '@/data/portfolio';
import { translate, type Language } from '@/i18n/translations';

/**
 * Bir deneyimin şehri ve çalışma biçimi, verilen dilde. Site kartı,
 * bot ve CV aynı yerden okuyor; biçimlendirme her birinin kendisinde
 * ("Hong Kong · Remote", "Hong Kong (Remote)").
 */
export function experiencePlace(lang: Language, e: Experience): { city: string; mode: string | null } | null {
  if (!e.location) return null;
  const key = `experience.${e.id}.location`;
  const city = translate(lang, key);
  return {
    city: city === key ? e.location : city,
    mode: e.mode ? translate(lang, `experience.mode.${e.mode}`) : null,
  };
}
