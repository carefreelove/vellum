// Run project-setup.mjs in .sites-deploy once before this script.
// The official starter remains isolated; this overlay shares the gallery's domain rules.
import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const target = resolve(process.argv[2] || '.sites-deploy');
const origin = process.env.PUBLIC_ORIGIN;
if (!origin || new URL(origin).protocol !== 'https:')
  throw new Error('Set PUBLIC_ORIGIN to the actual https Site origin');
await readFile(resolve(target, 'vite.config.ts')); // Refuse to export into an unprepared directory.
await rm(resolve(target, 'app'), { recursive: true, force: true });
await cp('hosting/app', resolve(target, 'app'), { recursive: true });
await cp('hosting/db', resolve(target, 'db'), { recursive: true });
await mkdir(resolve(target, 'app/gallery'), { recursive: true });
for (const name of ['themes.mjs', 'catalog.mjs', 'page.mjs'])
  await cp(`server/${name}`, resolve(target, 'app/gallery', name));
const html = await readFile('dist/index.html', 'utf8');
await writeFile(
  resolve(target, 'app/gallery/template.mjs'),
  `export const template = ${JSON.stringify(html)};\n`,
);
await writeFile(
  resolve(target, 'app/gallery/origin.mjs'),
  `export const publicOrigin = ${JSON.stringify(new URL(origin).origin)};\n`,
);
await rm(resolve(target, 'public'), { recursive: true, force: true });
await cp('dist', resolve(target, 'public'), { recursive: true });
await rm(resolve(target, 'public/index.html'));
const manifestPath = resolve(target, '.openai/hosting.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
manifest.d1 = 'DB';
manifest.r2 = null;
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
// Retain the selected Site identity in the main repo to make future resumption unambiguous.
await cp(manifestPath, 'hosting/.openai/hosting.json');
// Preserve already generated migration history on subsequent exports.
try {
  await cp('hosting/drizzle', resolve(target, 'drizzle'), { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log('Exported gallery assets and shared server rules to', target);
