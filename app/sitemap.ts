import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';
import {projects} from '@/config/projects';

// Required for `output: export` — emit a static sitemap.xml at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Include canonical public pages, not the root redirect or shared design
  // fragments. Add new public routes here when they are introduced.
  const paths = ['', '/configure', '/pricing', ...projects.map(project => `/work/${project.slug}`), '/privacy'];

  return paths.flatMap(path => {
    const languages = Object.fromEntries(
      routing.locales.map(locale => [locale, `${siteConfig.url}/${locale}${path}`])
    );

    // Omit lastModified until we have real per-page content dates. A build's
    // timestamp is not evidence that every page changed. Google ignores
    // priority and changeFrequency, so neither is needed here.
    return routing.locales.map(locale => ({
      url: languages[locale],
      alternates: {
        languages: {
          ...languages,
          'x-default': languages[routing.defaultLocale]
        }
      }
    }));
  });
}
