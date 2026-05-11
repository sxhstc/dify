---
description: 原型设计参考；优先 Vue2 后台（Element UI 2 + el-admin），无 style_ref 时使用本节；跨仓库时参考附录 gcommon-next
globs: **/*.{vue,css,scss,html,ts,tsx}
---

# 原型设计体系参考

**读取顺序**

1. 若任务在 **本仓库**（或 `package.json` 含 `element-ui@2`）：优先 **第一节**，并与 **`style_ref` 源码**、`src/styles/element-variables.scss` 对照。
2. 若存在 `style_ref`：**以源码中的 class、`size`、`type`、`label-width` 为准**，本节仅作色板补充。
3. 其他仓库且无 Element 变量文件时：可使用 **附录 gcommon-next** 作兜底（勿与第一节混用主色）。

---

## 第一节：Vue2 后台（Element UI 2 + el-admin）

主题变量来源：`src/styles/element-variables.scss`（与编译后 Element UI 主题一致方向；CDN 直出原型可用下列 Hex **贴近**现网）。

### 品牌色（SCSS 摘要）

| Token | 色值 | 用途 |
|-------|------|------|
| Primary | `#1890ff` | 主按钮、链接、激活态 |
| Success | `#13ce66` | 成功、重置按钮（常见 `type="success"`） |
| Warning | `#FFBA00` | 查询按钮（常见 `type="warning"`） |
| Danger | `#ff4949` | 危险操作（按需） |

### 边框与表格（摘要）

| Token | 色值 |
|-------|------|
| `$--border-color-light` | `#dfe4ed` |
| `$--border-color-lighter` | `#e6ebf5` |
| `$--table-border` | `1px solid #dfe6ec`（语义） |

### 页面与布局习惯

- **主内容区**：`body` / 外层背景 `#f0f2f5`；白底内容块 **`padding: 20px`**（`app-container` 与线上一致）。
- **表单**：列表页筛选多为 **`el-form` `inline`**、`label-width` 约 **99px**、控件 **`size="small"`**。
- **表格**：**`el-table` `border` `size="small"`**，列多时宜 **横向滚动** 而非删列挤竖排。
- **原型范围**：默认不画整站左侧菜单，避免挤占宽度；与 `.cursor/commands/onespec-generate-prototype.md` 约定一致。

### 字体

与 `main.js` / 全局样式一致方向：`"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif`。

---

## 附录：gcommon-next（跨仓库兜底）

以下适用于 **未走第一节**（无 `element-ui@2` 或团队约定 gcommon-next 令牌）的仓库。按 **第一节** 生成原型时 **勿**将下列 Primary `#3081F2` 与第一节 `#1890ff` 混用。

This appendix defines design tokens for the `gcommon-next` component library when no project-specific `style_ref` or Element variables exist.

### A.1 Core Color System

Strictly use the following Hex codes when this appendix applies.

#### Brand Colors

- **Primary**: `#3081F2` (Blue)
  - Hover: `#599AF5`
  - Active: `#246FD8`
  - Disabled: `#AFCFFC`
- **Success**: `#14CC52` (Green)
- **Warning**: `#FFAA33` (Orange)
- **Danger/Error**: `#F24130` (Red)
- **Info**: `#8C929A` (Grey)

#### Neutral System (Based on Cold Grey `#000D1F`)

**Text Colors**

- **Primary Text**: `rgba(0, 13, 31, 0.85)`
- **Regular Text**: `rgba(0, 13, 31, 0.65)`
- **Secondary Text**: `rgba(0, 13, 31, 0.45)`
- **Placeholder/Disabled**: `rgba(0, 13, 31, 0.25)`

**Border Colors**

- **Default Border**: `#D9DBDE`
- **Light Border**: `#E5E6E8`
- **Lighter Border**: `#F2F3F4`

**Background**

- **Page Background**: `#FAFAFB`
- **White Background**: `#FFFFFF`

### A.2 Typography

- **Font Stack**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif`
- **Base body**: `14px`

### A.3 Tables / Buttons / Dialogs（摘要）

- **Tables**: Header Bg `#F7F7F8`, Row Hover `#FAFAFB`
- **Buttons**: Default height `32px`, radius `6px`
- **Dialogs**: Radius `12px`, generous padding

### A.4 Implementation Rules

1. Prefer Flexbox for layout in standalone HTML.
2. Standalone prototypes may use hardcoded hex from this appendix when no project CSS is loaded.
3. Do not apply `--el-color-primary` (Element Plus) unless the target stack is Vue3 + Element Plus.
