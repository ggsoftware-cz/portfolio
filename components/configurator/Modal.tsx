'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {X} from 'lucide-react';
import s from './studio.module.css';

export default function Modal({open, onClose, titleId, children, dismissible = true}: {open: boolean; onClose: () => void; titleId: string; children: ReactNode; dismissible?: boolean}) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useTranslations('configurator');
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return <dialog ref={ref} aria-labelledby={titleId} className={s.modal} onCancel={event => {if (!dismissible) event.preventDefault(); else onClose();}}
    onClick={event => {if (dismissible && event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); }}}>
    <button type="button" className={s.modalClose} aria-label={t('close')} onClick={onClose} disabled={!dismissible}><X size={20} aria-hidden /></button>
    {open && children}
  </dialog>;
}
