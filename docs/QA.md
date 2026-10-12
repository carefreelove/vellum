# 验收记录 / QA record

日期 / Date: 2026-10-12

## 自动验证 / Automated verification

- API integration suite: health query, bilingual seed catalog, combined filters, Chinese/English search, invalid/repeated parameters, 404s, SQL-shaped input, palette attachment, restart persistence and seed idempotency.
- TypeScript type-check and Vite production build.
- Frozen dependency install with pnpm 11.25.0; only esbuild's dependency build is allowed.

## 真实浏览器 / Actual browser verification

Tested against the built frontend and Express backend using the Codex in-app browser:

- English / Chinese switch, including persistence while moving between pages.
- Search for `苔` returns Moss & Mist; nonexistent keywords display the resettable empty state.
- Dark appearance returns two records; reset restores all three.
- Save Paper Studio, navigate to the collection, and verify it remains saved.
- Select Paper Studio + Midnight Orbit; a third selection displays the two-theme limit.
- Navigate to comparison and verify two workspace previews.
- Open details from favorites.
- Copy the accent color; clipboard contains `#ae3b24`.
- Download a palette through the UI; inspect its saved JSON and explicit non-installer notice.
- Desktop at 1440px and mobile at 390px: document width equals viewport width, with no horizontal overflow.
- Capture full-page English/Chinese home, comparison, detail, and mobile screenshots under `docs/images/`.

## 验证边界 / Verification boundaries

- Docker/Compose configuration is provided; container build and runtime have not been executed in this environment.
- No claim of cross-browser certification or a complete WCAG audit.
- No real Codex theme installation or desktop compatibility testing: the catalog intentionally contains design concepts.
- Public GitHub source publication and production hosting are separate. No public production hosting is configured by this release.
- Screenshots show illustrative workspace studies rendered by Vellum, not modifications to the Codex application.

## 手动回归路径 / Manual regression path

1. `pnpm install --frozen-lockfile`, `pnpm check`, then `pnpm start`.
2. Open `/`; switch languages; filter by appearance, mood, and search.
3. Bookmark a look, refresh, open `/saved`, then remove it.
4. Select two looks, attempt a third, open `/compare`, replace one selection.
5. Open a detail page, copy a color, download the palette.
6. Open `/guide`; expand each FAQ. Verify `/about` and unknown theme handling.
7. Inspect at 390px, 768px, and 1440px; navigate controls using a keyboard.
