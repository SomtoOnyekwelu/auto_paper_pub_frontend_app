/**
 * ====================================================================
 * CHALLENGE SPACE: Themes — Design Authority (validated import)
 * ====================================================================
 * PURPOSE: Validate themes.json at build time and expose per-journal
 *   CSS-variable lookup. Multi-tenant theming is a DATA problem, not
 *   a code problem (Part 5/8 Hand-Sanitizer: CSS variables + a
 *   <style> injection — no JS theme switcher).
 * INCLUSION CRITERIA: themes.json import + Zod parse + getTheme().
 * EXCLUSION CRITERIA: Academic metadata (journals.ts), paper data.
 * DEPENDENCY RULE: Imports schemas.ts + themes.json. No page imports.
 * ====================================================================
 */
import { themesSchema, type Theme } from './schemas';
import themesJson from '../data/themes.json';

// Build-time Zero-Tolerance gate.
export const themes: Record<string, Theme> = themesSchema.parse(themesJson);

/** Neutral default for org-level pages (directory) spanning all journals. */
export const DEFAULT_THEME: Theme = {
  logo_url: '',
  css_variables: {
    '--font-serif': "'Merriweather', serif",
    '--font-sans': "'Inter', sans-serif",
    '--color-primary': '#1e40af',
    '--color-accent': '#f59e0b',
  },
};

/** Referential-integrity lookup. Throws if initials are unknown. */
export function getTheme(initials: string): Theme {
  const t = themes[initials];
  if (!t) throw new Error(`Unknown journal initials in themes: "${initials}"`);
  return t;
}
