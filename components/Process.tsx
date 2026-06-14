import {useTranslations} from 'next-intl';
import {Search, FileText, Code2, Rocket, LifeBuoy} from 'lucide-react';

type Step = {title: string; description: string};

const icons = [Search, FileText, Code2, Rocket, LifeBuoy];

export default function Process() {
  const t = useTranslations('process');
  const steps = t.raw('steps') as Step[];

  return (
    <section id="process" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('title')}</h2>
          <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-brand" />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = icons[i] ?? Code2;
            return (
              <li
                key={step.title}
                className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                    <Icon size={20} className="text-brand" strokeWidth={2} />
                  </span>
                  <span className="text-2xl font-black text-gray-200">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mb-1.5 text-base font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
