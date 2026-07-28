/**
 * ====================================================================
 * CHALLENGE SPACE: Journals — Academic Authority (validated import)
 * ====================================================================
 * PURPOSE: Validate journals.json at build time and expose lookup.
 * INCLUSION CRITERIA: journals.json import + Zod parse + Map lookup.
 * EXCLUSION CRITERIA: Paper data, theme/css data (see themes.ts).
 * DEPENDENCY RULE: Imports schemas.ts + journals.json. No page imports.
 * ====================================================================
 */
import { journalsSchema, type Journal } from './schemas';
import journalsJson from '../data/journals.json';

// Build-time Zero-Tolerance gate: a malformed journals.json halts HERE.
export const journals: Journal[] = journalsSchema.parse(journalsJson);

const byInitials = new Map(journals.map((j) => [j.initials, j]));

/** Referential-integrity lookup. Throws if initials are unknown. */
export function getJournal(initials: string): Journal {
  const j = byInitials.get(initials);
  if (!j) throw new Error(`Unknown journal initials: "${initials}"`);
  return j;
}
