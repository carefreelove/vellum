import express from 'express';
import { resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { listThemes, findTheme } from './database.mjs';

import { queryCatalog, paletteDocument, nativeShare } from './catalog.mjs';
import { renderPage, sitemap } from './page.mjs';

export function createApp(
  db,
  {
    distPath = resolve('dist'),
    publicOrigin = process.env.PUBLIC_ORIGIN || 'http://localhost:3001',
  } = {},
) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
    });
    next();
  });
  app.get('/api/health', (_req, res) => {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', schemaVersion: 1 });
  });
  app.get('/api/themes', (req, res) => {
    const result = queryCatalog(
      listThemes(db),
      new URL(req.originalUrl, 'http://localhost').searchParams,
    );
    if (!result) return res.status(400).json({ error: 'INVALID_QUERY' });
    res.json(result);
  });
  app.get('/api/themes/:id', (req, res) => {
    const theme = findTheme(db, req.params.id);
    if (!theme) return res.status(404).json({ error: 'THEME_NOT_FOUND' });
    res.json(theme);
  });
  app.get('/api/themes/:id/palette', (req, res) => {
    const theme = findTheme(db, req.params.id);
    if (!theme) return res.status(404).json({ error: 'THEME_NOT_FOUND' });
    res.set('Content-Disposition', `attachment; filename="${theme.id}.palette.json"`);
    res.json(paletteDocument(theme));
  });
  app.get('/api/themes/:id/native', (req, res) => {
    const value = nativeShare(findTheme(db, req.params.id));
    if (!value) return res.status(404).json({ error: 'NATIVE_SHARE_UNAVAILABLE' });
    res.set('Content-Disposition', 'attachment; filename="paper-studio.codex-theme.txt"');
    res.type('text/plain').send(value);
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
  app.get('/sitemap.xml', (_req, res) =>
    res.type('application/xml').send(sitemap(publicOrigin, listThemes(db))),
  );
  app.get('/robots.txt', (_req, res) =>
    res
      .type('text/plain')
      .send('User-agent: *\nAllow: /\nSitemap: ' + new URL('/sitemap.xml', publicOrigin).href),
  );
  if (existsSync(resolve(distPath, 'index.html'))) {
    const template = readFileSync(resolve(distPath, 'index.html'), 'utf8');
    app.use(express.static(distPath, { index: false }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      const page = renderPage(template, req.path, listThemes(db), publicOrigin);
      res.status(page.status).type('html').send(page.html);
    });
  }
  app.use((_req, res) => res.status(404).send('Not found'));
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  });
  return app;
}
