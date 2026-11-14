import type { MetadataRoute } from 'next';

/*
  "Ana ekrana ekle" ve Android için uygulama bilgisi.

  İkonlar: "EO", O'nun içinde bir hücre (hero'daki hücrelerden). Sekme
  ikonu src/app/icon.svg ve favicon.ico; iPhone ikonu src/app/apple-icon.png.
  Android'in "maskable" ikonu daire ya da damla biçiminde kırpılabildiği
  için işaret güvenli alana (ortadaki %80) çekilmiş ayrı bir dosya.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Enver Onur Çoğalan · AI Engineer & Mobile Developer',
    short_name: 'Onur Çoğalan',
    description: 'AI Engineer & Mobile Developer. Projeler, deneyimler ve iletişim.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
