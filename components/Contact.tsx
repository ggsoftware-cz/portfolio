'use client';

import {useState, useRef, useEffect, type FormEvent} from 'react';
import Script from 'next/script';
import {useTranslations} from 'next-intl';
import {Mail, Send, CheckCircle2, ChevronDown} from 'lucide-react';
import {siteConfig} from '@/config/site';

type FormState = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

declare global {
  interface Window {
    turnstile?: {reset: (widgetId?: string) => void};
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Contact() {
  const t = useTranslations('contact');

  const projectTypes = [
    {value: 'webapp',       label: t('fields.projectTypes.webapp')},
    {value: 'internalTool', label: t('fields.projectTypes.internalTool')},
    {value: 'landing',      label: t('fields.projectTypes.landing')},
    {value: 'other',        label: t('fields.projectTypes.other')}
  ];

  const [form, setForm] = useState<FormState>({name: '', email: '', projectType: '', message: ''});
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) {
        setTypeOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = '⚠';
    if (!form.email.trim()) {
      e.email = '⚠';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = '⚠';
    }
    if (!form.projectType) e.projectType = '⚠';
    if (!form.message.trim()) e.message = '⚠';
    return e;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const honeypot = String(fd.get('website') ?? '');
    const turnstileToken = String(fd.get('cf-turnstile-response') ?? '');

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...form, website: honeypot, turnstileToken})
      });
      if (!res.ok) {
        setSubmitError(t('error'));
        window.turnstile?.reset();
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError(t('error'));
      window.turnstile?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const {name, value} = e.target;
    setForm(prev => ({...prev, [name]: value}));
    if (errors[name as keyof FormState]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }
  }

  function selectProjectType(value: string) {
    setForm(prev => ({...prev, projectType: value}));
    if (errors.projectType) setErrors(prev => ({...prev, projectType: undefined}));
    setTypeOpen(false);
  }

  const fieldClass = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-white transition-colors outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
      err ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
    }`;

  const selectedType = projectTypes.find(pt => pt.value === form.projectType);

  return (
    <section id="contact" className="py-24 bg-white">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
          strategy="afterInteractive"
        />
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            {t('title')}
          </h2>
          <div className="w-12 h-1 rounded-full bg-brand mx-auto" />
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500 mb-10">{t('intro')}</p>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-gray-900">{t('success')}</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('fields.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={fieldClass(errors.name)}
                    placeholder="Jan Novák"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('fields.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={fieldClass(errors.email)}
                    placeholder="jan@firma.cz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('fields.projectType')}
                </label>
                <div ref={typeRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setTypeOpen(v => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={typeOpen}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm bg-white transition-colors outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                      errors.projectType ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={selectedType ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedType ? selectedType.label : t('fields.projectTypes.placeholder')}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform shrink-0 ${typeOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {typeOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10"
                    >
                      {projectTypes.map(pt => (
                        <button
                          key={pt.value}
                          type="button"
                          role="option"
                          aria-selected={pt.value === form.projectType}
                          onClick={() => selectProjectType(pt.value)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            pt.value === form.projectType
                              ? 'bg-gray-50 font-semibold text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('fields.message')}
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  className={fieldClass(errors.message)}
                  placeholder="..."
                />
              </div>

              {/* Honeypot — humans never see or fill this; bots usually do. */}
              <div
                aria-hidden="true"
                style={{position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden'}}
              >
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {TURNSTILE_SITE_KEY && (
                <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" />
              )}

              {submitError && (
                <p className="text-sm text-red-500" role="alert">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={15} />
                {submitting ? t('sending') : t('fields.submit')}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-500">
            <Mail size={14} />
            <a
              href={`mailto:${siteConfig.email}`}
              className="hover:text-brand transition-colors"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
