---
name: onespec-prd-update
argument-hint: <feature-name-or-zentao-story-id>
---

# OneSpec PRD Update — 同步 PRD 到禅道研发需求

将本地已**产品审核通过**的 `prd.md` 正文，回写到 **原禅道研发需求（Story）** 的 **`spec`**（及必要时的 **`title`**），并更新本地 frontmatter 同步状态。

**前置条件**：已通过 **`/onespec-generate-prd`** 生成 `onespec/prd/<feature-name>/prd.md`，且 `prd.md` frontmatter 中含 **`zentao-story-id`**（或与用户确认过的 Story ID）；`sync-status` 为 `pending` 或用户已明确 **强制再次同步**。

**禅道 MCP**：服务器标识多为 **`user-zentao`**（以 **Settings → MCP** 为准）。使用 **`get_stories_storyID`** 读取当前需求，**`put_stories_storyID`** 提交更新（`storyID` + **`payload`**）。

**实现说明（减少反复试错）**：

- **`payload` 必须包含 `title` 与 `spec`**。Cursor 里该工具的 **JSON schema 描述可能未列出 `spec`**，以禅道接口与 **`get` 返回字段**为准；**不可**因 schema 缺项就不传 `spec`。
- **大体积 `spec`（整份 PRD 转 HTML，常十余 KB）**：`call_mcp_tool` 可能对超长 `arguments` 不友好，或返回「无结构化内容」类告警但后端已写入。**推荐**：对 **HTTP 型**禅道 MCP（`mcp.json` 里为 `url` 的服务器）使用 **会话式调用**：
  1. `POST` **`initialize`**（JSON-RPC），从响应头读取 **`Mcp-Session-Id`**；
  2. 再 `POST` **`tools/call`**，`params.name` = `put_stories_storyID`，`params.arguments` = `{ "storyID": "<id>", "payload": { "title": "...", "spec": "..." } }`，请求头携带 **`Mcp-Session-Id`** 及 **`token`**（与 `mcp.json` 中该 server 的 `headers` 一致）。**禁止**把 token 写入仓库或 PRD。
  3. 若裸调 `tools/call` 报 **`method "tools/call" is invalid during session initialization`**，即缺会话，按上两步补 **`initialize`**。
- **写后校验**：**必须**再执行 **`get_stories_storyID`**，确认 `spec` 中出现 PRD 特征片段（如版本号、章节标题）；**勿**仅凭单次 MCP 返回体为空断定失败。

**`spec` HTML 建议（团队可读）**：保留飞书链接段落 → 简短说明「以下由本地 PRD 同步」→ `<hr/>` → **`<pre style="white-space:pre-wrap">` + `html.escape(Markdown正文)` + `</pre>`**（或等价转义），避免裸 `<` 破坏禅道富文本。

**配对命令**：PRD 本地稿由 **`/onespec-generate-prd`** 生成（`sync-status: pending`）；本命令负责审核通过后的禅道回写。技能参考：`.cursor/skills/onespec-generate-prd/SKILL.md`。

### 附：典型问题与处理

| 现象 | 处理 |
|------|------|
| `tools/call` invalid during session initialization | 对同一 MCP Base URL 先发 **`initialize`**，再用响应头 **`Mcp-Session-Id`** 调 **`tools/call`** |
| MCP 返回空或「无结构化内容」，禅道里 `spec` 已变 | **以 `get_stories_storyID` 为准**；勿盲目重复 PUT |
| 禅道里 `spec` 乱码、HTML 被吞 | 检查正文是否已 **`html.escape`**；避免未转义的 `<table>` 等与编辑器冲突 |
| 当前仓库没有 `onespec/prd/` | 在含 **项目群根** `onespec/` 的工作区执行，或先执行 **`/onespec-generate-prd`** |

### 附：`initialize` / `tools/call` 请求骨架（勿粘贴真实 token）

请求发往 **`~/.cursor/mcp.json`** 中禅道 server 的 **`url`**；头字段 **`token`** 与该 server 的 **`headers`** 一致。**第二次**请求必须带 **`Mcp-Session-Id: <initialize 响应头>`**。

`initialize` 示例体：

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"local","version":"0"}}}
```

`tools/call` 示例体（`arguments` 与 `call_mcp_tool` 同级字段一致）：

```json
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"put_stories_storyID","arguments":{"storyID":"<id>","payload":{"title":"…","spec":"…"}}}}
```

- 若在工作区生成了 **含 token 或大段 spec 的临时文件**，同步结束后 **删除**，且 **勿 `git add`**。

<background_information>
- **任务**: 将 `prd.md` **正文**（去掉 YAML frontmatter）同步到禅道 Story，不擅自改写 PRD 文件正文。
- **流程**: 定位 PRD → 校验状态 → 确认目标 Story / 强制覆盖 → **GET** → 组装 `payload` → **PUT** → **GET 校验** → 更新 frontmatter。
- **成功标准**:
  - 禅道上该 Story 的 **`spec`** 已包含 PRD 内容（按团队约定可为 HTML 包裹的 Markdown）。
  - `prd.md` 的 `sync-status` 为 `synced`，`sync-at` 为当天日期。
</background_information>

<instructions>
<!-- START -->
## 参数
- `feature-name-or-zentao-story-id`: (必填) `feature-name`（目录名），或 **`zentao-story-id`** 数字（在 `onespec/prd/**/prd.md` 的 frontmatter 中查找匹配）。

## 执行流程

### 步骤 1: 定位 PRD 文件
1. 在 `onespec/prd/` 下查找 `prd.md`：
   - 若输入为目录名：使用 `onespec/prd/<feature-name>/prd.md`。
   - 若输入为数字：遍历 `onespec/prd/**/prd.md`，frontmatter 中 **`zentao-story-id`** 与输入一致（忽略引号与空格）。
2. 未找到 → 提示「未找到匹配的 PRD，请确认 feature-name / Story ID，或先执行 `/onespec-generate-prd`」，终止。
3. 多个命中 → 列出路径请用户选择。

### 步骤 2: 读取并校验 PRD
1. 读取 `prd.md` 全文。
2. Frontmatter：
   - `sync-status: synced` → 须取得用户 **「强制再次同步」**（或等价明确表述），否则终止，避免误覆盖禅道。
   - `pending` 或缺省 → 继续。
3. 提取 **`zentao-story-id`**；若无且用户输入为数字，可用输入作为 Story ID；若仍无 → 请用户补充 Story ID 后再继续。

### 步骤 3: 确认同步目标
1. 输出将使用的 **`zentao-story-id`**（及 PRD frontmatter 中已记录的关联信息）。
2. **确认规则**（避免无意义往返）：
   - 用户已通过 **`/onespec-prd-update <id>`** 或 **`/onespec-prd-update <feature-name>`** 发起、且未表达取消 → **视为已确认**目标 Story，可直接进入步骤 4。
   - 若用户未带参数、仅询问流程，或明确要求「先核对再写」→ 询问：「确认将本地 PRD 同步到禅道研发需求 `<id>`？(y/n)」，拒绝则终止。
3. 可选：执行 **`get_stories_storyID`** 预览当前 **`title`**，与 PRD 文档信息表核对。

### 步骤 4: 回写禅道
1. **`get_stories_storyID`**，`storyID` = `zentao-story-id`，获取当前 **`title`**、`spec` 等（合并必填项、避免误清空）。
2. 从 `prd.md` 去掉 frontmatter，得到 **PRD 正文**（一般为 Markdown）。
3. **`put_stories_storyID`**：
   - `storyID` = `zentao-story-id`
   - **`payload`**：至少 **`title`**（优先使用 GET 返回的 `story.title`，除非 PRD 内明确要求改标题）与 **`spec`**（按上文「实现说明」与 HTML 建议组装）。若接口还要求其它字段，从 GET 结果合并，**禁止**空 `payload` 或缺 `title` 导致清空/校验失败。
4. 若 PUT 失败 → 输出完整错误信息，**不**改 `sync-status`。
5. **再次 `get_stories_storyID`**，核对 `spec` 已更新。

### 步骤 5: 更新 Frontmatter
成功后将 `prd.md` 头部更新为：
```yaml
---
zentao-story-id: "<id>"
feishu-doc-url: "<保留原值或留空>"
sync-status: synced
sync-at: <YYYY-MM-DD>
---
```
（保留原有 `feishu-doc-url` 等键。`sync-at` 取 **执行当日** `YYYY-MM-DD`，与 Cursor 会话「Today's date」或本机日期一致。）

输出：「PRD 已同步到禅道研发需求 `<id>`」。

## 关键约束
- **只做同步**：不得修改 PRD 正文的业务含义；若需改需求，应编辑本地 `prd.md` 后再次执行本命令。
- **先读后写再读**：PUT 前后均应 `get_stories_storyID`，避免误写或未落库。
- **敏感信息**：`token` 仅来自本机 MCP 配置，**勿**写入仓库、命令说明或 PRD。

</instructions>
