import express from 'express';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { listThemes, findTheme } from './database.mjs';

export function createApp(db, { distPath = resolve('dist') } = {}) {
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
    const { q = '', mode = 'all', mood = 'all', sort = 'curated' } = req.query;
    if (
      [q, mode, mood, sort].some((v) => typeof v !== 'string') ||
      q.length > 100 ||
      !['all', 'light', 'dark'].includes(mode) ||
      !['all', 'minimal', 'immersive', 'organic'].includes(mood) ||
      !['curated', 'newest', 'name'].includes(sort)
    ) {
      return res.status(400).json({ error: 'INVALID_QUERY' });
    }
    const keyword = q.trim().toLowerCase();
    const items = listThemes(db).filter(
      (t) =>
        (mode === 'all' || t.mode === mode) &&
        (mood === 'all' || t.mood === mood) &&
        (!keyword ||
          JSON.stringify([t.name, t.description, t.tags]).toLowerCase().includes(keyword)),
    );
    items.sort((a, b) =>
      sort === 'newest'
        ? b.updatedAt.localeCompare(a.updatedAt)
        : sort === 'name'
          ? a.name.en.localeCompare(b.name.en)
          : a.order - b.order,
    );
    res.json({ items, total: items.length });
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
    res.json({
      schema: 'gallery-palette-v1',
      id: theme.id,
      name: theme.name,
      version: theme.version,
      license: theme.license,
      status: theme.status,
      notice: 'Design tokens only. Not an installable Codex theme package.',
      palette: theme.palette,
    });
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get(['/', '/themes/:id', '/guide', '/saved', '/compare', '/about'], (_req, res) =>
      res.sendFile(resolve(distPath, 'index.html')),
    );
  }
  app.use((_req, res) => res.status(404).send('Not found'));
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  });
  return app;
}
