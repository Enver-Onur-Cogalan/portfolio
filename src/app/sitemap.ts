import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/data/site';


export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date('2026-08-19'),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
