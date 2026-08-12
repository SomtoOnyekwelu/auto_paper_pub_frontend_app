// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// NOTE: pages live at src/pages/* (moved up one level from src/pages/journals/*),
// and `base: '/journals'` prefixes every emitted asset URL. The colleague's
// advice (2026-08-12): hardcoded root-relative asset refs are made base-aware
// via `new URL('/path', Astro.site).pathname` — to be verified empirically.
// NOTE: framework is Astro 7 (installed), not the brief's "Astro v5"; SSG /
// Content-Layer / Zod APIs are stable across 5→7.
export default defineConfig({
  site: 'https://amssr.org',
  base: '/journals',
  output: 'static',
  compressHTML: false, // human-readable output for review/debug (Part 4B); negligible size cost
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
