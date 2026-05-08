import type {ReactNode} from 'react';
import type {Metadata} from 'next';
import {Geist} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '../globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist'
});

export const metadata: Metadata = {
  title: 'GG Software — Fast & affordable web development',
  description:
    'We build web apps and internal tools that actually get delivered. No bloat, no BS, just working software.'
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({locale}));
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

  return (
    <html lang={locale} className={`${geist.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
