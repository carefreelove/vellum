import { test, expect } from '@playwright/test';

test('language URL and filters survive reload, switching and history', async ({ page }) => {
  await page.goto('/en/?mode=dark&mood=organic&sort=name&q=moss');
  await expect(page.locator('.theme-card')).toHaveCount(1);
  await expect(page.getByRole('textbox', { name: 'Search themes' })).toHaveValue('moss');
  await page.reload();
  await expect(page.locator('.theme-card')).toHaveCount(1);
  await page.getByRole('button', { name: '切换为中文' }).click();
  await expect(page).toHaveURL(/\/zh\?mode=dark/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('.theme-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.getByRole('button', { name: 'Light', exact: true }).click();
  await expect(page.locator('.theme-card')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('.theme-card')).toHaveCount(1);
});
test('saved collection persists and comparison URL overrides local choices', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('.theme-card')).toHaveCount(3);
  await page.locator('.theme-card').first().getByRole('button', { name: 'Save theme' }).click();
  await page.goto('/en/saved');
  await expect(page.locator('.theme-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.theme-card')).toHaveCount(1);
  await page.goto('/en/');
  for (let i = 0; i < 3; i++)
    await page
      .locator('.theme-card')
      .nth(i)
      .getByRole('button', { name: 'Add to compare' })
      .click();
  await expect(page.getByRole('status')).toContainText('Choose up to two');
  await page.goto('/en/compare?themes=midnight-orbit,moss-and-mist');
  await expect(page.locator('.compare-grid h2')).toHaveText(['Midnight Orbit', 'Moss & Mist']);
  await page.goto('/en/compare?themes=');
  await expect(page.locator('.compare-grid h2')).toHaveCount(0);
});
test('shared comparison opens in a fresh browser and never expands beyond two', async ({
  page,
}) => {
  await page.goto('/zh/compare?themes=paper-studio,midnight-orbit,moss-and-mist');
  await expect(page.locator('.compare-grid > *')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('.compare-grid > *')).toHaveCount(2);
});
test('native text download and localized metadata are available', async ({ page, request }) => {
  const response = await page.goto('/en/themes/paper-studio');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('Paper Studio — Vellum');
  await expect(page.getByText('Experimental native share', { exact: true })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download native share text' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('paper-studio.codex-theme.txt');
  const native = await request.get('/api/themes/paper-studio/native');
  expect(await native.text()).toMatch(/^codex-theme-v1:/);
  const metadata = await request.get('/zh/themes/paper-studio');
  expect(await metadata.text()).toContain('property="og:locale" content="zh_CN"');
  expect((await request.get('/en/themes/not-real')).status()).toBe(404);
  const width = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    screen: window.innerWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.screen + 1);
});
test('API failure offers recovery without losing the requested URL', async ({ page }) => {
  await page.route('**/api/themes', (route) => route.fulfill({ status: 503, body: 'unavailable' }));
  await page.goto('/en/?mode=dark');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.unroute('**/api/themes');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.theme-card')).toHaveCount(2);
  await expect(page).toHaveURL(/mode=dark/);
});
test('share buttons copy a portable selection and the full native text', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/en/compare?themes=paper-studio,midnight-orbit');
  await expect(page.locator('.compare-grid h2')).toHaveCount(2);
  await page.getByRole('button', { name: 'Copy link', exact: true }).click();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(url).searchParams.get('themes')).toBe('paper-studio,midnight-orbit');
  await page.goto('/en/themes/paper-studio');
  await page.getByRole('button', { name: 'Copy Codex theme', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Codex theme text copied');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toMatch(/^codex-theme-v1:/);
  expect(JSON.parse(text.slice('codex-theme-v1:'.length)).theme.accent).toBe('#ae3b24');
});
