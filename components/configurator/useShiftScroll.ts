'use client';

import {useEffect, type RefObject} from 'react';
import {heroProgress} from '@/lib/configurator/motion';

/** Measure in layout pixels, so a scaled iPhone and an expanded preview agree. */
export function useShiftScroll(rootRef: RefObject<HTMLElement | null>, trackRef: RefObject<HTMLDivElement | null>, heroRef: RefObject<HTMLDivElement | null>, enabled: boolean, showing: boolean, contentKey: string) {
  useEffect(() => {
    const root = rootRef.current, track = trackRef.current, hero = heroRef.current;
    const viewport = root?.closest<HTMLElement>('[data-storefront-viewport]');
    const nav = root?.querySelector<HTMLElement>('header');
    if (!root || !track || !hero || !viewport || !nav || !showing) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, distance = 0, navHeight = 0, previous = -1;
    const update = () => {
      frame = 0;
      const scale = viewport.getBoundingClientRect().width / viewport.offsetWidth;
      if (!scale) return;
      const start = Math.max(0, viewport.scrollTop + (track.getBoundingClientRect().top - viewport.getBoundingClientRect().top) / scale - navHeight);
      const progress = heroProgress(viewport.scrollTop, start, distance);
      if (Math.abs(previous - progress) < .0001) return;
      previous = progress;
      hero.style.setProperty('--shift-progress', String(progress));
      hero.dataset.progress = String(progress);
      hero.dispatchEvent(new CustomEvent('shift:scroll', {detail: progress}));
    };
    const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
    const measure = () => {
      if (!viewport.clientWidth || !viewport.clientHeight) return;
      navHeight = nav.offsetHeight;
      const height = viewport.clientHeight - navHeight;
      const headline = hero.querySelector<HTMLElement>('[data-hero-heading]');
      const canPin = enabled && !reduced.matches && height >= 460 && (headline?.textContent?.length || 0) < 55;
      distance = canPin ? height * .78 : 0;
      root.style.setProperty('--shift-nav-height', `${navHeight}px`);
      root.style.setProperty('--shift-screen-height', `${height}px`);
      track.dataset.scroll = canPin ? 'true' : 'false';
      previous = -1;
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport); observer.observe(nav);
    viewport.addEventListener('scroll', schedule, {passive: true});
    reduced.addEventListener('change', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      viewport.removeEventListener('scroll', schedule); reduced.removeEventListener('change', measure);
      delete track.dataset.scroll;
      hero.style.removeProperty('--shift-progress'); delete hero.dataset.progress;
    };
  }, [rootRef, trackRef, heroRef, enabled, showing, contentKey]);
}

/** A selected card follows the customer's scroll back into the product detail. */
export function transitionToProduct({viewport, source, target, top, onFinish}: {
  viewport: HTMLElement; source: HTMLImageElement | null; target: HTMLImageElement | null; top: number; onFinish: (completed: boolean) => void;
}): () => void {
  const from = viewport.scrollTop;
  const destination = Math.min(Math.max(0, top), viewport.scrollHeight - viewport.clientHeight);
  const scale = viewport.getBoundingClientRect().width / viewport.offsetWidth;
  const start = source?.getBoundingClientRect(), end = target?.getBoundingClientRect();
  const ghost = source && start && end ? source.cloneNode() as HTMLImageElement : null;
  const overlay = ghost ? document.createElement('div') : null;
  const sourceOpacity = source?.style.opacity || '', targetOpacity = target?.style.opacity || '';
  if (ghost && overlay && start && end) {
    const bounds = viewport.getBoundingClientRect();
    overlay.dataset.productTransition = '';
    overlay.setAttribute('aria-hidden', 'true');
    // Keep the moving image inside the preview, including a scaled phone screen.
    Object.assign(overlay.style, {position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483646', clipPath: `inset(${bounds.top}px ${window.innerWidth - bounds.right}px ${window.innerHeight - bounds.bottom}px ${bounds.left}px)`});
    ghost.removeAttribute('id'); ghost.alt = ''; ghost.setAttribute('aria-hidden', 'true');
    Object.assign(ghost.style, {position: 'fixed', inset: 'auto', left: '0', top: '0', width: `${start.width}px`, height: `${start.height}px`, objectFit: 'contain', pointerEvents: 'none', zIndex: '2147483646', margin: '0', maxWidth: 'none', transformOrigin: '0 0', transform: `translate3d(${start.left}px,${start.top}px,0)`});
    overlay.appendChild(ghost); document.body.appendChild(overlay);
    if (source) source.style.opacity = '0';
    if (target) target.style.opacity = '0';
  }
  let frame = 0, cancelled = false;
  const began = performance.now(), duration = 660;
  const cleanup = () => {
    cancelAnimationFrame(frame); overlay?.remove();
    if (source) source.style.opacity = sourceOpacity;
    if (target) target.style.opacity = targetOpacity;
    viewport.removeEventListener('wheel', cancel); viewport.removeEventListener('touchstart', cancel);
    viewport.removeEventListener('pointerdown', cancel); window.removeEventListener('keydown', cancel);
    window.removeEventListener('resize', cancel); window.removeEventListener('scroll', cancel);
  };
  const cancel = () => {if (cancelled) return; cancelled = true; cleanup(); onFinish(false);};
  const step = (now: number) => {
    if (cancelled) return;
    const progress = Math.min(1, (now - began) / duration), eased = 1 - (1 - progress) ** 3;
    viewport.scrollTo({top: from + (destination - from) * eased, behavior: 'instant'});
    if (ghost && start && end) {
      const finalY = end.top - (destination - from) * scale;
      const x = start.left + (end.left - start.left) * eased, y = start.top + (finalY - start.top) * eased;
      const sx = 1 + (end.width / start.width - 1) * eased, sy = 1 + (end.height / start.height - 1) * eased;
      ghost.style.transform = `translate3d(${x}px,${y}px,0) scale(${sx},${sy})`;
      ghost.style.opacity = String(progress > .85 ? (1 - progress) / .15 : 1);
      if (target) target.style.opacity = String(progress > .85 ? (progress - .85) / .15 : 0);
    }
    if (progress < 1) frame = requestAnimationFrame(step);
    else {cancelled = true; cleanup(); onFinish(true);}
  };
  viewport.addEventListener('wheel', cancel, {passive: true}); viewport.addEventListener('touchstart', cancel, {passive: true});
  viewport.addEventListener('pointerdown', cancel, {passive: true}); window.addEventListener('keydown', cancel);
  window.addEventListener('resize', cancel); window.addEventListener('scroll', cancel, {passive: true});
  frame = requestAnimationFrame(step);
  return cancel;
}
