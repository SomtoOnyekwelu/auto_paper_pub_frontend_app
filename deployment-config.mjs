/**
 * SINGLE SOURCE OF TRUTH for the deployed public subpath.
 *
 * The site is served under /journals/* through a Cloudflare Worker reverse
 * proxy. Astro's `build.assetsPrefix` must equal this value, and public/
 * assets (favicon, logo) referenced in source code must be prefixed with this
 * value. Keeping it in ONE file (imported by both astro.config.mjs and
 * src/config/brand.ts) prevents the drift that caused the asset-prefix
 * challenge (see docs/challenge_space/1.3).
 */
export const PUBLIC_ASSET_PREFIX = "/journals";
