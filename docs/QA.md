# 验收记录 / QA record

更新日期 / Updated: 2026-10-13 — Vellum v0.2.0

## 自动验证 / Automated verification

- `pnpm install --frozen-lockfile`: passed with pnpm 11.25.0.
- `pnpm check`: 16 tests passed; TypeScript and Vite production build passed.
- API tests cover health, bilingual catalog, combined filters/search, invalid/repeated parameters, 404s, SQL-shaped input, palette attachment, native text attachment, database persistence and idempotent seeding.
- Content tests cover bilingual message parity, catalog shape, foreground contrast, native field mapping, escaped HTML metadata, canonical/hreflang and sitemap.
- Playwright: **12/12 passed against Express/SQLite** and **12/12 passed against the built Worker/local D1 adapter**. Each set runs six scenarios in desktop Chromium and Pixel 7 mobile emulation:
  1. Language URL, combined filters, reload, language switch and browser back.
  2. Persisted favorites, two-theme limit, shared comparison overriding local state, explicit empty comparison.
  3. Shared comparison in a fresh context, clamped to two unique IDs.
  4. Native text download, localized title/metadata, real 404 response and no horizontal overflow on details.
  5. API failure and retry recovery while keeping URL filters.
  6. Actual clipboard reads after copying a comparison URL and native theme text.
- Hosted adapter: official Vinext build passed; local D1 schema migration applied and catalog seeded successfully.
- GitHub Actions now installs Chromium and runs the same browser suite after the unit tests/build; failure reports are retained as artifacts.

## 页面截图 / Page screenshots

`docs/images/` was refreshed from the built Worker/local D1 preview: English home, Chinese home, Chinese Paper Studio detail, comparison and mobile Chinese home. Desktop viewport: 1440px. Mobile: 412px. Document width matched the viewport in all five captures.

详情页人工检查确认实验性分享区、复制／下载按钮、色板与兼容性说明显示完整。截图是 Vellum 的示意预览，不是修改后的 Codex 应用截图。

## 验证边界 / Verification boundaries

- 原生分享只完成官方能力确认、本机资源只读格式核验和网站复制／下载验证。**没有在 Codex 应用内执行导入或恢复**，不声称实机兼容。
- Mobile testing uses Chromium device emulation, not physical Android/iOS hardware. Safari and Firefox have not been tested.
- No claim of a complete WCAG audit. Contrast assertions cover the primary preview text, not every state or semantic color.
- Docker/Compose remains a deployment recipe; container build/runtime have not been executed.
- Local D1 and production D1 are separate. Production verification is recorded below after publication.

## 手动回归 / Manual regression

1. `pnpm install --frozen-lockfile && pnpm check`; install Chromium with `pnpm exec playwright install chromium`; run `pnpm test:e2e`.
2. `pnpm start`; open `/zh` and `/en`. Filter, refresh, switch language, and use browser back.
3. Save a theme, reopen `/saved`, and remove it. Select two themes and attempt a third.
4. Copy a comparison link and open it in another browser profile with no saved data.
5. Open Paper Studio, copy/download native text; separately download reference palette JSON.
6. Open `/guide`, expand FAQs, verify `/about`, unknown paths and unknown theme IDs.
7. Inspect keyboard focus and layouts at mobile, tablet and desktop widths.

## 发布记录 / Production publication

- Sites saved version: **1**, deployment status: **succeeded**, audience: **public**.
- URL: https://vellum.wayback654.chatgpt.site
- Sites source commit: `dc71ae60dee5f744024b8a48d9f7b378733ffd87` (the exported adapter repository, separate from GitHub).
- Production browser verification **did not pass**: all 12 scenarios encountered an upstream Cloudflare `403` / “Sorry, you have been blocked” page from the current network. A direct request to `/api/health` and `/zh` received the same edge block. This does not establish a defect in the gallery, but it prevents verification of public page/API behavior and production D1 access.
- Representative Cloudflare Ray ID: `a497c650bcf28142-HKG`, 2026-10-13 01:20 Asia/Shanghai. The Sites Worker error log query for the preceding 15 minutes returned no events; absence of logs is not proof of application health.
- No security challenge, network restriction or access policy was bypassed. Resolve the edge-access issue through the hosting/network provider, then rerun production checks. Local results are not substituted for production acceptance.
