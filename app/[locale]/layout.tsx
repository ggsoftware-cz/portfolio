import type {ReactNode} from 'react';
import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';
import '../globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist'
});

const OG_LOCALE: Record<string, string> = {cs: 'cs_CZ', en: 'en_US'};

export function generateStaticParams() {
  return routing.locales.map(locale => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'meta'});

  const ogImage = {
    url: '/opengraph-image.png',
    width: 1200,
    height: 630,
    alt: t('ogImageAlt')
  };

  return {
    metadataBase: new URL(siteConfig.url),
    title: {default: t('title'), template: t('titleTemplate')},
    description: t('description'),
    keywords: t('keywords'),
    applicationName: siteConfig.name,
    authors: [{name: siteConfig.name, url: siteConfig.url}],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    alternates: {
      canonical: `/${locale}`,
      languages: {cs: '/cs', en: '/en', 'x-default': '/cs'}
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: t('title'),
      description: t('description'),
      url: `${siteConfig.url}/${locale}`,
      locale: OG_LOCALE[locale],
      alternateLocale: locale === 'cs' ? 'en_US' : 'cs_CZ',
      images: [ogImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },
    formatDetection: {telephone: false, email: false, address: false}
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as 'cs' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({locale, namespace: 'meta'});

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        email: siteConfig.email,
        logo: `${siteConfig.url}/icon.svg`,
        image: `${siteConfig.url}/opengraph-image.png`,
        description: t('description')
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        publisher: {'@id': `${siteConfig.url}/#organization`},
        inLanguage: locale
      }
    ]
  };

  return (
    <html lang={locale} className={`${geist.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
