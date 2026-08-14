# reference/ — Cloudflare & deployment reference copies

Versioned reference copies of Cloudflare-dashboard-side configuration, so the
deployment topology is tracked in git even though the live artifacts live in
the Cloudflare dashboard.

## Files

| File | What it is |
|------|-----------|
| `cloudflare-worker-amssr-journals-proxy.js` | The live Worker reverse proxy for `amssr.org/journals/*` → Pages (custom domain `for-redirect-to-journals-on-pages.amssr.org`). Mirrors the dashboard script. |

## Caching decision (2026-08-12)

**Symptom:** after deploying the base-prefixed styling fix, `amssr.org` still
served the OLD HTML (root-relative `/_astro/...`, `/favicon.svg`) while the
Pages origin served the new build correctly.

**Root cause:** Cloudflare's Worker-runtime `fetch()` cache was serving the
stale HTML. The Pages origin itself was correct and already emits optimal
headers:
- HTML: `public, max-age=0, must-revalidate` — browsers revalidate, so new
  papers appear immediately.
- Content-hashed assets (CSS/JS/images): immutable long-cache.

**Fix (Hand Sanitizer):** add `cache: "no-store"` to the Worker's `fetch()`
init — ONE line. The Worker always hits the origin fresh; Pages' own headers
then govern freshness. This preserves ALL caching benefits (fast cached
assets, low origin load) while eliminating HTML staleness.

**Rejected alternative:** blanket `Cache-Control: no-store` on the whole site —
loses asset caching speed + resilience for zero freshness gain.

## Deployment topology

```
amssr.org/journals/*  --(Worker fetch, no-store)-->  for-redirect-to-journals-on-pages.amssr.org
                                                          | (Pages custom domain, auto-serves latest)
                                                          v
                                                  ajournals.pages.dev (latest deployment)
```
