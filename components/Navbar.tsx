'use client';

import {useState, useEffect, useRef} from 'react';
import Image from 'next/image';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {Menu, X, ChevronDown} from 'lucide-react';

const locales = [
  {code: 'cs', label: 'Čeština', flag: '/czech.svg'},
  {code: 'en', label: 'English', flag: '/english.svg'}
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const navLinks = [
    {label: t('services'), href: '#services'},
    {label: t('pricing'), href: '#pricing'},
    {label: t('about'), href: '#about'},
    {label: t('contact'), href: '#contact'}
  ];

  const current = locales.find(l => l.code === locale) ?? locales[0];

  function switchLocale(next: string) {
    router.replace(pathname, {locale: next});
    setLangOpen(false);
    setMenuOpen(false);
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      {/* 3-col grid: logo | nav (centered) | actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-[1fr_auto_1fr] items-center h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <Image src="/icon.svg" width={32} height={32} alt="GG Software" unoptimized />
          <span className="font-bold text-gray-900 text-[15px]">GG Software</span>
        </a>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop right: CTA then language dropdown */}
        <div className="hidden md:flex items-center gap-2 justify-end">
          <a
            href="#contact"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            {t('cta')}
          </a>

          {/* Language dropdown */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Image src={current.flag} width={20} height={20} alt={current.label} unoptimized />
              {current.label}
              <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
              >
                {locales.map(l => (
                  <button
                    key={l.code}
                    role="option"
                    aria-selected={l.code === locale}
                    onClick={() => switchLocale(l.code)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                      l.code === locale
                        ? 'bg-gray-50 font-semibold text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Image src={l.flag} width={20} height={20} alt={l.label} unoptimized />
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile: hamburger on the right */}
        <div className="flex md:hidden justify-end">
          <button
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-brand py-1 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('cta')}
            </a>
            <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-gray-200 overflow-hidden">
              {locales.map(l => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    l.code === locale
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Image src={l.flag} width={18} height={18} alt={l.label} unoptimized />
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
