'use client';

import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Minus, Plus, RotateCcw, ShoppingBag, X} from 'lucide-react';
import type {Configuration} from '@/lib/configurator/config';
import {addToBag, bagQuantity, bagTotal, changeQuantity, colorways, demoPrice, MAX_QUANTITY, productTints, shoeSizes, type BagLine, type Colorway} from '@/lib/configurator/shop';
import s from './shift.module.css';
import {useShiftScroll} from './useShiftScroll';
import {revealProductView} from './productViewMotion';

// Gallery thumbnails stay static. Live previews and hovered cards load 3D on demand.
const SneakerCanvas = dynamic(() => import('./SneakerCanvas'), {ssr: false});
const swatches = productTints;
const poster = (colorway: Colorway) => `/templates/shift/air-jordan-${{beach: 'original', midnight: 'blue', street: 'rose'}[colorway]}.webp`;

function ProductStage({colorway, motion, miniature}: {colorway: Colorway; motion: boolean; miniature: boolean}) {
  const t = useTranslations('configurator.shop');
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [turn, setTurn] = useState(0);
  const [reset, setReset] = useState(0);
  const [visible, setVisible] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (miniature || !stage.current) return;
    const node = stage.current;
    let inView = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
    const start = () => {
      // Keep the phone's first paint light; a tap explicitly starts its 3D view.
      if (inView && (node.closest<HTMLElement>('[data-shift-store]')?.clientWidth || 0) > 700 && !reduced.matches && !connection?.saveData) setVisible(true);
    };
    const observer = new IntersectionObserver(([entry]) => {inView = entry.isIntersecting; start();}, {rootMargin: '100px'});
    const resize = new ResizeObserver(start);
    observer.observe(node); resize.observe(node);
    return () => {observer.disconnect(); resize.disconnect();};
  }, [miniature]);
  return <div className={s.productStage} ref={stage}>
    <div className={s.productShadow} aria-hidden />
    <div className={s.productVisual} role="img" aria-label={t('productAlt', {color: t(colorway)})}>
      <Image className={`${s.poster} ${status === 'ready' ? s.posterHidden : ''}`} src={poster(colorway)} alt="" fill sizes={miniature ? '70vw' : '(max-width: 700px) 90vw, 55vw'} fetchPriority={miniature ? 'low' : 'high'} loading={miniature ? 'lazy' : 'eager'} />
      {!miniature && visible && status !== 'unavailable' && <div className={`${s.canvas} ${status === 'ready' ? s.canvasReady : ''}`}><SneakerCanvas colorway={colorway} motion={motion} turn={turn} reset={reset} onStatus={setStatus} /></div>}
    </div>
    {!miniature && <div className={s.viewerBar}>
      {!visible ? <button className={s.activate3d} onClick={() => setVisible(true)}><RotateCcw size={14} aria-hidden />{t('explore3d')}</button> : <span aria-live="polite">{t(status === 'ready' ? motion ? 'scrollDrag' : 'drag' : status === 'unavailable' ? 'fallback' : 'loading')}</span>}
      {status === 'ready' && <div className={s.viewerButtons}>
        <button type="button" aria-label={t('rotateLeft')} onClick={() => setTurn(value => value - 1)}><ArrowLeft size={15} aria-hidden /></button>
        <button type="button" aria-label={t('rotateRight')} onClick={() => setTurn(value => value + 1)}><ArrowRight size={15} aria-hidden /></button>
        <button type="button" aria-label={t('resetView')} onClick={() => setReset(value => value + 1)}><RotateCcw size={14} aria-hidden /></button>
      </div>}
    </div>}
  </div>;
}

function ProductCard({colorway, index, motion, price, onSelect}: {colorway: Colorway; index: number; motion: boolean; price: string; onSelect: (value: Colorway, card: HTMLButtonElement) => void}) {
  const t = useTranslations('configurator.shop');
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const activate = (button: HTMLButtonElement) => {
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection;
    if (motion && button.dataset.docking !== 'true' && !connection?.saveData && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setActive(true);
  };
  return <button className={s.productCard} data-product-card={colorway} onPointerEnter={event => {if (event.pointerType === 'mouse') activate(event.currentTarget);}} onPointerMove={event => {if (!active && event.pointerType === 'mouse') activate(event.currentTarget);}} onFocus={event => {if (event.currentTarget.matches(':focus-visible')) activate(event.currentTarget);}} onClick={event => onSelect(colorway, event.currentTarget)} aria-label={t('chooseProduct', {color: t(colorway)})}>
    <div className={s.cardImage} data-card-image style={{'--card-tint': swatches[colorway]} as React.CSSProperties}>
      <span>0{index + 1}</span>
      <div className={s.cardProduct} data-card-product>
        <Image className={`${s.poster} ${status === 'ready' ? s.posterHidden : ''}`} src={poster(colorway)} alt={t('productAlt', {color: t(colorway)})} fill sizes="(max-width:700px) 90vw, 30vw" />
        {active && status !== 'unavailable' && <div className={`${s.canvas} ${status === 'ready' ? s.canvasReady : ''}`}><SneakerCanvas mode="card" colorway={colorway} motion={motion} turn={0} reset={0} onStatus={setStatus} /></div>}
      </div>
      <span className={s.cardReveal} aria-hidden>{t(colorway)}</span><span className={s.cardArrow}><ArrowUpRight size={20} aria-hidden /></span>
    </div>
    <div className={s.cardCaption}><span><strong>{t('productName')}</strong><small>{t(colorway)}</small></span><span>{price}</span></div>
  </button>;
}

export default function ShiftStorefront({config, miniature = false, onEnquire}: {config: Configuration; miniature?: boolean; onEnquire?: () => void}) {
  const t = useTranslations('configurator');
  const shop = useTranslations('configurator.shop');
  const locale = useLocale();
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const heroTrack = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const cancelSelection = useRef<(() => void) | null>(null);
  const detailAnimation = useRef<Animation | null>(null);
  const productPage = useRef<HTMLElement>(null);
  const entry = useRef<{card: DOMRect | null; image: DOMRect | null} | null>(null);
  const returnTo = useRef<{scroll: number; color: Colorway | null; trigger: string} | null>(null);
  const restoring = useRef(false);
  const collection = useRef<HTMLElement>(null);
  const story = useRef<HTMLElement>(null);
  const productForm = useRef<HTMLDivElement>(null);
  const bagHeading = useRef<HTMLHeadingElement>(null);
  const bagTrigger = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<{base: Colorway; value: Colorway} | null>(null);
  const initialColor = config.shop?.colorway || 'beach';
  const colorway = selected?.base === initialColor ? selected.value : initialColor;
  const previousColor = useRef(colorway);
  const selectColor = (value: Colorway) => setSelected({base: initialColor, value});
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [lines, setLines] = useState<BagLine[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [message, setMessage] = useState('');
  const quantity = bagQuantity(lines);
  const name = config.content.name || t('templates.shift.business');
  const headline = config.content.headline || t('templates.shift.headline');
  useShiftScroll(root, heroTrack, hero, config.shop?.motion !== false, !miniature && !bagOpen && !productOpen, `${config.font}/${config.fontSize}/${headline}/${config.sections.services}`, colorway);
  useEffect(() => () => {cancelSelection.current?.(); detailAnimation.current?.cancel();}, []);
  useEffect(() => {if (config.shop?.motion === false) cancelSelection.current?.();}, [config.shop?.motion]);
  useLayoutEffect(() => {
    const viewport = root.current?.closest<HTMLElement>('[data-storefront-viewport]');
    if (!viewport || bagOpen) return;
    if (productOpen && productPage.current) {
      viewport.scrollTo({top: 0, behavior: 'instant'});
      previousColor.current = colorway;
      productPage.current.querySelector<HTMLElement>('[data-product-title]')?.focus({preventScroll: true});
      const origin = entry.current;
      entry.current = null;
      if (origin && config.shop?.motion !== false && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cancelSelection.current = revealProductView(productPage.current, viewport, origin.card, origin.image);
      }
    } else if (restoring.current && returnTo.current) {
      const destination = returnTo.current;
      restoring.current = false;
      viewport.scrollTo({top: destination.scroll, behavior: 'instant'});
      const selector = destination.color ? `[data-product-card="${destination.color}"]` : `[data-product-trigger="${destination.trigger}"]`;
      root.current?.querySelector<HTMLElement>(selector)?.focus({preventScroll: true});
    }
    return () => cancelSelection.current?.();
    // Colour changes within an open page must not reset its scroll or focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productOpen, bagOpen]);
  useEffect(() => {
    if (previousColor.current === colorway) return;
    previousColor.current = colorway;
    const image = productForm.current?.querySelector('img');
    if (!image || miniature || config.shop?.motion === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    detailAnimation.current?.cancel();
    // A finite response to choosing a colour; never an idle animation.
    detailAnimation.current = image.animate([{opacity: .35}, {opacity: 1}], {duration: 280, easing: 'cubic-bezier(.22,1,.36,1)'});
    return () => detailAnimation.current?.cancel();
  }, [colorway, miniature, config.shop?.motion]);
  const Heading = miniature ? 'h3' : 'h2';
  const price = (amount: number) => new Intl.NumberFormat(locale === 'cs' ? 'cs-CZ' : 'en-GB', {style: 'currency', currency: 'CZK', maximumFractionDigits: 0}).format(amount);
  const scroll = (node: HTMLElement | null) => {
    const viewport = root.current?.closest('[data-storefront-viewport]');
    if (!node || !viewport) return;
    // Work in layout pixels: the iPhone frame may be visually scaled.
    const scale = viewport.getBoundingClientRect().width / (viewport as HTMLElement).offsetWidth;
    const navHeight = root.current?.querySelector('header')?.offsetHeight || 0;
    viewport.scrollTo({top: viewport.scrollTop + (node.getBoundingClientRect().top - viewport.getBoundingClientRect().top) / scale - navHeight - 20,
      behavior: config.shop?.motion === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  useEffect(() => {if (bagOpen) {bagHeading.current?.focus({preventScroll: true}); root.current?.closest('[data-storefront-viewport]')?.scrollTo({top:0});}}, [bagOpen]);
  const closeBag = () => {setBagOpen(false); setCheckout(false); requestAnimationFrame(() => {root.current?.closest('[data-storefront-viewport]')?.scrollTo({top:0}); bagTrigger.current?.focus({preventScroll: true});});};
  const updateQuantity = (line: BagLine, next: number) => {
    setLines(value => changeQuantity(value, line.colorway, line.size, next));
    if (next === 0) requestAnimationFrame(() => bagHeading.current?.focus());
  };
  const buy = () => {
    if (!size) {setSizeError(true); productForm.current?.querySelector<HTMLButtonElement>('[data-size]')?.focus({preventScroll: true}); return;}
    const existing = lines.find(line => line.colorway === colorway && line.size === size);
    if (existing && existing.quantity >= MAX_QUANTITY) {setMessage(shop('limit')); return;}
    setLines(value => addToBag(value, colorway, size));
    setMessage(shop('added', {color: shop(colorway), size}));
  };
  const selectProduct = (value: Colorway, card?: HTMLButtonElement) => {
    cancelSelection.current?.(); detailAnimation.current?.cancel();
    const viewport = root.current?.closest<HTMLElement>('[data-storefront-viewport]');
    returnTo.current = {scroll: viewport?.scrollTop || 0, color: card ? value : null, trigger: document.activeElement?.getAttribute('data-product-trigger') || 'hero'};
    entry.current = {card: card?.querySelector('[data-card-image]')?.getBoundingClientRect() || null, image: card?.querySelector('[data-card-product]')?.getBoundingClientRect() || null};
    selectColor(value); setSizeError(false); setMessage(''); setProductOpen(true);
  };
  const closeProduct = () => {
    cancelSelection.current?.(); restoring.current = true; setProductOpen(false);
  };
  const explore = () => config.sections.services ? scroll(collection.current) : selectProduct(colorway);


  return <article data-shift-store ref={root} className={`${s.store} ${miniature ? s.miniature : ''}`} data-product-open={productOpen && !bagOpen} aria-label={`${t('templates.shift.name')} — ${t('demoLabel')}`} onKeyDown={event => {if (event.key === 'Escape' && productOpen && !bagOpen) {event.stopPropagation(); closeProduct();}}}>
    <header className={s.nav}>
      <span className={s.logo}>{name}<span aria-hidden>↗</span></span>
      <nav aria-label={`${name} ${t('demoLabel')}`}>
        {!bagOpen && config.sections.services && <button className={s.navLink} onClick={() => productOpen ? closeProduct() : scroll(collection.current)}>{shop('collection')}</button>}
        {!bagOpen && !productOpen && config.sections.about && <button className={s.navLink} onClick={() => scroll(story.current)}>{shop('ourWorld')}</button>}
        <button ref={bagTrigger} className={s.bagButton} onClick={() => {setBagOpen(value => !value); setCheckout(false);}} aria-label={shop('bagCount', {count: quantity})} aria-expanded={bagOpen}><ShoppingBag size={17} aria-hidden /><span>{shop('bag')}</span><b>{quantity}</b></button>
      </nav>
    </header>

    {bagOpen ? <section className={s.bagPage} aria-labelledby={`${id}-bag`}>
      <button className={s.textButton} onClick={closeBag}><ArrowLeft size={17} aria-hidden />{shop('continue')}</button>
      <h2 id={`${id}-bag`} ref={bagHeading} tabIndex={-1}>{shop('yourBag')}<span>({quantity})</span></h2>
      <p className={s.demoNote}>{shop('demoNote')}</p>
      {lines.length === 0 ? <div className={s.emptyBag}><ShoppingBag size={44} aria-hidden /><h3>{shop('empty')}</h3><button className={s.primary} onClick={closeBag}>{shop('explore')}<ArrowUpRight size={18} aria-hidden /></button></div> : <>
        <ul className={s.bagLines}>{lines.map(line => <li key={`${line.colorway}-${line.size}`}>
          <Image src={poster(line.colorway)} alt={shop('productAlt', {color: shop(line.colorway)})} width={180} height={140} />
          <div className={s.lineDetails}><h3>{shop('productName')} / {shop(line.colorway)}</h3><p>{shop('size')} EU {line.size}</p><strong>{price(demoPrice * line.quantity)}</strong>
            <div className={s.quantity}><button aria-label={shop('decrease', {color: shop(line.colorway), size: line.size})} onClick={() => updateQuantity(line, line.quantity - 1)}><Minus size={14} aria-hidden /></button><span>{line.quantity}</span><button disabled={line.quantity >= MAX_QUANTITY} aria-label={shop('increase', {color: shop(line.colorway), size: line.size})} onClick={() => updateQuantity(line, line.quantity + 1)}><Plus size={14} aria-hidden /></button></div>
          </div>
          <button className={s.remove} aria-label={shop('remove', {color: shop(line.colorway), size: line.size})} onClick={() => updateQuantity(line, 0)}><X size={19} aria-hidden /></button>
        </li>)}</ul>
        <div className={s.bagSummary}><div><span>{shop('subtotal')}</span><strong>{price(bagTotal(lines))}</strong></div><p>{shop('priceNote')}</p>
          {!checkout ? <button className={s.primary} onClick={() => setCheckout(true)}>{shop('checkout')}<ArrowRight size={18} aria-hidden /></button> : <div className={s.checkoutNotice} role="status"><Check size={22} aria-hidden /><h3>{shop('checkoutTitle')}</h3><p>{shop('checkoutBody')}</p><button className={s.primary} onClick={onEnquire}>{shop('buildShop')}<ArrowUpRight size={18} aria-hidden /></button></div>}
        </div>
      </>}
    </section> : productOpen ? <section ref={productPage} className={s.productPage} data-product-page aria-labelledby={`${id}-product`}>
          <button className={s.textButton} onClick={closeProduct}><ArrowLeft size={17} aria-hidden />{shop('backShop')}</button>
          <div className={s.productPanel} ref={productForm}>
            <div className={s.detailPhoto}><span>{shop('productName')} / 01</span><Image src={poster(colorway)} alt={shop('productAlt', {color: shop(colorway)})} width={900} height={700} sizes="(max-width:700px) 90vw, 35vw" /><p>{shop('colorway')} — {shop(colorway)}</p></div>
            <div className={s.productDetails} data-product-details>
              <p className={s.eyebrow}>{shop('everyday')}</p><h3 id={`${id}-product`} data-product-title tabIndex={-1}>{shop('productName')}</h3><div className={s.price}>{price(demoPrice)}<span>{shop('samplePrice')}</span></div><p>{shop('productBody')}</p>
              <fieldset><legend>{shop('colorway')} — {shop(colorway)}</legend><div className={s.colorChoices}>{colorways.map(value => <button key={value} aria-pressed={value === colorway} onClick={() => {selectColor(value); setMessage('');}}><i style={{background: swatches[value]}} />{shop(value)}</button>)}</div></fieldset>
              <fieldset aria-describedby={sizeError ? `${id}-size-error` : undefined}><legend>{shop('size')} / EU</legend><div className={s.sizes}>{shoeSizes.map(value => <button data-size key={value} aria-pressed={size === value} onClick={() => {setSize(value); setSizeError(false); setMessage('');}}>{value}</button>)}</div></fieldset>
              {sizeError && <p id={`${id}-size-error`} className={s.fieldError} role="alert">{shop('chooseSize')}</p>}
              <button className={s.primary} onClick={buy}>{shop('addBag')}<Plus size={19} aria-hidden /></button>
              <div className={s.addStatus} role="status">{message && <><Check size={15} aria-hidden /><span>{message}</span><button onClick={() => setBagOpen(true)}>{shop('viewBag')}<ArrowRight size={14} aria-hidden /></button></>}</div>
              <p className={s.demoNote}>{shop('demoNote')}</p>
            </div>
          </div>
        </section> : <>
      {!miniature && <div className={s.travellingProduct} data-travelling-product><ProductStage colorway={colorway} motion={config.shop?.motion !== false} miniature={false} /></div>}
      <div ref={heroTrack} className={s.heroTrack}>
      <div className={s.heroScene}>
        <div className={s.sceneType} aria-hidden><span>{shop('statement1')} {shop('statement1')} {shop('statement1')}</span><span>{shop('statement2')} {shop('statement2')} {shop('statement2')}</span></div>
      <div ref={hero} className={s.hero} data-shift-hero>
        <div className={s.heroTop}><p>{t('templates.shift.tagline')}</p><span>01 / {name}</span></div>
        <Heading data-hero-heading className={`${s.heroHeading} ${headline.length > 28 ? s.longHeadline : ''}`}>{headline}</Heading>
        <div className={s.heroProductSlot} data-hero-product-slot>{miniature && <ProductStage colorway={colorway} motion={false} miniature />}</div>
        <div className={s.heroBottom}>
          <div className={s.heroCopy}><p>{config.content.description || t('templates.shift.descriptionText')}</p><button className={s.primary} data-shop-cta data-product-trigger="hero" onClick={explore}>{config.content.cta || t('templates.shift.cta')}<ArrowUpRight size={20} aria-hidden /></button></div>
          <div className={s.productCaption}><span>{shop('productName')} — 01</span><p>{shop('colorway')} / {shop(colorway)}</p><div className={s.swatches} role="group" aria-label={shop('colorway')}>{colorways.map(value => <button key={value} aria-label={shop(value)} aria-pressed={colorway === value} style={{'--swatch': swatches[value]} as React.CSSProperties} onClick={() => {selectColor(value); setMessage('');}}><i /></button>)}</div></div>
        </div>
        <div className={s.heroFoot}><span>{shop('everyday')}</span><span>{shop('scroll')}<ArrowDown size={14} aria-hidden /></span></div>
      </div>
        {!miniature && <div className={s.sceneNext} data-scene-next><span>{shop('collectionEyebrow')}</span><button className={s.primary} data-product-trigger="scene" onClick={explore}>{shop('explore')}<ArrowDown size={17} aria-hidden /></button></div>}
      </div>
      </div>
      {!miniature && <>
        {config.sections.services && <section ref={collection} className={`${s.shopSection} ${s.collection}`} aria-labelledby={`${id}-collection`}>
          <div className={s.sectionTitle}><div><p className={s.eyebrow}>{shop('collectionEyebrow')}</p><h3 id={`${id}-collection`}>{shop('collectionTitle')}</h3></div><span>01 — 03</span></div>
          <div className={s.productGrid}>{colorways.map((value, index) => <ProductCard key={value} colorway={value} index={index} motion={config.shop?.motion !== false} price={price(demoPrice)} onSelect={selectProduct} />)}</div>
        </section>}
        {config.sections.about && <section ref={story} className={s.story} aria-labelledby={`${id}-story`}>
          <div className={s.storyImage}><Image src={`/templates/${config.image}.webp`} alt={t(`templates.${config.image}.imageAlt`)} fill sizes="(max-width:700px) 100vw, 50vw" /></div>
          <div className={s.storyCopy}><p className={s.eyebrow}>{shop('ourWorld')} / 02</p><h3 id={`${id}-story`}>{shop('storyTitle')}</h3><p>{shop('storyBody')}</p><button className={s.primary} data-product-trigger="story" onClick={explore}>{shop('explore')}<ArrowUpRight size={20} aria-hidden /></button><span className={s.storyMark} aria-hidden>↗</span></div>
        </section>}
        {config.sections.faq && <section className={`${s.shopSection} ${s.faq}`} aria-labelledby={`${id}-faq`}><h3 id={`${id}-faq`}>{shop('faqTitle')}</h3><div>{[1,2,3].map(index => <details key={index}><summary>{shop(`question${index}`)}<Plus size={18} aria-hidden /></summary><p>{shop(`answer${index}`)}</p></details>)}</div></section>}
        <section className={s.contact}><p className={s.eyebrow}>{t('demoLabel')}</p><h3>{shop('contactTitle')}</h3><p>{shop('contactBody')}</p><button className={s.primary} onClick={onEnquire}>{shop('buildShop')}<ArrowUpRight size={20} aria-hidden /></button></section>
      </>}
    </>}
    {!miniature && <footer className={s.footer}><span className={s.footerLogo}>{name}<span aria-hidden>↗</span></span><div><span>{shop('demoNote')}</span><a href="/templates/shift/credits.txt" target="_blank" rel="noreferrer">{shop('credits')}<ArrowUpRight size={12} aria-hidden /></a></div></footer>}
  </article>;
}
