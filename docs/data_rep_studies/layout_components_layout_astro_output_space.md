# Data Representation Study — `Layout.astro` (Phase 4: Output-Space Breakout)

Component path: `src/layouts/Layout.astro`
Purpose: render the `<html>/<head>/<body>` shell, expose slot points, and inject per-journal CSS variable set.

## Phase 1 — Inputs (props)

- `journalInitials?: string` — picks the journal's theme; absent → `DEFAULT_THEME` (used by directory route only).
- `title: string` (required) — `<title>` element.
- `description?: string` — optional `<meta name="description">` value for social/crawler metadata.

Internal derived inputs (from `getTheme(journalInitials)`):

- `theme.css_variables` — map of CSS custom properties (`--font-serif`, `--font-sans`, `--color-primary`, `--color-accent`).
- `Astro.site?.origin` — used only when downstream SeoHead emits absolute URLs.

## Phase 2 — Conceptual Mapping

- Per-journal multi-tenant theming is data-driven: each `<style is:inline set:html={cssVarsCss}>` declaration of `:root { ... }` overrides the page-wide CSS variables. Hand-Sanitizer (Part 5/8): one CSS-variable injection site, no JS theme switcher, no per-component hardcoded colors.
- Layout exposes ONE named slot, `head`, used by SeoHead.astro to land citation_* meta tags inside `<head>` (Issue 1 fix). Default slot is the body content (the page's own `<main>`).
- Header block contains the AMSSRN org logo (Task 4): the per-journal `logo_url` is held in themes.json awaiting per-journal SVGs from the brand owner; the org 512px PNG is rendered universally.

## Phase 3 — Cross-product

- CP1 (every Page renders Layout): the `<head>` always carries `<title>`, optional description, the per-journal `:root` injection, and the `head` slot. The `<body>` always carries the org-logo `<header>` and the page's own markup via the default slot.
- CP2 (default slot is omitted by consumer): body renders empty besides the header; harmless.
- CP3 (head slot is omitted): the page has no citation meta tags → E2E assertion in `e2e_1.0_*` flags the regression.
- CP4 (compressed HTML): disabled (`compressHTML: false` in astro.config.mjs, Task 3); each meta lives on its own line.

## Phase 4 — Output-Space Breakout

The component emits, in order:

1. `<!doctype html>` + `<html lang="en">`
2. `<head>` with: `meta charset`, `viewport`, favicon link, `<title>`, optional description, per-journal inline `<style>` injection, `<slot name="head" />`.
3. `<body>` with: AMSSRN org-logo `<header>`, default `<slot />`.
4. `</body</html>`.

HTML is human-readable (multi-line; ≥20 lines after layout expansion), enabling structural E2E assertions in `e2e_tests/`.

## Related chains

- `src/components/SeoHead.astro` provides the `<slot name="head" />` content.
- Page `src/pages/journals/[journal_initials]/[slug].astro` fills the default slot with the article body.
- `astro.config.mjs` provides the per-domain `site: 'https://amssrn.org'` used downstream.
- Tier-4 E2E in `e2e_tests/e2e_1.0_article_landing_page.js` asserts ordering and presence of these elements.
