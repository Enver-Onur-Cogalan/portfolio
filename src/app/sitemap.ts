import type { MetadataRoute } from 'next';

const SITE_URL = 'https://portfolio-sand-two-79.vercel.app';

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
