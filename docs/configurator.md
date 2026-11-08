# Website studio

The configurator lives at `/cs/configure` and `/en/configure`. Run `npm run dev`
and open one of these routes. The home page, main navigation, footer and landing
page pricing lead to it.

## Customer journey

1. Choose Atelier (studios), Haven (hospitality), Forma (local services), Savor
   (restaurants), or Shift (fashion and lifestyle with a 3D product).
2. Start with a palette, then optionally change individual colors, heading font
   and size, section spacing, corners, content width, alignment, photography and
   visible sections. Edit the business name, headline, introduction and CTA.
3. Explore a responsive desktop/mobile preview, expand it, or copy a design link.
4. Send the design and contact details for a quote. No account, payment, phone
   number or marketing opt-in is required.

Design drafts are stored per template in localStorage. Switching designs preserves
previous work. The last edited design can be resumed from the gallery. Storage
failures do not prevent editing. Versioned configuration fragments contain design
settings and business copy, never the contact form's name/email/notes. A shared
link is public to anyone who has it; it is not an access-control mechanism.

Illustrative business names, menu entries, questions and copy are demo content.
They are not claims about GG Software clients. No reviews, ratings, customer
counts, restaurant prices or availability have been invented. Sample CTAs scroll
to the demo's contact section, which offers the real configurator enquiry action.
These are landing-page previews, not deployed booking or restaurant systems.

## Email on the existing GitHub Pages host

GitHub Pages serves the static `out/` directory; it cannot execute the Next POST
routes. The existing `/api/contact` has the same hosting limitation and is outside
this feature's implementation.

The configurator supports two honest modes:

- **No public endpoint configured:** prepare an email to `info@ggsoftware.cz` in
  the visitor's email app with their choices and a reproducible preview link.
  The UI explicitly tells them to press Send in their email app. Copy enquiry
  and download remain available. The website does not claim this email was sent.
- **Endpoint configured:** send JSON to that endpoint and show success only when
  the handler returns an accepted email-provider ID. Failed requests preserve the
  form and offer the prepared-email fallback. Retries reuse an idempotency key.

The implementation includes `workers/configuration/index.ts` for static hosting
and `app/api/configuration/route.ts` for local development or a future Next server
host. Both use the same validated handler in `lib/configurator/submission.ts`.

### Enable in-page delivery on GitHub Pages

This is an external deployment step, not performed as part of local implementation.

1. Use an existing Cloudflare account and a verified Resend sending domain. Review
   `workers/configuration/wrangler.jsonc`; ensure `SITE_URL` matches the canonical
   browser origin and that rate-limit namespace `1001` is unused by other Workers
   in that account (choose another positive integer if necessary).
2. Deploy that Worker using your approved, pinned Wrangler toolchain. Store
   `RESEND_API_KEY`, `RESEND_FROM`, and `TURNSTILE_SECRET_KEY` as Worker secrets.
   Do not put them into GitHub Pages build variables or browser code. `CONTACT_TO`
   is already `info@ggsoftware.cz`. `RESEND_FROM` must use the verified sender.
3. Configure a Turnstile widget restricted to `ggsoftware.cz`. Its action is
   `configuration`; the server verifies success, hostname and action. Set both
   halves of the widget configuration before enabling the send endpoint.
4. Set GitHub repository Actions **variables** `NEXT_PUBLIC_CONFIGURATION_ENDPOINT`
   to the deployed Worker's HTTPS URL ending in `/configuration`, and
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the public widget key. The Pages workflow
   now passes these values into the build. No private keys belong here.
5. Rebuild/deploy the static site using the existing workflow. Verify an authorized
   real enquiry, inbox receipt, reply-to address, attached JSON and preview link.

Worker deployment command, once the account and secrets are configured:

```sh
wrangler deploy --config workers/configuration/wrangler.jsonc
```

For a Next server host, disable static export in its deployment configuration and
set `NEXT_PUBLIC_CONFIGURATION_ENDPOINT=/api/configuration` at build time. Supply
the private variables at runtime. The server adapter's in-memory throttle is only
per process; use the host's edge rate limiter and overwrite forwarded IP headers.

The Worker limits anonymous submissions by IP (5/minute/location), which may
aggregate visitors on a shared network. This is a light abuse control, combined
with Turnstile, not a strict global quota. No customer database is added.

## Validation and data handling

- 16 KB request-body bound enforced while reading, not just via Content-Length.
- Versioned runtime configuration validation with enum, color, length and numeric
  bounds; unknown fields are dropped.
- Fixed recipient, safe text-only email, Reply-To validation, bounded provider
  timeouts, honeypot, exact-origin allowlist, production Turnstile verification,
  idempotency key, no-store responses, safe provider errors.
- All arbitrary copy is rendered as React text. No HTML editor, file upload,
  user-controlled fetch URL or CSS injection is introduced.
- No secret or message payload is logged. Contact details stay in memory until
  submission. Business design preferences are explicitly covered by the updated
  privacy page copy.

## Checks

`npm test` runs the Node 22 configuration, validation, email and Worker boundary
regressions with fake transports. No test sends real mail. `npx tsc --noEmit` checks
both adapters and the UI. `npm run build` produces the existing static export.
Browser and delivery evidence is recorded in `docs/web-delivery.md`.

Primary implementation references:
- [Next static exports](https://nextjs.org/docs/app/guides/static-exports) (installed
  16.2.6 guides were read before implementation).
- [Resend send-email contract](https://resend.com/docs/api-reference/emails/send-email).
- [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- [Worker rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

## Shift 3D shop

Open `/en/configure#template=shift` or `/cs/configure#template=shift`. Shift adds
an original fashion storefront inspired by the composition and 3D interaction of
landonorris.com. Its catalogue uses a licensed Air Jordan 1 model with its original finish and two
explicitly labelled concept tints;
prices are demo amounts in CZK, not a GG Software offer or live merchandise.

The existing controls apply to typography, palette, spacing, corners, content
width, hero alignment/copy, editorial photography and optional collection,
story and FAQ sections. Shift also stores the initial product colourway and
motion setting. The optional `shop` object is validated by the same parser as
share links, local drafts and enquiries. Older version-1 designs remain valid.
Shopper selections and bag contents stay in memory and are not sent as orders.

The demo supports colour/size choice, validation, adding/merging lines, quantity
changes, removal, totals and an empty bag. Checkout explicitly ends the demo and
links to the existing GG enquiry; no payment, inventory, delivery or order service
is connected. Real store integration and client-owned product assets are a
separate implementation scope.

The active preview loads Three.js and the local 1.97 MB GLB only when its stage is
near the viewport. Gallery cards and unsupported/failed WebGL use transparent
WebP renders (21–23 KB each). Rendering responds to scroll, drag, rotation controls
and finite colour changes; there is no idle animation loop. Reduced motion,
offscreen/hidden-tab suspension, a DPR cap and cleanup limit graphics work. Labelled rotation
buttons supplement dragging; vertical touch scrolling stays available. The bag
is an inline view inside the iPhone frame, with focus moved to its heading and
returned to the bag control when closed. Credits are linked in the store footer.

**Release:** if in-page enquiry delivery is enabled, redeploy the configuration
Worker from this revision alongside the static site so its validator accepts the
new `shift` template, `barlow` font and optional shop settings. The email-app mode
needs no Worker update. No hosting or Worker deployment is performed by this PR.

Small previews, reduced-motion users and data-saving connections start with the
local poster and an explicit “Explore in 3D” action. Desktop previews wider than
700px activate 3D near the viewport. This keeps the initial phone visit light
while retaining the same interactive model after a tap.

The desktop hero separates the left headline from the product on the right. In
phones, the shoe sits between the heading and the call to action. The pale scene
recedes into a centred window over dark moving type. The live shoe then leaves
that frame, completes a full turn and translates into its matching collection
card. Its path is measured from the real hero/card layout, including the scaled
iPhone preview, and reverses with the scroll. Camera framing and the final pose
match the card poster; a short crossfade completes the handoff. The outgoing
frame and its controls clear away as the shoe leaves.

Motion disabled, reduced motion, short previews and long headlines retain the
static layout. Receded controls become inert; navigation remains available. The
expanded preview's focus loop excludes inert controls. The phone's initial
poster follows the same translation with a small tilt; tapping “Explore in 3D”
enables the full model turn.

Collection cards reveal their colour within their own bounds. Mouse hover or
keyboard focus loads a card's real 3D model on demand, turns it toward the pointer
and returns it to its resting angle on leave. Touch, reduced motion, data saving
and disabled motion retain the posters. Loaded card models only render during
input/easing; there is no idle loop. Selecting one
opens an inline product page: the card's frame expands into that page and its
image settles into position. The title receives focus. Back to shop (or Escape)
returns to the originating card/CTA and restores its scroll position. Wheel,
touch, pointer and keyboard input finish the reveal immediately. Colour changes
use a short crossfade; no product image flies over unrelated sections. The bag
and quote flow remain unchanged. Saved colour IDs retain version-1 compatibility.
