// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// NOTE: no `base: '/journals'` — that + src/pages/journals/* would yield
// /journals/journals/... and break the data-contract URLs. The host routes
// /journals/* here and / to the parent org (out of scope). See challenge 1.0.
// NOTE: framework is Astro 7 (installed), not the brief's "Astro v5"; SSG /
// Content-Layer / Zod APIs are stable across 5→7.
export default defineConfig({
  site: 'https://amssr.org',
  output: 'static',
  compressHTML: false, // human-readable output for review/debug (Part 4B); negligible size cost
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
