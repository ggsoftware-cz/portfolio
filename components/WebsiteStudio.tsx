import {useTranslations, useLocale} from 'next-intl';
import {ArrowUpRight} from 'lucide-react';
import TemplateGallery from './configurator/TemplateGallery';
import s from './configurator/studio.module.css';

export default function WebsiteStudio() {
  const t = useTranslations('configurator');
  const locale = useLocale();
  return <section id="website-studio" className={s.homeSection}>
    <div className={s.homeContainer}>
      <div className={s.homeHeading}><div><p className={s.studioLabel}>{t('studio')}</p><h2>{t('homeTitle')}</h2><p>{t('homeIntro')}</p></div><a href={`/${locale}/configure`}>{t('homeLink')}<ArrowUpRight size={20} aria-hidden /></a></div>
      <TemplateGallery compact />
      <p className={s.demoNote}>{t('demoNote')}</p>
    </div>
  </section>;
}
