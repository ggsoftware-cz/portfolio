# Design Language

A reference for agents working on this site. Match these conventions when adding or
editing UI so new work is indistinguishable from what's already here. Styling is
**Tailwind CSS v4** (configured via `@theme` in `app/globals.css`, no `tailwind.config`).

## Aesthetic

Clean, light, modern SaaS marketing site. Lots of whitespace, soft shadows, rounded
corners, a single bold accent color over a neutral gray scale. No gradients, no dark
mode, no heavy borders. Friendly and professional.

## Color

The brand color is defined as CSS theme tokens in `app/globals.css` — use the Tailwind
classes (`bg-brand`, `text-brand`, `border-brand`, etc.), never raw hex in components.

| Token | Hex | Usage |
|-------|-----|-------|
| `brand` | `#E01A4F` | Primary CTAs, accents, icons, links on hover, the divider bar |
| `brand-700` | `#bf1441` | Primary button hover |
| `brand-500` | `#e8356a` | Secondary icon tint |
| `brand-200` | `#f9a0b9` | Soft CTA shadow (`shadow-brand-200`) |
| `brand-100` | `#fcd0dc` | Decorative shapes, soft icon backgrounds |
| `brand-50` | `#fde8ef` | Soft icon/avatar backgrounds, decorative shapes |

Neutrals come from Tailwind's default `gray` scale:
- **Text:** `text-gray-900` (headings), `text-gray-700`/`text-gray-600` (body), `text-gray-500`/`text-gray-400` (muted, placeholders)
- **Surfaces:** `bg-white` and `bg-gray-50` alternate between sections; `bg-gray-900` for the footer
- **Borders:** `border-gray-100` / `border-gray-200`
- **Status:** `text-green-500` (success), `text-red-400`/`text-red-500` & `border-red-400` (errors)

## Typography

- Font: **Geist** (`next/font/google`), wired as `--font-geist` → `--font-sans`. Apply with `font-sans`.
- Headings are heavy: `font-black` for `h1`/`h2`, `font-bold` for `h3`.
- Hero `h1`: `text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]`.
- Section `h2`: `text-3xl sm:text-4xl font-black`.
- Body: `text-gray-500`/`text-gray-600` with `leading-relaxed`; lead paragraphs `text-lg sm:text-xl`.
- Small UI text: `text-sm` / `text-xs`, often `font-medium` or `font-semibold`.
- Eyebrow/labels: `text-sm font-semibold uppercase tracking-wide`.

## Layout

- Page container: `max-w-6xl mx-auto px-4 sm:px-6`. Hero/content blocks narrow further with `max-w-3xl` / `max-w-2xl`.
- Section vertical rhythm: `py-24` (hero uses `min-h-screen` + `pt-16` to clear the fixed navbar).
- Sections alternate `bg-white` and `bg-gray-50` down the page.
- Card grids: `grid sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- Mobile-first; layer responsive variants at `sm:`, `md:`, `lg:`.

## Section headers

Centered heading with a short accent bar beneath it — reuse verbatim:

```tsx
<div className="text-center mb-14">
  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{title}</h2>
  <div className="w-12 h-1 rounded-full bg-brand mx-auto" />
</div>
```

## Components & patterns

**Radii:** `rounded-lg` (small buttons/inputs in nav), `rounded-xl` (buttons, inputs,
dropdowns), `rounded-2xl` (cards), `rounded-full` (pills, avatars, accent bar, decorative shapes).

**Shadows:** soft and subtle — `shadow-sm` at rest, `shadow-md` on hover, `shadow-lg` for popovers/dropdowns.

**Cards:** `bg-white rounded-2xl p-7 border border-gray-100 shadow-sm`, with hover lift
`hover:shadow-md hover:-translate-y-1 transition-all duration-200`.

**Primary button:**
```tsx
className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
```

**Secondary button:** `border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50`, or a neutral fill `bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100`.

**Inputs:** `px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white hover:border-gray-300 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none`. Error state swaps the border to `border-red-400`.

**Pills/chips:** `px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm`.

**Custom dropdowns:** built from a `<button>` + absolutely-positioned panel (no native
`<select>`), with `role="listbox"`/`role="option"`, `aria-haspopup`, `aria-expanded`,
close-on-outside-click via a `mousedown` listener, and a `ChevronDown` that rotates 180° when open.

**Navbar:** `fixed` and transparent at top; on scroll (`scrollY > 8`) becomes `bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100`.

**Icons:** [`lucide-react`](https://lucide.dev), sized 14–22px, usually `strokeWidth={2}` (or `2.5` for emphasis). Tint with `text-brand` etc. Soft icon backplate: `inline-flex p-3 rounded-xl bg-brand-50`.

**Decorative background:** large blurred `rounded-full` brand-tinted blobs at low opacity, plus a faint SVG dot-grid pattern (`opacity-[0.03]`). Always `aria-hidden` and `pointer-events-none`.

## Motion

- Use `transition-colors` for color/background changes, `transition-all duration-200` for card hover lift, `transition-transform` for chevron rotation.
- Page scrolling is smooth (`scroll-behavior: smooth` + anchor `href="#section"` navigation).
- Keep it restrained — subtle hover lifts and fades only, no large or looping animations.

## Accessibility

- Decorative elements get `aria-hidden`; interactive controls get `aria-label` / `aria-expanded` / `aria-haspopup` and proper roles.
- Forms validate client-side, show inline error state, and use a hidden honeypot field + Cloudflare Turnstile for spam protection.
- Maintain visible focus styles (`focus:ring-2 focus:ring-brand/20`).

## Conventions

- Content is internationalized with `next-intl` — never hardcode user-facing strings; pull from `messages/{cs,en}.json` via `useTranslations`. Default locale is `cs`.
- Keep components server-first; add `'use client'` only when interactivity (state, effects, listeners) requires it.
- Site-wide values (name, email, URL, socials) live in `config/site.ts`.
