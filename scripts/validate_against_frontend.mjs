/**
 * Cross-check: validates a backend-produced publication JSON against the
 * frontend's authoritative Zod paperSchema (src/lib/schemas.ts).
 * Usage: node scripts/validate_against_frontend.mjs <path-to-json>
 */
import { readFileSync } from 'node:fs';
import { paperSchema } from '../src/lib/schemas.ts';

const [, , jsonPath] = process.argv;
if (!jsonPath) {
  console.error('usage: node scripts/validate_against_frontend.mjs <paper.json>');
  process.exit(2);
}
const paper = JSON.parse(readFileSync(jsonPath, 'utf-8'));
const result = paperSchema.safeParse(paper);
if (!result.success) {
  console.error('CONTRACT VIOLATION — frontend paperSchema rejected the JSON:');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}
console.log('CONTRACT OK — JSON passes the frontend Zod paperSchema.');
