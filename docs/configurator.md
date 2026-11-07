# Website studio

The configurator lives at `/cs/configure` and `/en/configure`. Run `npm run dev`
and open one of these routes. The home page, main navigation, footer and landing
page pricing lead to it.

## Customer journey

1. Choose Atelier (studios), Haven (hospitality), Forma (local services) or Savor
   (restaurants, added at the user's request).
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
