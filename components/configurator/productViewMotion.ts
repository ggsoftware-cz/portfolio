/** Expand a selected card into a product page without moving the scroll position. */
export function revealProductView(view: HTMLElement, viewport: HTMLElement, from: DOMRect | null, imageFrom: DOMRect | null) {
  const scale = viewport.getBoundingClientRect().width / viewport.offsetWidth;
  const bounds = view.getBoundingClientRect();
  const animations: Animation[] = [];
  const timing = {duration: 620, easing: 'cubic-bezier(.22,1,.36,1)'};
  if (from && scale) {
    const top = Math.max(0, (from.top - bounds.top) / scale);
    const left = Math.max(0, (from.left - bounds.left) / scale);
    const right = Math.max(0, (bounds.right - from.right) / scale);
    const bottom = Math.max(0, (bounds.bottom - from.bottom) / scale);
    animations.push(view.animate([{clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 4px)`}, {clipPath: 'inset(0px 0px 0px 0px round 0px)'}], timing));
  } else {
    animations.push(view.animate([{opacity: 0, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], timing));
  }
  const image = view.querySelector('img');
  if (image && imageFrom && scale) {
    const to = image.getBoundingClientRect();
    const dx = (imageFrom.left - to.left) / scale, dy = (imageFrom.top - to.top) / scale;
    animations.push(image.animate([{transformOrigin: '0 0', transform: `translate(${dx}px,${dy}px) scale(${imageFrom.width / to.width},${imageFrom.height / to.height})`}, {transformOrigin: '0 0', transform: 'none'}], timing));
  }
  const details = view.querySelector<HTMLElement>('[data-product-details]');
  if (details) animations.push(details.animate([{opacity: 0, transform: 'translateY(18px)'}, {opacity: 1, transform: 'none'}], {...timing, duration: 480, delay: 100, fill: 'backwards'}));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finish = () => {
    animations.forEach(animation => animation.cancel());
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) viewport.removeEventListener(event, finish);
    window.removeEventListener('resize', finish); reduced.removeEventListener('change', finish);
    delete view.dataset.entering;
  };
  view.dataset.entering = 'true';
  for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown']) viewport.addEventListener(event, finish, {passive: true});
  window.addEventListener('resize', finish); reduced.addEventListener('change', finish);
  Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(finish);
  return finish;
}
