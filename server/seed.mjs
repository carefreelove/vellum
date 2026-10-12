import { openDatabase } from './database.mjs';
const db = openDatabase();
console.log(
  `Catalog ready: ${db.prepare('SELECT count(*) AS count FROM themes').get().count} themes.`,
);
db.close();
