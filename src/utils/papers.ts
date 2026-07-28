/**
 * ====================================================================
 * CHALLENGE SPACE: Pure URL helpers
 * ====================================================================
 * PURPOSE: Convert validated data into the local-looking URL strings
 *   the routes and sitemap consume. Pure functions — no fetching.
 * INCLUSION CRITERIA: journalIndexUrl, journalArchiveUrl,
 *   articleUrl (by initials + slug), pdfUrl.
 * EXCLUSION CRITERIA: Routing decisions, rendering, validation.
 * DEPENDENCY RULE: No imports. The lowest utility layer.
 * ====================================================================
 */

export const journalIndexUrl = '/journals/';
export function journalArchiveUrl(initials: string): string {
  return `/journals/${initials}/`;
}
export function articleUrl(initials: string, slug: string): string {
  return `/journals/${initials}/${slug}/`;
}
export function pdfUrl(initials: string, slug: string): string {
  return `/journals/${initials}/${slug}/galley.pdf`;
}
