/**
 * Pages Function — the R2 galley edge proxy.
 * Route: /journals/:journal_initials/:slug/galley.pdf
 *
 * WHY (Part 10 §E + Part 11 §6 + challenge 1.2): the frontend renders the
 * LOCAL-looking citation_pdf_url (/journals/:initials/:slug/galley.pdf — same
 * subdirectory as the HTML abstract, satisfying Google Scholar). This Function
 * silently streams the actual binary from the R2 bucket (binding GALLEYS) at
 * that same URL. The browser/crawler never leaves the same subdirectory; Git
 * stays clean (no binaries tracked); the download link gives instant PDF access.
 *
 * The R2 object key is <journal_initials>/<slug>.pdf — the exact key the backend
 * stores in Supabase papers.r2_key, so each galley is uniquely identifiable to
 * its paper entity.
 */

/** @param {PagesFunctionContext} ctx */
export const onRequestGet = async ({ params, env }) => {
  const { journal_initials, slug } = params;
  const key = `${journal_initials}/${slug}.pdf`;

  const object = await env.GALLEYS.get(key);
  if (object === null) {
    return new Response(`Galley not found: ${key}`, { status: 404 });
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + slug + '.pdf"',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
