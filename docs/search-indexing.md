# Search indexing setup

The site already generates its crawl and indexing metadata as part of the
Next.js static export. Google Search Console setup happens separately; adding
code does not submit a sitemap to an account or guarantee indexing or rankings.

## Public URLs

| Purpose | URL | Source |
| --- | --- | --- |
| Crawl rules | https://ggsoftware.cz/robots.txt | `app/robots.ts` |
| Sitemap | https://ggsoftware.cz/sitemap.xml | `app/sitemap.ts` |
| Czech homepage | https://ggsoftware.cz/cs | `app/[locale]/page.tsx` |
| English homepage | https://ggsoftware.cz/en | `app/[locale]/page.tsx` |
| Root redirect | https://ggsoftware.cz/ | `public/index.html` |

- Robots rules allow crawling public pages and resources and advertise the
  absolute sitemap URL. An allow rule does not override Cloudflare access rules.
- The sitemap includes the 14 canonical public URLs: home, configurator, pricing,
  three projects, and privacy in each language. New project entries are included
  automatically; add other new public routes to its path list.
- Each sitemap entry contains reciprocal Czech and English alternates and a
  Czech `x-default`, matching the existing page metadata.
- The root redirect and configuration URL fragments are not separate sitemap
  entries. The complete Czech and English pages are the indexing targets.
- `lastmod` is omitted because there are no reliable per-page content dates.
  A rebuild must not pretend that every page received a significant update.
  Google ignores sitemap priority and change frequency values.
- Pages already have canonical URLs, language alternates, index/follow
  directives, titles, descriptions, and Organization/WebSite structured data.
  The shared layout also supplies the configured Search Console verification
  tag. WebSite metadata includes the brand's alternate names from `config/site.ts`.

## Root and language handling

The root has an immediate HTML refresh and a canonical URL pointing to `/cs`.
Its visible fallback links offer both languages. It no longer runs a competing
JavaScript redirect based on browser language. Explicit `/en` URLs remain
English, and visitors can use the site's language switcher.

`i18n/routing.ts` disables automatic locale detection so local/server routing
uses the same default as the static deployment. GitHub Pages cannot execute a
Next.js server redirect. Google's supported immediate HTML refresh is retained;
a permanent HTTP redirect at the hosting/edge layer can be used if configured
later. No Cloudflare or DNS changes are included in this code change.

## Search Console steps

1. Verify the **Domain property** `ggsoftware.cz` using the DNS record supplied
   by Search Console. This covers both languages and protocol/subdomain variants.
   The existing HTML verification tag is an alternative for a URL-prefix
   property; it cannot verify a Domain property.
2. Submit `https://ggsoftware.cz/sitemap.xml` in the Sitemaps report and confirm
   Google can read it.
3. Inspect `https://ggsoftware.cz/cs` and `https://ggsoftware.cz/en`. Check the
   indexed status and Google-selected canonical; use Test live URL to confirm
   current accessibility and rendering.
4. Request indexing for eligible pages that need discovery or a recrawl. A
   redirect status on the root is expected if Google selects its destination.
   Do not repeatedly request the same URL: that does not accelerate crawling.
5. Monitor the Page indexing and Performance reports, including Czech queries,
   branded searches, impressions, clicks, and enquiries from organic visitors.

The live audit on 7 November 2026 found that browser-like requests reached all
14 sitemap URLs. Plain Python requests to the homepage, robots file, and sitemap
were rejected with Cloudflare error 1010, while a Googlebot-labelled request
succeeded. Changing a user-agent string is not verification of real Googlebot
access. Use Search Console's live test and Cloudflare events to investigate any
actual Google crawl failures before changing access rules.

## Verification

After `npm run build`, verify the files in `out/`: sitemap URLs resolve to
exported pages; canonical and language links agree with the sitemap; public
pages have no `noindex`; and root navigation reaches `/cs` with JavaScript both
enabled and disabled. Check explicit `/en` navigation as well.

These checks verify the generated site. Indexing status, Google-selected
canonicals, and search rankings require Search Console data after deployment.
Content relevance and credible references still matter for service searches
such as “tvorba webových stránek” and “webové aplikace na míru”.

Local validation on 7 November 2026 passed: repository lint; production build
including TypeScript; all 14 exported pages checked against sitemap canonicals,
language alternates, indexability, verification tags, and WebSite metadata;
Chromium root redirects for Czech and English browser locales with JavaScript
enabled and disabled; and explicit English-page navigation in all four cases.
The new sitemap and redirect changes still require deployment.

## References

- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: redirects and search](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google: ownership verification](https://support.google.com/webmasters/answer/9008080?hl=en)
- [Google: request a recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Cloudflare: Browser Integrity Check](https://developers.cloudflare.com/waf/tools/browser-integrity-check/)
