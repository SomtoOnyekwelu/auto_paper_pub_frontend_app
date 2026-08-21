/**
 * TEST ONTOLOGY: Security debt guard — Layout title escaping (DEBT-017)
 * SOURCE FILE: src/layouts/Layout.astro
 * SCOPE: The DOCX-derived title reaches the <title> element. It must be
 *   rendered with Astro's escaped interpolation, never the raw `set:html`
 *   directive (stored XSS would let a hostile title close </title> and
 *   inject script into <head>). This test reads the layout source from
 *   disk (file-based guardian, same pattern as the SEO asset test).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('DEBT-017 — title never rendered raw', () => {
  it('layout uses escaped interpolation for the title, not set:html', () => {
    const src = readFileSync(
      resolve('src/layouts/Layout.astro'), 'utf-8');
    expect(src).toContain('<title>{props.title}</title>');
    expect(src).not.toContain('set:html={props.title}');
  });
});
