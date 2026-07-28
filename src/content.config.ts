/**
 * ====================================================================
 * CHALLENGE SPACE: Papers Content Collection
 * ====================================================================
 * PURPOSE: Load per-paper JSON from src/data/papers/{new,published}/
 *   via the glob loader, validated at build time by paperSchema.
 * INCLUSION CRITERIA: The `papers` collection (glob over new+published).
 * EXCLUSION CRITERIA: journals/themes (validated direct imports in
 *   lib/journals.ts + lib/themes.ts — single-file contracts, avoiding
 *   the file() array-split ambiguity documented in challenge 1.0).
 * DEPENDENCY RULE: astro:content, astro/loaders, lib/schemas.
 * ====================================================================
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { paperSchema } from './lib/schemas';

export const collections = {
  papers: defineCollection({
    loader: glob({ pattern: '{new,published}/*.json', base: 'src/data/papers' }),
    schema: paperSchema,
  }),
};
