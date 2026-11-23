export const templateIds = ['atelier', 'haven', 'forma', 'savor', 'shift'] as const;
export type TemplateId = (typeof templateIds)[number];
export const fontIds = ['geist', 'georgia', 'arial', 'palatino', 'barlow'] as const;
export type FontId = (typeof fontIds)[number];

export const fonts: Record<FontId, {name: string; family: string}> = {
  geist: {name: 'Geist', family: 'var(--font-geist), Arial, sans-serif'},
  georgia: {name: 'Georgia', family: 'Georgia, "Times New Roman", serif'},
  arial: {name: 'Arial', family: 'Arial, Helvetica, sans-serif'},
  palatino: {name: 'Palatino', family: 'Palatino, "Palatino Linotype", "Book Antiqua", serif'},
  barlow: {name: 'Barlow Condensed', family: 'var(--font-barlow), "Arial Narrow", Arial, sans-serif'}
};

export type Palette = {accent: string; background: string; text: string};
export const palettes: Record<TemplateId, Palette[]> = {
  shift: [
    {accent: '#d2f600', background: '#f5f5f0', text: '#25291f'},
    {accent: '#ff7648', background: '#f9f3ec', text: '#34291f'},
    {accent: '#bcb1f5', background: '#f6f5fa', text: '#292434'},
    {accent: '#9bdbcd', background: '#f0f7f4', text: '#1c3530'}
  ],
  atelier: [
    {accent: '#355b43', background: '#f5f4ef', text: '#24382f'},
    {accent: '#6b4052', background: '#faf5f7', text: '#34222b'},
    {accent: '#344e6d', background: '#f2f5f8', text: '#223344'},
    {accent: '#544b3e', background: '#faf8f3', text: '#302c25'}
  ],
  haven: [
    {accent: '#235c68', background: '#fcfaf6', text: '#263b40'},
    {accent: '#4b5e3b', background: '#f6f7f0', text: '#303a27'},
    {accent: '#75513e', background: '#fcf8f1', text: '#43362c'},
    {accent: '#584b75', background: '#f7f5fa', text: '#352c47'}
  ],
  savor: [
    {accent: '#852d36', background: '#fff8ed', text: '#4a2026'},
    {accent: '#275443', background: '#fffbed', text: '#24392c'},
    {accent: '#a13820', background: '#fff9f2', text: '#4c2c20'},
    {accent: '#36354c', background: '#f7f5f0', text: '#29283b'}
  ],
  forma: [
    {accent: '#2449c7', background: '#ffffff', text: '#172437'},
    {accent: '#a83c22', background: '#fffaf6', text: '#362d27'},
    {accent: '#246c56', background: '#f7fbf9', text: '#193c31'},
    {accent: '#6546a1', background: '#fbf9ff', text: '#2d2340'}
  ]
};

export type Configuration = Palette & {
  version: 1;
  template: TemplateId;
  font: FontId;
  fontSize: number;
  spacing: number;
  radius: number;
  width: number;
  align: 'left' | 'center';
  image: TemplateId;
  imagePosition: number;
  imageStyle: 'natural' | 'muted' | 'mono';
  sections: {services: boolean; about: boolean; faq: boolean};
  content: {name: string; headline: string; description: string; cta: string};
  shop?: {colorway: 'midnight' | 'beach' | 'street'; motion: boolean};
};

export const contentLimits = {name: 50, headline: 100, description: 240, cta: 32} as const;
export const templateNames: Record<TemplateId, string> = {atelier: 'Atelier', haven: 'Haven', forma: 'Forma', savor: 'Savor', shift: 'Shift'};
export const DRAFT_KEY = 'gg-website-design-v1';

export function createConfiguration(template: TemplateId): Configuration {
  return {
    version: 1, template, ...palettes[template][0],
    font: template === 'shift' ? 'barlow' : template === 'forma' ? 'arial' : 'georgia',
    fontSize: 100, spacing: 64, radius: template === 'haven' ? 4 : template === 'forma' ? 12 : 2,
    width: 1120, align: template === 'haven' ? 'center' : 'left',
    image: template, imagePosition: 50, imageStyle: 'natural',
    sections: {services: true, about: true, faq: true},
    content: {name: '', headline: '', description: '', cta: ''},
    ...(template === 'shift' ? {shop: {colorway: 'beach' as const, motion: true}} : {})
  };
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const within = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const hex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

// URL fragments, browser storage and API bodies all cross the same validation boundary.
export function parseConfiguration(value: unknown): Configuration | null {
  if (!record(value) || value.version !== 1 ||
    !templateIds.includes(value.template as TemplateId) || !templateIds.includes(value.image as TemplateId) ||
    !fontIds.includes(value.font as FontId) ||
    !hex(value.accent) || !hex(value.background) || !hex(value.text) ||
    !within(value.fontSize, 80, 125) || !within(value.spacing, 32, 100) ||
    !within(value.radius, 0, 32) || !within(value.width, 880, 1280) ||
    !within(value.imagePosition, 0, 100) || !['left', 'center'].includes(value.align as string) ||
    !['natural', 'muted', 'mono'].includes(value.imageStyle as string) ||
    !record(value.content) || !record(value.sections)) return null;

  for (const [key, limit] of Object.entries(contentLimits)) {
    const text = value.content[key];
    if (typeof text !== 'string' || text.length > limit || /[\u0000-\u0008\u000b-\u001f]/.test(text)) return null;
  }
  for (const key of ['services', 'about', 'faq']) {
    if (typeof value.sections[key] !== 'boolean') return null;
  }
  if (value.shop !== undefined && (!record(value.shop) ||
    !['midnight', 'beach', 'street'].includes(value.shop.colorway as string) || typeof value.shop.motion !== 'boolean')) return null;
  // Reconstruct instead of carrying arbitrary untrusted properties into drafts or emails.
  return {
    version: 1, template: value.template as TemplateId, image: value.image as TemplateId,
    accent: value.accent, background: value.background, text: value.text,
    font: value.font as FontId, fontSize: value.fontSize, spacing: value.spacing,
    radius: value.radius, width: value.width, align: value.align as Configuration['align'],
    imagePosition: value.imagePosition, imageStyle: value.imageStyle as Configuration['imageStyle'],
    sections: {services: value.sections.services as boolean, about: value.sections.about as boolean, faq: value.sections.faq as boolean},
    ...(value.template === 'shift' ? {shop: record(value.shop)
      ? {colorway: value.shop.colorway as NonNullable<Configuration['shop']>['colorway'], motion: value.shop.motion as boolean}
      : {colorway: 'beach' as const, motion: true}} : {}),
    content: {
      name: value.content.name as string, headline: value.content.headline as string,
      description: value.content.description as string, cta: value.content.cta as string
    }
  };
}

export function encodeConfiguration(config: Configuration): string {
  // UTF-8 safe, URL-safe base64; deliberately excludes the contact form.
  const bytes = new TextEncoder().encode(JSON.stringify(config));
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeConfiguration(value: string): Configuration | null {
  if (value.length > 5000 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const bytes = Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    return parseConfiguration(JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes)));
  } catch { return null; }
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map(start => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(a: string, b: string) {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function onColor(color: string) {
  return contrastRatio(color, '#ffffff') >= 4.5 ? '#ffffff' : '#000000';
}

export function configurationSummary(config: Configuration): string {
  return [
    `Template: ${templateNames[config.template]}`,
    `Colors: accent ${config.accent}, background ${config.background}, text ${config.text}`,
    `Font: ${fonts[config.font].name}; heading scale: ${config.fontSize}%`,
    `Spacing: ${config.spacing}px; corners: ${config.radius}px; width: ${config.width}px; alignment: ${config.align}`,
    `Photo: ${config.image}; position: ${config.imagePosition}%; treatment: ${config.imageStyle}`,
    ...(config.template === 'shift' ? [`3D shop: colorway ${config.shop?.colorway || 'beach'}; motion ${config.shop?.motion !== false ? 'on' : 'off'}`] : []),
    `Sections: ${Object.entries(config.sections).filter(([, enabled]) => enabled).map(([key]) => key).join(', ') || 'hero and contact only'}`,
    ...Object.entries(config.content).map(([key, value]) => `${key}: ${value || '(template default)'}`)
  ].join('\n');
}
