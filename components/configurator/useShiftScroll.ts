'use client';

import {useLayoutEffect, type RefObject} from 'react';
import {heroProgress, heroScene} from '@/lib/configurator/motion';

/** Measure in layout pixels, so a scaled iPhone and an expanded preview agree. */
export function useShiftScroll(rootRef: RefObject<HTMLElement | null>, trackRef: RefObject<HTMLDivElement | null>, heroRef: RefObject<HTMLDivElement | null>, enabled: boolean, showing: boolean, contentKey: string) {
  useLayoutEffect(() => {
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
      const scene = heroScene(progress);
      track.style.setProperty('--shift-retreat', String(scene.retreat));
      track.style.setProperty('--shift-frame-scale', String(scene.frameScale));
      track.style.setProperty('--shift-type-travel', `${scene.typeTravel}%`);
      root.dataset.sceneDark = progress > .03 ? 'true' : 'false';
      hero.inert = progress > .2;
      const next = track.querySelector<HTMLElement>('[data-scene-next]');
      if (next) { next.inert = progress < .65; next.style.opacity = String(heroProgress(progress, .55, .15)); }
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
      distance = canPin ? height * 1.2 : 0;
      root.style.setProperty('--shift-nav-height', `${navHeight}px`);
      root.style.setProperty('--shift-screen-height', `${height}px`);
      track.dataset.scroll = canPin ? 'true' : 'false';
      previous = -1;
      update();
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
      for (const key of ['--shift-retreat', '--shift-frame-scale', '--shift-type-travel']) track.style.removeProperty(key);
      delete root.dataset.sceneDark; delete hero.dataset.progress; hero.inert = false;
    };
  }, [rootRef, trackRef, heroRef, enabled, showing, contentKey]);
}
