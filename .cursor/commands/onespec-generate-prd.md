---
name: onespec-generate-prd
argument-hint: <story-id> [feature-name]
---

# OneSpec Generate PRD Workflow

PRD 本地生成工作流：以 **禅道研发需求（Story）ID** 为入口，经 **禅道 MCP** 拉取需求 → 从需求描述中解析 **飞书文档链接** → 抓取飞书正文（或经用户补充）→ 需求分析与分级 → 在本地生成 PRD。**不**写回禅道；产品审核通过后由 **`/onespec-prd-update`** 将 PRD 同步回该 Story。

**禅道 MCP**：Cursor 中服务器标识多为 **`user-zentao`**（`~/.cursor/mcp.json` 里 key 可能为 `zentao`，以 **Settings → MCP** 面板为准）。研发需求详情使用 **`get_stories_storyID`**（参数 `storyID` 为数字字符串）。

**飞书 MCP**：Cursor 中服务器标识多为 **`user-feishu-docx-mcp`**。Wiki 文档先用 **`get_feishu_document_info`**（传 wiki URL，`documentType: "wiki"`）获取 `documentId`，再用 **`get_feishu_document_blocks`**（传 `documentId`，`mode: "markdown"`）拉取正文。

<background_information>
- **任务**: 将禅道 Story + 飞书需求正文转化为高质量 PRD，**仅在本地输出**。
- **流程**: 禅道拉取 Story → 解析飞书 URL → 获取飞书内容（失败则降级）→ **需求附图（可选）** → 需求分析 →（澄清）→ PRD 生成。
- **成功标准**:
  - 需求经过充分分析，无重大逻辑漏洞。
  - PRD 符合分级模板与 EARS 规范。
  - 写入 `onespec/prd/<feature-name>/prd.md`，frontmatter 含 **`zentao-story-id`**、`sync-status: pending`。
</background_information>

<instructions>
<!-- START -->
## 参数
- `story-id`: (必填) **禅道研发需求 ID**（Story，一般为纯数字，如 `9`）。
- `feature-name`: (选填) 功能英文标识：纯小写字母与连字符，最多 4 个词，如 `bank-account-list`。未提供时根据 Story **`title`** 自动生成并告知用户。
- `zentao-story-id`: (自动) 与 `story-id` 相同，写入 `prd.md` frontmatter，供 **`/onespec-prd-update`** 回写禅道。

## 幂等性策略
- 在 `feature-name` 确定后，立即检查 `onespec/prd/<feature-name>/prd.md` 是否已存在。
- 若已存在，**必须暂停并询问用户**：
  > 「检测到 `onespec/prd/<feature-name>/prd.md` 已存在，请选择：1. **覆盖** 2. **取消**」
- 未收到明确回复前不得写入；选择取消则终止。

## 执行流程

### 阶段 0: 禅道 Story 与飞书正文

**目标**: 锁定 Story，并得到可作为需求分析的 **`user-story`** 文本（越长越完整越好）。

1. **调用禅道 MCP**  
   - **`get_stories_storyID`**，`storyID` = 用户输入的 `story-id`（字符串形式即可）。  
   - 失败（无权限、404 等）→ 输出错误信息，**终止**（不得编造 Story）。

2. **向用户简报并确认**（可合并为一条消息）  
   - 展示：`id`、`title`、`status`、`product`（若有）、`openedBy` / `openedDate`（若有）。  
   - **`spec` 原文或摘要**（HTML 可先strip标签再展示，避免刷屏）。  
   - 询问：**「确认以该 Story 及飞书内容为准继续生成 PRD？」** — 取消则终止。

3. **从 `story.spec` 解析飞书链接**（HTML 内 `href` 或纯文本 URL 均可）  
   - 匹配主机含 **`feishu.cn`**、**`feishu.net`**、**`larkoffice.com`**、**`larksuite.com`** 的 `http(s)://...` 链接；取**第一条**作为主文档（多条时列出并请用户指定一条）。  
   - **无链接**：将 `spec` 去 HTML 后的文本作为 `user-story`；在对话与 PRD 中标注「未检测到飞书链接，仅以禅道描述为准」，跳过阶段 0.5 的飞书抓取。

4. **获取飞书文档内容**（存在 URL 时）  
   - **优先使用飞书 MCP**（`user-feishu-docx-mcp`）：  
     1. 调用 **`get_feishu_document_info`**，参数 `documentId` = 飞书 URL，`documentType` = `"wiki"`（wiki 链接）或 `"document"`（docx 链接）。获取返回的 **`documentId`**（即 `obj_token`）。  
     2. 调用 **`get_feishu_document_blocks`**，参数 `documentId` = 上一步返回的 `documentId`，`mode` = `"markdown"`。得到 Markdown 正文。  
   - **若飞书 MCP 不可用或调用失败**：降级为请用户 **导出飞书为 Markdown / 复制正文粘贴到对话**。  
   - 合并规则：`user-story` = **飞书正文（或用户粘贴）** + 必要时附录 **禅道 `spec` 去标签后的补充**（避免重复可去重）。

5. **记录元数据**（写入阶段 2 的 frontmatter）  
   - `zentao-story-id`: `story-id`  
   - `feishu-doc-url`: 解析到的主链接，无则留空或省略该键

### 阶段 0.5: 需求附图（飞书 / 禅道描述中的公网图，可选）

**目标**: 从 `user-story` 或已抓取的飞书 HTML 中提取 **可匿名访问的图片 URL**，下载到本地供多模态理解；**失败不阻断** PRD。

1. 在文本中匹配 `https?://...` 且后缀或路径像图片（`.png`/`.jpg`/`.jpeg`/`.gif`/`.webp` 等）。**排除**需登录的飞书内域私有短链（若无法下载则跳过并记录）。
2. 下载目录：`onespec/prd/_prd-image-cache/<feature-name>/`（或 `zentao-<story-id>` 子目录）。使用 `/usr/bin/curl` 等可用工具；失败仅记录。
3. 对成功落盘的图片做内容识别，汇总为 **`imageContextSummary`**（中文要点）；**禁止**把带鉴权或签名的临时 URL 写入 `prd.md`。
4. **Figma**：仅当用户明确要求且存在 `figma.com` 链接时，使用已配置的 **`figma-developer-mcp`**；失败不阻断。

### 阶段 1: 需求分析 (Requirement Analysis)

与历史版本相同逻辑，数据源改为上述 **`user-story`**（含飞书 + 禅道补充）。

1. **命名 `feature-name`**：未提供时由 `title` / `user-story` 生成（纯英文小写+连字符，最多 4 词，禁止拼音作单词主体）。
2. 读取 `.cursor/commands/spec-rules/requirement-analysis.md`；缺失则用命令内兜底 checklist。
3. **澄清**：最多 2 轮 `questions.md`；超出后询问是否强制继续（TBD 标注）。

### 阶段 2: 生成 PRD (Generate PRD)

1. **分级**：读取 `.cursor/commands/spec-rules/requirements.md`；无法判断时默认 B 级并标注。
2. **模板**：按等级选用 `.cursor/skills/onespec-generate-prd/references/templates/` 下对应**一个**模板文件。
3. **评审摘要（必选，便于评审）**：在正文 **`# ……需求文档` 标题之后、`## 1. ……` 之前**，固定增加 **`## 0. 评审摘要（必读，约 2 页）`**，用**口语、短句、列表**，不写实现细节堆砌；建议包含：
   - **0.1 一句话需求**（要解决什么问题）
   - **0.2 做什么 / 不做什么**（边界先对齐）
   - **0.3 关键流程或生效方式**（若涉及保存、同步、多端，用人话写清「谁调谁、成功判据」）
   - **0.4 验收怎么测**（测试可执行的要点，不求覆盖全文）
   - 详细条款、EARS、表格仍放在 **`## 1` 及之后**，与模板章节编号衔接（即：**§0 摘要 → §1 文档信息 → …**）。
   - **不影响后续流程**：`/onespec-prd-update` 同步的是整份 Markdown；`onespec-change` / `design` / `tasks` 仍以正文与 frontmatter 为准，仅多一节可读摘要。
4. **输出**: `onespec/prd/<feature-name>/prd.md`（中文、EARS、WHAT 非 HOW）；若有 **`imageContextSummary`** 须有「需求附图说明」或等价小节。
5. **Frontmatter**（头部）：
   ```yaml
   ---
   zentao-story-id: "<story-id>"
   feishu-doc-url: "<主飞书 URL，无则留空>"
   sync-status: pending
   ---
   ```
## 关键约束
- **禁止本命令写禅道**：不得调用 `put_stories_storyID` 等；回写由 **`/onespec-prd-update`** 负责。
- **禁止编造**：禅道 MCP 失败、飞书不可读时不得虚构需求；须等待用户粘贴或修正 ID。
- **顺序**: 阶段 0 → 0.5 → 1 → 2。
- **路径**: `onespec/prd/<feature-name>/` 下 `questions.md`（若有）、`prd.md`；图片缓存建议加入 `.gitignore`。

## 可选：无禅道 ID 的纯文本需求

若用户**未提供数字 Story ID**、整段为自然语言：视为 **纯文本模式** — `user-story` = 全文，`zentao-story-id` 留空；仍生成 PRD，但 **`/onespec-prd-update` 无法自动关联禅道**，须用户在更新命令中自行提供 Story ID 或先补写 frontmatter。

</instructions>
