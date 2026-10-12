import { env } from 'cloudflare:workers';
import { themes as seeds } from '../gallery/themes.mjs';
import { queryCatalog, paletteDocument, nativeShare } from '../gallery/catalog.mjs';
import { renderPage, sitemap } from '../gallery/page.mjs';
import { template } from '../gallery/template.mjs';
import { publicOrigin } from '../gallery/origin.mjs';
let seeded: Promise<unknown> | undefined;
const headers = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
};
const json = (value: unknown, status = 200, extra = {}) =>
  Response.json(value, { status, headers: { ...headers, ...extra } });
export async function GET(request: Request) {
  const url = new URL(request.url);
  const db = env.DB;
  if (!db) return json({ error: 'DATABASE_UNAVAILABLE' }, 503);
  try {
    if (url.pathname === '/api/health') {
      await db.prepare('SELECT 1').first();
      return json({ status: 'ok', schemaVersion: 1 });
    }
    // Seed only records that do not exist. Schema is applied by migrations, never by requests.
    if (!seeded)
      seeded = db
        .batch(
          seeds.map((theme: { id: string }) =>
            db
              .prepare('INSERT OR IGNORE INTO themes (id, document) VALUES (?, ?)')
              .bind(theme.id, JSON.stringify(theme)),
          ),
        )
        .catch((error: unknown) => {
          seeded = undefined;
          throw error;
        });
    await seeded;
    const rows = await db
      .prepare('SELECT document FROM themes ORDER BY id')
      .all<{ document: string }>();
    const themes = rows.results.map((row) => JSON.parse(row.document));
    if (url.pathname === '/api/themes') {
      const result = queryCatalog(themes, url.searchParams);
      return result ? json(result) : json({ error: 'INVALID_QUERY' }, 400);
    }
    if (url.pathname.startsWith('/api/')) {
      const match = url.pathname.match(/^\/api\/themes\/([^/]+)(?:\/(palette|native))?$/);
      const theme = match && themes.find((t) => t.id === decodeURIComponent(match[1]));
      if (!theme) return json({ error: 'THEME_NOT_FOUND' }, 404);
      if (match?.[2] === 'palette')
        return json(paletteDocument(theme), 200, {
          'Content-Disposition': `attachment; filename="${theme.id}.palette.json"`,
        });
      if (match?.[2] === 'native') {
        const text = nativeShare(theme);
        return text
          ? new Response(text, {
              headers: {
                ...headers,
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': 'attachment; filename="paper-studio.codex-theme.txt"',
              },
            })
          : json({ error: 'NATIVE_SHARE_UNAVAILABLE' }, 404);
      }
      return json(theme);
    }
    if (url.pathname === '/sitemap.xml')
      return new Response(sitemap(publicOrigin, themes), {
        headers: { ...headers, 'Content-Type': 'application/xml' },
      });
    if (url.pathname === '/robots.txt')
      return new Response(`User-agent: *\nAllow: /\nSitemap: ${publicOrigin}/sitemap.xml`, {
        headers: { ...headers, 'Content-Type': 'text/plain' },
      });
    const page = renderPage(template, url.pathname, themes, publicOrigin);
    return new Response(page.html, {
      status: page.status,
      headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Gallery request failed', error);
    return json({ error: 'INTERNAL_ERROR' }, 500);
  }
}
