// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// NOTE: pages live at src/pages/journals/* so the DIST LAYOUT is
// dist/journals/* — matching the Cloudflare Worker's /journals/* fetch paths.
// NO `base` (base would DOUBLE the /journals prefix and corrupt the sitemap —
// verified 2026-08-12). Instead, `build.assetsPrefix: '/journals'` prefixes
// ONLY asset URLs (CSS/JS/images/favicon) while leaving routes + sitemap alone.
// This is Astro 7's documented assetsPrefix option (build.assetsPrefix) — the
// Hand-Sanitizer: prefix assets, keep dist/journals files, no _redirects needed.
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
  build: {
    assetsPrefix: '/journals',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
