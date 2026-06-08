import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // One entry per locale, cross-linked with hreflang alternates so crawlers
  // understand cs/en are the same page in different languages.
  return routing.locales.map(locale => ({
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
}
