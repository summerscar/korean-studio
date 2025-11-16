# Copilot 指南 — Korean Studio

以下说明面向在此仓库中工作的 AI 编码代理（例如 Copilot / Chat 型代理）。目标是让代理能快速理解本仓库的结构、开发流程和关键接入点，并产出与仓库约定一致的更改。

## 快速概览
- 框架：`Next.js 15`（App Router） + `Keystone 6`（CMS）
- 数据库：PostgreSQL（Prisma，由 Keystone 管理；`schema.prisma` 为 Keystone 自动生成）
- 内容：`MDX` 存储于 `mdx/`，多语言文案在 `messages/`。

## 重要目录与示例文件
- `app/` — Next.js 页面、布局与前端组件（组件示例：`app/components/*`）。
- `keystone/` — Keystone 配置与数据模型（主文件：`keystone/schema.ts`）。
- `scripts/` — 内容生成与索引脚本（例如：`scripts/generate-search-index.ts`、`generate-doc-desc.ts`）。
- `next.config.ts` — Next 与 MDX、SVGR、Prisma 插件的定制配置。
- `package.json` — 常用任务：`npm run dev`（并行 Keystone + Next）、`npm run build`、`npm run keystone:dev`、`npm run next:dev`、`npm run script:generate-search-index`。

## 开发/构建/调试 要点（直接可执行）
- 启动开发（会并行运行 Keystone + Next）：
```bash
npm install
npm run dev
```
- 如果只需调试 CMS：`npm run keystone:dev`。只需前端：`npm run next:dev`。
- 构建生产：`npm run build`，运行：`npm run next:start` 与 `npm run keystone:start`（或直接 `npm run start`）。

## 数据模型与迁移注意事项
- 数据模型请在 `keystone/schema.ts` 修改，然后通过 Keystone 流程生成/应用更改（Keystone 会更新 `schema.prisma`）。不要直接编辑 `schema.prisma`（文件头部已有提示）。

## 内容与国际化模式（重要约定）
- 学习内容以 MDX 文件保存在 `mdx/`，按级别组织（`beginner/`, `intermediate/` 等）。新增内容后通常需要更新文档元数据与搜索索引：
  - `npm run script:docs-modified`
  - `npm run script:generate-search-index`
- 翻译文案放在 `messages/`（JSON），运行时通过 `next-intl` 动态加载，URL 与 cookie 会影响语言选择。

## 身份与权限集成（关键接入点）
- 应用使用混合认证：`next-auth` 與 `Keystone`（参考 `keystone/context.ts` 与 `app/api/auth/[...nextauth]/route.ts`）。
- 修改認證或會話相關邏輯時，需要同時考慮兩邊的 session 同步與授權判斷（`keystone/schema.ts` 中的 access helpers 展示了此模式）。

## 代码风格与质量检查
- 使用 Biome 作为 linter/formatter：`npm run lint` / `npm run format` / `npm run check`。
- 提交时 `lint-staged` 会触发 Biome 的检查，MDX 变更会触发文档脚本（见 `package.json` 中的 `lint-staged` 配置）。

## 集成点与外部依赖
- AI/第三方：`openai`、`@google/generative-ai` 已在依赖中，引入在若干 `scripts/` 与服务端 API（注意后端 API key 的安全管理，使用 `.env`）。
- 邮件与推送：`nodemailer` 与 `web-push`，模型中有 `PushSubscription` 列表（见 `keystone/schema.ts`）。

## 生成补丁时的最佳实践（针对代理）
- 修改数据模型：在 `keystone/schema.ts` 修改后，使用 Keystone 的 dev 流程（`npm run keystone:dev`）验证 schema 变更，并确保 `schema.prisma` 的自动生成反映了预期变更。
- 修改或新增 MDX 内容：在 `mdx/` 添加文件并运行文档脚本与索引脚本以维持搜索与元数据一致性。
- 前端改动：遵循 `app/` 的路由约定（App Router page/layout/route），使用 `next dev` 验证热重载。
- 代码风格：在更改前运行 Biome 格式化与检查。提交前确保 `lint-staged` 钩子通过。

## 小结与排查提示
- 若遇到 Prisma/Keystone 类型或生成问题，优先检查 `keystone/schema.ts` 与 `next.config.ts` 的 Prisma 插件配置（`PrismaPlugin`）和 `DATABASE_URL` 环境变量。
- 若 MDX 或自定义组件渲染异常，检查 `next.config.ts` 中的 `pageExtensions` 与 MDX loader 配置，以及 `app/components/markdown-render` 相关自定义组件。

如果有需要我可以把这份文件合并到仓库（已准备好写入），或按你的偏好调整为英文/更细粒度的规则。请告诉我你想修改或补充的部分。
