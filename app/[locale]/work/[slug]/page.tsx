import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {ArrowLeft, ArrowUpRight, Check} from 'lucide-react';
import {routing} from '@/i18n/routing';
import {siteConfig} from '@/config/site';
import {projects, getProject} from '@/config/projects';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectMockup from '@/components/ProjectMockup';

type Params = {locale: string; slug: string};

// Pre-render every locale × project combination for `output: export`.
export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    projects.map(project => ({locale, slug: project.slug}))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const project = getProject(slug);
  if (!project) return {};

  const t = await getTranslations({locale, namespace: 'work'});
  const name = t(`items.${slug}.name`);
  const description = t(`items.${slug}.tagline`);

  return {
    title: name,
    description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: {cs: `/cs/work/${slug}`, en: `/en/work/${slug}`}
    },
    openGraph: {
      type: 'article',
      title: name,
      description,
      url: `${siteConfig.url}/${locale}/work/${slug}`
    }
  };
}

export default async function ProjectPage({params}: {params: Promise<Params>}) {
  const {locale, slug} = await params;
  setRequestLocale(locale);

  const project = getProject(slug);
  if (!project) notFound();

  const t = await getTranslations('work');
  const item = (key: string) => t(`items.${slug}.${key}`);
  const results = t.raw(`items.${slug}.results`) as string[];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white pt-28 pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-50 opacity-60" />
            <div className="absolute -left-20 top-1/2 h-[400px] w-[400px] rounded-full bg-brand-50 opacity-40" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <a
              href={`/${locale}#work`}
              className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-brand"
            >
              <ArrowLeft size={15} />
              {t('detail.back')}
            </a>

            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                    {item('category')}
                  </span>
                  <span className="text-xs text-gray-400">{project.year}</span>
                </div>

                <h1 className="mb-5 text-4xl font-black leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
                  {item('name')}
                </h1>
                <p className="mb-7 max-w-xl text-lg leading-relaxed text-gray-500">
                  {item('tagline')}
                </p>

                <div className="mb-8 flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`/${locale}#contact`}
                    className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700"
                  >
                    {t('detail.ctaButton')}
                  </a>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-6 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      {t('detail.visit')}
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
              </div>

              <ProjectMockup
                variant={project.variant}
                src={project.cover}
                alt={item('name')}
              />
            </div>
          </div>
        </section>

        {/* Overview / Challenge / Solution */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Block title={t('detail.overviewTitle')} body={item('overview')} />
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <Block title={t('detail.challengeTitle')} body={item('challenge')} compact />
              <Block title={t('detail.solutionTitle')} body={item('solution')} compact />
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-black text-gray-900">
                {t('detail.screenshotsTitle')}
              </h2>
              <div className="mx-auto h-1 w-12 rounded-full bg-brand" />
            </div>

            <div className="grid items-center gap-6 lg:grid-cols-[1.6fr_1fr]">
              <ProjectMockup
                variant={project.variant}
                view="b"
                src={project.screenshots?.[0]}
                alt={item('name')}
              />
              <ProjectMockup
                variant={project.variant}
                device="phone"
                src={project.screenshots?.[1]}
                alt={item('name')}
                className="lg:max-w-[200px]"
              />
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-3xl font-black text-gray-900">
                {t('detail.resultsTitle')}
              </h2>
              <div className="mx-auto h-1 w-12 rounded-full bg-brand" />
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {results.map(r => (
                <li
                  key={r}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <Check size={14} className="text-brand" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm leading-relaxed text-gray-700">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-14 text-center sm:px-14">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand opacity-20"
              />
              <h2 className="relative mb-3 text-2xl font-black text-white sm:text-3xl">
                {t('detail.ctaTitle')}
              </h2>
              <p className="relative mx-auto mb-8 max-w-lg text-gray-400">
                {t('detail.ctaText')}
              </p>
              <a
                href={`/${locale}#contact`}
                className="relative inline-flex items-center justify-center rounded-xl bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700"
              >
                {t('detail.ctaButton')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Block({
  title,
  body,
  compact = false
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div>
      <h2
        className={`mb-3 font-black text-gray-900 ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}
      >
        {title}
      </h2>
      <p className="leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}
