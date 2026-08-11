/**
 * E2E VERIFICATION: Challenge 1.2 — Deployment, Edge Rewrites, Sitemap, robots
 *
 * Verifies that the deployment artifacts are present and correct:
 *   - public/_redirects + functions/ (Cloudflare Pages edge proxy for /journals/.../galley.pdf
 *     streaming from the R2 bucket binding — Google Scholar same-subdirectory rule)
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
assert(redirects.includes('functions/journals/[journal_initials]/[slug]/galley.pdf'),
  'redirect comments document the R2 Pages Function edge proxy');
assert(redirects.includes('R2') && redirects.includes('GALLEYS'),
  'redirect documents the R2 galley bucket (binding GALLEYS)');

console.log('\n[1b] Pages Function (R2 edge proxy) present at source...');
const fnPath = resolve(process.cwd(), 'functions/journals/[journal_initials]/[slug]/galley.pdf.ts');
assert(existsSync(fnPath), 'functions/journals/[journal_initials]/[slug]/galley.pdf.ts exists');
const fnSrc = existsSync(fnPath) ? readFileSync(fnPath, 'utf-8') : '';
assert(fnSrc.includes('env.GALLEYS.get'),
  'Pages Function streams the R2 object (env.GALLEYS.get)');
assert(fnSrc.includes('application/pdf'),
  'Pages Function returns Content-Type application/pdf');
assert(fnSrc.includes('journal_initials') && fnSrc.includes('slug'),
  'Pages Function builds the R2 key from initials + slug');

console.log('\n[1c] wrangler.toml binds the R2 bucket...');
const wranglerPath = resolve(process.cwd(), 'wrangler.toml');
assert(existsSync(wranglerPath), 'wrangler.toml exists');
const wrangler = existsSync(wranglerPath) ? readFileSync(wranglerPath, 'utf-8') : '';
assert(wrangler.includes('binding = "GALLEYS"'), 'wrangler.toml has binding GALLEYS');
assert(wrangler.includes('bucket_name = "for-paper-pub-system"'),
  'wrangler.toml binds bucket for-paper-pub-system');
assert(wrangler.includes('pages_build_output_dir'), 'wrangler.toml sets pages_build_output_dir');

console.log('\n[2] Sitemap generated and contains every article URL...');
const sitemapIndexPath = resolve(DIST, 'sitemap-index.xml');
assert(existsSync(sitemapIndexPath), 'sitemap-index.xml exists in dist/');

const sitemapPath = resolve(DIST, 'sitemap-0.xml');
assert(existsSync(sitemapPath), 'sitemap-0.xml exists in dist/');

const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf-8') : '';
for (const url of [
  'https://amssr.org/journals/',
  'https://amssr.org/journals/grjbm/',
  'https://amssr.org/journals/grjbm/8492-monetary-policy-finance/',
  'https://amssr.org/journals/grjesd/1045-fiscal-policy-social-progress/',
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
