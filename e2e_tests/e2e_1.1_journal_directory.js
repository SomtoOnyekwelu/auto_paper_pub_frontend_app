/**
 * E2E VERIFICATION: Challenge 1.1 — Journal Directory & Archive Pages
 *
 * Verifies the public-facing browse path:
 *   /journals/                 lists all 4 journals
 *   /journals/(initials)/     lists ONLY that journal's papers
 *
 * Usage: node e2e_tests/e2e_1.1_journal_directory.js
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = resolve(process.cwd(), 'dist');
let failures = 0, passes = 0;

function assert(cond, message) {
  if (cond) { passes++; console.log(`  PASS: ${message}`); }
  else      { failures++; console.error(`  FAIL: ${message}`); }
}

console.log('\n[1] Directory + every archive page exists...');
assert(existsSync(resolve(DIST, 'index.html')), '/journals/ exists');
['grjbm','grjaf','grjesd','grjhpa'].forEach(initials => {
  assert(existsSync(resolve(DIST, `${initials}/index.html`)),
    `/journals/${initials}/ archive page exists`);
});

console.log('\n[2] Directory lists all four journals by name...');
const dir = readFileSync(resolve(DIST, 'index.html'), 'utf-8');
const expectedNames = [
  'Global Research Journal of Business Management',
  'Global Research Journal of Accounting and Finance',
  'Global Research Journal of Economics and Social Development',
  'Global Research Journal of Humanities and Public Administration',
];
for (const name of expectedNames) assert(dir.includes(name), `directory mentions: ${name}`);

console.log('\n[3] Each archive page links to its papers via a plain <a>...');
const grjbm = readFileSync(resolve(DIST, 'grjbm/index.html'), 'utf-8');
// ArticleUrl helper returns path with trailing slash. Test both forms so the
// assertion stays robust to future URL-helper refactors.
assert(grjbm.includes('<a href="/journals/grjbm/8492-monetary-policy-finance/"')
    || grjbm.includes('<a href="/journals/grjbm/8492-monetary-policy-finance">'),
  'grjbm archive links to article 8492 via plain <a>');

console.log('\n[4] Strict filter — grjesd archive lists ONLY grjesd papers...');
const grjesd = readFileSync(resolve(DIST, 'grjesd/index.html'), 'utf-8');
// ArticleUrl helper returns path with trailing slash (route index.astro shape).
// Test both forms so the assertion survives URL-helper formatting changes.
assert(grjesd.includes('/journals/grjesd/1045-fiscal-policy-social-progress/')
    || grjesd.includes('/journals/grjesd/1045-fiscal-policy-social-progress"'),
  'grjesd archive contains 1045 paper');
assert(!grjesd.includes('/journals/grjbm/8492-monetary-policy-finance'),
  'grjesd archive does NOT leak grjbm papers');

console.log('\n[5] Empty-archive edge case — grjaf has zero papers yet...');
const grjaf = readFileSync(resolve(DIST, 'grjaf/index.html'), 'utf-8');
assert(grjaf.includes('No articles published yet'),
  'grjaf archive shows "No articles published yet." empty-state placeholder');

console.log('\n[6] Crawler-friendly plain HTML links (no JS routing)...');
for (const initials of ['grjbm','grjaf','grjesd','grjhpa']) {
  const html = readFileSync(resolve(DIST, `${initials}/index.html`), 'utf-8');
  assert(html.includes(`<a href="/journals/`), `${initials} archive uses plain <a href> paths`);
}

console.log('\n[7] AMSSRN org logo present on directory + archive pages (Task 4 coverage)...');
assert(dir.includes('amssrn-logo-512.png'),
  'Directory renders AMSSRN org logo');
assert(grjbm.includes('amssrn-logo-512.png'),
  'grjbm archive renders AMSSRN org logo');

console.log('\n' + '='.repeat(50));
console.log(`RESULTS: ${passes} passed, ${failures} failed`);
console.log('='.repeat(50) + '\n');
process.exit(failures > 0 ? 1 : 0);
