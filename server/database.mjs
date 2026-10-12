import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { themes } from './themes.mjs';

export function openDatabase(path = process.env.DATABASE_PATH || './data/gallery.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      document TEXT NOT NULL CHECK(json_valid(document))
    );
    CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    INSERT OR IGNORE INTO migrations VALUES (1, datetime('now'));
  `);
  const insert = db.prepare('INSERT OR IGNORE INTO themes(id, document) VALUES (?, ?)');
  db.exec('BEGIN');
  try {
    for (const theme of themes) insert.run(theme.id, JSON.stringify(theme));
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return db;
}

export function listThemes(db) {
  return db
    .prepare('SELECT document FROM themes ORDER BY id')
    .all()
    .map((row) => JSON.parse(row.document));
}

export function findTheme(db, id) {
  const row = db.prepare('SELECT document FROM themes WHERE id = ?').get(id);
  return row ? JSON.parse(row.document) : null;
}
