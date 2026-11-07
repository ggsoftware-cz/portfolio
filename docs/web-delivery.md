# Website configurator delivery

## Scope and decisions
- Existing Next.js 16.2.6 / React 19 / next-intl stack; npm; GitHub Pages static export retained.
- Routes: `/cs/configure`, `/en/configure`; discoverable from home, navigation and landing-page pricing.
- Four complete illustrative landing pages: Atelier (editorial studio), Haven (hospitality/wellness), Forma (local services), Savor (restaurants, user-requested addition).
- Journey: choose a direction → customize a live responsive preview → review and request a quote.
- No account, mandatory phone, pricing invention, testimonials, or fabricated business results.
- Presets first; fine controls optional. Browser-local design draft and shareable configuration fragment; contact details never persisted or put in links.
- Email: reusable validated Resend handler, Next route for server deployments, optional Cloudflare Worker for existing static hosting. Build-time endpoint configuration; honest mail-client fallback when unavailable. No real test emails.

## Completed evidence (2026-11-07)

| Check | Status | Evidence / limit |
| --- | --- | --- |
| Four designs and editor | pass | Atelier, Haven, Forma, Savor; complete scrolling previews, presets and detailed controls; EN/CS |
| Drafts / share / reset | pass | Reload, Unicode copy, per-template switching, invalid links, reset and storage validation |
| Quote flow | pass | Native validation; complete configuration payload; simulated delivery failure, retry with same idempotency key, provider success; contact data excluded from draft and share link |
| Server regression suite | pass | `npm test`: 12 tests; fixed recipient, UTF-8 attachment, JSON/body limits, origin, captcha/hostname/action, provider failures, Worker preflight and rate limit |
| Type checking | pass | `npx tsc --noEmit` and production build's TypeScript check |
| Repository lint | pass | `npm run lint`; existing CookieConsent effect lint issue fixed using a browser-store subscription, including unavailable-storage handling |
| Static export | pass | `npm run build`; both localized routes in `out/`; expected warning that API routes do not run on static hosting |
| Responsive / runtime | pass | Four templates at 390, 768 and 1440px; no document overflow or uncaught runtime errors. Maximum-length unbroken copy also checked at 375px |
| Automated accessibility | pass | Axe WCAG 2 A/AA + 2.1 AA on all 12 template/width combinations; Czech mobile quote dialog rechecked after darkening its small-print text |
| Keyboard | pass | Native modal Escape/focus return; expanded-preview focus trap and Escape; focus styles, native controls |
| Gallery / metadata | pass | EN/CS at 390, 768, 1440px; localized title, description, canonical, reciprocal alternates, initial HTML, no unintended noindex. Gallery miniature overlaps caused some axe contrast items to require visual review; screenshot text is readable and card stacking was subsequently corrected |
| Local production fallback | pass | Exported pages explicitly show a prepared-email handoff when endpoint is unset; no false send-success state. Email app was not opened and no real emails were sent |
| Lighthouse mobile lab | pass | Local static export `/en/configure`: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.7s, FCP 1.7s, TBT 30ms, CLS 0. Default simulated mobile throttling. Not field Core Web Vitals |
| Safari / physical devices | not-run | Chromium checks only; real Safari/device testing remains a release check |
| Live Turnstile / inbox receipt | not-run | No authorized production delivery test; providers mocked in tests |
| Production deployment | not-run | Local implementation only. Deploy the optional email Worker and set public endpoint/widget variables for in-page delivery on GitHub Pages |
| Field conversion / performance | not-run | Requires live traffic; no conversion increase is claimed |

Screenshots are in `output/playwright/`: gallery, all four desktop/mobile previews,
EN desktop quote, CS mobile quote, homepage entry and static email handoff.
The generated Lighthouse report is `output/lighthouse/configurator.report.html`.
The initial gallery audit is under `output/configurator-audit/`.

Release notes and exact email configuration are in `docs/configurator.md`.
Photography provenance is in `docs/configurator-assets.md`. No accounts, payments,
new analytics or externally hosted site were created. Existing hosting is retained.

Deployment: use the existing Pages workflow after review. It now runs lint and the
regression suite on Node 22 before export and accepts public endpoint/widget vars.
Rollback: redeploy the previous Pages artifact/source revision; there is no data
migration. Disable the endpoint build variable to return to the email-client flow.

Mobile preview refinement (2026-11-07): added an adaptive iPhone-style frame with
decorative status/address chrome and a stable 390px website viewport. Chromium
checks passed for all four templates at 320, 390, 768 and 1440px, including frame
fit, no horizontal overflow, internal scrolling, expansion and Escape. Also
verified live palette updates, desktop switching and the Czech mobile default.
Axe WCAG 2 A/AA and 2.1 AA found no violations in the four mobile previews.
Repository lint, TypeScript and the production static export passed. Screenshots:
`output/playwright/iphone-preview-desktop.png`,
`output/playwright/iphone-preview-mobile-checked.png` and
`output/playwright/iphone-preview-cs-expanded.png`. Physical iOS/Safari checks
remain outstanding.

## Shift storefront verification (2026-11-07)

Fifth configurable direction: original fashion/lifestyle store inspired by the
Lando Norris reference. Three.js renders a licensed local sneaker with three
material variants; original typography, layout and copy surround it. Existing
landing pages and the SEO work remain intact. The bag is a client-side demo,
with an explicit checkout boundary leading to the real design-enquiry flow.

- `npm run lint`, TypeScript in `npm run build`, static export and `git diff --check` pass.
- `npm test`: 16 tests pass, including distinct bag variants, quantity limits,
  totals/removal, version-1 draft compatibility, untrusted shop settings and the
  existing enquiry/Worker protections.
- Chromium desktop journey: size validation → add/merge multiple variants → bag
  quantity edits/removal → demo checkout → GG quote dialog. No real email or
  payment was submitted. Bag heading focus and expanded-preview keyboard loop
  checked, including the new credits link.
- Responsive: CS iPhone preview at 320/390px and intermediate 768px / desktop
  1440px; no document or preview horizontal overflow. Maximum-length unbroken
  content with Georgia at 125% also fits without horizontal scrolling.
- Preset product colour and motion survive generated design links and reloads.
  Gallery loads no GLB. Three.js is deferred until an active desktop stage or an
  explicit 3D request on a small/reduced-motion/data-saving preview.
- Axe WCAG 2 A/AA + 2.1 AA: zero violations in desktop store and mobile store
  with the interactive model. This is supporting evidence, not full conformance.
- Reduced motion: instrumented WebGL draws remain unchanged at idle; a labelled
  rotation button draws the new view. Forced unavailable WebGL preserves the
  product poster and usable size validation, with no uncaught page errors.
- Local mobile Lighthouse, final static export with gzip for text/JS/CSS and
  default simulated mobile throttling: performance **90**, FCP **1.1s**, LCP
  **3.5s**, TBT **110ms**, CLS **0.009**. No GLB requested before interaction.
  LCP remains above the 2.5s good threshold in this lab run; share fragments select
  the editor after hydration. These are local lab results, not field Core Web
  Vitals or a measured conversion improvement. The report is
  `output/lighthouse/shift.json`.

Visual evidence in `output/playwright/`: `shift-desktop.png`,
`shift-mobile-final.png`, `shift-mobile-cs.png`, `shift-bag.png`,
`shift-gallery-card.png`, `shift-fallback.png`.
Physical iOS/Safari, live provider receipt and production hosting remain untested.
No deployment or merge is performed. If direct in-page email is configured, deploy
its Worker from this revision so its validator accepts Shift and Barlow settings;
the existing email-app fallback does not require that deployment.
