# Data Representation Study — SeoHead.astro (Phase 1: Input Breakdown)

Component path: `src/components/SeoHead.astro`
Purpose: Render exhaustive Highwire Press meta tags in `<head>` for Google Scholar ingestion.
Slot: Receives the `head` slot of `Layout.astro` (Issue 1 fix — meta tags MUST land in `<head>`, never the default slot which is body).

## Phase 1 — Formal Input Breakdown & Concretization

Inputs:

- `tags: Highwire` — validated Zod object from `src/lib/schemas.ts`, extracted from a paper record. Concretized values from `src/data/papers/new/8492.json`:
  - P1 valid: full paper record parsing cleanly.
  - P2 missing title → Zod throws before this component ever runs (build fails).
  - P3 ISO date `2026-07-20` → Zod throws (regex enforces `YYYY/M/D`).
  - P4 `https://doi.org/...` → Zod throws (raw-prefix regex).
  - P5 bare ORCID → Zod throws.
  - P6 unknown `journal_initials` → `getStaticPaths` throws (referential integrity).
  - P7 malformed slug → Zod throws.
  - P8 empty `authors[]` → Zod throws.
  - P9 external pdf URL → Zod throws (regex enforces local-looking).
  - P10 `citation_publication_date: "2026/7/20"` (valid) — passes through verbatim.

- `Astro.site?: URL` — from `site: 'https://amssrn.org'` in `astro.config.mjs`. Drives absolute-URL derivation.

## Phase 2 — Conceptual Mapping (domain insights)

- `citation_pdf_url` is stored RELATIVE (`/journals/.../galley.pdf`) so the rendered page stays in the same subdirectory (Google Scholar rule), but the Highwire meta tag content MUST be ABSOLUTE (`https://amssrn.org/journals/...`).
- The domain is a single source of truth: `site:` in `astro.config.mjs`. Hand-Sanitizer: never hardcode "https://amssrn.org" inside any component.
- One `<meta>` per author (`citation_author`), per ORCID (`citation_author_orcid`), per institution (`citation_author_institution`). Never comma-joined (Part 10 §B). Array parallelism is enforced upstream by paperSchema.
- Date is preserved verbatim: store `YYYY/M/D`, emit `YYYY/M/D` (Part 10 §C).

## Phase 3 — Cross-product (per-tag mapping)

For every Highwire field, output exactly one `<meta>` (or one per array-element for repeated fields):

- citation_title, citation_journal_title, citation_issn, citation_volume, citation_issue, citation_firstpage, citation_lastpage, citation_publication_date, citation_doi → verbatim string passthrough.
- citation_pdf_url → `absolutePdfUrl = new URL(rel, Astro.site.origin).href`.
- citation_abstract → verbatim.
- citation_keywords → `.map()` to one meta per keyword.
- citation_author, citation_author_orcid, citation_author_institution → three parallel `.map()`s producing one meta per author (length matched by schema).

## Phase 4 — Output Space

- ~17 to ~20 `<meta name="citation_*" content="..." />` tags.
- They MUST render inside the parent's `<head>` (i.e., via the `head` slot of Layout.astro). If ever rendered in the default slot they leak into `<body>`, which fails the E2E Tier-4 assertion in `e2e_tests/e2e_1.0_article_landing_page.js`.

## Related chains

- See `e2e_tests/e2e_1.0_article_landing_page.js` for the structural assertions this component must satisfy.
- See `docs/data_rep_studies/paperschema_lib_schemas_ts_format_specs.md` for the format specs obeyed by every field.
