'use client';

import {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {ArrowLeft, ArrowUpRight, Check, Monitor, Smartphone, Maximize2, Minimize2, Link2, Download, SlidersHorizontal, Eye} from 'lucide-react';
import {createConfiguration, decodeConfiguration, encodeConfiguration, parseConfiguration, templateIds, templateNames, DRAFT_KEY, type Configuration, type TemplateId} from '@/lib/configurator/config';
import TemplateGallery from './TemplateGallery';
import LivePreview from './LivePreview';
import Controls from './Controls';
import Modal from './Modal';
import QuoteForm, {downloadConfiguration} from './QuoteForm';
import s from './studio.module.css';

function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia('(max-width: 760px)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

const getCompactViewport = () => window.matchMedia('(max-width: 760px)').matches;
const getServerViewport = () => false;

export default function Configurator() {
  const t = useTranslations('configurator');
  const locale = useLocale();
  const [config, setConfig] = useState<Configuration | null>(null);
  const [saved, setSaved] = useState<Configuration | null>(null);
  const [gallery, setGallery] = useState(true);
  const [deviceChoice, setDevice] = useState<'desktop' | 'mobile' | null>(null);
  const compactViewport = useSyncExternalStore(subscribeToViewport, getCompactViewport, getServerViewport);
  const device = deviceChoice ?? (compactViewport ? 'mobile' : 'desktop');
  const [mobileView, setMobileView] = useState<'preview' | 'customize'>('preview');
  const [expanded, setExpanded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteSending, setQuoteSending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewAreaRef = useRef<HTMLElement>(null);
  const drafts = useRef<Partial<Record<TemplateId, Configuration>>>({});
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const readLocation = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const encoded = params.get('design');
      if (encoded) {
        const restored = decodeConfiguration(encoded);
        if (restored) {
          setConfig(restored); setSaved(restored); setGallery(false);
          drafts.current[restored.template] = restored;
          try { localStorage.setItem(DRAFT_KEY, JSON.stringify(restored)); localStorage.setItem(`${DRAFT_KEY}-${restored.template}`, JSON.stringify(restored)); }
          catch { setStorageAvailable(false); }
        }
        else setStatus(t('invalidLink'));
      } else {
        const template = params.get('template');
        if (templateIds.includes(template as TemplateId)) {
          const next = drafts.current[template as TemplateId] || createConfiguration(template as TemplateId);
          setConfig(next); setSaved(next); setGallery(false);
          try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch { setStorageAvailable(false); }
        }
      }
    };
    // Synchronize browser-owned state after hydration; static HTML stays a usable gallery.
    const frame = requestAnimationFrame(() => {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) setSaved(parseConfiguration(JSON.parse(draft)));
        for (const id of templateIds) {
          try { const value = localStorage.getItem(`${DRAFT_KEY}-${id}`); const restored = value ? parseConfiguration(JSON.parse(value)) : null; if (restored?.template === id) drafts.current[id] = restored; } catch { /* Ignore a single damaged draft. */ }
        }
      }
      catch { setStorageAvailable(false); }
      readLocation();
    });
    window.addEventListener('hashchange', readLocation);
    return () => {cancelAnimationFrame(frame); window.removeEventListener('hashchange', readLocation); if (noticeTimer.current) clearTimeout(noticeTimer.current);};
  }, [t]);

  useEffect(() => {
    if (!expanded) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') setExpanded(false);
      if (event.key === 'Tab') {
        const nodes = previewAreaRef.current?.querySelectorAll<HTMLElement>('button, summary, [tabindex="0"]');
        const focusable = Array.from(nodes || []).filter(node => node.getClientRects().length > 0);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last?.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first?.focus();}
      }
    }
    window.addEventListener('keydown', escape);
    return () => {document.body.style.overflow = overflow; window.removeEventListener('keydown', escape);};
  }, [expanded]);

  function update(next: Configuration) {
    setConfig(next); setSaved(next);
    drafts.current[next.template] = next;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); localStorage.setItem(`${DRAFT_KEY}-${next.template}`, JSON.stringify(next)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
    // Keep the current tab's reload/share state current without adding history on each slider movement.
    window.history.replaceState(null, '', `#design=${encodeConfiguration(next)}`);
  }
  function choose(template: TemplateId) {
    const next = drafts.current[template] || (saved?.template === template ? saved : createConfiguration(template));
    update(next); setGallery(false); setMobileView('preview');
    requestAnimationFrame(() => { window.scrollTo({top: 0, behavior: 'instant'}); titleRef.current?.focus(); previewRef.current?.scrollTo({top: 0}); });
  }
  function showGallery() {
    setGallery(true); setExpanded(false); window.history.replaceState(null, '', window.location.pathname);
    requestAnimationFrame(() => { window.scrollTo({top: 0, behavior: 'instant'}); titleRef.current?.focus(); });
  }
  function notify(message: string) {
    setStatus(message); if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setStatus(''), 4500);
  }
  async function share() {
    if (!config) return;
    const url = `${window.location.origin}/${locale}/configure#design=${encodeConfiguration(config)}`;
    try { await navigator.clipboard.writeText(url); notify(t('copied')); }
    catch { setShareLink(url); notify(t('copyFailed')); }
  }
  const editing = config !== null && !gallery;

  return <div className={`${s.studio} ${editing ? s.editing : ''}`}>
    <header className={s.studioHeader} inert={expanded}>
      <a href={`/${locale}`} className={s.brand} aria-label={t('back')}><Image src="/icon.svg" width={29} height={29} alt="" /><span>GG Software</span></a>
      <span className={s.headerDivider} aria-hidden /><span className={s.headerTitle}>{t('studio')}</span>
      <nav className={s.steps} aria-label={t('studio')}><span aria-current={gallery ? 'step' : undefined}><i>{editing ? <Check size={12} aria-hidden /> : '1'}</i>{t('stepChoose')}</span><span aria-current={editing ? 'step' : undefined}><i>2</i>{t('stepCustomize')}</span><span><i>3</i>{t('stepSend')}</span></nav>
      <a className={s.localeLink} href={`/${locale === 'en' ? 'cs' : 'en'}/configure${config ? `#design=${encodeConfiguration(config)}` : ''}`} lang={locale === 'en' ? 'cs' : 'en'}>{locale === 'en' ? 'CZ' : 'EN'}</a>
    </header>
    <main>
      {!editing ? <div className={s.galleryPage}>
        <div className={s.galleryIntro}><a href={`/${locale}`} className={s.backLink}><ArrowLeft size={15} aria-hidden />{t('back')}</a><h1 ref={titleRef} tabIndex={-1}>{t('title')}</h1><p>{t('intro')}</p><div className={s.galleryBenefits}><span><Check size={15} aria-hidden />{t('noAccount')}</span><span><Check size={15} aria-hidden />{t('noCommitment')}</span></div></div>
        {saved && <button className={s.resume} onClick={() => {update(saved); setGallery(false);}}>{t('continue')}<span>{templateNames[saved.template]}<ArrowUpRight size={16} aria-hidden /></span></button>}
        <div className={s.galleryCaption}><h2>{t('galleryNote')}</h2><span>{t('ownPace')}</span></div>
        <TemplateGallery onChoose={choose} />
        <p className={s.demoNote}>{t('demoNote')}</p>
      </div> : <>
        <div className={s.editorHeading} inert={expanded}><div><button className={s.backLink} onClick={showGallery}><ArrowLeft size={15} aria-hidden />{t('change')}</button><h1 ref={titleRef} tabIndex={-1}>{templateNames[config.template]}<span>{t(`templates.${config.template}.category`)}</span></h1></div><div className={s.editorActions}><button className={s.iconButton} aria-label={t('share')} title={t('share')} onClick={share}><Link2 size={18} aria-hidden /></button><button className={s.iconButton} aria-label={t('download')} title={t('download')} onClick={() => downloadConfiguration(config)}><Download size={18} aria-hidden /></button><button className={s.primaryButton} onClick={() => setQuoteOpen(true)}>{t('quote')}<ArrowUpRight size={17} aria-hidden /></button></div></div>
        <div className={s.mobileTabs} inert={expanded}><button onClick={() => setMobileView('preview')} aria-pressed={mobileView === 'preview'}><Eye size={16} aria-hidden />{t('preview')}</button><button onClick={() => setMobileView('customize')} aria-pressed={mobileView === 'customize'}><SlidersHorizontal size={16} aria-hidden />{t('customize')}</button></div>
        <div className={s.workspace}>
          <aside inert={expanded} className={`${s.sidebar} ${mobileView === 'customize' ? s.mobileActive : ''}`} aria-label={t('customize')}><Controls config={config} onChange={update} onReset={() => setResetOpen(true)} /><p className={s.saveNote}>{storageAvailable ? <Check size={13} aria-hidden /> : null}{storageAvailable ? t('saved') : t('saveUnavailable')}</p></aside>
          <section ref={previewAreaRef} role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined} className={`${s.previewArea} ${mobileView === 'preview' ? s.mobileActive : ''} ${expanded ? s.expanded : ''}`} aria-label={t('live')}>
            <div className={s.previewToolbar}><span><i aria-hidden />{t('live')}</span><div className={s.deviceSwitch}><button className={s.iconButton} aria-label={t('desktop')} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}><Monitor size={17} aria-hidden /></button><button className={s.iconButton} aria-label={t('mobile')} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}><Smartphone size={17} aria-hidden /></button></div><button className={s.iconButton} onClick={() => setExpanded(!expanded)} aria-label={expanded ? t('exitFullScreen') : t('fullScreen')}>{expanded ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}</button></div>
            <LivePreview config={config} mobile={device === 'mobile'} expanded={expanded} viewportRef={previewRef} onEnquire={() => {setExpanded(false); setQuoteOpen(true);}} />
            <div className={s.previewFooter}><span>{t('demoLabel')}</span><span>{t('previewHint')}</span></div>
          </section>
        </div>
        <div className={s.mobileBottom} inert={expanded}><button className={s.secondaryButton} onClick={() => setMobileView(mobileView === 'preview' ? 'customize' : 'preview')}>{mobileView === 'preview' ? <SlidersHorizontal size={16} aria-hidden /> : <Eye size={16} aria-hidden />}{t(mobileView === 'preview' ? 'customize' : 'preview')}</button><button className={s.primaryButton} onClick={() => setQuoteOpen(true)}>{t('quoteShort')}<ArrowUpRight size={16} aria-hidden /></button></div>
      </>}
      {shareLink && <div className={s.shareFallback}><label>{t('copyFailed')}<input readOnly value={shareLink} onFocus={event => event.target.select()} /></label><button onClick={() => setShareLink('')}>{t('close')}</button></div>}
      <div className={s.toast} role="status" aria-live="polite">{status}</div>
    </main>
    <Modal open={quoteOpen} onClose={() => setQuoteOpen(false)} dismissible={!quoteSending} titleId="quote-title">{config && <QuoteForm config={config} onSendingChange={setQuoteSending} />}</Modal>
    <Modal open={resetOpen} onClose={() => setResetOpen(false)} titleId="reset-title"><div className={s.resetContent}><h2 id="reset-title">{t('resetTitle')}</h2><p>{t('resetBody')}</p><div><button className={s.secondaryButton} onClick={() => setResetOpen(false)}>{t('cancel')}</button><button className={s.primaryButton} onClick={() => {if (config) update(createConfiguration(config.template)); setResetOpen(false);}}>{t('confirmReset')}</button></div></div></Modal>
  </div>;
}
