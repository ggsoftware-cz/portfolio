'use client';

import {useLayoutEffect, type RefObject} from 'react';
import {heroProgress, heroScene, smoothProgress} from '@/lib/configurator/motion';
import type {Colorway} from '@/lib/configurator/shop';

/** All coordinates use layout pixels, including a scaled iPhone preview. */
export function useShiftScroll(rootRef: RefObject<HTMLElement | null>, trackRef: RefObject<HTMLDivElement | null>, heroRef: RefObject<HTMLDivElement | null>, enabled: boolean, showing: boolean, contentKey: string, colorway: Colorway) {
  useLayoutEffect(() => {
    const root = rootRef.current, track = trackRef.current, hero = heroRef.current;
    const viewport = root?.closest<HTMLElement>('[data-storefront-viewport]');
    const nav = root?.querySelector<HTMLElement>('header');
    const slot = hero?.querySelector<HTMLElement>('[data-hero-product-slot]');
    const product = root?.querySelector<HTMLElement>('[data-travelling-product]');
    if (!root || !track || !hero || !viewport || !nav || !slot || !product || !showing) return;
    const targetCard = root.querySelector<HTMLElement>(`[data-product-card="${colorway}"]`);
    const target = targetCard?.querySelector<HTMLElement>('[data-card-product]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, distance = 0, navHeight = 0, height = 0;
    const update = () => {
      frame = 0;
      const viewportRect = viewport.getBoundingClientRect();
      const scale = viewportRect.width / viewport.offsetWidth;
      if (!scale) return;
      const start = Math.max(0, viewport.scrollTop + (track.getBoundingClientRect().top - viewportRect.top) / scale - navHeight);
      const progress = heroProgress(viewport.scrollTop, start, distance);
      const scene = heroScene(progress);
      track.style.setProperty('--shift-retreat', String(scene.retreat));
      track.style.setProperty('--shift-frame-scale', String(scene.frameScale));
      track.style.setProperty('--shift-type-travel', `${scene.typeTravel}%`);
      root.dataset.sceneDark = progress > .03 ? 'true' : 'false';
      hero.inert = progress > .2;
      product.inert = progress > .2;
      product.style.setProperty('--shift-controls', String(Math.max(0, 1 - scene.retreat * 5)));
      const next = track.querySelector<HTMLElement>('[data-scene-next]');

      // The live product sits outside the clipped hero frame. Match its slot at
      // first, then interpolate to the actual collection card (no magic offsets).
      const origin = slot.getBoundingClientRect(), rootRect = root.getBoundingClientRect();
      let x = origin.left, y = origin.top, width = origin.width, transfer = 0;
      if (target && distance) {
        const destination = target.getBoundingClientRect();
        const targetCenter = viewport.scrollTop + (destination.top + destination.height / 2 - viewportRect.top) / scale - navHeight;
        const begin = start + distance * .78;
        const end = Math.max(begin + height * .65, targetCenter - height * .55);
        transfer = heroProgress(viewport.scrollTop, begin, end - begin);
        const blend = smoothProgress(transfer);
        // Stay to the right of the incoming title, then arc into the card.
        const lateral = viewport.clientWidth > 700 ? smoothProgress(heroProgress(transfer, .6, .4)) : blend;
        x += (destination.left - x) * lateral;
        y += (destination.top - y) * blend;
        width += (destination.width - width) * blend;
        // A brief crossfade at the identical resting pose hides GPU/poster seams.
        const fade = heroProgress(transfer, .97, .03);
        target.style.opacity = String(fade);
        targetCard!.dataset.docking = transfer < 1 ? 'true' : 'false';
        product.style.opacity = String(1 - fade);
      } else {
        product.style.opacity = '1';
        target?.style.removeProperty('opacity');
        if (targetCard) delete targetCard.dataset.docking;
      }
      if (next) {
        next.inert = progress < .65 || transfer > .1;
        next.style.opacity = String(heroProgress(progress, .55, .15) * (1 - heroProgress(transfer, 0, .15)));
      }
      track.style.setProperty('--shift-departure', String(smoothProgress(heroProgress(transfer, 0, .35))));
      root.style.setProperty('--shift-collection-reveal', String(distance && target ? heroProgress(transfer, .66, .1) : 1));
      product.style.setProperty('--shift-poster-turn', `${Math.sin(transfer * Math.PI) * -18}deg`);
      const baseWidth = parseFloat(getComputedStyle(slot).width);
      product.style.width = `${baseWidth}px`;
      product.style.height = `${baseWidth * 7 / 9}px`;
      product.style.transform = `translate3d(${(x - rootRect.left) / scale}px, ${(y - rootRect.top) / scale}px, 0) scale(${width / scale / baseWidth})`;
      product.style.visibility = transfer === 1 ? 'hidden' : 'visible';
      root.dataset.progress = String(progress);
      root.dataset.transfer = String(transfer);
      root.dispatchEvent(new CustomEvent('shift:scroll', {detail: {progress, transfer}}));
    };
    const schedule = () => {if (!frame) frame = requestAnimationFrame(update);};
    const measure = () => {
      if (!viewport.clientWidth || !viewport.clientHeight) return;
      navHeight = nav.offsetHeight;
      height = viewport.clientHeight - navHeight;
      const headline = hero.querySelector<HTMLElement>('[data-hero-heading]');
      const canPin = enabled && !reduced.matches && height >= 460 && (headline?.textContent?.length || 0) < 55;
      distance = canPin ? height * 1.2 : 0;
      root.style.setProperty('--shift-nav-height', `${navHeight}px`);
      root.style.setProperty('--shift-screen-height', `${height}px`);
      track.dataset.scroll = canPin ? 'true' : 'false';
      update();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport); observer.observe(nav); observer.observe(hero);
    if (target) observer.observe(target);
    viewport.addEventListener('scroll', schedule, {passive: true});
    reduced.addEventListener('change', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      viewport.removeEventListener('scroll', schedule); reduced.removeEventListener('change', measure);
      delete track.dataset.scroll;
      for (const key of ['--shift-retreat', '--shift-frame-scale', '--shift-type-travel', '--shift-departure']) track.style.removeProperty(key);
      root.style.removeProperty('--shift-collection-reveal');
      delete root.dataset.sceneDark; delete root.dataset.progress; delete root.dataset.transfer;
      hero.inert = false; product.inert = false;
      target?.style.removeProperty('opacity');
      if (targetCard) delete targetCard.dataset.docking;
    };
  }, [rootRef, trackRef, heroRef, enabled, showing, contentKey, colorway]);
}
