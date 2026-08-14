// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// NOTE: pages live at src/pages/journals/* so the DIST LAYOUT is
// dist/journals/* — matching the Cloudflare Worker's /journals/* fetch paths.
// NO base config: base would DOUBLE the /journals prefix (routes already carry
// it from the folder structure) AND the sitemap plugin would emit
// /journals/journals/... (verified 2026-08-12). Root-relative asset URLs are
// instead rewritten via public/_redirects (200 rewrite, no SEO redirect chain).
// trailingSlash: 'always' is a HARD constraint for Cloudflare Pages — Pages
// 301-redirects slashless folder paths, and 'never' would create an infinite
// redirect loop with the Worker proxy.
// NOTE: framework is Astro 7 (installed), not the brief's "Astro v5"; SSG /
// Content-Layer / Zod APIs are stable across 5→7.
export default defineConfig({
  site: 'https://amssr.org',
  trailingSlash: 'always', // Cloudflare Pages compat (prevents redirect loop)
  output: 'static',
  compressHTML: false, // human-readable output for review/debug (Part 4B); negligible size cost
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
