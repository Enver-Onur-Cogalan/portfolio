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
  'https://portfolio-sand-two-79.vercel.app';
