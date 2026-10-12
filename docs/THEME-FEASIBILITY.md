# Paper Studio 原生主题分享可行性

核验日期：2026-10-12。范围：Codex 桌面界面的颜色主题分享；不包括 CLI、IDE、背景图片或应用包修改。

## 结论与验证等级

可以为 Paper Studio 提供 **实验性原生分享文本**：`codex-theme-v1:` 后直接拼接 JSON，用户在应用的浅色主题导入入口粘贴。当前应用资源中存在对应的导出、解析、校验及导入 UI 实现。

本次完成了官方文档查询和已安装应用的只读格式核验，**没有执行真实导入、切换、恢复或截图验收**。因此不能标记为“已实机验证”，也不能保证不同版本、平台的导入结果。原生分享字段属于本机实现观察，尚未找到官方发布的稳定 schema 合约。

建议网站展示状态：中文「实验性原生分享 · 待实机验证」；英文 `Experimental native share · Awaiting app verification`。复制按钮应称「复制 Codex 分享码」/ `Copy Codex theme`，避免承诺一键安装。

## 官方依据

[OpenAI 官方 changelog](https://learn.chatgpt.com/docs/changelog) 的 2026-03-12、Codex app 26.312 条目确认：用户可以在 Settings 中选择基础主题，调整强调色、背景色、前景色以及 UI/代码字体，并分享自定义主题。该条目证明产品能力，不规定以下 JSON schema，也不能据此推断最低兼容版本。

## 本机证据与复核定位

只读检查 `/Applications/ChatGPT.app/Contents/Info.plist` 和 `/Applications/ChatGPT.app/Contents/Resources/app.asar`。版本为 `26.930.61225`，build `13232`。没有读取用户凭据、会话存储或个人主题设置，也没有修改应用文件。

`app.asar` 内部资源路径如下；文件 hash 用来识别本次核验构建，后续更新应重新验证：

| 资源                                              | 可复核内容                                                                              | SHA-256                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `webview/assets/app-initial-69cd8dbddec5.js`      | `WRs` 分享前缀、`VRs` 导出、`HRs` 解析、`RRs` 变体检查、`qRs` 外层 schema、`t3i` 规范化 | `8c11b76e960300895e8a3dde8b2613f87c92ed226b58173aa73ceaff9cd2b604` |
| `webview/assets/app-shared-122c56612a72.js`       | `Owt` 主题 schema、`sP` 内置代码主题 ID、`cP` 支持的变体、`oF` 设置定义                 | `a800cb8a356a0d7c61820cb29ed4478d30f8a73f4c7c0d9d19e035b0ffa91926` |
| `webview/assets/general-settings-11fa5e255445.js` | `Import {variant} theme`、`Copy {variant} theme`、粘贴对话框与导入回调                  | `0bc009158518ff282425d39bd7ba864232a4ba5f7fa533af49e615efd70964c6` |

实现观察：

- 导出把对象经 `JSON.stringify` 序列化后附在 `codex-theme-v1:` 后；不是 Base64，也不是安装 URL。
- 导入先 trim，要求该前缀；正文可直接为 JSON，也可为经 `encodeURIComponent` 编码的 JSON。
- 外层对象必须包含 `codeThemeId`、`theme`、`variant`。导入入口的 light/dark 必须与 `variant` 一致。
- `codeThemeId` 必须为应用认得的内置代码主题，而且支持所选变体。`codex` 在本构建中同时支持 light/dark。
- 原生导入提交主题和代码主题设置；并非加载 CSS、执行脚本或安装插件。
- 未发现支持 Vellum 任意背景图片、布局、贴纸或任意 syntax-token 配色的该分享字段。分享码中的语法高亮由内置 `codeThemeId` 决定。

## 字段映射

| 原生字段                           | 本构建约束                 | Paper Studio 建议                                    |
| ---------------------------------- | -------------------------- | ---------------------------------------------------- |
| `variant`                          | `light` 或 `dark`          | `light`                                              |
| `codeThemeId`                      | 内置主题 ID                | `codex`，不声称语法配色与网站示意完全相同            |
| `theme.accent`                     | 六位 `#RRGGBB`             | Vellum `palette.accent`：`#ae3b24`                   |
| `theme.accentSource`               | 可选 `chatgpt` 或 `custom` | `custom`，明确使用主题强调色                         |
| `theme.surface`                    | 六位颜色                   | Vellum **`palette.background`**：`#f4f0e8`           |
| `theme.ink`                        | 六位颜色                   | Vellum `palette.foreground`：`#282823`               |
| `theme.contrast`                   | 0–100 整数                 | `45`，本机浅色默认值；不是 WCAG 对比度比值           |
| `theme.opaqueWindows`              | boolean                    | `true`，先使用不透明效果，减少桌面透色带来的预览差异 |
| `theme.fonts.code`                 | string 或 null，必需       | `null`，使用应用默认代码字体                         |
| `theme.fonts.ui`                   | string 或 null，必需       | `null`，首个样本避免依赖未安装字体                   |
| `theme.fonts.content`              | 可选 string 或 null        | 首个样本省略                                         |
| `theme.semanticColors.diffAdded`   | 六位颜色                   | `#00a240`，保留本机浅色默认语义色                    |
| `theme.semanticColors.diffRemoved` | 六位颜色                   | `#ba2623`，保留本机浅色默认语义色                    |
| `theme.semanticColors.skill`       | 六位颜色                   | `#924ff7`，保留本机浅色默认语义色                    |

可选字体 face 字段 `codeFace`、`contentFace`、`uiFace` 的对象包含 `family`、`fullName`、`postscriptName`。跨设备样本不应绑定本机字体 face。Vellum 网站的 Manrope / Noto Sans SC 设计选择不意味着主题会把字体安装到 Codex；原生字体设置与网站字体各自独立。

Vellum 的 `palette.surface` (`#e9e4da`) 和 `palette.muted` (`#706c64`) 没有直接对应的独立分享字段。应用会派生面板、次级文本等颜色，因此网页 mockup 只能继续称为示意预览，不能替代实机截图。

## 建议样本

以下样本依据本次只读核验构造，尚未在真实应用中导入。第一行为完整、可复制的候选分享文本：

```text
codex-theme-v1:{"codeThemeId":"codex","theme":{"accent":"#ae3b24","accentSource":"custom","contrast":45,"fonts":{"code":null,"ui":null},"ink":"#282823","opaqueWindows":true,"semanticColors":{"diffAdded":"#00a240","diffRemoved":"#ba2623","skill":"#924ff7"},"surface":"#f4f0e8"},"variant":"light"}
```

网站可提供该文本的复制或 `.txt` 下载。不要把 Vellum 原有配色 JSON、CSS 下载改称为原生主题；它们应保留各自用途。推荐只为 Paper Studio 开放实验性分享，使验证范围清晰。

## 用户安装与恢复说明草案

以下路径根据应用资源中的 UI 文案编写，按钮位置需在后续实机验收确认：

1. 打开应用 Settings → Appearance（某些版本可能在 General 下），找到 Light 浅色主题区域。
2. 先使用 `Copy Light theme` 保存自己的当前浅色主题分享文本，并记录当前 Light / Dark / System 选择。
3. 在 Vellum 复制 Paper Studio 的完整分享码。
4. 在应用选择 `Import Light theme`，粘贴分享码，确认导入。如当前使用深色或系统深色，切换到 Light 才能看到浅色结果。
5. 如需恢复，重新导入第 2 步保存的分享文本，并恢复原来的外观模式。

如果界面没有对应导入入口，停止使用这份操作说明并核对版本；不要修改应用包或覆盖用户配置来绕过入口。

## 后续实机验收标准

- 在明确允许进行主题测试的环境中，先导出备份并记录应用版本与系统版本。
- 导入上面的候选文本，确认 UI 返回成功，浅色变体的强调色、背景和正文可见改变。
- 分别检查聊天正文、代码块、diff、侧栏和弹窗，拍摄不含私人信息的截图。
- 再导出主题，比较关键颜色、`variant`、`codeThemeId`，记录应用规范化结果。
- 导入备份并恢复原外观模式，确认恢复完成。
- 只有完成以上步骤，才将对应构建标记为 `App verified`；格式检查通过、网站复制成功、单元测试通过都不等同于实机验证。

本次没有设置修改权限需求，也没有进行上述实机验收；这是后续可执行的验收清单。
