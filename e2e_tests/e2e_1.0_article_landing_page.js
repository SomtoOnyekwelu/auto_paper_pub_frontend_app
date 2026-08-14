/**
 * E2E VERIFICATION: Challenge 1.0 — Article Landing Page & Data Ingestion
 *
 * Exercises the produced dist/ from the user's perspective: crawlers see
 * exhaustive Highwire tags, the per-journal CSS variable injection, visible
 * abstract in the body, deliberate human-readable HTML.
 *
 * Usage: node e2e_tests/e2e_1.0_article_landing_page.js
 * Exit 0: all assertions pass. Exit 1: at least one failed.
 *
 * Prerequisite: npm run build (the article HTML must exist in dist/).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = resolve(process.cwd(), 'dist');
let failures = 0, passes = 0;

function assert(cond, message) {
  if (cond) { passes++; console.log(`  PASS: ${message}`); }
  else      { failures++; console.error(`  FAIL: ${message}`); }
}

console.log('\n[1] Build output exists...');
assert(existsSync(resolve(DIST, 'grjbm/8492-monetary-policy-finance/index.html')),
  'Article landing HTML for grjbm 8492 exists');

const html = readFileSync(resolve(DIST, 'grjbm/8492-monetary-policy-finance/index.html'), 'utf-8');
const headSection = html.split('</head>')[0] || '';
const bodySection = html.split('<body')[1] || '';

console.log('\n[2] Highwire meta tags are in <head>, not in <body>...');
const tagNames = [
  'citation_title', 'citation_journal_title', 'citation_issn',
  'citation_volume', 'citation_issue', 'citation_firstpage',
  'citation_lastpage', 'citation_publication_date', 'citation_doi',
  'citation_pdf_url', 'citation_abstract', 'citation_keywords',
  'citation_author', 'citation_author_orcid', 'citation_author_institution',
];
for (const n of tagNames) {
  assert(headSection.includes(`name="${n}"`), `${n} is in <head>`);
  assert(!bodySection.includes(`name="${n}"`), `${n} is NOT in <body>`);
}

console.log('\n[3] citation_pdf_url is absolute...');
const pdfMatch = html.match(/name="citation_pdf_url" content="([^"]+)"/);
assert(pdfMatch && pdfMatch[1].startsWith('https://'), `citation_pdf_url is absolute. Got: ${pdfMatch?.[1]}`);
assert(pdfMatch?.[1].includes('/journals/grjbm/'), 'citation_pdf_url includes the journal path');

console.log('\n[4] Date format is YYYY/M/D, not ISO...');
const dateMatch = html.match(/name="citation_publication_date" content="([^"]+)"/);
assert(dateMatch && /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateMatch[1]),
  `Date is YYYY/M/D. Got: ${dateMatch?.[1]}`);
assert(dateMatch && !dateMatch[1].includes('-'), 'Date has no hyphen (i.e. not ISO)');

console.log('\n[5] DOI is raw prefix, no https://...');
const doiMatch = html.match(/name="citation_doi" content="([^"]+)"/);
assert(doiMatch && doiMatch[1].startsWith('10.'), `DOI starts with 10. Got: ${doiMatch?.[1]}`);
assert(doiMatch && !doiMatch[1].startsWith('https://'), 'DOI has no https:// prefix');

console.log('\n[6] Each author emitted as a separate <meta> tag (per-author split)...');
const authorTags = html.match(/name="citation_author" content="[^"]+"/g) || [];
assert(authorTags.length === 2, `Expected 2 separate citation_author tags. Got: ${authorTags.length}`);
const authorOrcidTags = html.match(/name="citation_author_orcid" content="[^"]+"/g) || [];
assert(authorOrcidTags.length === 2, `Expected 2 separate citation_author_orcid tags. Got: ${authorOrcidTags.length}`);

console.log('\n[7] Abstract is visible in <body> (not hidden behind a toggle)...');
assert(bodySection.includes('Research Objective:'), 'Abstract body text visible in body');
assert(bodySection.includes('Methodology:'), 'Abstract sections visible in body');
assert(!bodySection.includes('<details'), 'Abstract not inside <details>');
assert(!bodySection.includes('display: none'), 'Abstract not hidden via CSS');

console.log('\n[8] HTML is human-readable (multi-line, not minified)...');
const lines = html.split('\n');
assert(lines.length > 20, `HTML should be multi-line. Got: ${lines.length} lines.`);
const metaLines = lines.filter(l => l.includes('<meta name="citation_'));
assert(metaLines.length >= 10, `Each citation meta tag should be on its own line. Got: ${metaLines.length}`);

console.log('\n[9] Per-journal CSS variable injection is present in <head>...');
assert(headSection.includes('--color-primary:#1e40af'), ':root has --color-primary:#1e40af (grjbm)');
assert(headSection.includes('--font-serif'), ':root has --font-serif override');

console.log('\n[10] AMSSRN org logo renders on the article page (answer to Task 4)...');
assert(bodySection.includes('amssrn-logo-512.png'),
  'AMSSRN org logo asset referenced in body');

console.log('\n[11] Visual hierarchy H1 > H3 ...');
const h1 = bodySection.indexOf('<h1');
const h3 = bodySection.indexOf('<h3');
assert(h1 > -1 && h3 > -1 && h1 < h3, 'H1 (title) appears before H3 (author byline)');

console.log('\n[12] Title attribute and abstract visible...');
assert(html.includes('<title>Effect of Monetary Policy on Financial Services</title>'),
  '<title> matches Highwire citation_title');
assert(bodySection.includes('Effect of Monetary Policy on Financial Services'),
  'Title text appears in body');

// ---- Summary ----
console.log('\n' + '='.repeat(50));
console.log(`RESULTS: ${passes} passed, ${failures} failed`);
console.log('='.repeat(50) + '\n');
process.exit(failures > 0 ? 1 : 0);
