import {useTranslations} from 'next-intl';

// Technologies are product names, not translated. Edit this list freely.
const groups = [
  {
    key: 'frontend' as const,
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
  },
  {
    key: 'backend' as const,
    items: ['ASP.NET Core', 'Node.js', 'REST APIs', 'PostgreSQL']
  },
  {
    key: 'infra' as const,
    items: ['Azure', 'Docker', 'GitHub Actions', 'Cloudflare']
  }
];

export default function TechStack() {
  const t = useTranslations('techStack');

  return (
    <section id="tech" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('title')}</h2>
          <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-brand" />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {groups.map(group => (
            <div
              key={group.key}
              className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {t(`groups.${group.key}`)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map(item => (
                  <span
                    key={item}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
