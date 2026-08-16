//
// CHALLENGE SPACE: SEO URL helpers — absolute URL construction
//
// PURPOSE: Pure functions that resolve root-relative paths against the
//   Astro `site` origin into absolute HTTPS URLs for social/meta tags.
//   These are the ONLY place that knows how to turn a `/journals/...` path
//   into a full `https://amssr.org/journals/...` URL — one source of truth
//   for every og:url, og:image, twitter:image, etc.
//
// INCLUSION CRITERIA: absoluteSiteUrl (any root-relative path → absolute URL),
//   socialImageUrl (the OG image URL, derived from ogImageUrl in brand.ts).
//
// EXCLUSION CRITERIA: Highwire citation meta (SeoHead.astro owns that);
//   favicon/ICO path arithmetic (Layout.astro owns that).
//
// DEPENDENCY RULE: Imports `ogImageUrl` from src/config/brand (which itself
//   imports PUBLIC_ASSET_PREFIX from deployment-config.mjs — the lowest layer).
//   No page or component imports. No I/O. Pure functions only.
//
import { ogImageUrl } from '../config/brand';

/**
 * Resolve a root-relative `path` against the `site` origin to produce an
 * absolute URL string.
 *
 * The `path` is assumed to already carry exactly one `/journals/` prefix
 * (it comes from Astro.url.pathname or ogImageUrl in brand.ts). This function
 * NEVER adds a prefix — it only prepends the origin, so no double-prefixing
 * can occur.
 *
 * @param path  Root-relative URL path (must begin with `/`).
 * @param site   Astro `site` value — a string URL or a `URL` object
 *               (from `astro.config.mjs` → `https://amssr.org`).
 * @returns     Absolute URL string, e.g. `https://amssr.org/journals/grjbm/...`
 */
export function absoluteSiteUrl(path: string, site: string | URL): string {
  const base = typeof site === 'string' ? site : site.href;
  // new URL(path, base) replaces the entire path when `path` starts with `/`.
  // This guarantees the result is origin + path — no insertion of /journals/.
  return new URL(path, base).href;
}

/**
 * Build the absolute URL of the social (OG / Twitter Card) preview image.
 *
 * Delegates to `absoluteSiteUrl(ogImageUrl, site)`, where `ogImageUrl` is the
 * single source of truth exported from `src/config/brand.ts`. The resulting
 * URL always has exactly one `/journals/` prefix:
 *
 *   https://amssr.org/journals/assets/social/amssrn-og.png
 *
 * @param site  Astro `site` value (string URL or URL object).
 * @returns     Absolute URL string for the 1200×630 OG image.
 */
export function socialImageUrl(site: string | URL): string {
  return absoluteSiteUrl(ogImageUrl, site);
}
