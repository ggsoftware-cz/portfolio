'use client';

import {useState, useSyncExternalStore} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {siteConfig} from '@/config/site';

const CONSENT_KEY = 'gg-consent';

function subscribeToConsent(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('gg-consent', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('gg-consent', callback);
  };
}

function readConsent() {
  try { return localStorage.getItem(CONSENT_KEY); }
  catch { return null; }
}

export default function CookieConsent() {
  const t = useTranslations('cookie');
  const [dismissed, setDismissed] = useState(false);
  const consent = useSyncExternalStore(subscribeToConsent, readConsent, () => 'server');
  const visible = Boolean(siteConfig.plausibleDomain) && consent === null && !dismissed;

  function choose(value: 'accepted' | 'declined') {
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Storage may be disabled. */ }
    window.dispatchEvent(new Event('gg-consent'));
    setDismissed(true);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-gray-600">
          {t('message')}{' '}
          <Link href="/privacy" className="font-medium text-brand hover:underline">
            {t('learnMore')}
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => choose('declined')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t('decline')}
          </button>
          <button
            onClick={() => choose('accepted')}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
