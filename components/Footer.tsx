import Image from 'next/image';
import {useTranslations, useLocale} from 'next-intl';
import {siteConfig} from '@/config/site';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const locale = useLocale();

  // Absolute (locale-prefixed) so the links also work from project subpages.
  const links = [
    {label: nav('services'), href: `/${locale}#services`},
    {label: nav('work'), href: `/${locale}#work`},
    {label: nav('pricing'), href: `/${locale}#pricing`},
    {label: nav('about'), href: `/${locale}#about`},
    {label: nav('contact'), href: `/${locale}#contact`}
  ];

  const {legal, social} = siteConfig;
  const hasLegal = legal.companyName || legal.ico || legal.address;

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-10">
          {/* Logo + tagline + contact + legal */}
          <div className="max-w-sm">
            <div className="mb-2">
              <Image src="/logo.svg" width={135} height={36} alt={siteConfig.name} unoptimized />
            </div>
            <p className="text-sm text-gray-500">{t('tagline')}</p>

            <div className="mt-4 flex flex-col gap-1 text-sm">
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors">
                {siteConfig.email}
              </a>
              {siteConfig.phone && (
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.phone}
                </a>
              )}
            </div>

            {hasLegal && (
              <div className="mt-4 text-xs leading-relaxed text-gray-600">
                {legal.companyName && <p>{legal.companyName}</p>}
                {legal.address && <p>{legal.address}</p>}
                {(legal.ico || legal.dic) && (
                  <p>
                    {legal.ico && <>IČO: {legal.ico}</>}
                    {legal.ico && legal.dic && ' · '}
                    {legal.dic && <>DIČ: {legal.dic}</>}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick links */}
          <nav className="flex flex-col gap-2">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-start gap-3">
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            )}
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-800 pt-6 text-xs text-gray-600">
          <span>{t('copyright')}</span>
          <a href={`/${locale}/privacy`} className="hover:text-white transition-colors">
            {t('privacy')}
          </a>
        </div>
      </div>
    </footer>
  );
}
