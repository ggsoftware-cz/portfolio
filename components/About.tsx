import {useTranslations} from 'next-intl';

export default function About() {
  const t = useTranslations('about');

  const stats = [
    t('stats.delivery'),
    t('stats.communication'),
    t('stats.pricing')
  ];

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            {t('title')}
          </h2>
          <div className="w-12 h-1 rounded-full bg-brand mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {stats.map(stat => (
            <span
              key={stat}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm"
            >
              {stat}
            </span>
          ))}
        </div>

        {/* Team */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-gray-700">{t('team.title')}</h3>
        </div>
        {/* TODO: Swap placeholder team member names/photos in About section */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            {name: 'Jan Novák', role: 'Full-stack Developer'},
            {name: 'Petra Kovářová', role: 'Frontend & UX'}
          ].map(member => (
            <div
              key={member.name}
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm w-44"
            >
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-xl font-black text-brand">
                {member.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
