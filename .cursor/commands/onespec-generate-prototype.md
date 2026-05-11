---
name: onespec-generate-prototype
description: 先探测仓库技术栈（package.json 等），再按当前项目栈生成单文件 HTML 原型（CDN 直开，与现网一致）
---

# OneSpec Generate Prototype

基于已生成的 PRD，生成交互原型 HTML。**必须先探测当前仓库真实技术栈**，再选用与之一致的 UI 栈、API 写法与 **CDN 版本号**；禁止在未读 `package.json` 的情况下凭记忆写死某一仓库的历史版本（例如默认假定 Vue2.5.17）。若项目为 Vue2 + Element UI，原型须与 el-admin 式页面习惯一致；**禁止**在 Vue2 项目里默认使用 Vue3 + Element Plus + UnoCSS。

<!-- START -->

## 参数

- `id`：（可选）需求 ID，用于在 `onespec/prd/` 下匹配 `prd.md` 元数据
- `prd_path`：（可选）直接指定 PRD 路径，如 `onespec/prd/<feature-name>/prd.md`
- `name`：（可选）输出文件名中的标识（kebab-case）；缺省时与 PRD 所在目录名或功能名一致
- `style_ref`：（可选）参考页面或组件路径，如 `src/views/bankAccount/index.vue`；**强烈建议**对列表/表单页传入对应 `index.vue` 或 `head.vue`，以保证筛选区、表格、`size="small"`、`label-width` 等与现网一致

## 技术栈探测（强制执行，先于 PRD 分析）

**目的**：使命令在不同仓库间通用，且 CDN 与线上依赖主版本对齐。

1. **读取** 仓库根目录 `package.json` 的 `dependencies` 与 `devDependencies`（必要时再读 **`package-lock.json`** / **`pnpm-lock.yaml`** / **`yarn.lock`**），解析用于 CDN 的版本字符串：
   - **`vue`**：取声明版本；若为范围（如 `^2.5.17`），优先用 **lock 中已解析的精确版本**；无 lock 时可用范围左端或 npm 语义下的主.minor（与 unpkg 可访问版本一致即可），并在对话中注明依据。
   - **`element-ui`** / **`element-plus`**：同上，与 `vue` 主版本必须匹配（Vue2 → element-ui；Vue3 → element-plus）。
2. **判定分支**（命中即采用，并在对话中输出简短 **技术栈摘要**：框架主版本、UI 库及选用的 CDN 版本）：
   - **`vue` 为 2.x** 且存在 **`element-ui`** → **Vue 2 + Element UI 2**，CDN 使用探测到的 `vue` + `element-ui` 版本。
   - **`vue` 为 3.x**（或 `@vue/compat` 且按 3 使用）且存在 **`element-plus`** → **Vue 3 + Element Plus**，CDN 使用探测到的版本。
   - **Vue3 + 仅 element-ui**、**Vue2 + 仅 element-plus** 等不兼容组合 → **停止生成**，说明冲突并请用户指定或调整依赖描述。
   - **无 Element 系 UI 库** → 可生成 **纯 Vue** 最小原型，或说明无法对齐 Element 现网组件、建议补充 `style_ref` / 依赖后再生成（二选一须在对话中写清）。
3. **不要引入** 当前仓库未使用的 CSS 框架：无 `uno.config.ts` / 未依赖 UnoCSS 时，禁止引入 UnoCSS Runtime；无 Tailwind 依赖时不要引入 Tailwind CDN。

## 准备与 PRD（步骤 1.1）

1. **定位 PRD**：`prd_path` 优先；否则 `id` 匹配 `onespec/prd/*/prd.md` frontmatter 或目录约定；均未提供则提示用户补充。
2. **分析 PRD**：业务字段、列表/表单、操作按钮、弹窗与二次确认、与 `style_ref` 的列对应关系。

> **推荐执行顺序**：技术栈探测（上一节）→ 本节 PRD → 下一节样式与主题（便于列与现网组件对齐）。

## 设计规范与样式对齐（步骤 1.2）

在已完成 **技术栈探测** 的前提下，按优先级执行，命中即采用，并在对话中简要说明「风格来源」：

| 优先级 | 条件 | 动作 |
|--------|------|------|
| 1 | 提供了 `style_ref` | **精读**该 `.vue`（及同目录强关联子组件如 `head.vue` / `form.vue`）：`el-form` 是否 `inline`、`label-width`、控件 `size`、按钮 `type`（如查询 `warning`、重置 `success`、新增 `primary`）、`el-table` 的 `border`/`size`、`app-container` 等 class；表格列顺序与 PRD 对齐 |
| 2 | 未提供 `style_ref` 但 PRD 写明页面路径 | 在 `src/views/` 下定位对应 `index.vue` 并同上做样式抽取 |
| 3 | 主题色与 Element 变量（Vue2 + element-ui 常见） | 读取 `src/styles/element-variables.scss`（或 `src/styles/index.scss` 中引用关系）：常见主色为 **`#1890ff`（primary）** 等；在原型 `<style>` 中通过 CSS 变量或少量覆盖 **贴近** 编译后主题（以当前仓库 SCSS 为准，勿硬编码其他项目色值） |
| 4 | Vue3 + element-plus 项目 | 以项目内主题/暗色配置或 Element Plus 变量为准，在 `<style>` 中做必要覆盖 |
| 5 | 以上仍不足 | 可读取 `.cursor/skills/onespec-generate-prototype/references/design-system.md` 或请用户补充截图 |

**布局约束（避免与现网不一致）**：

- 原型默认只模拟 **`style_ref` 所在页面在 Layout 内的主内容区**（例如 `div.app-container` 内：筛选 + 按钮 + 表格 + 分页），**不要**默认绘制整站左侧导航栏；侧栏会挤占宽度，导致筛选换行、宽表变「竖」。
- 若 PRD 明确要求「带侧栏的整页壳」，再增加简易侧栏，且主内容区应 **`min-width` + 横向滚动** 保证表格仍为横向宽表。

**可选截图**：用户粘贴现网页面截图时，结合 `style_ref` 校对筛选文案（如「账号」vs「账户号」）与列宽。

## 生成策略（步骤 2）— 按探测结果二选一

### A. Vue 2 + Element UI

1. **交付物**：单个 HTML，**CDN** 加载依赖，双击可开（需网络）。
2. **CDN URL**：使用 **技术栈探测** 得到的 `vue`、`element-ui` 版本号拼接（示例形态，版本号须替换为探测值）：
   - Vue：`https://unpkg.com/vue@{探测的vue版本}/dist/vue.js`
   - Element UI JS：`https://unpkg.com/element-ui@{探测的element-ui版本}/lib/index.js`
   - Element UI 样式：`https://unpkg.com/element-ui@{探测的element-ui版本}/lib/theme-chalk/index.css`
   - 中文：优先 `lib/umd/locale/zh-cn.js`（与 Element UI UMD 导出一致；若 404 以当前包内实际路径为准）。
3. **写法**：
   - **Vue 2 Options API**（`new Vue({ ... })` 或 `template` + `type="text/x-template"`），与仓库内 `.vue` 一致。
   - 表格列使用 **`slot-scope`**；`this.$message`、`this.$confirm`。
   - **禁止**：`import`、TypeScript、`createApp`、Composition API、Element Plus 组件名（如 `el-config-provider`）。
4. **图标**：内联 SVG 或 Element UI `icon="el-icon-xxx"`。
5. **Mock 数据**：3～5 条高拟真；禁止占位式命名；虚构数据勿写入正式 Spec。
6. **交互**：与 PRD 一致（Loading、`$message`、`$confirm`、表单 `rules` 等）。

### B. Vue 3 + Element Plus

仅当探测为 **Vue 3 + element-plus** 时启用：CDN 使用探测到的 `vue`（如 `vue@3.x.x` 的 **global 构建**）与 `element-plus` 版本；`createApp` + `app.use(ElementPlus)`；组件与消息 API 以 Element Plus 文档为准。版本号同样来自 **技术栈探测**，不得抄其他仓库固定 URL。

## 输出路径

- **优先**（与 PRD 同目录，便于评审）：`onespec/prd/<feature-name>/<id>-<feature-name>-preview.html` 或 `onespec/prd/<feature-name>/<feature-name>-preview.html`（`id` 缺省时省略前缀）。
- **备选**：`onespec/prototype/<id>-<name>-preview.html`（若团队约定统一落盘到 prototype 目录）。
- 生成前确保目标目录存在（`mkdir -p`）。

## 自我审查（步骤 3）

- [ ] PRD 字段与列表/表单列一致（含 PRD 要求隐藏的列，如「无状态列」）
- [ ] **已执行技术栈探测**：HTML 中 CDN 的 `vue` / `element-ui` 或 `element-plus` **主版本**与当前仓库 `package.json`（及 lock，若已读）一致，并在对话中有 **技术栈摘要**
- [ ] 样式与 `style_ref` / `element-variables.scss`（或 Vue3 项目主题配置）一致；主内容区横向宽表、筛选尽量单行（必要时横向滚动）
- [ ] 单文件、无 `import`、浏览器可直接打开
- [ ] 主流程可点击跑通

## 关键约束

- **风格对齐当前仓库**：在 Vue2 + Element UI 项目中使用 el-admin 式习惯，而非 Element Plus 默认皮肤；Vue3 项目则对齐 Element Plus 用法。
- **零配置**：仅 CDN，无本地构建。
- **路径基准**：以本仓库根目录为基准。
- **虚构数据声明**：Mock 数据不得被当作真实业务写入其他文档。

<!-- END -->
