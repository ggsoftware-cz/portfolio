import {useTranslations} from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white pt-16">
      {/* Background geometric shapes */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-50 opacity-60" />
        <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] rounded-full bg-brand-50 opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-brand-100 opacity-30" />
        {/* Grid dots */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#E01A4F" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          {/* Badge */}


          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.05] mb-6">
            {t('headline')}
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mb-10">
            {t('subheadline')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-brand text-white font-semibold text-base hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
            >
              {t('ctaPrimary')}
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-base hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {t('ctaSecondary')} →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
