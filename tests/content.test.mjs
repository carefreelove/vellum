import { test } from 'node:test';
import assert from 'node:assert/strict';
import { themes } from '../server/themes.mjs';
import { messages } from '../src/i18n.ts';

test('every interface message has a nonempty English and Chinese translation', () => {
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.zh).sort());
  for (const locale of ['en', 'zh']) {
    for (const [key, value] of Object.entries(messages[locale])) {
      assert.equal(typeof value, 'string', `${locale}.${key}`);
      assert.ok(value.trim().length > 0, `${locale}.${key}`);
    }
  }
});

test('catalog IDs are safe for routes and downloads and bilingual fields are complete', () => {
  assert.equal(new Set(themes.map((theme) => theme.id)).size, themes.length);
  for (const theme of themes) {
    assert.match(theme.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ['name', 'description', 'story']) {
      for (const locale of ['en', 'zh']) assert.ok(theme[field][locale]?.trim());
    }
    for (const color of Object.values(theme.palette)) assert.match(color, /^#[0-9a-f]{6}$/i);
    assert.equal(theme.status, 'concept');
  }
});

test('primary preview text has at least WCAG AA contrast against background and surface', () => {
  const luminance = (hex) => {
    const channels = hex
      .slice(1)
      .match(/../g)
      .map((value) => parseInt(value, 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const theme of themes) {
    const foreground = luminance(theme.palette.foreground);
    for (const surface of ['background', 'surface']) {
      const background = luminance(theme.palette[surface]);
      assert.ok(
        (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) >=
          4.5,
        `${theme.id}.${surface}`,
      );
    }
  }
});
