# 架构 / Architecture

Vellum v0.2 是精选 Codex 主题画廊，不含 Create 编辑器。

```text
React + TypeScript + Vite
  pages/      首页 / 详情 / 对比 / 收藏 / 指南 / 关于 / 404
  components/ 布局 / 色板 / 示意预览 / 分享控件
  hooks/      目录与收藏状态 / URL 筛选 / location 订阅
      ↓ 同源 API
共享领域规则：server/catalog.mjs + server/page.mjs
      ├─ Express → node:sqlite → 持久磁盘
      └─ Vinext route → Cloudflare D1 → 托管数据库
```

## 路由与状态

- `/en` 与 `/zh` 是明确语言入口，优先于本地偏好；无前缀旧链接继续可用，由浏览器补上语言。
- `q`、`mode`、`mood`、`sort` 保存到 URL。输入搜索使用 replaceState，筛选变化使用 pushState，后退可恢复筛选。
- `/en/compare?themes=paper-studio,midnight-orbit` 可在空白浏览器中重现对比。URL 有 `themes` 时优先于本地保存；`themes=` 表示明确清空。去重且最多两款。
- 收藏和默认对比名单使用 localStorage，不跨设备同步。
- 页面正文由 React 渲染；服务端提供本地化 title/description、Open Graph、canonical、hreflang、sitemap。收藏和对比页 noindex；未知页面和主题返回 HTTP 404。

## 目录与下载契约

主题包含 ID、中英文名称/描述/故事/标签、明暗模式、氛围、色板、版本、许可和状态。三个样本仍为 `status: concept`。

配色 JSON 是设计参考。只有 Paper Studio 提供实验性 `codex-theme-v1:` 分享文本，映射原生 accent、ink、surface；网页 surface/muted 没有独立原生字段。已做格式核验，尚未执行真实应用导入，详见 [可行性记录](THEME-FEASIBILITY.md)。

## 持久化与发布

Node 启动初始化 SQLite；Sites 使用提交到 `hosting/drizzle/` 的 schema-only 迁移。两者均只插入不存在的种子 ID，不覆盖已有目录记录。线上请求不执行 DDL，无公开写入 API。

`hosting/` 是官方 starter 的小型覆盖层，`scripts/export-sites.mjs` 导出同一份前端和共享后端规则，避免维护两个主题实现。部署流程及恢复原则见 [HOSTING](HOSTING.md)。

## 验证

- Node tests：API、参数、持久化、双语完整性、对比度、分享格式、HTML 转义和元数据。
- Playwright：桌面与手机 Chromium，双语路由、筛选刷新/历史、收藏、对比链接、API 故障恢复、剪贴板和下载。
- Worker/D1 与 Node 运行同一套浏览器场景；CI 默认验证 Node，线上部署另行验收。
