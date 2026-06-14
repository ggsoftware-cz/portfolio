import {useTranslations} from 'next-intl';

type Stat = {value: string; label: string};

export default function Stats() {
  const t = useTranslations('stats');
  const items = t.raw('items') as Stat[];

  return (
    <section className="border-y border-gray-100 bg-white py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
        {items.map(item => (
          <div key={item.label} className="text-center">
            <p className="text-3xl font-black text-brand sm:text-4xl">{item.value}</p>
            <p className="mt-1 text-sm font-medium text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
