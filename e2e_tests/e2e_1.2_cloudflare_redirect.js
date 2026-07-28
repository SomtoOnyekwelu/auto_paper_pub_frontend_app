/**
 * E2E VERIFICATION: Challenge 1.2 — Deployment, Edge Rewrites, Sitemap, robots
 *
 * Verifies that the deployment artifacts are present and correct:
 *   - public/_redirects (Cloudflare Pages Edge Proxy for /journals/.../galley.pdf)
 *   - dist/sitemap-index.xml + sitemap-0.xml include all article URLs
 *   - dist/robots.txt exists and is permissive
 *
 * Usage: node e2e_tests/e2e_1.2_cloudflare_redirect.js
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DIST = resolve(process.cwd(), 'dist');
const PUB = resolve(process.cwd(), 'public');
let failures = 0, passes = 0;

function assert(cond, message) {
  if (cond) { passes++; console.log(`  PASS: ${message}`); }
  else      { failures++; console.error(`  FAIL: ${message}`); }
}

console.log('\n[1] _redirects file present at source (public/_redirects)...');
const redirectsSrc = resolve(PUB, '_redirects');
assert(existsSync(redirectsSrc), 'public/_redirects exists');

const redirects = readFileSync(redirectsSrc, 'utf-8');
assert(redirects.includes('/journals/:initials/:slug/galley.pdf'),
  'redirect pattern targets /journals/:initials/:slug/galley.pdf');
assert(redirects.includes(':initials/:slug.pdf') || redirects.includes(':splat'),
  'redirect forwards to Supabase storage with named placeholders');
assert(redirects.includes('[your-supabase-project]') || redirects.includes('supabase.co'),
  'redirect references Supabase (cloud storage target)');

console.log('\n[2] Sitemap generated and contains every article URL...');
const sitemapIndexPath = resolve(DIST, 'sitemap-index.xml');
assert(existsSync(sitemapIndexPath), 'sitemap-index.xml exists in dist/');

const sitemapPath = resolve(DIST, 'sitemap-0.xml');
assert(existsSync(sitemapPath), 'sitemap-0.xml exists in dist/');

const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf-8') : '';
for (const url of [
  'https://amssrn.org/journals/',
  'https://amssrn.org/journals/grjbm/',
  'https://amssrn.org/journals/grjbm/8492-monetary-policy-finance/',
  'https://amssrn.org/journals/grjesd/1045-fiscal-policy-social-progress/',
]) assert(sitemap.includes(url), `sitemap includes: ${url}`);

console.log('\n[3] robots.txt present and permissive...');
const robotsPath = resolve(DIST, 'robots.txt');
assert(existsSync(robotsPath), 'dist/robots.txt exists');
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf-8') : '';
assert(robots.includes('User-agent: *') && robots.includes('Allow: /'),
  'robots.txt allows all crawlers');
assert(robots.toLowerCase().includes('sitemap:'),
  'robots.txt references the sitemap');

console.log('\n' + '='.repeat(50));
console.log(`RESULTS: ${passes} passed, ${failures} failed`);
console.log('='.repeat(50) + '\n');
process.exit(failures > 0 ? 1 : 0);
