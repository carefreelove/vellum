import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  document: text('document').notNull(),
});
