import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {Check} from 'lucide-react';
import {routing} from '@/i18n/routing';
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
  const t = await getTranslations({locale, namespace: 'pricingPage.meta'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: {cs: '/cs/pricing', en: '/en/pricing', 'x-default': '/cs/pricing'}
    },
    robots: {index: true, follow: true}
  };
}

export default async function PricingPage({params}: {params: Promise<Params>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pricingPage');
  const tp = await getTranslations('pricing');

  const tiers = ['landing', 'webapp', 'custom'] as const;
  const included = t.raw('included') as string[];
  const terms = t.raw('terms') as {title: string; body: string}[];
  const faq = t.raw('faq') as {q: string; a: string}[];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {'@type': 'Answer', text: item.a}
    }))
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqJsonLd)}}
      />
      <main className="bg-white">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pb-12 pt-32 sm:px-6">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900">{t('h1')}</h1>
          <p className="mb-2 leading-relaxed text-gray-600">{t('intro')}</p>
          <p className="text-sm text-gray-400">{t('updated')}</p>
        </section>

        {/* Tier cards — reuses the homepage pricing strings (single source of truth) */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-black text-gray-900">{t('tiersTitle')}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {tiers.map(key => {
                const features = tp.raw(`tiers.${key}.features`) as string[];
                return (
                  <div
                    key={key}
                    className="flex flex-col rounded-2xl p-7 border border-gray-100 shadow-sm bg-white"
                  >
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {tp(`tiers.${key}.name`)}
                    </p>
                    <p className="text-3xl font-black text-gray-900">{tp(`tiers.${key}.price`)}</p>
                    <ul className="flex flex-col gap-2.5 mt-6 flex-1">
                      {features.map((f: string) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <Check size={15} className="mt-0.5 shrink-0 text-brand" strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What is always included */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-black text-gray-900">{t('includedTitle')}</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {included.map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check size={16} className="mt-0.5 shrink-0 text-brand" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-black text-gray-900">{t('termsTitle')}</h2>
            <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {terms.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <p className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-black text-brand">
                    {i + 1}
                  </p>
                  <p className="mb-1 font-bold text-gray-900">{step.title}</p>
                  <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-black text-gray-900">{t('faqTitle')}</h2>
            <div className="flex flex-col gap-6">
              {faq.map(item => (
                <div key={item.q}>
                  <h3 className="mb-1 font-bold text-gray-900">{item.q}</h3>
                  <p className="leading-relaxed text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="mb-3 text-3xl font-black text-gray-900">{t('ctaTitle')}</h2>
            <p className="mb-8 leading-relaxed text-gray-600">{t('ctaBody')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`/${locale}#contact`}
                className="inline-flex items-center justify-center rounded-xl bg-brand px-7 py-3.5 font-semibold text-sm text-white shadow-sm transition-colors hover:opacity-90"
              >
                {t('ctaButton')}
              </a>
              <a
                href={`/${locale}#work`}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline"
              >
                {t('workLink')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
