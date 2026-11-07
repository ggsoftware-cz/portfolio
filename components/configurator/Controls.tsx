'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Check, ChevronDown, RotateCcw} from 'lucide-react';
import {palettes, fonts, fontIds, templateIds, contentLimits, contrastRatio, onColor, type Configuration} from '@/lib/configurator/config';
import s from './studio.module.css';

type Props = {config: Configuration; onChange: (config: Configuration) => void; onReset: () => void};

export default function Controls({config, onChange, onReset}: Props) {
  const t = useTranslations('configurator');
  const [tab, setTab] = useState<'appearance' | 'layout' | 'content'>('appearance');
  function update<K extends keyof Configuration>(key: K, value: Configuration[K]) { onChange({...config, [key]: value}); }
  const range = (key: 'fontSize' | 'spacing' | 'radius' | 'width' | 'imagePosition', label: string, min: number, max: number, unit: string) => (
    <label className={s.rangeField} htmlFor={`control-${key}`}>
      <span>{label}<output htmlFor={`control-${key}`}>{config[key]}{unit}</output></span>
      <input id={`control-${key}`} type="range" min={min} max={max} value={config[key]} onChange={event => update(key, Number(event.target.value))} />
    </label>
  );
  return <div className={s.controls}>
    <div className={s.controlIntro}><h2>{t('stepCustomize')}</h2><p>{t('ownPace')}</p></div>
    <div className={s.tabs} aria-label={t('customize')}>
      {(['appearance', 'layout', 'content'] as const).map(key => <button type="button" key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{t(key)}</button>)}
    </div>
    <div className={s.controlFields}>
      {tab === 'appearance' && <>
        <fieldset><legend>{t('palette')}</legend><div className={s.palettes}>
          {palettes[config.template].map((palette, index) => <button key={palette.accent} type="button" aria-label={t('paletteLabel', {number: index + 1})}
            aria-pressed={palette.accent === config.accent && palette.background === config.background && palette.text === config.text}
            onClick={() => onChange({...config, ...palette})}>
            <span style={{background: palette.background}} /><span style={{background: palette.text}} /><span style={{background: palette.accent}} />
            {palette.accent === config.accent && palette.background === config.background && palette.text === config.text && <Check size={14} aria-hidden className={s.paletteCheck} />}
          </button>)}
        </div></fieldset>
        <details className={s.controlDetails}><summary>{t('colors')}<ChevronDown size={15} aria-hidden /></summary>
          <div className={s.colorFields}>{(['accent', 'background', 'text'] as const).map(key => <label key={key} className={s.colorField}>
            <input type="color" value={config[key]} onChange={event => update(key, event.target.value)} aria-label={t(key)} /><span>{t(key)}<small>{config[key].toUpperCase()}</small></span>
          </label>)}</div>
        </details>
        {contrastRatio(config.text, config.background) < 4.5 && <div className={s.contrastNotice} role="status"><p>{t('contrast')}</p><button type="button" onClick={() => update('text', onColor(config.background))}>{t('fixContrast')}</button></div>}
        <fieldset><legend>{t('font')}</legend><div className={s.fontOptions}>{fontIds.map(font => <button type="button" key={font} aria-pressed={font === config.font} onClick={() => update('font', font)}><span style={{fontFamily: fonts[font].family}}>Aa</span><span>{fonts[font].name}</span>{font === config.font && <Check size={14} aria-hidden />}</button>)}</div></fieldset>
        {range('fontSize', t('headingSize'), 80, 125, '%')}
        <details className={s.controlDetails}><summary>{t('photography')}<ChevronDown size={15} aria-hidden /></summary>
          <div className={s.photoOptions}>{templateIds.map(image => <button type="button" key={image} aria-label={t('photo', {name: t(`templates.${image}.name`)})} aria-pressed={image === config.image} onClick={() => update('image', image)} style={{backgroundImage: `url(/templates/${image}.webp)`}}>{image === config.image && <Check size={16} aria-hidden />}</button>)}</div>
          {range('imagePosition', t('imagePosition'), 0, 100, '%')}
          <fieldset><legend>{t('imageStyle')}</legend><div className={s.segmented}>{(['natural', 'muted', 'mono'] as const).map(value => <button type="button" key={value} aria-pressed={config.imageStyle === value} onClick={() => update('imageStyle', value)}>{t(value)}</button>)}</div></fieldset>
        </details>
      </>}
      {tab === 'layout' && <>
        {range('spacing', t('spacing'), 32, 100, 'px')}
        {range('radius', t('corners'), 0, 32, 'px')}
        {range('width', t('width'), 880, 1280, 'px')}
        <fieldset><legend>{t('alignment')}</legend><div className={s.segmented}>{(['left', 'center'] as const).map(align => <button type="button" key={align} aria-pressed={config.align === align} onClick={() => update('align', align)}>{t(align)}</button>)}</div></fieldset>
        <fieldset><legend>{t('sections')}</legend><div className={s.sectionToggles}>{(['services', 'about', 'faq'] as const).map(key => <label key={key}><span>{t(key)}</span><input type="checkbox" role="switch" checked={config.sections[key]} onChange={event => update('sections', {...config.sections, [key]: event.target.checked})} /></label>)}</div></fieldset>
      </>}
      {tab === 'content' && <>
        <p className={s.fieldHint}>{t('contentHint')}</p>
        {(['name', 'headline', 'description', 'cta'] as const).map(key => {
          const label = {name: 'businessName', headline: 'headline', description: 'description', cta: 'buttonText'}[key];
          const placeholder = {name: 'business', headline: 'headline', description: 'descriptionText', cta: 'cta'}[key];
          const props = {id: `content-${key}`, value: config.content[key], maxLength: contentLimits[key], placeholder: t(`templates.${config.template}.${placeholder}`), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update('content', {...config.content, [key]: event.target.value})};
          return <label className={s.textField} key={key} htmlFor={props.id}><span>{t(label)}</span>{key === 'description' || key === 'headline' ? <textarea {...props} rows={key === 'description' ? 4 : 3} /> : <input {...props} type="text" />}<small>{t('remaining', {count: contentLimits[key] - config.content[key].length})}</small></label>;
        })}
      </>}
    </div>
    <button type="button" onClick={onReset} className={s.resetButton}><RotateCcw size={14} aria-hidden />{t('reset')}</button>
  </div>;
}
