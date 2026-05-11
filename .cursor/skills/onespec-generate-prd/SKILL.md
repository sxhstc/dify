---
name: onespec-generate-prd
description: PRD 本地生成技能。以禅道研发需求 Story ID 经 MCP 拉取需求、解析飞书链接并抓取正文（或用户粘贴），经需求分析与分级生成 PRD；不写回禅道，审核通过后由 /onespec-prd-update 回写同一 Story。当用户提到 "onespec-generate-prd"、"生成PRD"、"需求文档" 等时触发。
---

# OneSpec PRD Generator

将 **禅道研发需求 + 飞书需求文档**（及可选附图上下文）转化为高质量 PRD，**仅在本地输出**。同步到禅道由 **`/onespec-prd-update`** 负责。

## 同步到禅道（审核通过后）

- 产品审核通过、本地 **`prd.md`** 定稿后，执行 **`/onespec-prd-update <feature-name>`** 或 **`/onespec-prd-update <zentao-story-id>`**，将正文写回同一 Story 的 **`spec`**（不写 `title` 除非 PRD 要求改）。详见 **[onespec-prd-update 命令](../../commands/onespec-prd-update.md)** 与技能 **[onespec-prd-update](../onespec-prd-update/SKILL.md)**（含 **HTTP MCP 会话**、大 `spec`、写后 GET 校验）。
- **`sync-status: pending`**：尚未同步；同步成功后由更新命令设为 **`synced`** 并写 **`sync-at`**。若已是 **`synced`** 且需再次覆盖禅道，用户须在 **`/onespec-prd-update`** 侧明确 **「强制再次同步」**。

## 成功标准

- 禅道 Story 经 MCP 真实拉取，失败不编造
- 飞书不可自动抓取时有明确降级（用户粘贴 / 仅禅道 spec）
- PRD 写入 `onespec/prd/<feature-name>/prd.md`，frontmatter 含 **`zentao-story-id`**、`sync-status: pending`

## 参数

- `story-id`: (必填) 禅道 **研发需求 ID**（`/stories`），纯数字
- `feature-name`: (可选) 英文小写+连字符，最多 4 词；未提供则根据 Story **`title`** 生成
- `zentao-story-id`: 写入 frontmatter，与 `story-id` 相同

## MCP 与工具

- **禅道**：`call_mcp_tool` → server 以 Cursor 为准（多为 **`user-zentao`**），**`get_stories_storyID`**，`arguments`: `{ "storyID": "<id>" }`
- **飞书**：从 `story.spec`（HTML）用正则提取 URL（`feishu.cn`、`larkoffice.com` 等），再通过 **飞书 MCP**（`user-feishu-docx-mcp`）拉取正文：先 **`get_feishu_document_info`**（传 URL + `documentType`）获取 `documentId`，再 **`get_feishu_document_blocks`**（`documentId` + `mode: "markdown"`）拉取 Markdown；MCP 不可用时降级为请用户粘贴

## 工作流程

### 阶段 0：禅道 Story + 飞书

1. **`get_stories_storyID`** 拉取 Story；失败则终止
2. 向用户展示 `title`、`status` 等并 **确认继续**
3. 从 **`spec`** 解析飞书链接（`href` 或裸 URL）；无则 **`user-story`** = strip HTML 后的 spec，并标注无飞书
4. 有链接：**飞书 MCP** `get_feishu_document_info`（URL + `documentType`）→ `documentId` → `get_feishu_document_blocks`（`mode: "markdown"`）；MCP 不可用 → 用户粘贴正文
5. **`user-story`** = 飞书正文（主）+ 禅道 spec 纯文本补充（可选）

### 阶段 0.5：附图（可选，失败不阻断）

- 从 `user-story` / 飞书 HTML 提取 **公网可拉** 的图片 URL，下载到 `onespec/prd/_prd-image-cache/<feature-name>/`
- 识别汇总 **`imageContextSummary`**；**禁止**把签名 URL 写入 `prd.md`
- Figma：仅用户明确要求且存在 `figma.com` 链接时使用 **`figma-developer-mcp`**

### 阶段 1：需求分析

- **命名**：`feature-name` 未定时从 `title`/`user-story` 生成（英文小写+连字符，2–4 词）
- 读取 [references/requirement-analysis.md](references/requirement-analysis.md)
- **幂等**：若 `onespec/prd/<feature-name>/prd.md` 已存在 → **必须**停等用户选覆盖或取消
- 澄清 ≤2 轮 `questions.md`；附图要点须纳入分析（若有 `imageContextSummary`）

### 阶段 2：生成 PRD

- [references/grading-system.md](references/grading-system.md) 定级；缺信息默认 B 并标注
- **只读一个**模板：`references/templates/{s|a|b|c}-level.md`
- **评审摘要（必选）**：在 **`# ……需求文档` 之后、`## 1 ……` 之前**（B/C 级模板若在 `## [需求编号]` 之前无标题，则补 `# ……需求文档` 并将 **`## 0. 评审摘要（必读）`** 置于其下），固定包含 **`## 0. 评审摘要（必读，约 2 页）`**（B/C 可压缩为半页）：口语、短句、列表；建议 **0.1 一句话需求**、**0.2 做什么/不做什么**、**0.3 关键流程或生效方式**、**0.4 验收怎么测**；详细条款仍在 **`## 1` 及之后**。此节仅为可读摘要，**不改变** `/onespec-prd-update`（同步全文）、design、tasks 等后续流程。
- 输出：`onespec/prd/<feature-name>/prd.md`（中文、EARS、WHAT）
- **Frontmatter**：

```yaml
---
zentao-story-id: "<story-id>"
feishu-doc-url: "<解析到的主飞书 URL，无则留空>"
sync-status: pending
---
```

⛔ 禁止在本技能流程中调用 **`put_stories_storyID`** 或任何禅道写接口

## 纯文本模式（无 Story ID）

用户仅提供自然语言、无数字 ID：`user-story` = 全文，`zentao-story-id` 留空；仍可生成 PRD，但 **`/onespec-prd-update`** 需用户自行提供 Story ID。

## 关键约束

| 约束 | 说明 |
|------|------|
| 禁止写禅道 | 同步仅由 `/onespec-prd-update` |
| 顺序 | 0 → 0.5 → 1 → 2 |
| MCP 标识 | 禅道多为 `user-zentao` |

## Reference 文件

| 文件 | 读取时机 |
|------|----------|
| `references/requirement-analysis.md` | 阶段 1 |
| `references/grading-system.md` | 阶段 2 |
| `references/templates/*.md` | 阶段 2 选其一 |
