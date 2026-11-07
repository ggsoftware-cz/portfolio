import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['cs', 'en'],
  defaultLocale: 'cs',
  // Match the static root redirect; visitors switch language explicitly.
  localeDetection: false,
  localePrefix: 'always'
});
