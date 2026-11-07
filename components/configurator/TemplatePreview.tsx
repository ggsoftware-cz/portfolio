'use client';

import {useId, useRef, type CSSProperties} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {ArrowUpRight, ArrowRight, Plus, Check, Utensils, Leaf, MoveUpRight} from 'lucide-react';
import {fonts, onColor, type Configuration} from '@/lib/configurator/config';
import s from './templates.module.css';
import ShiftStorefront from './ShiftStorefront';

type Props = {config: Configuration; miniature?: boolean; eager?: boolean; onEnquire?: () => void};

export default function TemplatePreview({config, miniature = false, eager = false, onEnquire}: Props) {
  const t = useTranslations('configurator');
  const prefix = `templates.${config.template}`;
  const id = useId().replace(/:/g, '');
  const contactRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const name = config.content.name || t(`${prefix}.business`);
  const headline = config.content.headline || t(`${prefix}.headline`);
  const description = config.content.description || t(`${prefix}.descriptionText`);
  const cta = config.content.cta || t(`${prefix}.cta`);
  const style = {
    '--site-accent': config.accent, '--site-bg': config.background, '--site-text': config.text,
    '--site-on-accent': onColor(config.accent), '--site-font': fonts[config.font].family,
    '--site-size': config.fontSize / 100, '--site-space': `${config.spacing}px`,
    '--site-radius': `${config.radius}px`, '--site-width': `${config.width}px`,
    '--site-align': config.align, '--site-position': `${config.imagePosition}%`,
    '--site-filter': config.imageStyle === 'mono' ? 'grayscale(1)' : config.imageStyle === 'muted' ? 'saturate(.5)' : 'none'
  } as CSSProperties;
  const scrollTo = (node: HTMLElement | null) => node?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  const action = () => scrollTo(contactRef.current);
  const renderPhoto = ({className = '', secondary = false}: {className?: string; secondary?: boolean}) => (
    <div className={`${s.photo} ${className}`}>
      <Image src={`/templates/${miniature ? 'thumbs/' : ''}${config.image}.webp`} alt={t(`templates.${config.image}.imageAlt`)} fill
        sizes={miniature ? '(max-width: 640px) 90vw, 45vw' : '(max-width: 700px) 100vw, 70vw'}
        fetchPriority={miniature ? 'low' : secondary ? 'auto' : 'high'}
        loading={secondary || (miniature && !eager) ? 'lazy' : 'eager'} />
    </div>
  );
  const renderCallToAction = ({outline = false}: {outline?: boolean}) => (
    <button type="button" className={`${s.cta} ${outline ? s.outline : ''}`} onClick={action}>
      {cta}<ArrowUpRight size={18} aria-hidden />
    </button>
  );
  const HeroHeading = miniature ? 'h3' : 'h2';

  if (config.template === 'shift') return <div className={s.container} style={style}>
    <ShiftStorefront config={config} miniature={miniature} onEnquire={onEnquire} />
  </div>;

  return (
    <div className={s.container} style={style}>
      <article className={`${s.site} ${s[config.template]}`} aria-label={`${t(`${prefix}.name`)} — ${t('demoLabel')}`}>
        <header className={s.nav}>
          <span className={s.wordmark}>{config.template === 'forma' && <span className={s.formaMark} aria-hidden />}{name}</span>
          <nav aria-label={`${name} ${t('demoLabel')}`}>
            {config.sections.services && <button onClick={() => scrollTo(servicesRef.current)}>{t('navServices')}</button>}
            {config.sections.about && <button onClick={() => scrollTo(aboutRef.current)}>{t('navAbout')}</button>}
            <button className={s.navAction} onClick={action}>{config.template === 'savor' ? cta : t('navContact')}<ArrowUpRight size={14} aria-hidden /></button>
          </nav>
        </header>

        <div className={s.hero}>
          {config.template === 'haven' && renderPhoto({className: s.heroPhoto})}
          <div className={s.heroCopy}>
            <p className={s.tagline}>{config.template === 'savor' && <Utensils size={19} aria-hidden />}{t(`${prefix}.tagline`)}</p>
            <HeroHeading>{headline}</HeroHeading>
            <p className={s.introduction}>{description}</p>
            {renderCallToAction({})}
          </div>
          {config.template !== 'haven' && renderPhoto({className: s.heroPhoto})}
          {config.template === 'atelier' && <span className={s.heroFootnote}>{t(`${prefix}.tagline`)}<MoveUpRight size={20} aria-hidden /></span>}
        </div>

        {!miniature && <>
        {config.template === 'haven' && <div className={s.welcomeStrip}><Leaf size={22} aria-hidden /><span>{t(`${prefix}.servicesTitle`)}</span><button onClick={() => scrollTo(servicesRef.current)}>{t('navServices')}<ArrowRight size={18} aria-hidden /></button></div>}
        {config.template === 'savor' && <div className={s.restaurantStrip}><span>{t(`${prefix}.tagline`)}</span><Utensils size={22} aria-hidden /><span>{t(`${prefix}.business`)}</span></div>}

        {config.sections.services && <section ref={servicesRef} className={`${s.section} ${s.services}`} aria-labelledby={`${id}-services`}>
          <div className={s.sectionHeading}>
            <h3 id={`${id}-services`}>{t(`${prefix}.servicesTitle`)}</h3>
            <p>{t(`${prefix}.servicesIntro`)}</p>
          </div>
          <div className={s.serviceList}>
            {[1, 2, 3].map(index => <div className={s.service} key={index}>
              {config.template === 'forma' && <Check size={23} aria-hidden />}
              <div><h4>{t(`${prefix}.service${index}`)}</h4><p>{t(`${prefix}.service${index}Body`)}</p></div>
              {config.template === 'atelier' && <ArrowUpRight size={25} aria-hidden />}
            </div>)}
          </div>
          {config.template === 'savor' && <p className={s.menuNote}>{t(`${prefix}.menuNote`)}</p>}
        </section>}

        {config.sections.about && <section ref={aboutRef} className={`${s.section} ${s.story}`} aria-labelledby={`${id}-story`}>
          {renderPhoto({secondary: true, className: s.storyPhoto})}
          <div className={s.storyCopy}><h3 id={`${id}-story`}>{t(`${prefix}.storyTitle`)}</h3><p>{t(`${prefix}.storyBody`)}</p>{renderCallToAction({outline: true})}</div>
        </section>}

        {config.template === 'forma' && config.sections.about && <section className={`${s.section} ${s.process}`}>
          <h3>{t(`${prefix}.processTitle`)}</h3><ol>{[1, 2, 3].map(index => <li key={index}><span aria-hidden>{index}</span>{t(`${prefix}.process${index}`)}</li>)}</ol>
        </section>}

        {config.sections.faq && <section className={`${s.section} ${s.faq}`} aria-labelledby={`${id}-faq`}>
          <h3 id={`${id}-faq`}>{t('faqTitle')}</h3>
          <div>{[1, 2].map(index => <details key={index}><summary>{t(`${prefix}.question${index}`)}<Plus size={18} aria-hidden /></summary><p>{t(`${prefix}.answer${index}`)}</p></details>)}</div>
        </section>}

        <section ref={contactRef} className={`${s.section} ${s.contact}`} aria-labelledby={`${id}-contact`}>
          <p className={s.tagline}>{t('demoLabel')}</p>
          <h3 id={`${id}-contact`}>{t('sampleContact')}</h3><p>{t('sampleContactBody')}</p>
          <button className={s.cta} onClick={onEnquire}>{t('quote')}<ArrowUpRight size={18} aria-hidden /></button>
        </section>
        <footer className={s.footer}><span className={s.wordmark}>{name}</span><span>{t('demoLabel')}</span></footer>
        </>}
      </article>
    </div>
  );
}
