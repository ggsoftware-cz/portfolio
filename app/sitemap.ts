import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';
import {projects} from '@/config/projects';

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // One entry per locale, cross-linked with hreflang alternates so crawlers
  // understand cs/en are the same page in different languages.
  const home: MetadataRoute.Sitemap = routing.locales.map(locale => ({
    url: `${siteConfig.url}/${locale}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: {
        cs: `${siteConfig.url}/cs`,
        en: `${siteConfig.url}/en`
      }
    }
  }));

  const work: MetadataRoute.Sitemap = routing.locales.flatMap(locale =>
    projects.map(project => ({
      url: `${siteConfig.url}/${locale}/work/${project.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          cs: `${siteConfig.url}/cs/work/${project.slug}`,
          en: `${siteConfig.url}/en/work/${project.slug}`
        }
      }
    }))
  );

  const privacy: MetadataRoute.Sitemap = routing.locales.map(locale => ({
    url: `${siteConfig.url}/${locale}/privacy`,
    lastModified,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
    alternates: {
      languages: {
        cs: `${siteConfig.url}/cs/privacy`,
        en: `${siteConfig.url}/en/privacy`
      }
    }
  }));

  return [...home, ...work, ...privacy];
}
