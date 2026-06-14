'use client';

import {useEffect, useState} from 'react';
import Script from 'next/script';
import {siteConfig} from '@/config/site';

const CONSENT_KEY = 'gg-consent';

// Loads Plausible (cookie-less, privacy-friendly) only after the visitor has
// accepted, and only when a domain is configured in siteConfig.
export default function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!siteConfig.plausibleDomain) return;
    const check = () => setAllowed(localStorage.getItem(CONSENT_KEY) === 'accepted');
    check();
    window.addEventListener('gg-consent', check);
    return () => window.removeEventListener('gg-consent', check);
  }, []);

  if (!siteConfig.plausibleDomain || !allowed) return null;

  return (
    <Script
      defer
      data-domain={siteConfig.plausibleDomain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
