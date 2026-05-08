# GG Software — Portfolio Website Spec

## Project Overview

Build a portfolio/landing website for **GG Software**, a small web & internal software development agency. The site should feel modern, approachable, and startup-friendly — clean UI, no corporate stiffness, slightly playful but professional.

---

## Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Fonts:** Inter (or Geist) for body, a slightly bolder weight for headings
- **Icons:** Lucide React

---

## Brand

- **Name:** GG Software
- **Tagline:** Fast & affordable — no fluff
- **Logo:** Placeholder `<Logo />` component (image slot, `logo.png` in `/public`) — leave a clearly marked TODO comment
- **Tone:** Friendly, direct, confident. No buzzwords. Talks like a person, not a brochure.
- **Color palette:** Pick a modern startup palette — suggested: white background, a vivid accent (e.g. indigo or violet), dark gray for text, light gray for section backgrounds. Keep it cohesive.

---

## Pages & Sections

Single-page layout (`/`), smooth scroll between sections.

### 1. Navbar

- Logo placeholder on the left
- Nav links: Services, Pricing, About, Contact
- CTA button: "Get a quote" → scrolls to Contact
- Sticky on scroll, subtle backdrop blur

---

### 2. Hero

- Large headline using the tagline: **"Fast & affordable — no fluff"**
- Sub-headline: something like _"We build web apps and internal tools that actually get delivered. No bloat, no BS, just working software."_
- Two CTAs: primary **"Get a quote"** (scrolls to Contact), secondary **"See our services"** (scrolls to Services)
- Background: clean with a subtle gradient or abstract geometric shapes — nothing stock-photo-y
- Optional: a simple animated code snippet or dashboard mockup illustration as a visual accent (pure CSS/SVG, no images needed)

---

### 3. Services

Section title: **"What we build"**

Three service cards:

| Service                         | Icon              | Description                                                                                   |
| ------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Web Apps                        | `LayoutDashboard` | Custom business tools, dashboards, and data-heavy apps — built to actually fit your workflow. |
| Internal Tools & CRUD Apps      | `Database`        | From admin panels to inventory systems — fast to ship, easy to maintain.                      |
| Landing Pages & Marketing Sites | `Globe`           | Conversion-focused, fast-loading sites that look great and get out of the way.                |

Cards should have an icon, title, short description, and subtle hover effect.

---

### 4. Pricing

Section title: **"Simple, honest pricing"**

Three tiers in a card layout. Highlight the middle tier as most popular.

| Tier    | Name                | Price       | Contents                                                                            |
| ------- | ------------------- | ----------- | ----------------------------------------------------------------------------------- |
| Basic   | Landing Page        | From €499   | Single-page marketing site, mobile responsive, contact form, delivered in 5–7 days  |
| Popular | Web App / Tool      | From €1 499 | Custom web app or internal tool, up to 5 core features, admin panel, 30-day support |
| Custom  | Enterprise / Custom | Let's talk  | Complex systems, integrations, ongoing dev — scoped together                        |

- Each card: name, price, bullet list of inclusions, CTA button ("Get started" / "Contact us")
- Popular card: accent color border/badge, slightly elevated

---

### 5. About

Section title: **"Who we are"**

- Short paragraph: _"GG Software is a small, focused team of developers. We skip the account managers and the overhead — you work directly with the people writing your code. That's how we stay fast and affordable."_
- Two or three stat/highlight chips (e.g. "⚡ Avg. delivery: 2 weeks", "💬 Direct dev communication", "✅ Fixed-price projects")
- Team section: placeholder for 1–2 team member cards (name, role, avatar placeholder circle) — leave a TODO comment to swap in real photos/names

---

### 6. Contact

Section title: **"Let's build something"**

- Short intro line: _"Tell us what you need. We'll get back to you within 24 hours."_
- Contact form fields:
    - Name (text)
    - Email (email)
    - Project type (select: Web App, Internal Tool, Landing Page, Other)
    - Message (textarea)
    - Submit button: "Send message"
- Form should have basic client-side validation (required fields, email format)
- On submit: show a success message (no backend needed — just a simulated success state with `useState`)
- Also show contact email: `ggsoftware.cz@gmail.com` (placeholder)

---

### 7. Footer

- Logo placeholder + tagline
- Quick links: Services, Pricing, About, Contact
- Copyright: `© 2025 GG Software. All rights reserved.`
- Optional: LinkedIn / GitHub icon links (placeholder `#` hrefs)

---

## Internationalization (i18n)

The site must support **Czech (cs) and English (en)**, with Czech as the default.

### Implementation

- Use **`next-intl`** for i18n (`npm install next-intl`)
- Locale routing: `/` and `/cs` → Czech, `/en` → English (or use `next-intl` middleware with locale prefix strategy `always` except for default)
- Language switcher in the Navbar — a simple toggle/button: `🇨🇿 CS / 🇬🇧 EN`
- Store all copy in translation files:

```
/messages
  cs.json
  en.json
```

### Translation files

**`/messages/en.json`** — use the English copy already defined in this spec (hero, services, pricing, about, contact, footer).

**`/messages/cs.json`** — Czech translations:

```json
{
    "nav": {
        "services": "Služby",
        "pricing": "Ceník",
        "about": "O nás",
        "contact": "Kontakt",
        "cta": "Nezávazná poptávka"
    },
    "hero": {
        "headline": "Rychle a dostupně — bez zbytečností",
        "subheadline": "Vyvíjíme webové aplikace a interní nástroje, které se skutečně dodají. Žádné nafukování rozsahu, žádné kecy — jen funkční software.",
        "ctaPrimary": "Nezávazná poptávka",
        "ctaSecondary": "Naše služby"
    },
    "services": {
        "title": "Co děláme",
        "webApps": {
            "title": "Webové aplikace",
            "description": "Firemní nástroje, dashboardy a datově náročné aplikace — postavené tak, aby skutečně seděly vašemu procesu."
        },
        "internalTools": {
            "title": "Interní nástroje & CRUD aplikace",
            "description": "Od adminů po skladové systémy — rychlé na vývoj, jednoduché na údržbu."
        },
        "landingPages": {
            "title": "Landing pages & weby",
            "description": "Weby zaměřené na konverzi, rychlé a přehledné — bez zbytečného balastu."
        }
    },
    "pricing": {
        "title": "Jednoduchý, férový ceník",
        "tiers": {
            "landing": {
                "name": "Landing page",
                "price": "Od 12 900 Kč",
                "features": [
                    "Jednostránkový web",
                    "Responzivní design",
                    "Kontaktní formulář",
                    "Dodání za 5–7 dní"
                ]
            },
            "webapp": {
                "name": "Webová aplikace",
                "price": "Od 38 900 Kč",
                "badge": "Nejoblíbenější",
                "features": [
                    "Webová aplikace na míru",
                    "Až 5 hlavních funkcí",
                    "Administrační panel",
                    "Podpora 30 dní"
                ]
            },
            "custom": {
                "name": "Na míru",
                "price": "Domluvíme se",
                "features": [
                    "Komplexní systémy",
                    "Integrace",
                    "Průběžný vývoj",
                    "Společně navrhneme rozsah"
                ]
            }
        },
        "ctaStart": "Začít",
        "ctaContact": "Kontaktovat nás"
    },
    "about": {
        "title": "Kdo jsme",
        "description": "GG Software je malý, soustředěný tým vývojářů. Vynecháváme account managery a zbytečnou režii — komunikujete přímo s lidmi, kteří píší váš kód. Tak dokážeme zůstat rychlí a dostupní.",
        "stats": {
            "delivery": "⚡ Průměrné dodání: 2 týdny",
            "communication": "💬 Přímá komunikace s vývojáři",
            "pricing": "✅ Projekty s pevnou cenou"
        }
    },
    "contact": {
        "title": "Pojďme něco postavit",
        "intro": "Řekněte nám, co potřebujete. Ozveme se do 24 hodin.",
        "fields": {
            "name": "Jméno",
            "email": "E-mail",
            "projectType": "Typ projektu",
            "projectTypes": {
                "webapp": "Webová aplikace",
                "internalTool": "Interní nástroj",
                "landing": "Landing page",
                "other": "Jiné"
            },
            "message": "Zpráva",
            "submit": "Odeslat"
        },
        "success": "Zpráva odeslána! Ozveme se brzy."
    },
    "footer": {
        "tagline": "Rychle a dostupně — bez zbytečností",
        "copyright": "© 2025 GG Software. Všechna práva vyhrazena."
    }
}
```

### Notes

- Prices in the Czech version should be in **CZK** (Kč), English version in **EUR** (€)
- The language switcher should persist the current section/scroll position when switching
- `// TODO: Add more locales here if expanding to other markets (e.g. de, sk)`

---

## Technical Notes

- Use `next-intl` for i18n — Czech default, English at `/en`
- All sections should have `id` attributes for smooth scroll nav links
- Mobile-first responsive design — hamburger menu on mobile
- Use `next/font` for font loading
- No external UI libraries (shadcn is fine if needed, but keep it minimal)
- Animations: subtle fade-in on scroll using Tailwind + Intersection Observer, or `framer-motion` if preferred — keep it lightweight
- No backend, no database — fully static
- Deploy-ready for Vercel out of the box (`next build` should work clean)

---

## File Structure Suggestion

```
/app
  layout.tsx
  page.tsx
  /[locale]
    layout.tsx
    page.tsx
/components
  Navbar.tsx
  Hero.tsx
  Services.tsx
  Pricing.tsx
  About.tsx
  Contact.tsx
  Footer.tsx
/messages
  cs.json
  en.json
/public
  logo.png        ← placeholder, swap later
```

---

## TODOs to Leave in Code

- `// TODO: Replace logo.png with actual logo`
- `// TODO: Swap placeholder team member names/photos in About section`
- `// TODO: Wire up contact form to backend / email service (e.g. Resend, Formspree)`
- `// TODO: Replace ggsoftware.cz@gmail.com with real contact email`
