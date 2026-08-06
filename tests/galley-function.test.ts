/**
 * Tier 3 — unit tests for the R2 galley Pages Function
 * (functions/journals/[journal_initials]/[slug]/galley.pdf.ts)
 *
 * The function is the edge proxy for the local-looking citation_pdf_url
 * (/journals/:initials/:slug/galley.pdf — Google Scholar same-subdirectory
 * rule): it must build the R2 key <initials>/<slug>.pdf, stream the object
 * with Content-Type application/pdf, and 404 when the object is missing.
 */
import { describe, expect, it, vi } from 'vitest';

// Load the handler as a plain module (no Cloudflare runtime needed).
const { onRequestGet } = await import(
  '../functions/journals/[journal_initials]/[slug]/galley.pdf.ts'
);

function makeCtx({ key, body }: { key: string | null; body?: ReadableStream }) {
  const get = vi.fn(async (k: string) =>
    key === null ? null : { body: body ?? new ReadableStream() },
  );
  const env = { GALLEYS: { get } };
  const params = { journal_initials: 'grjbm', slug: '8492-money-policy' };
  return { env, params, get };
}

describe('galley Pages Function (R2 edge proxy)', () => {
  it('streams the R2 object at the local-looking galley URL with application/pdf', async () => {
    const ctx = makeCtx({ key: 'grjbm/8492-money-policy.pdf' });
    const res = await onRequestGet(ctx as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(ctx.get).toHaveBeenCalledWith('grjbm/8492-money-policy.pdf');
  });

  it('builds the R2 key from initials + slug (unique per paper)', async () => {
    const ctx = makeCtx({ key: 'grjhpa/100-impact-ai-education.pdf' });
    ctx.params = { journal_initials: 'grjhpa', slug: '100-impact-ai-education' };
    await onRequestGet(ctx as never);
    expect(ctx.get).toHaveBeenCalledWith('grjhpa/100-impact-ai-education.pdf');
  });

  it('returns 404 when the R2 object is missing', async () => {
    const ctx = makeCtx({ key: null });
    const res = await onRequestGet(ctx as never);
    expect(res.status).toBe(404);
  });
});
