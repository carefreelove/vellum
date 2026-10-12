import { openDatabase } from './database.mjs';
import { createApp } from './app.mjs';
import { existsSync } from 'node:fs';
if (existsSync('.env')) process.loadEnvFile('.env');
const db = openDatabase();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
const server = createApp(db).listen(port, host, () =>
  console.log(`Gallery ready at http://${host}:${port}`),
);
function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
