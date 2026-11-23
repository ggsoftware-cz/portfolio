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

## Shift scroll and online model refinement (2026-11-08)

The hero now follows the preview's scroll position: type translates away, the
product turns, and the whole scene slides into the shop. Scroll back to reverse
the same pose. No idle rotation loop remains. Collection selection uses a finite
image transition, clipped to the preview screen, then focuses size selection;
wheel/touch/pointer/keyboard input cancels it cleanly. Reduced motion and the
saved motion-off setting use the static layout and direct product navigation.

Replaced the sample shoe with **Air Jordan 1 by makoto**, downloaded from the
SceneView mirror under CC BY 4.0. One complete shoe was extracted from the pair;
original geometry, two materials and all six 1024px textures are retained. The
reproducible local GLB is 1,969,812 bytes. New 21–23 KB product renders and catalogue
names match the model; two extra tints are explicitly labelled as concepts.
Source, licence and modifications are in `docs/configurator-assets.md`, embedded
GLB metadata and the public footer credits.

- Lint, TypeScript, production static export and `git diff --check` pass; all
  18 tests pass, including scroll boundaries and reversible poses.
- Production Chromium: scroll forward/back returns the same progress, stationary
  scene makes zero WebGL draws, one scroll renders the two meshes and then stops.
  Collection image transfer, completion focus, wheel cancellation and opacity
  cleanup checked on desktop and the scaled phone. Colour/size → add → bag works.
- Motion off and emulated reduced motion disable pinning and image transfer.
  CS phone starts without a GLB request, then loads the model after the 3D action.
  Expanded iPhone layouts at 320/390/768px have no document or preview overflow.
- Axe WCAG 2 A/AA + 2.1 AA: zero violations in the desktop store and expanded CS
  phone with 3D active. Physical iOS/Safari remains untested.
- Final local mobile Lighthouse against the gzip-served export: performance
  **93**, FCP **1.1s**, LCP **3.3s**, TBT **30ms**, CLS **0.009**. No GLB request
  before interaction. An earlier run with other preview sessions open measured
  65 / 1,540ms TBT; both reports are retained as
  `output/lighthouse/shift-scroll{,-final}.json`. These are variable local lab
  measurements, not field results; LCP remains above 2.5s.

Reviewed screenshots: `output/playwright/shift-scroll-desktop.png`,
`shift-scroll-midpoint.png`, `shift-scroll-phone-cs.png`,
`shift-product-transition.png`, and `shift-phone-transition.png`.
No production deployment, merge, payment or real email submission was performed.

## Reference-led scene correction (2026-11-08, subsequent revision)

This supersedes the earlier independent text translation and scrolling product
transfer. Inspected [landonorris.com](https://landonorris.com/) in a live browser:
its opening recedes as a complete framed image over a dark scene with large
horizontal type; helmet interactions reveal images within their card bounds.
Reference captures are saved as `output/playwright/lando-*.png`. No reference
branding, copy, code or media was imported into the product.

Shift now retreats as one frame. Small labels clear away, leaving the shoe in a
centred window; the backdrop type moves behind it. The entire scene then leaves
with native scrolling into a dark collection. Cards reveal their colour within
their own bounds and open a dedicated inline product page. The selected card
expands into that page; Back to shop/Escape restores the originating card or CTA
and its scroll position. Product view and bag stay inside the iPhone frame.

- Lint, TypeScript, static export and all **19 tests** pass. Added a contract for
  the frame retreat/hold and updated the reversible pose test.
- Chromium desktop/phone: selection entry, interruption, return focus/position,
  size validation, add-to-bag and bag return checked. Escape from the product
  page preserves the expanded preview. The keyboard loop excludes inert controls.
- Reduced motion and saved motion-off: no pinning or product-page animations.
  A hidden collection still supports direct product entry and return to its CTA.
- CS phone at 320/390/768px has no document/preview overflow. Zero GLB requests
  before the explicit 3D action. Checked the 3D scene after activation.
- Axe WCAG 2 A/AA + 2.1 AA: zero violations in the inset scene and product page
  inside the expanded phone. Physical Safari/iOS remains untested.
- Final local mobile Lighthouse, gzip static export: performance **93**, FCP
  **1.1s**, LCP **3.3s**, TBT **30ms**, CLS **0.01**. No model request before
  interaction. Report: `output/lighthouse/shift-scene.json`. Local lab evidence;
  LCP is still above the good threshold and no field improvement is claimed.

Reviewed evidence includes `scene-refined.png`, `scene-product-expanding.png`,
`scene-product-open.png`, `scene-phone-inset.png`, `scene-phone-cs.png` and
`scene-phone-cs-product.png` under `output/playwright/`.
No deployment, merge or real email/order submission was performed.

## Hero placement, product handoff and 3D card hover (2026-11-08)

The hero now gives the headline and product separate space: text left/product
right on desktop, product between title and CTA on phones. A single live product
sits outside the clipped hero frame, rotates through a full turn and translates
into the matching collection card. Its measured landing rectangle and resting
angle match the card poster. The outgoing frame clears as the product leaves;
the desktop path stays right of the incoming title, and phone copy appears once
the product has passed. Reversing scroll reverses the same path.

Product cards load the existing model on mouse hover or keyboard focus, turn
with the pointer and ease back to rest on leave. Touch/reduced-motion/data-saving
visitors keep the poster. No additional model assets or dependencies were added.

- Lint, TypeScript, production static export, `git diff --check` and all **20
  tests** pass. The new motion contract checks the complete turn, clamping and
  identical forward/backward poses.
- Production Chromium: measured forward/back positions are identical. The final
  product/card rectangles agree within 0.001 CSS pixels. Product selection,
  size/add-to-bag, Escape and restoration of card focus/scroll still work.
- WebGL draw instrumentation: zero calls during stationary hero, settled hover
  and settled pointer leave. Further scrolling after the product has landed
  makes zero draws in its hidden hero renderer. Card models load on demand.
- CS preview checked at 320/390/768px, desktop at 1440px: no document/preview
  horizontal overflow. Fresh phone visit makes no GLB request before the explicit
  3D action. Blocked model request retains a visible poster and fallback message.
- Reduced motion and saved motion-off disable pinning/handoff; reduced mode has
  zero active DOM animations. Axe WCAG 2 A/AA + 2.1 AA finds zero violations in
  the desktop hero, hovered collection, product view and CS phone hero. Card
  number contrast was corrected by giving labels an opaque background.

Reviewed captures include `placement-hero-refined.png`, `transfer-*.png`,
`placement-card-hover.png`, `handoff-final-hover.png`, `handoff-phone-390.png` and
`handoff-phone-product.png` in `output/playwright/`. Lighthouse was not rerun for
this revision; earlier figures above describe the earlier revision. Physical
Safari/iOS remains untested. No deployment, merge or real email/order submission.
