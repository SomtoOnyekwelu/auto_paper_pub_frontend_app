// ====================================================================
// Cloudflare Worker: reverse proxy for amssr.org/journals -> Pages
// ====================================================================
// Reference copy of the LIVE Worker deployed in the Cloudflare dashboard
// (account B, the one holding the journals Pages project).
//
// CHANGE LOG:
//  2026-08-12 — ADDED `cache: "no-store"` to the Worker's fetch() init.
//    Root cause of the stale-CSS bug: Cloudflare's Worker-runtime fetch
//    cache was serving OLD HTML (root-relative /_astro/... assets) even
//    though the Pages origin had deployed the new base-prefixed build.
//    `cache: "no-store"` makes the Worker always hit the Pages origin
//    fresh; Pages then returns its own correct headers:
//      - HTML:  `public, max-age=0, must-revalidate` (browsers revalidate
//               -> new papers appear immediately)
//      - Assets: immutable long-cache (content-hashed CSS/JS/images)
//    This keeps ALL caching benefits while eliminating staleness — the
//    Hand Sanitizer over a blanket no-store on the whole site.
//
// To deploy: paste this into the Cloudflare dashboard Worker editor and
// save. It is ALSO mirrored in git under reference/ for tracking.
// ====================================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Strict subpath matching for routing edge-cases
    if (url.pathname === "/journals" || url.pathname.startsWith("/journals/")) {
      const targetDomain = "for-redirect-to-journals-on-pages.amssr.org";

      // 2. Prevent Cloudflare Pages redirect loops by forcing trailing slash on bare route
      let cleanPath = url.pathname;
      if (cleanPath === "/journals") {
        cleanPath = "/journals/";
      }

      const newUrl = `https://${targetDomain}${cleanPath}${url.search}`;

      // 3. Clone and update headers explicitly (Do not rely on auto-handling)
      const modifiedHeaders = new Headers(request.headers);
      modifiedHeaders.set("Host", targetDomain);

      // 4. Handle streaming request body errors cleanly for POST/PUT requests
      const init = {
        method: request.method,
        headers: modifiedHeaders,
        redirect: "manual", // Let us handle redirects explicitly
        cache: "no-store", // 2026-08-12: bypass the Worker fetch cache so the
                           // Pages origin's own Cache-Control headers govern
                           // freshness (HTML revalidates; assets stay immutable).
      };

      // Only include body if the method allows it to prevent runtime stream exceptions
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && request.body) {
        init.body = request.body;
      }

      try {
        const response = await fetch(newUrl, init);

        // 5. CRITICAL: Rewrite Location header on redirects to prevent URL leaks
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get("Location");
          if (location) {
            const newLocation = location.replace(targetDomain, "amssr.org");
            const newHeaders = new Headers(response.headers);
            newHeaders.set("Location", newLocation);
            newHeaders.set("X-Worker-Proxied", "true"); // 6. Observability header
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: newHeaders,
            });
          }
        }

        // 7. Add observability header to all responses
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Worker-Proxied", "true");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        // 8. Error handling for network failures
        return new Response("Service temporarily unavailable", {
          status: 503,
          headers: {
            "Content-Type": "text/plain",
            "X-Worker-Proxied": "error",
          },
        });
      }
    }

    // fallback to main site
    return await fetch(request);
  },
};
