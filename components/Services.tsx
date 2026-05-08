import {useTranslations} from 'next-intl';
import {LayoutDashboard, Database, Globe} from 'lucide-react';

const services = [
  {
    key: 'webApps' as const,
    Icon: LayoutDashboard,
    color: 'text-brand',
    bg: 'bg-brand-50'
  },
  {
    key: 'internalTools' as const,
    Icon: Database,
    color: 'text-brand-500',
    bg: 'bg-brand-50'
  },
  {
    key: 'landingPages' as const,
    Icon: Globe,
    color: 'text-brand',
    bg: 'bg-brand-100'
  }
];

export default function Services() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            {t('title')}
          </h2>
          <div className="w-12 h-1 rounded-full bg-brand mx-auto" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({key, Icon, color, bg}) => (
            <div
              key={key}
              className="group bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`inline-flex p-3 rounded-xl ${bg} mb-5`}>
                <Icon size={22} className={color} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t(`${key}.title`)}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
