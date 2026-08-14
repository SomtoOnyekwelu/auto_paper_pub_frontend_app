/**
 * ====================================================================
 * CHALLENGE SPACE: Brand configuration — single source of truth
 * ====================================================================
 * PURPOSE: ONE declaration site for organization-wide branding
 *   assets (currently: the AMSSRN org logo). Any Layout, page, or
 *   component that needs the org logo MUST import `orgLogoUrl` from
 *   here. NEVER hardcode the logo path inline — that is the
 *   duplications-on-write anti-pattern the corpus warns against, and
 *   it would also break the moment the file is renamed.
 * INCLUSION: organization-level brand asset paths only.
 * EXCLUSION: per-journal assets (those live in themes.json `logo_url`,
 *   awaiting per-journal SVGs from the brand owner).
 * DEPENDENCY RULE: No imports. The lowest layer.
 * ====================================================================
 */

import { PUBLIC_ASSET_PREFIX } from "../../deployment-config.mjs";

// AMSSRN org logo. The 512-px PNG (renamed to remove spaces; see commit
// message) is the canonical org asset. Per-journal logos will live in
// themes.json `logo_url` when the brand owner ships per-journal SVGs;
// Layout will switch to a per-page `theme.logo_url` lookup at that point.
//
// PUBLIC_ASSET_PREFIX comes from deployment-config.mjs — the SINGLE source of
// truth shared with astro.config.mjs. Astro's assetsPrefix covers bundled
// CSS/JS but NOT public/ assets (favicon, logo), so those paths are derived
// here from the same prefix; the Cloudflare Worker proxies /journals/assets/*
// and public/_redirects 200-rewrites them back to /assets/* (no redirect chain).
export { PUBLIC_ASSET_PREFIX };

export const orgLogoUrl =
  PUBLIC_ASSET_PREFIX + "/assets/logos/amssrn-logo-512.png";

// Future home for org-level brand config (palette, typography baseline)
// if/when centralization becomes necessary. Today this file ONLY holds
// the logo path so there's exactly ONE place to change.
