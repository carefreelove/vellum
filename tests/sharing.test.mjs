import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nativeShare } from '../server/catalog.mjs';
import { renderPage, sitemap } from '../server/page.mjs';
import { themes } from '../server/themes.mjs';
const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('native sample maps only supported colors and preserves the light variant', () => {
  const text = nativeShare(themes.find((t) => t.id === 'paper-studio'));
  const doc = JSON.parse(text.slice('codex-theme-v1:'.length));
  assert.equal(doc.variant, 'light');
  assert.equal(doc.codeThemeId, 'codex');
  assert.equal(doc.theme.surface, '#f4f0e8');
  assert.equal(doc.theme.ink, '#282823');
  assert.equal(doc.theme.accent, '#ae3b24');
  assert.deepEqual(doc.theme.fonts, { code: null, ui: null });
  assert.equal(nativeShare(themes.find((t) => t.id === 'midnight-orbit')), null);
});
test('localized server HTML includes route-specific metadata and alternates', () => {
  const page = renderPage(template, '/zh/themes/paper-studio', themes, 'https://vellum.example');
  assert.equal(page.status, 200);
  assert.match(page.html, /lang="zh-CN"/);
  assert.ok(page.html.includes(themes[0].name.zh));
  assert.match(
    page.html,
    /rel="canonical" href="https:\/\/vellum.example\/zh\/themes\/paper-studio"/,
  );
  assert.match(page.html, /hreflang="en"/);
  assert.match(page.html, /property="og:title"/);
  assert.ok(!page.html.includes('A space that feels like you.</title>'));
});
test('unknown pages and themes return real 404 metadata; private collections are noindex', () => {
  for (const path of ['/zh/nope', '/en/themes/missing', '/themes/%ZZ']) {
    const page = renderPage(template, path, themes, 'https://vellum.example');
    assert.equal(page.status, 404);
    assert.match(page.html, /noindex/);
  }
  assert.match(renderPage(template, '/en/saved', themes, 'https://vellum.example').html, /noindex/);
});
test('server metadata escapes theme content and sitemap lists only public canonical pages', () => {
  const data = structuredClone(themes);
  data[0].name.en = '<script>"bad"</script>';
  const page = renderPage(template, '/en/themes/paper-studio', data, 'https://vellum.example');
  assert.ok(!page.html.includes('<script>"bad"</script>'));
  assert.match(page.html, /&lt;script&gt;/);
  const xml = sitemap('https://vellum.example', themes);
  assert.equal((xml.match(/<url>/g) || []).length, 12);
  assert.ok(!xml.includes('/saved'));
});
