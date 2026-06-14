import {useTranslations} from 'next-intl';
import {Plus} from 'lucide-react';

type Item = {q: string; a: string};

export default function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items') as Item[];

  return (
    <section id="faq" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('title')}</h2>
          <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-brand" />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        {/* Native <details> — works without JS, so it's static-export friendly. */}
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <details
              key={item.q}
              className="group rounded-2xl border border-gray-100 bg-white px-6 shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-gray-900">
                {item.q}
                <Plus
                  size={18}
                  className="shrink-0 text-brand transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="pb-5 leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
