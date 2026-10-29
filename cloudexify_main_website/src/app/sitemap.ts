import { MetadataRoute } from 'next';
import { servicesData } from './services/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cloudexify.site';

  const servicesUrls = Object.keys(servicesData).map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...servicesUrls,
  ];
}
