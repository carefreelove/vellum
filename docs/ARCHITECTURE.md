# 架构 / Architecture

首版定位为精选 Codex 装饰主题画廊。前端展示与数据库目录分离，不含主题 Create 编辑器。

```text
Browser / React + TypeScript
  ├─ Catalog → search, filters, ordering
  ├─ Theme detail → preview, metadata, palette download
  ├─ Compare → two workspace previews
  ├─ Saved → browser-local collection
  └─ Language → zh / en, persisted locally
         ↓ same-origin /api
Express / Node.js 24
         ↓ prepared statements
SQLite / persistent volume
```

## 目录契约

每个主题存储独立 ID、中英文名称/描述/设计说明/标签、明暗模式、氛围、色板、作者、版本、许可和兼容性状态。初始三个主题均为原创概念配色，`status: concept`。下载只输出带格式标识的设计 token JSON，不宣称它是 Codex 安装包。

SQLite 在首次启动时自动建表并播种；重复启动不会覆盖已有条目。修改种子不会更新已存在的数据库记录。后续目录维护应通过版本化 migration 或受保护管理工具实现。

## API

| Method | Path                                            | Purpose                    |
| ------ | ----------------------------------------------- | -------------------------- |
| GET    | `/api/health`                                   | 数据库连通性与 schema 版本 |
| GET    | `/api/themes?q=&mode=all&mood=all&sort=curated` | 查询主题目录               |
| GET    | `/api/themes/:id`                               | 完整主题详情               |
| GET    | `/api/themes/:id/palette`                       | 下载配色 JSON              |

`mode`: `all`, `light`, `dark`。`mood`: `all`, `minimal`, `immersive`, `organic`。`sort`: `curated`, `newest`, `name`。

参数错误返回 400；不存在返回 404；内部错误返回 500。错误响应使用稳定的 `error` code。没有公开写入接口、上传入口或假登录按钮。

## 部署边界

生产模式由同一个 Express 进程提供前端构建和 API。SQLite 文件必须放在持久卷，适合单实例部署。GitHub public 仓库托管源码，GitHub Pages 无法单独运行该后端。横向扩容时应迁移到 PostgreSQL 等共享数据库。

后续扩展点：经过真实兼容性验证的主题包、受保护的管理后台、作者投稿审核、对象存储、账户同步。它们不是首版已完成功能。
