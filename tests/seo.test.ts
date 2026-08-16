/**
 * TEST ONTOLOGY: SEO URL helpers — Challenge 6 (social metadata / favicon / journal links)
 * SOURCE FILE: src/utils/seo.ts, src/config/brand.ts
 * SCOPE: Verify absolute URL construction, single /journals/ prefix discipline,
 *   social image path resolution, and asset existence.
 *   Tier 1: Zero-Tolerance (invalid inputs must not crash, must not double-prefix)
 *   Tier 2: Output-Shape (one assertion per valid output shape)
 *   Tier 3: Property-Based fuzzing (invariants across the data space)
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { absoluteSiteUrl, socialImageUrl } from '../src/utils/seo';
import { ogImageUrl, PUBLIC_ASSET_PREFIX } from '../src/config/brand';

// --- FACTORY FUNCTIONS (Part 4 §4: never shared mutable fixtures) ---
// Pure string returns — factories ensure pristine values per test execution.
function siteUrl(): string { return 'https://amssr.org'; }
function articlePath(): string { return '/journals/grjbm/8492-monetary-policy-finance/'; }

// ===========================================================================
// TIER 1: ZERO-TOLERANCE (inputs must not silently corrupt output)
// ===========================================================================

describe('Tier 1 — Zero-Tolerance: absoluteSiteUrl guards', () => {
  it('rejects a path that already has a double /journals/ prefix — never amplifies it', () => {
    const result = absoluteSiteUrl(articlePath(), siteUrl());
    expect(result).not.toContain('/journals/journals/');
  });

  it('handles site URL with trailing slash (no double-slash in origin)', () => {
    const result = absoluteSiteUrl(articlePath(), 'https://amssr.org/');
    expect(result).not.toContain('//journals');
    expect(result).toContain('https://amssr.org/journals');
  });

  it('handles root path /journals/ without adding extra slash', () => {
    const result = absoluteSiteUrl('/journals/', siteUrl());
    expect(result).toBe('https://amssr.org/journals/');
  });
});

// ===========================================================================
// TIER 2: OUTPUT-SHAPE (exact assertions per DRS cross-product)
// ===========================================================================

describe('Tier 2 — Output-Shape: absoluteSiteUrl', () => {
  it('CP1: builds a correct absolute URL from a root-relative path', () => {
    expect(absoluteSiteUrl(articlePath(), siteUrl()))
      .toBe('https://amssr.org' + articlePath());
  });

  it('CP2: builds the journal index URL correctly', () => {
    expect(absoluteSiteUrl('/journals/', siteUrl()))
      .toBe('https://amssr.org/journals/');
  });

  it('CP3: handles trailing slash on site without double-slash', () => {
    expect(absoluteSiteUrl('/journals/grjbm/', 'https://amssr.org/'))
      .toBe('https://amssr.org/journals/grjbm/');
  });

  it('CP4: accepts a URL object as site argument', () => {
    expect(absoluteSiteUrl('/journals/grjbm/', new URL(siteUrl())))
      .toBe('https://amssr.org/journals/grjbm/');
  });

  it('preserves trailing slash from the input path', () => {
    expect(absoluteSiteUrl(articlePath(), siteUrl()).endsWith('/'))
      .toBe(true);
  });

  it('never inserts /journals/ that was not in the input path', () => {
    const result = absoluteSiteUrl('/grjbm/article/', siteUrl());
    expect(result).toBe('https://amssr.org/grjbm/article/');
  });
});

describe('Tier 2 — Output-Shape: ogImageUrl (brand.ts)', () => {
  it('CP6: ogImageUrl equals PUBLIC_ASSET_PREFIX + /assets/social/amssrn-og.png', () => {
    expect(ogImageUrl).toBe(PUBLIC_ASSET_PREFIX + '/assets/social/amssrn-og.png');
  });

  it('CP6b: ogImageUrl has exactly one /journals/ prefix', () => {
    const count = (ogImageUrl.match(/\/journals\//g) || []).length;
    expect(count).toBe(1);
  });
});

describe('Tier 2 — Output-Shape: socialImageUrl', () => {
  it('CP4: resolves to the /journals/assets/social/amssrn-og.png path', () => {
    expect(socialImageUrl(siteUrl()))
      .toBe('https://amssr.org/journals/assets/social/amssrn-og.png');
  });

  it('CP5: accepts a URL object as site argument', () => {
    expect(socialImageUrl(new URL(siteUrl())))
      .toBe('https://amssr.org/journals/assets/social/amssrn-og.png');
  });

  it('CP7: has exactly one /journals/ prefix (no double-prefixing)', () => {
    const result = socialImageUrl(siteUrl());
    const count = (result.match(/\/journals\//g) || []).length;
    expect(count).toBe(1);
  });

  it('CP8/CP13: never contains /journals/journals/', () => {
    expect(socialImageUrl(siteUrl())).not.toContain('/journals/journals/');
  });
});

describe('Tier 1 — Zero-Tolerance: social image asset exists on disk', () => {
  it('CP8: public/assets/social/amssrn-og.png exists at the referenced path', () => {
    // ogImageUrl is root-relative and proxy-rewritten by _redirects
    // (/journals/assets/* -> /assets/*). The real source file lives at
    // public/ + (ogImageUrl minus the PUBLIC_ASSET_PREFIX prefix).
    const relativeFromPublic = ogImageUrl.slice(PUBLIC_ASSET_PREFIX.length);
    const fsPath = resolve('public' + relativeFromPublic);
    expect(existsSync(fsPath)).toBe(true);
  });

  it('OG image dimensions are exactly 1200x630', () => {
    const relativeFromPublic = ogImageUrl.slice(PUBLIC_ASSET_PREFIX.length);
    const fsPath = resolve('public' + relativeFromPublic);
    const buf = readFileSync(fsPath);
    // PNG signature: bytes 0-7; IHDR width: bytes 16-19; height: bytes 20-23
    expect(buf.slice(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  });
});

// ===========================================================================
// TIER 3: PROPERTY-BASED FUZZING (invariants across the data space)
// ===========================================================================

describe('Tier 3 — Property-Based Fuzzing', () => {
  // Generators constrained to URL-safe character sets — the WHATWG URL
  // parser rejects backslashes, spaces, null bytes, and numeric-only TLDs.
  // fc.stringMatching directly produces matching strings (efficient).
  // Path must start with '/' then a non-slash char (prevents '//' which
  // the WHATWG parser treats as protocol-relative and throws).
  const arbRootPath = fc.stringMatching(/^\/[a-zA-Z0-9_.~:.-][a-zA-Z0-9/_.~:.-]*$/);
  const arbSiteUrl = fc.stringMatching(
    /^https:\/\/[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}\/?$/,
  );

  it('absoluteSiteUrl never double-prefixes /journals/ for any root-relative path', () => {
    fc.assert(
      fc.property(arbRootPath, (p) => {
        const result = absoluteSiteUrl(p, siteUrl());
        // The function must never ADD a /journals/ segment that wasn't in p.
        // new URL(path, base) replaces the path entirely, so the result
        // is origin + p — no insertion, no double-prefix.
        // Invariant: the count of /journals/ in the result equals the count
        // in the input path.
        const pCount = (p.match(/\/journals\//g) || []).length;
        const rCount = (result.match(/\/journals\//g) || []).length;
        expect(rCount).toBe(pCount);
        expect(result).not.toContain('/journals/journals/');
      }),
      { numRuns: 200 },
    );
  });

  it('socialImageUrl always yields exactly one /journals/ prefix for any valid site', () => {
    fc.assert(
      fc.property(arbSiteUrl, (site) => {
        const result = socialImageUrl(site);
        const count = (result.match(/\/journals\//g) || []).length;
        expect(count).toBe(1);
        expect(result).not.toContain('/journals/journals/');
      }),
      { numRuns: 200 },
    );
  });

  it('absoluteSiteUrl result always starts with the site origin', () => {
    fc.assert(
      fc.property(arbRootPath, arbSiteUrl, (path, site) => {
        const result = absoluteSiteUrl(path, site);
        const origin = new URL(site).origin;
        expect(result.startsWith(origin)).toBe(true);
      }),
      { numRuns: 200 },
    );
  });
});
