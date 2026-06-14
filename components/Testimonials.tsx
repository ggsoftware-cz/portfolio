import {useTranslations} from 'next-intl';
import {Quote} from 'lucide-react';

type Item = {quote: string; name: string; role: string; company: string};

// Client wordmarks shown in the "trusted by" row. Replace with real clients /
// logo images as you collect them. "Samolep" is a real delivered project.
const clients = ['Samolep', 'Nova Bistro', 'MedRoster'];

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const items = t.raw('items') as Item[];

  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('title')}</h2>
          <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-brand" />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map(item => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
            >
              <Quote size={24} className="mb-4 text-brand-200" fill="currentColor" />
              <blockquote className="mb-6 flex-1 leading-relaxed text-gray-700">
                {item.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-sm font-black text-brand">
                  {item.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{item.name}</span>
                  <span className="block text-xs text-gray-500">
                    {item.role}
                    {item.company ? `, ${item.company}` : ''}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Client logos / wordmarks */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-400">
            {t('clientsLabel')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {clients.map(name => (
              <span key={name} className="text-xl font-black text-gray-300">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
