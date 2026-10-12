# 产品决策记录

## 已确认范围

- Codex 个性化装饰主题浏览网站，参考 https://codexthemes.ai/ 的功能路径。
- 不提供 Create 功能；首版少量主题，优先完成架构。
- 网站中英文切换；GitHub README 中英文完整版本互链。
- 后端实现由开发方决定。
- 完成并验证后上传用户的 GitHub public 仓库。

## 已确认品牌与视觉

用户选择：**Vellum + A 编辑设计画廊**。

视觉候选：

1. 编辑设计画廊：米白、墨黑、橙红；Manrope / Noto Sans SC / IBM Plex Mono。
2. 深空展厅：深蓝黑、冰蓝；Space Grotesk / Noto Sans SC / JetBrains Mono。
3. 极简设计工具：雾灰、白色、钴蓝；Inter / Noto Sans SC / IBM Plex Mono。

2026-10-12 用户回复 `vellum A`，确认 Vellum 名称和方案 1。其余方案仅保留为决策背景。

## 当前架构选择

- React + TypeScript + Vite 前端。
- Express + Node.js 24 + SQLite 后端。
- 收藏暂存于浏览器本地，不引入首版账户系统。
- 主题对比、完整预览和状态标注作为基础体验增强。
- 三个原创概念配色，不复制参考站主题素材。
- 不将配色 JSON 宣称为可安装的 Codex 主题包。
- GitHub 上传与线上后端部署分开核验。
