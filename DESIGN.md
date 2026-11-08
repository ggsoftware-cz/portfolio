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

## Website configurator (November 2026)

The configurator is an intentional exception to the portfolio's repeated centered
section headers: its shell is a quiet, practical workspace in the established
Geist / white / GG pink identity. A dedicated `/[locale]/configure` route leaves
space for a real page preview. The homepage introduces the same five designs.

Distinct compositions, rather than color skins:

- **Atelier**: architecture / studios / independent experts. Left-aligned generous
  display type, image occupying the right two-thirds of a composed hero, editorial
  project rows. Default palette: paper `#f5f4ef`, ink `#24382f`, moss `#355b43`,
  pale sage `#dce4d8`. Georgia display, Geist body. Quiet, rounded image corners.
- **Haven**: hospitality / wellness / experiences. Full-width photographic opening,
  a floating white navigation line, centered Georgia typography, a grounded
  reservation-like contact strip and alternating image/story sections. Default
  palette: white `#fcfaf6`, ink `#263b40`, ocean `#235c68`, pale sand `#eee7da`.
- **Forma**: trades / local and professional services. Bold Arial display,
  split cobalt and image hero, clear service list, explicit three-step customer
  process, repeated quote action. Default palette: white `#ffffff`, ink `#172437`,
  cobalt `#2449c7`, ice `#edf1fa`.

Concept review: removed invented review stars, large metrics, repeated feature-card
kits and decorative gradients. All three keep familiar navigation and contact
buttons. Demo business names and copy are explicitly illustrative. A buyer can
replace hero copy, choose a palette or individual colors, change display fonts,
scale, spacing, width, alignment, image treatment, corners and visible sections.

The fourth direction, **Savor**, was added at the user’s request for restaurants.
It uses an expressive Georgia masthead, an arched food photo and a generous
menu list. Palette: cream `#fff8ed`, wine `#852d36`, deep ink `#4a2026`.

Layout: two-column gallery of Atelier, Haven, Forma and Savor; editor
`[controls 300px] [live site preview]`; mobile uses preview/controls views with
persistent quote action. Section rhythm scales with one spacing token. Display
font options: Geist, Georgia, Arial, Palatino with system fallbacks. CSS variables
scope every theme to its preview; container queries make mobile preview genuine.
Motion responds to interaction; reduced motion disables smooth scrolling/transitions.

Mobile preview refinement: use a graphite iPhone-style frame with a Dynamic
Island, camera, quiet status/address chrome, side buttons and a home indicator.
Render the template at a stable 390px screen width, then scale the complete frame
to the available canvas. On narrow screens, default to phone mode and fit its
width so text remains readable; expanded mode fits the complete device to the
available height as well. Keep the website itself scrollable inside the screen.
Hardware details are decorative, non-interactive and hidden from screen readers.

## Shift — fashion / lifestyle storefront

Fifth direction, explicitly inspired by https://landonorris.com/: an oversized
condensed masthead, floating interactive product, pale canvas, acid accent,
contrasting editorial section and a large closing wordmark. Adapt the visual
rhythm to a shop with a clear buying path; retain original names/copy/assets.
Use Barlow Condensed 800 (`--font-barlow`, Arial Narrow / Arial fallbacks), Geist
body, lime `#d2f600`, paper `#f5f5f0`, ink `#25291f`. The four palette presets
and existing spacing / radius / width / type tokens remain editable.

Hierarchy: brand / bag, expressive hero with 3D sneaker, product / colour / size
selection, three-colour collection, editorial story, practical FAQ, GG enquiry.
A one-page bag stays inside the preview, including the scaled iPhone, without
nested dialog traps. Demo pricing is illustrative, with no payment collection or
claims of real inventory, shipping, reviews or offers. Customers can configure
initial shoe colour and motion as part of their saved design. Browsing colour,
size and bag contents is ephemeral demo state, excluded from enquiry payloads.

Three.js is dynamically imported only in an active visible preview. Gallery and
no-WebGL states use local product renders. Cap DPR at 1.5; stop rendering outside
the viewport or a hidden tab; honour reduced motion and the saved scroll-animation setting.
Drag gestures and labelled rotate/reset buttons inspect the product. Vertical
touch gestures still scroll. Keep the 3D asset and its attribution local.

Small previews, reduced-motion users and data-saving connections start with the
local poster and an explicit “Explore in 3D” action. Desktop previews at least
600px wide activate 3D near the viewport. This keeps the initial phone visit light
while retaining the same interactive model after a tap.

## Shift motion refinement (November 2026)

Keep the Shift palette and Barlow/Geist hierarchy. The opening now occupies one
preview screen, followed by a short pinned scroll passage: display type travels
left/up, the product turns and moves toward the centre, then the complete hero
slides out as the shopping section arrives. Scrolling back reverses the same
poses. There is no idle turntable or time-based floating. The preview's own scroll
container is the source of progress, including inside the scaled iPhone frame.

A selected collection image travels into its product detail while the preview
scrolls there. Variant changes use a short, deliberate product transition; rapid
selections cancel the previous transition. Keep navigation and purchase controls
available, use no wheel interception or scroll snapping, and retain a static
layout for reduced motion, disabled motion and unusually short previews.

Use the online Air Jordan 1 model by makoto (CC BY 4.0), with the original leather,
stitching, laces and texture maps. The default is its original black/white finish;
two additional tints are labelled as concepts. Product imagery, the interactive
view and catalogue names must all agree. Keep original author attribution visible
in the footer credits and embedded in the asset.
