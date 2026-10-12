# Hosting / 部署适配

[English README](../README.md) · [中文 README](../README.zh-CN.md)

Vellum keeps its ordinary Node deployment and offers a Sites adapter. The adapter is an overlay on the official Vinext starter, not a second frontend. Both runtimes use the same `server/themes.mjs`, `server/catalog.mjs`, `server/page.mjs` and the same Vite-built client.

Vellum 保留普通 Node 部署，额外提供基于官方 Vinext starter 的 Sites 适配层。两种运行方式共用主题数据、参数校验、下载规则、页面信息及同一份前端构建。

## Runtime / 运行方式

|           | Node                          | Sites                                                                |
| --------- | ----------------------------- | -------------------------------------------------------------------- |
| HTTP      | Express 5                     | Vinext route handler / Cloudflare Worker                             |
| Catalog   | SQLite, persistent disk       | Cloudflare D1, provisioned by Sites                                  |
| Schema    | Startup initialization        | Generated schema-only Drizzle migration, applied by Sites on publish |
| Seed      | Insert missing IDs at startup | Insert missing IDs on first catalog request per isolate              |
| Favorites | Browser localStorage          | Browser localStorage                                                 |

No DDL runs during hosted requests. Existing catalog records are never overwritten by seed data. Updating an existing record requires an intentional data maintenance process. Local D1 and hosted D1 are separate; local tests do not prove hosted migration success.

线上请求不执行建表语句，播种不会覆盖已有记录。已有主题更新需要明确的数据维护流程。本地 D1 与线上数据库互相独立。

## Build the overlay / 构建适配层

Requires the Codex Sites plugin and its official starter/helper scripts. `<sites-plugin-root>` is the installed plugin directory containing `scripts/`. Node self-hosting does not need the plugin.

需要 Codex Sites 插件；`<sites-plugin-root>` 表示包含 `scripts/` 的插件目录。独立 Node 部署不依赖该插件。

1. Run `pnpm install --frozen-lockfile`, `pnpm check` in the main repository.
2. For a fresh local adapter, create an empty `.sites-deploy/` and run `node <sites-plugin-root>/scripts/project-setup.mjs` from it. If resuming an existing Site, use the plugin's source restore workflow first; retain its Site ID and migration history.
3. Use the exact `project_id` stored in `hosting/.openai/hosting.json` for this project. Do not create another Site for an update. When publishing your own fork, register your own Site and save its returned ID instead of using Vellum's ID.
4. From the repository root:

```bash
PUBLIC_ORIGIN=https://your-actual-site-origin \
  node scripts/export-sites.mjs
```

5. In `.sites-deploy/`, use the plugin's `install-dependencies.mjs` and `build-site.mjs`. The exporter enables `DB` and copies immutable migration history from `hosting/drizzle/`.
6. When changing the schema, edit `hosting/db/schema.ts`, export, run the starter's `npm run db:generate`, inspect generated SQL, and copy the resulting `drizzle/` history back to `hosting/drizzle/`. Keep data seeding outside migrations.
7. For local testing, apply only pending migrations with the starter's local D1 command, then run its built Worker. Set `E2E_BASE_URL=http://127.0.0.1:<port>` and run `pnpm test:e2e` in the main repo.
8. Use the Sites `site-workflow.mjs` helper with a short-lived repository credential through stdin. It commits/pushes the exact adapter source and packages the build. Save that returned commit/archive, then deploy the saved version. Preserve the selected audience; public publishing requires a public audience request.

源代码与部署包必须匹配同一提交。不要把凭据写进源码、命令参数、README 或日志。`.sites-deploy/`、数据库和构建结果均不提交到主 GitHub 仓库；主仓库保留适配层源码、导出脚本、schema 与迁移，Sites 源仓库保留实际部署输入。

The exported `public/assets` and HTML template are generated inputs in the Sites source repository. Regenerate them after every client change; the primary repository remains the editable source of truth. Do not manually edit generated assets.

每次前端变更后都需要重新导出。Sites 源仓库中的静态资源是构建后的输入，不应手工修改。

## Limits / 边界

- There is no public write API, account database, upload form or analytics service.
- Native share text is experimental; a successful web download is not a successful Codex app import.
- Docker remains a deployment recipe until separately built and run.
- GitHub CI tests the Node runtime. Worker/D1 and production checks are recorded separately in `docs/QA.md`.
