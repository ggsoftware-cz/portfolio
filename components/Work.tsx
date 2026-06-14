import {useTranslations} from 'next-intl';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {projects} from '@/config/projects';
import ProjectMockup from './ProjectMockup';

export default function Work() {
  const t = useTranslations('work');

  return (
    <section id="work" className="relative overflow-hidden bg-white py-24">
      {/* Soft decorative blob, consistent with the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-50 opacity-50"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-3xl font-black text-gray-900 sm:text-4xl">{t('title')}</h2>
          <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-brand" />
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(project => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Thumbnail */}
              <div className="overflow-hidden bg-gray-50 p-5 pb-0">
                <ProjectMockup
                  variant={project.variant}
                  src={project.cover}
                  alt={t(`items.${project.slug}.name`)}
                  className="translate-y-1 transition-transform duration-300 group-hover:-translate-y-0"
                />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">
                  {t(`items.${project.slug}.category`)}
                </p>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {t(`items.${project.slug}.name`)}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-500">
                  {t(`items.${project.slug}.tagline`)}
                </p>

                <div className="mb-5 flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 transition-colors group-hover:text-brand">
                  {t('cta')}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
