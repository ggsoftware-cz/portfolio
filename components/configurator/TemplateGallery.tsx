'use client';

import {useTranslations, useLocale} from 'next-intl';
import {ArrowUpRight} from 'lucide-react';
import {createConfiguration, templateIds, type TemplateId} from '@/lib/configurator/config';
import TemplatePreview from './TemplatePreview';
import s from './studio.module.css';

export default function TemplateGallery({onChoose, compact = false}: {onChoose?: (id: TemplateId) => void; compact?: boolean}) {
  const t = useTranslations('configurator');
  const locale = useLocale();
  return <div className={`${s.galleryGrid} ${compact ? s.compactGallery : ''}`}>
    {templateIds.map((id, index) => <article className={`${s.templateCard} ${id === 'shift' ? s.featuredTemplate : ''}`} key={id}>
      <div className={s.cardPreview} inert aria-hidden><div className={s.miniature}><TemplatePreview config={createConfiguration(id)} miniature eager={!compact && index < 2} /></div></div>
      <div className={s.cardBody}><div className={s.cardTitle}><h3>{t(`templates.${id}.name`)}</h3><span>{t(`templates.${id}.category`)}</span></div>
        {!compact && <p>{t(`templates.${id}.description`)}</p>}
        <div className={s.cardBottom}><span>{t(`templates.${id}.fit`)}</span>{onChoose ? <button type="button" onClick={() => onChoose(id)} aria-label={t('choose', {name: t(`templates.${id}.name`)})}>{t('customize')}<ArrowUpRight size={17} aria-hidden /></button> : <a href={`/${locale}/configure#template=${id}`} aria-label={t('choose', {name: t(`templates.${id}.name`)})}>{t('customize')}<ArrowUpRight size={17} aria-hidden /></a>}</div>
      </div>
    </article>)}
  </div>;
}
