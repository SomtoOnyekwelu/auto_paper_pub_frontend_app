/**
 * TEST ONTOLOGY: Data Representation — paperSchema + lib data integrity
 * SOURCE FILE: src/lib/schemas.ts, src/lib/journals.ts, src/lib/themes.ts, src/utils/papers.ts
 * SCOPE: Build-time validation cross-products (Challenge 1.0 Data Rep Study).
 *   Tier 1: Zero-Tolerance (invalid inputs MUST crash loudly, naming the field).
 *   Tier 2: Output-Shape (one assertion per valid output shape).
 *   Tier 3: Property-Based fuzzing (regex invariants hold across the data space).
 *   Data integrity: the committed JSON files parse and the lookups resolve.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { z, type ZodError } from 'zod';
import {
  paperSchema,
  journalSchema,
  themesSchema,
  DOI_RE,
  SLUG_RE,
} from '../src/lib/schemas';
import { journals, getJournal } from '../src/lib/journals';
import { themes, getTheme } from '../src/lib/themes';
import { journalIndexUrl, journalArchiveUrl, articleUrl, pdfUrl } from '../src/utils/papers';

// --- FACTORY FUNCTIONS (Part 4 §4: never shared mutable fixtures) ---

/** Fresh, unmutated copy of the valid 8492 paper for EVERY test execution. */
function getValidPaper() {
  return JSON.parse(
    JSON.stringify({
      paper_id: 8492,
      journal_initials: 'grjbm',
      slug: '8492-monetary-policy-finance',
      title: 'Effect of Monetary Policy on Financial Services',
      authors: [
        { name: 'Onuoha, Donatus', author_slug: 'f4a2b1c9-donatus-onuoha', orcid: 'https://orcid.org/0000-0002-1825-0097', affiliation: 'ESUT, Enugu State' },
        { name: 'Okparaka, Vincent', author_slug: 'a3b7e2d1-okparaka-vincent', orcid: 'https://orcid.org/0000-0001-1234-5678', affiliation: 'ESUT, Enugu State' },
      ],
      highwire_tags: {
        citation_title: 'Effect of Monetary Policy on Financial Services',
        citation_journal_title: 'Global Research Journal of Business Management',
        citation_issn: '2811-1745',
        citation_volume: '6',
        citation_issue: '2',
        citation_firstpage: '102',
        citation_lastpage: '123',
        citation_publication_date: '2026/7/20',
        citation_doi: '10.1234/grjbm.v6i2.102',
        citation_pdf_url: '/journals/grjbm/8492-monetary-policy-finance/galley.pdf',
        citation_abstract: 'Research Objective: ...',
        citation_keywords: ['Monetary Policy', 'Finance'],
        citation_author: ['Onuoha, Donatus', 'Okparaka, Vincent'],
        citation_author_orcid: ['https://orcid.org/0000-0002-1825-0097', 'https://orcid.org/0000-0001-1234-5678'],
        citation_author_institution: ['ESUT, Enugu State', 'ESUT, Enugu State'],
      },
    }),
  );
}

/** Returns the list of dot-paths the ZodError flagged, so we can assert the
 *  EXACT field that failed (Part 4 §3: each field named individually). */
function failingPaths(paper: unknown): string[] {
  try {
    paperSchema.parse(paper);
    return [];
  } catch (e) {
    return (e as ZodError).issues.map((i) => i.path.join('.'));
  }
}

// =========================================================================
// TIER 1: ZERO-TOLERANCE (invalid inputs MUST crash loudly)
// =========================================================================
describe('Tier 1 — Zero-Tolerance', () => {
  it.each<[string, (p: any) => void, string]>([
    ['missing title', (p) => { delete p.title; }, 'title'],
    ['ISO date', (p) => { p.highwire_tags.citation_publication_date = '2026-07-20'; }, 'citation_publication_date'],
    ['https DOI', (p) => { p.highwire_tags.citation_doi = 'https://doi.org/10.1234/grjbm.v6i2.102'; }, 'citation_doi'],
    ['bare ORCID in author', (p) => { p.authors[0].orcid = '0000-0002-1825-0097'; }, 'authors'],
    ['non-parallel author arrays', (p) => { p.highwire_tags.citation_author_orcid = ['https://orcid.org/0000-0002-1825-0097']; }, 'highwire_tags'],
    ['authors length mismatch', (p) => { p.authors = [p.authors[0]]; }, 'authors'],
    ['title-based slug', (p) => { p.slug = 'effect-of-monetary-policy-on-financial-services'; }, 'slug'],
    ['empty authors', (p) => { p.authors = []; }, 'authors'],
    ['external pdf url', (p) => { p.highwire_tags.citation_pdf_url = 'https://supabase.host/galley.pdf'; }, 'citation_pdf_url'],
    ['empty keywords', (p) => { p.highwire_tags.citation_keywords = []; }, 'citation_keywords'],
    ['malformed ISSN', (p) => { p.highwire_tags.citation_issn = '28111745'; }, 'citation_issn'],
    ['non-positive paper_id', (p) => { p.paper_id = 0; }, 'paper_id'],
  ])('rejects %s and names the offending field', (_name, mutate, field) => {
    const paper = getValidPaper();
    mutate(paper);
    const paths = failingPaths(paper);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.some((fp) => fp.includes(field))).toBe(true);
  });

  it('does NOT mutate the factory base across iterations', () => {
    const before = JSON.stringify(getValidPaper());
    for (let i = 0; i < 5; i++) {
      const p = getValidPaper();
      p.title = ''; // schema-INVALID (empty title) — so parse throws
      expect(() => paperSchema.parse(p)).toThrow();
    }
    expect(JSON.stringify(getValidPaper())).toBe(before);
  });
});

// =========================================================================
// TIER 2: OUTPUT-SHAPE (each conceptual output shape from Phase 4)
// =========================================================================
describe('Tier 2 — Output-Shape', () => {
  it('parses the valid paper into the exact Paper shape (CP1)', () => {
    const paper = paperSchema.parse(getValidPaper());
    expect(paper.paper_id).toBe(8492);
    expect(paper.journal_initials).toBe('grjbm');
    expect(paper.slug).toBe('8492-monetary-policy-finance');
    expect(paper.authors).toHaveLength(2);
    expect(paper.authors[0].name).toBe('Onuoha, Donatus');
    expect(paper.highwire_tags.citation_publication_date).toBe('2026/7/20');
    expect(paper.highwire_tags.citation_author).toEqual(['Onuoha, Donatus', 'Okparaka, Vincent']);
    expect(paper.highwire_tags.citation_author_orcid).toHaveLength(2);
    expect(paper.highwire_tags.citation_author_institution).toHaveLength(2);
  });

  it('journals.json parses to exactly 4 journals with unique initials+ISSNs', () => {
    expect(journals).toHaveLength(4);
    const initials = journals.map((j) => j.initials);
    expect(new Set(initials).size).toBe(initials.length);
    const issns = journals.flatMap((j) => [j.issn_print, j.issn_online]);
    expect(new Set(issns).size).toBe(issns.length); // no duplicate ISSN (catches the old grjaf bug)
  });

  it('themes.json parses and covers every journal initials', () => {
    const themeKeys = Object.keys(themes);
    expect(themesSchema.parse(themes)).toBeDefined();
    for (const j of journals) {
      expect(themeKeys).toContain(j.initials);
    }
  });

  it('URL helpers produce the exact contract strings', () => {
    expect(journalIndexUrl).toBe('/journals/');
    expect(journalArchiveUrl('grjbm')).toBe('/journals/grjbm/');
    expect(articleUrl('grjbm', '8492-monetary-policy-finance')).toBe('/journals/grjbm/8492-monetary-policy-finance/');
    expect(pdfUrl('grjbm', '8492-monetary-policy-finance')).toBe('/journals/grjbm/8492-monetary-policy-finance/galley.pdf');
  });

  it('getJournal/getTheme throw on unknown initials (referential integrity)', () => {
    expect(() => getJournal('xxxx')).toThrow(/Unknown journal initials/);
    expect(() => getTheme('xxxx')).toThrow(/Unknown journal initials/);
  });
});

// =========================================================================
// TIER 3: PROPERTY-BASED FUZZING (regex invariants hold across data space)
// =========================================================================
describe('Tier 3 — Property-Based Fuzzing', () => {
  it('every string that does NOT match the DOI regex is rejected', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 40 }), (s) => {
        fc.pre(!DOI_RE.test(s));
        const paper = getValidPaper();
        paper.highwire_tags.citation_doi = s;
        expect(() => paperSchema.parse(paper)).toThrow();
      }),
      { numRuns: 2000 },
    );
  });

  it('every valid-conforming DOI we synthesize is accepted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 9999 }),
        fc.string({ minLength: 2, maxLength: 12 }).filter((s) => /^[-._;()/:A-Za-z0-9]+$/.test(s)),
        (reg, suffix) => {
          const doi = `10.${reg}/${suffix}`;
          if (!DOI_RE.test(doi)) return true;
          const paper = getValidPaper();
          paper.highwire_tags.citation_doi = doi;
          expect(() => paperSchema.parse(paper)).not.toThrow();
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('arbitrary slugs that violate the shape are rejected', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (s) => {
        fc.pre(!SLUG_RE.test(s));
        const paper = getValidPaper();
        paper.slug = s;
        expect(() => paperSchema.parse(paper)).toThrow();
      }),
      { numRuns: 2000 },
    );
  });
});

// Additional regexes retained for audit completeness (not all are exercised).
import { ORCID_RE as _ORCID, ISSN_RE as _ISSN, PDF_URL_RE as _PDF, PUB_DATE_RE as _DATE } from '../src/lib/schemas';
void { _ORCID, _ISSN, _PDF, _DATE, journalSchema };
