/**
 * TEST ONTOLOGY: Optional ORCID at the Frontend Zod Boundary (C14)
 * SOURCE FILE: src/lib/schemas.ts
 * SCOPE: C14 F1-F5. author.orcid may be null; citation_author_orcid
 *   entries may be null and stay position-parallel. Malformed non-null
 *   ORCID still fails; array length mismatch still fails.
 */
import { describe, it, expect } from 'vitest';
import { paperSchema, ORCID_RE } from '../src/lib/schemas';

const CANONICAL = 'https://orcid.org/0000-0002-1825-0097';

function getValidPaper() {
  return JSON.parse(
    JSON.stringify({
      paper_id: 8492,
      journal_initials: 'grjbm',
      slug: '8492-optional-orcid',
      title: 'Optional ORCID Publication Study',
      authors: [
        {
          name: 'Onuoha, Donatus',
          author_slug: 'slug-0',
          orcid: CANONICAL,
          affiliation: 'ESUT, Enugu State',
        },
      ],
      highwire_tags: {
        citation_title: 'Optional ORCID Publication Study',
        citation_journal_title: 'Global Research Journal of Business Management',
        citation_issn: '2811-1745',
        citation_volume: '6',
        citation_issue: '2',
        citation_firstpage: '102',
        citation_lastpage: '123',
        citation_publication_date: '2026/7/20',
        citation_doi: '10.1234/grjbm.v6i2.102',
        citation_pdf_url: '/journals/grjbm/8492-optional-orcid/galley.pdf',
        citation_abstract: 'Abstract body.',
        citation_keywords: ['orcid'],
        citation_author: ['Onuoha, Donatus'],
        citation_author_orcid: [CANONICAL],
        citation_author_institution: ['ESUT, Enugu State'],
      },
    }),
  );
}

describe('C14 F1-F3 — null ORCID accepted and position-preserving', () => {
  it('F1: author orcid null + highwire [null] parses', () => {
    const paper = getValidPaper();
    paper.authors[0].orcid = null;
    paper.highwire_tags.citation_author_orcid = [null];
    const parsed = paperSchema.parse(paper);
    expect(parsed.authors[0].orcid).toBeNull();
    expect(parsed.highwire_tags.citation_author_orcid).toEqual([null]);
  });

  it('F2: [null, canonical] parses and preserves positions', () => {
    const paper = getValidPaper();
    paper.authors = [
      { ...paper.authors[0], name: 'Onuoha, Donatus', author_slug: 'slug-0', orcid: null },
      { ...paper.authors[0], name: 'Okparaka, Vincent', author_slug: 'slug-1', orcid: CANONICAL },
    ];
    paper.highwire_tags.citation_author = ['Onuoha, Donatus', 'Okparaka, Vincent'];
    paper.highwire_tags.citation_author_orcid = [null, CANONICAL];
    paper.highwire_tags.citation_author_institution = ['ESUT, Enugu State', 'ESUT, Enugu State'];
    const parsed = paperSchema.parse(paper);
    expect(parsed.authors[0].orcid).toBeNull();
    expect(parsed.authors[1].orcid).toBe(CANONICAL);
    expect(parsed.highwire_tags.citation_author_orcid).toEqual([null, CANONICAL]);
  });

  it('F3: all-canonical shape is unchanged', () => {
    const parsed = paperSchema.parse(getValidPaper());
    expect(parsed.highwire_tags.citation_author_orcid).toEqual([CANONICAL]);
  });
});

describe('C14 F4-F5 — malformed and mismatch still fail', () => {
  it('F4: bare (non-canonical) ORCID fails and names the field', () => {
    const paper = getValidPaper();
    paper.authors[0].orcid = '0000-0002-1825-0097';
    expect(() => paperSchema.parse(paper)).toThrow(/orcid/);
  });

  it('F4b: empty string ORCID fails', () => {
    const paper = getValidPaper();
    paper.authors[0].orcid = '';
    expect(() => paperSchema.parse(paper)).toThrow(/orcid/);
  });

  it('F5: highwire array length mismatch still fails', () => {
    const paper = getValidPaper();
    paper.highwire_tags.citation_author_orcid = [];
    expect(() => paperSchema.parse(paper)).toThrow(/citation_author_orcid|equal length/);
  });
});

describe('C14 F6 — all-null ORCID arrays pass', () => {
  it('two authors with [null, null] highwire ORCIDs parses', () => {
    const paper = getValidPaper();
    paper.authors = [
      { ...paper.authors[0], name: 'A, One', author_slug: 'slug-0', orcid: null },
      { ...paper.authors[0], name: 'B, Two', author_slug: 'slug-1', orcid: null },
    ];
    paper.highwire_tags.citation_author = ['A, One', 'B, Two'];
    paper.highwire_tags.citation_author_orcid = [null, null];
    paper.highwire_tags.citation_author_institution = ['X', 'Y'];
    expect(() => paperSchema.parse(paper)).not.toThrow();
  });

  it('ORCID_RE still enforces canonical shape for supplied values', () => {
    expect(ORCID_RE.test(CANONICAL)).toBe(true);
    expect(ORCID_RE.test('0000-0002-1825-0097')).toBe(false);
  });
});
