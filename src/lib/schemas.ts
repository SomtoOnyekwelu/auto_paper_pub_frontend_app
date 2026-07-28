/**
 * ====================================================================
 * CHALLENGE SPACE: Data Representation (Zod Schemas)
 * ====================================================================
 * PURPOSE: The single source of truth for every data contract in the
 *   frontend. Validates journals.json, themes.json, and per-paper JSON
 *   at BUILD time. A malformed file halts the build with an error
 *   naming the offending field (Zero-Tolerance gate, Part 4 Tier 1).
 * INCLUSION CRITERIA: Zod schemas + regex format specs + cross-field
 *   refinements (parallel author arrays, authors↔citation_author).
 * EXCLUSION CRITERIA: Routing, rendering, theme injection,
 *   referential-integrity lookups (those live in lib/journals.ts,
 *   lib/themes.ts, and getStaticPaths).
 * DEPENDENCY RULE: Depends only on `zod`. Must NOT import from any
 *   page, layout, or component (prevents cycles — schemas are the
 *   lowest layer).
 * ====================================================================
 *
 * NOTE: The Teaching Corpus (Part 3) specifies the DOI regex
 * `^10\.\d{4,9}/[-._;()/:A-Z0-9]+$`, which REJECTS lowercase. DOI
 * suffixes are case-insensitive (RFC 9493) and the project's own
 * valid sample `10.1234/grjbm.v6i2.102` is lowercase. This validator
 * uses the corrected lowercase-accepting variant. The corpus bug is
 * logged in `teachings to agent/0.0-teachings-corpus-index.md`.
 */
import { z } from 'zod';

// --- Exact format specifications (Data Rep Study, Phase: formats) ---
export const DOI_RE = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
export const ORCID_RE = /^https:\/\/orcid\.org\/\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
export const ISSN_RE = /^\d{4}-\d{3}[\dX]$/;
export const PUB_DATE_RE = /^\d{4}\/\d{1,2}\/\d{1,2}$/; // YYYY/M/D — NOT ISO
export // Slug: <numeric-id>-<lowercase body (letters/digits/hyphens)>. The body may
// contain inner hyphens (real multi-word keywords like "social-progress" do),
// so we constrain only the two boundaries: it must START with the numeric id,
// and the remainder after the first hyphen is lowercase slug chars. This
// accepts the brief's canonical `8492-monetary-policy-finance` AND compound
// keywords like `1045-fiscal-policy-social-progress`, while rejecting title
// slugs that lack the numeric id prefix (e.g. "effect-of-monetary-policy-...").
const SLUG_RE: RegExp = /^[0-9]+(-[a-z0-9][a-z0-9-]*)?$/;
export const PDF_URL_RE = /^\/journals\/[a-z]+\/[0-9a-z-]+\/galley\.pdf$/;
export const INITIALS_RE = /^[a-z]+$/;

export const journalSchema = z.object({
  initials: z.string().regex(INITIALS_RE, 'initials must be lowercase letters'),
  name: z.string().min(1, 'name is required'),
  issn_print: z.string().regex(ISSN_RE, 'issn_print must be NNNN-NNNX'),
  issn_online: z.string().regex(ISSN_RE, 'issn_online must be NNNN-NNNX'),
  description: z.string().min(1, 'description is required'),
});
export type Journal = z.infer<typeof journalSchema>;

const cssVariablesSchema = z.object({
  '--font-serif': z.string().min(1, '--font-serif is required'),
  '--font-sans': z.string().min(1, '--font-sans is required'),
  '--color-primary': z.string().min(1, '--color-primary is required'),
  '--color-accent': z.string().min(1, '--color-accent is required'),
});
export const themeSchema = z.object({
  logo_url: z.string().min(1, 'logo_url is required'),
  css_variables: cssVariablesSchema,
});
export type Theme = z.infer<typeof themeSchema>;

export const authorSchema = z.object({
  name: z.string().min(1, 'author name is required'),
  author_slug: z.string().min(1, 'author_slug is required'),
  orcid: z.string().regex(ORCID_RE, 'author orcid must be full URL https://orcid.org/...'),
  affiliation: z.string().min(1, 'author affiliation is required'),
});
export type Author = z.infer<typeof authorSchema>;

export const highwireSchema = z
  .object({
    citation_title: z.string().min(1, 'citation_title is required'),
    citation_journal_title: z.string().min(1, 'citation_journal_title is required'),
    citation_issn: z.string().regex(ISSN_RE, 'citation_issn must be NNNN-NNNX'),
    citation_volume: z.string().min(1, 'citation_volume is required'),
    citation_issue: z.string().min(1, 'citation_issue is required'),
    citation_firstpage: z.string().min(1, 'citation_firstpage is required'),
    citation_lastpage: z.string().min(1, 'citation_lastpage is required'),
    citation_publication_date: z.string().regex(PUB_DATE_RE, 'citation_publication_date must be YYYY/M/D, not ISO'),
    citation_doi: z.string().regex(DOI_RE, 'citation_doi must be raw prefix 10.xxxx/..., not https://'),
    citation_pdf_url: z.string().regex(PDF_URL_RE, 'citation_pdf_url must be local /journals/.../galley.pdf'),
    citation_abstract: z.string().min(1, 'citation_abstract is required'),
    citation_keywords: z.array(z.string().min(1)).min(1, 'citation_keywords must have >= 1 item'),
    citation_author: z.array(z.string().min(1)).min(1, 'citation_author must have >= 1 author'),
    citation_author_orcid: z.array(z.string().regex(ORCID_RE, 'citation_author_orcid entries must be full ORCID URLs')).min(1),
    citation_author_institution: z.array(z.string().min(1)).min(1),
  })
  .refine(
    (h) =>
      h.citation_author.length === h.citation_author_orcid.length &&
      h.citation_author.length === h.citation_author_institution.length,
    {
      message:
        'citation_author / citation_author_orcid / citation_author_institution must have equal length (one entry per author)',
    },
  );
export type Highwire = z.infer<typeof highwireSchema>;

export const paperSchema = z
  .object({
    paper_id: z.number().int().positive('paper_id must be a positive integer'),
    journal_initials: z.string().regex(INITIALS_RE, 'journal_initials must be lowercase letters'),
    slug: z.string().regex(SLUG_RE, 'slug must be <numeric-id>-<lowercase body>, not title-based'),
    title: z.string().min(1, 'title is required'),
    authors: z.array(authorSchema).min(1, 'authors must have >= 1 author'),
    highwire_tags: highwireSchema,
  })
  .refine((p) => p.authors.length === p.highwire_tags.citation_author.length, {
    message: 'authors length must equal citation_author length',
    path: ['authors'],
  });
export type Paper = z.infer<typeof paperSchema>;

export const journalsSchema = z.array(journalSchema);
export const themesSchema = z.record(z.string(), themeSchema);
