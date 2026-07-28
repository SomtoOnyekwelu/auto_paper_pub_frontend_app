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

// AMSSRN org logo. The 512-px PNG (renamed to remove spaces; see commit
// message) is the canonical org asset. Per-journal logos will live in
// themes.json `logo_url` when the brand owner ships per-journal SVGs;
// Layout will switch to a per-page `theme.logo_url` lookup at that point.
export const orgLogoUrl = "/assets/logos/amssrn-logo-512.png";

// Future home for org-level brand config (palette, typography baseline)
// if/when centralization becomes necessary. Today this file ONLY holds
// the logo path so there's exactly ONE place to change.
