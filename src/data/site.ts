/**
 * Sitenin genel ayarları.
 *
 * Adres tek bir yerde duruyor: metadata, sitemap ve robots.txt buradan
 * okuyor. Alan adı değiştiğinde (örneğin kendi alan adına geçildiğinde)
 * yalnızca bu satır güncellenir.
 *
 * Ortam değişkeni verilmişse o öncelikli; böylece önizleme dağıtımları
 * kendi adreslerini kullanabilir.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://enveronurcogalan.vercel.app';

/**
 * CV dosyaları, dile göre. Hero'daki düğme, İletişim'deki klasör ve
 * önizleme seçili dilin dosyasını gösteriyor. İkisi de sitenin verisinden
 * üretiliyor: npm run cv (scripts/build-cv.ts).
 */
export const CV_FILES = {
  tr: { path: '/cv.pdf', downloadName: 'Enver-Onur-Cogalan-CV.pdf' },
  en: { path: '/cv-en.pdf', downloadName: 'Enver-Onur-Cogalan-CV-EN.pdf' },
} as const;
