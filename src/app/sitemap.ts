import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/data/site';


export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      // Derleme anı: her yayında güncelleniyor. Elle yazılmış bir tarih
      // içerik değiştikçe eskiyordu.
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
