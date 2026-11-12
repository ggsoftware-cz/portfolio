'use client';

import {useState, useRef, useEffect, type FormEvent} from 'react';
import Script from 'next/script';
import {useTranslations, useLocale} from 'next-intl';
import {Check, ArrowUpRight, Mail, Download, LoaderCircle, Copy} from 'lucide-react';
import {siteConfig} from '@/config/site';
import {configurationSummary, templateNames, fonts, encodeConfiguration, type Configuration} from '@/lib/configurator/config';
import s from './studio.module.css';

const ENDPOINT = process.env.NEXT_PUBLIC_CONFIGURATION_ENDPOINT || (process.env.NODE_ENV === 'development' ? '/api/configuration' : '');
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Turnstile = {render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id?: string) => void};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export function downloadConfiguration(config: Configuration) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'}));
  const link = document.createElement('a');
  link.href = url; link.download = `gg-${config.template}-design.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Verification({onError}: {onError: () => void}) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const locale = useLocale();
  function render() {
    const turnstile = (window as Window & {turnstile?: Turnstile}).turnstile;
    if (ref.current && turnstile?.render && !widget.current) {
      widget.current = turnstile.render(ref.current, {sitekey: SITE_KEY, theme: 'light', language: locale, action: 'configuration', 'error-callback': onError});
    }
  }
  useEffect(() => () => { if (widget.current) (window as Window & {turnstile?: Turnstile}).turnstile?.remove(widget.current); }, []);
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={render} onError={onError} /><div ref={ref} className={s.verification} /></>;
}

export default function QuoteForm({config, onSendingChange}: {config: Configuration; onSendingChange: (sending: boolean) => void}) {
  const t = useTranslations('configurator');
  const locale = useLocale();
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error' | 'draft'>('idle');
  const [captchaError, setCaptchaError] = useState(false);
  const [copyState, setCopyState] = useState(false);
  const [copyText, setCopyText] = useState('');
  const [form, setForm] = useState({name: '', email: '', notes: ''});
  const formRef = useRef<HTMLFormElement>(null);
  const requestId = useRef<string | null>(null);
  const pending = useRef(false);
  const requestSnapshot = useRef('');
  const previewUrl = `${siteConfig.url}/${locale}/configure#design=${encodeConfiguration(config)}`;
  const brief = `${locale === 'cs' ? 'Poptávka webu' : 'Website enquiry'}\n\n${form.name}\n${form.email}\n\n${configurationSummary(config)}\n\n${form.notes}\n\nPreview: ${previewUrl}`;
  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(`Website design — ${templateNames[config.template]}`)}&body=${encodeURIComponent(brief)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    if (!ENDPOINT) { window.location.href = mailto; setState('draft'); return; }
    pending.current = true;
    onSendingChange(true);
    setState('sending');
    const fd = new FormData(event.currentTarget);
    const data = {...form, locale, configuration: config, website: String(fd.get('website') || ''), turnstileToken: String(fd.get('cf-turnstile-response') || '')};
    const snapshot = JSON.stringify({...form, locale, configuration: config});
    if (snapshot !== requestSnapshot.current) { requestId.current = crypto.randomUUID(); requestSnapshot.current = snapshot; }
    try {
      const res = await fetch(ENDPOINT, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...data, requestId: requestId.current}), signal: AbortSignal.timeout(25000)});
      const response = await res.json().catch(() => null);
      if (!res.ok || response?.ok !== true || typeof response?.id !== 'string') throw new Error('Send failed');
      setState('success');
    } catch {
      setState('error');
      window.turnstile?.reset();
    } finally { pending.current = false; onSendingChange(false); }
  }

  async function copyBrief() {
    try { await navigator.clipboard.writeText(brief); setCopyState(true); }
    catch { setCopyText(brief); }
  }

  if (state === 'success') return <div className={s.successState} role="status"><span><Check size={30} aria-hidden /></span><h2 id="quote-title">{t('successTitle')}</h2><p>{t('successBody')}</p><p>{t('successNext')}</p><button className={s.secondaryButton} onClick={() => downloadConfiguration(config)}><Download size={16} aria-hidden />{t('download')}</button></div>;
  return <>
    <div className={s.quoteHeader}><span className={s.studioLabel}>{t('stepSend')}</span><h2 id="quote-title">{t('reviewTitle')}</h2><p>{t('reviewIntro')}</p></div>
    <div className={s.designSummary}><div className={s.summaryColors} aria-hidden>{[config.background, config.accent, config.text].map((color, index) => <i key={index} style={{background: color}} />)}</div><div><strong>{templateNames[config.template]}</strong><span>{fonts[config.font].name} · {config.spacing}px</span><small>{t('included')}</small></div></div>
    <form ref={formRef} onSubmit={submit} className={s.quoteForm}>
      <div className={s.formRow}><label className={s.textField}><span>{t('name')}</span><input autoComplete="name" name="name" required maxLength={100} value={form.name} onChange={event => setForm({...form, name: event.target.value})} /></label>
      <label className={s.textField}><span>{t('email')}</span><input type="email" name="email" autoComplete="email" required maxLength={200} value={form.email} onChange={event => setForm({...form, email: event.target.value})} /></label></div>
      <label className={s.textField}><span>{t('notes')}</span><textarea name="notes" rows={3} maxLength={2000} placeholder={t('notesPlaceholder')} value={form.notes} onChange={event => setForm({...form, notes: event.target.value})} /></label>
      <div className={s.honeypot} aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {ENDPOINT && SITE_KEY && <Verification onError={() => setCaptchaError(true)} />}
      {captchaError && <p role="alert" className={s.error}>{t('captchaError')}</p>}
      {!ENDPOINT && <p className={s.mailNote}><Mail size={18} aria-hidden />{t('mailBody')}</p>}
      {state === 'error' && <p role="alert" className={s.error}>{t('error')}</p>}
      {state === 'draft' && <p role="status" className={s.mailNote}>{t('mailOpened')}</p>}
      <button type="submit" className={s.primaryButton} disabled={state === 'sending'}>{state === 'sending' ? <LoaderCircle size={17} className={s.spinner} aria-hidden /> : <ArrowUpRight size={17} aria-hidden />}{state === 'sending' ? t('sending') : ENDPOINT ? t('send') : t('emailFallback')}</button>
      <p className={s.formPrivacy}>{t('privacyBefore')} <a href={`/${locale}/privacy`} target="_blank" rel="noreferrer">{t('privacyLink')}</a></p>
      <p className={s.commitment}>{t('noCommitment')}</p>
    </form>
    {(state === 'error' || state === 'draft' || captchaError) && <div className={s.recovery}><a href={mailto} className={s.secondaryButton}><Mail size={16} aria-hidden />{t('emailFallback')}</a><button className={s.secondaryButton} onClick={copyBrief}><Copy size={16} aria-hidden />{copyState ? t('briefCopied') : t('copyBrief')}</button><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{copyText && <textarea aria-label={t('copyBrief')} readOnly value={copyText} onFocus={event => event.target.select()} />}</div>}
  </>;
}
