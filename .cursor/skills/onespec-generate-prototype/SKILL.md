---
name: onespec-generate-prototype
description: 先探测仓库技术栈（package.json 等），再按当前项目栈生成单文件 HTML 原型（CDN 直开）。触发词：onespec-generate-prototype、生成原型、创建原型、UI原型、页面原型。
---

# OneSpec 原型生成

## 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `id` | 可选 | 需求 ID，用于定位 PRD 和命名输出文件 |
| `prd_path` | 可选 | 直接指定 PRD 文件路径 |
| `name` | 可选 | 输出文件名标识（kebab-case） |
| `style_ref` | 可选 | 参考页面或组件路径（**强烈建议**传 `src/views/<模块>/index.vue` 或同目录 `head.vue`），对齐筛选、表格、按钮 `type` 与 `size` |

## 工作流程

### 阶段 1：信息收集

**步骤 1.0 — 技术栈探测（强制，须最先执行）**

1. 用工具读取仓库根目录 **`package.json`** 的 `dependencies` 与 `devDependencies`。
2. **可选**：读取 **`package-lock.json`** / **`pnpm-lock.yaml`** / **`yarn.lock`**，当 `vue`、`element-ui`、`element-plus` 等为 semver 范围时，以 **lock 中解析到的精确版本** 作为 CDN 版本（更贴近线上安装结果）；无 lock 时在对话中注明采用的版本依据（如 `^2.5.17` 取兼容的发布版）。
3. **判定分支**（在对话的「准备摘要」中必须写明 **技术栈摘要**：Vue 主版本、UI 库名、用于 CDN 的版本号）：
   - `vue` **2.x** + **`element-ui`** → Vue 2 + Element UI 原型；CDN URL 中的版本 = 探测值。
   - `vue` **3.x**（或明确按 Vue3 使用）+ **`element-plus`** → Vue 3 + Element Plus 原型；CDN 版本 = 探测值。
   - Vue 与 Element 产品线不匹配（如 Vue3 + 仅 element-ui）→ **停止**，说明原因。
   - 无 Element 系依赖 → 纯 Vue 最小 HTML 或提示补充依赖/`style_ref`（二选一写清）。
4. **禁止**：仓库未使用 UnoCSS/Tailwind 时，不向 HTML 注入对应 CDN Runtime。

**步骤 1.1 — 定位 PRD**

| 优先级 | 条件 | 执行动作 |
|--------|------|---------|
| 1 | 提供了 `prd_path` | 验证文件存在，读取 |
| 2 | 提供了 `id` | 遍历 `onespec/prd/*/prd.md`，匹配 ID 后读取 |
| 3 | 两者均未提供 | **停止**，提示用户提供 PRD 路径或需求 ID |

⛔ 禁止在未获取 PRD 文件内容的情况下继续执行

**步骤 1.2 — 获取设计规范**

| 优先级 | 条件 | 执行动作 |
|--------|------|---------|
| 1 | 提供了 `style_ref` | **精读**该 `.vue` 及同目录强关联子组件（如 `head.vue`、`form.vue`）：`el-form`/`inline`/`label-width`、`size="small"`、`el-table` `border`、`type="warning"` 查询、`type="success"` 重置等；**不要**默认虚构整站左侧菜单 |
| 2 | 仓库存在 `src/styles/element-variables.scss`（且为 Element UI 项目） | 提取主题色：`$--color-primary: #1890ff` 等，写入原型内联样式补充 |
| 3 | 存在 `uno.config.ts` 或团队统一 `src/style.css` | 提取变量（多出现在 Vue3 项目）；与 1、2 可同时参考 |
| 4 | 以上仍不足 | 读取 [references/design-system.md](references/design-system.md) |

**布局约束**：原型默认只渲染 **Layout 主内容区**（如 `app-container`：筛选 + 操作 + 表格 + 分页），与 `src/views/**/*.vue` 一致；避免侧栏挤窄导致筛选竖排、宽表变「竖」。PRD 明确要求整页壳时再加侧栏，并为主区设置 **`min-width` + `overflow-x: auto`**。

> 可提示用户：粘贴现网页面截图，可与 `style_ref` 对照文案与列宽。

**步骤 1.3 — 分析 PRD 内容**

读取 [references/prd-analysis.md](references/prd-analysis.md)，按其规则提取字段、流程、交互。

**步骤 1.4 — 强制确认**

完成步骤 **1.0–1.3** 后输出准备摘要（**技术栈摘要**、PRD 路径、生成分支 Vue2/UI2 或 Vue3/Plus、风格来源、输出路径），请用户回复「继续」后再进入阶段 2。若用户已通过斜杠命令**显式要求一次生成完毕**，可视为确认（与 `.cursor/commands/onespec-generate-prototype.md` 保持一致）。

⛔ 未确认前不得写入 HTML（除非用户指令已等价于确认）

### 阶段 2：生成原型

读取 [references/html-template.md](references/html-template.md)，按 **步骤 1.0 探测到的技术栈与版本号** 选用对应章节，**所有 CDN 链接中的版本字符串须与探测结果一致**，不得抄其他项目或历史示例中的固定版本。

- **Vue2 + element-ui**：Options API + `slot-scope` + `$message` / `$confirm`（版本以 `package.json`/lock 为准）。
- **Vue3 + element-plus**：文档第二节 + `createApp` / `app.use(ElementPlus)`（版本以 `package.json`/lock 为准）。

共用要求：

- **Mock 数据**：3–5 条高拟真；虚构数据勿写入正式 Spec
- **交互**：Loading、`$message` / `$confirm`、表单校验、删除二次确认
- **图标**：内联 SVG 或 Element UI 自带 `icon` 属性

### 阶段 3：自我审查

- [ ] PRD 字段与界面一致（含「隐藏列」等 PRD 约束）
- [ ] 已执行 **步骤 1.0**，HTML 中 CDN 的 `vue` / `element-ui` 或 `element-plus` 版本与 `package.json`（及 lock，若已读）一致
- [ ] 样式与 `style_ref` / `element-variables.scss`（或 Vue3 主题配置）一致；主内容区横向宽表
- [ ] 单文件、浏览器可直接打开
- [ ] 主流程可点击跑通

### 阶段 4：输出

- **优先路径**：`onespec/prd/<feature-name>/<id>-<feature-name>-preview.html`（与 PRD 同目录）；无 `id` 时可省略 `id-` 前缀
- **备选**：`onespec/prototype/<id>-<name>-preview.html`
- 单文件 HTML，依赖 CDN，零本地构建

## Reference 文件

| 文件 | 读取时机 |
|------|----------|
| `references/prd-analysis.md` | 阶段 1 步骤 1.3 |
| `references/html-template.md` | 阶段 2（按技术栈选章节） |
| `references/design-system.md` | 阶段 1 步骤 1.2 兜底或主题摘要 |
