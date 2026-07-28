import { defineConfig } from 'vitest/config';

// Intentionally minimal: Vitest uses its OWN Vite instance, independent of
// Astro's config. Tests target pure/data modules only (schemas, utils, lib)
// — never astro:content or .astro files — so the Tailwind plugin and the
// Astro build environment never touch the test run. (Hand-Sanitizer for
// test isolation, Part 8 §F.)
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
