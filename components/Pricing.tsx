import {useTranslations} from 'next-intl';
import {Check} from 'lucide-react';

type Tier = 'landing' | 'webapp' | 'custom';

const tiers: {key: Tier}[] = [
  {key: 'landing'},
  {key: 'webapp'},
  {key: 'custom'}
];

export default function Pricing() {
  const t = useTranslations('pricing');

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            {t('title')}
          </h2>
          <div className="w-12 h-1 rounded-full bg-brand mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {tiers.map(({key}) => {
            const features = t.raw(`tiers.${key}.features`) as string[];

            return (
              <div
                key={key}
                className="flex flex-col rounded-2xl p-7 border border-gray-100 shadow-sm bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {t(`tiers.${key}.name`)}
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    {t(`tiers.${key}.price`)}
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check size={15} className="mt-0.5 shrink-0 text-brand" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  {key === 'custom' ? t('ctaContact') : t('ctaStart')}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
