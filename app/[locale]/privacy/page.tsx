import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Params = {locale: string};

export function generateStaticParams() {
  return routing.locales.map(locale => ({locale}));
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'privacy'});
  return {
    title: t('title'),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: {cs: '/cs/privacy', en: '/en/privacy'}
    },
    robots: {index: true, follow: true}
  };
}

export default async function PrivacyPage({params}: {params: Promise<Params>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('privacy');
  const company = siteConfig.legal.companyName || siteConfig.name;
  const fill = (s: string) =>
    s.replaceAll('{company}', company).replaceAll('{email}', siteConfig.email);

  const sections = t.raw('sections') as {heading: string; body: string}[];

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
          <h1 className="mb-2 text-4xl font-black tracking-tight text-gray-900">{t('title')}</h1>
          <p className="mb-10 text-sm text-gray-400">{t('updated')}</p>

          <p className="mb-10 leading-relaxed text-gray-600">{fill(t('intro'))}</p>

          <div className="flex flex-col gap-8">
            {sections.map(section => (
              <div key={section.heading}>
                <h2 className="mb-2 text-xl font-bold text-gray-900">{section.heading}</h2>
                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                  {fill(section.body)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
