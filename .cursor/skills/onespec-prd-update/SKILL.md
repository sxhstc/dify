---
name: onespec-prd-update
description: 将本地已审核的 PRD（prd.md）通过禅道 MCP 回写到原研发需求 Story 的 spec/title；先 get 再 put 合并字段，PUT 后再 get 校验。当用户提到 "onespec-prd-update"、PRD 同步禅道、PRD 上传禅道 时触发。
---

# OneSpec PRD → 禅道同步

## 前置

- 仓库内存在 `onespec/prd/<feature-name>/prd.md`
- Frontmatter 含 **`zentao-story-id`**（或与用户确认的 Story ID）
- `sync-status: synced` 再次同步时，用户须明确 **强制再次同步**

**配对**：本地 PRD 由 **`/onespec-generate-prd`** 产出（`pending`）；本技能负责回写禅道。参见 **[onespec-generate-prd](../onespec-generate-prd/SKILL.md)**。

## MCP

- Server：以 Cursor 为准（多为 **`user-zentao`**）
- **`get_stories_storyID`**：`{ "storyID": "<id>" }`
- **`put_stories_storyID`**：`{ "storyID": "<id>", "payload": { "title": "...", "spec": "..." } }`
  - **`payload` 必须含 `title` + `spec`**（schema 描述可能未列 `spec`，以接口与 GET 字段为准）
  - **`spec`**：禅道富文本多为 HTML；Markdown 正文建议 `html.escape` 后包在 `<pre style="white-space:pre-wrap">` 内，前部可保留飞书链接 + 一句「本地 PRD 同步」说明
  - 其它必填字段从 GET 结果合并，**禁止**空 payload 覆盖清空

### 大 `spec` 与 HTTP MCP（易踩坑）

- 若 **`call_mcp_tool`** 对大 JSON 失败或返回无结构化内容：对 **`mcp.json` 中为 `url` 的禅道 MCP**，使用 **JSON-RPC 会话**：
  1. `initialize` → 读响应头 **`Mcp-Session-Id`**
  2. `tools/call` + `Mcp-Session-Id` + `token` 头，调用 `put_stories_storyID`
- 错误 **`tools/call` invalid during session initialization** → 未带会话，先 `initialize`
- **勿**把 `token` 写入仓库或 PRD

### 典型问题（速查）

| 现象 | 处理 |
|------|------|
| `invalid during session initialization` | `initialize` → 带 `Mcp-Session-Id` 再 `tools/call` |
| MCP 无返回体但禅道已更新 | 以 **GET story** 的 `spec` 为准 |

## 确认规则（避免歧义往返）

- 用户已发 **`/onespec-prd-update <id|feature-name>`** 且无取消语义 → **视为已确认**目标 Story，可直接 GET → PUT
- 仅询问、未给参数，或要求先核对 → 再问 y/n
- **`synced` 强制覆盖**：须用户明确 **「强制再次同步」** 等表述

## 步骤摘要

1. 按 `feature-name` 或 `zentao-story-id` 定位 `prd.md`
2. 校验 `sync-status` 与强制覆盖意图
3. **GET** → 组装 `title` + `spec` → **PUT** → **GET 校验** `spec`
4. 成功则 frontmatter：`sync-status: synced`、`sync-at: YYYY-MM-DD`

## 约束

- **不修改 PRD 业务正文**（除非用户事先已编辑 PRD）
- PUT 失败不更新 `sync-status`
- 详细分支、HTML 模板与 YAML 规则以 **[onespec-prd-update.md](../../commands/onespec-prd-update.md)** 为准
