---
name: onespec-change
description: 起草 OneSpec 变更提案（Proposal）及 Delta Spec 草稿。从禅道研发需求按 Story ID 拉取需求，分析代码库后生成 proposal.md 和 specs/*.md。当用户提到"onespec-change"、"起草变更"、"发起变更" 或 "新建变更提案"触发此技能。
---

# OneSpec 变更提案

## 参数
- `id`: (必填) **禅道研发需求 Story ID**（纯数字）
- `name`: (必填) 变更名称（短英文或拼音，用于目录名）

## 执行步骤

### 1. 准备工作
1. 验证 `id` 和 `name` 参数已提供。
2. 创建目录：`onespec/changes/<id>-<name>/` 及子目录 `specs/`。

### 2. 获取需求详情（禅道 MCP `user-zentao`）
1. **`get_stories_storyID`**（MCP 服务器 `user-zentao`）：参数 `{ "storyID": "<id>" }`
2. 提取：标题 → `story.title`，描述 → `story.spec`（HTML），处理人 → `story.assignedTo`，优先级 → `story.pri`
3. 若 `story.spec` 中包含飞书链接，使用 WebFetch 抓取正文内容并补充到描述中

> ❌ **禁止**：未调用 MCP 成功不得编造需求内容。

### 3. 代码上下文分析

> **上下文感知（仅限代码内容）**：先检查对话历史中是否已有相关**代码搜索/读取结果**，
> 有则直接复用，仅补充缺失模块。
> ⛔ **禁止**：步骤 2 的基础信息字段（处理人、优先级、标题）
>   不得从对话历史、原型 Mock 数据、PRD 文档等非 API 来源中读取。

**3.1 跨服务上下文（条件加载）**

```
IF 需求描述涉及：跨服务 API 调用 | 多系统数据同步 | 认证/鉴权 | 消息队列/事件
   → 加载 .cursor/rules/product-wiki/*.mdc
ELSE（纯单服务内部逻辑）
   → 跳过，不加载
```

**3.2 代码搜索范围约束**

**搜索方式**（按优先级）：
1. **结构认知**：先确认模块目录结构（如 `ls -R src/modules`），建立全局感知，避免盲目搜索
2. **L1 精确查找（优先）**：已知或能推测出类名/文件名时，必须使用 `Glob` 或 `Grep`
3. **L2 语义搜索（兜底）**：仅在无法推测名称时使用 `SemanticSearch`（每次聚焦单一问题：如「xxx 的 BO 字段定义」）
4. **读取约束**：命中文件后用 `Read(offset, limit ≤ 60)` 精读相关片段，禁止全目录扫描或整文件 Read

| 约束项 | 规则 |
|--------|------|
| 文件数量 | 超 5 个时取最相关 3 个；其余仅记录路径，不读取 |
| 单文件行数 | 超 300 行时只读关键词上下文（前后各 20 行） |
| 跳过文件 | `*Test.java`、`*.spec.ts`、`*_test.go` 等测试文件 |
| 历史去重 | 检查对话历史，已读取的文件不得重复 Read |

### 4. 生成 Proposal
1. 读取 [references/generation-rules.md](references/generation-rules.md) 和 [references/proposal-template.md](references/proposal-template.md)。
2. 创建 `onespec/changes/<id>-<name>/proposal.md`，按 generation-rules.md §1 **Proposal 填充规范**填写内容。

> ❌ **禁止**：不得修改模板 Frontmatter 结构及标题层级；无法确认代码逻辑时保留占位符，不编造。

### 5. 自动生成 Delta Spec 草稿
1. 读取 [references/spec-template.md](references/spec-template.md)。
2. 解析 proposal.md「规范变更规划」章节，按 generation-rules.md §2 **Delta Spec 精化规范**，逐条在 `specs/` 下创建 `.md` 草稿。
3. 将已生成条目从 `- [ ]` 更新为 `- [x]`。

> ❌ **禁止**：不得将 proposal.md 内容直接复制粘贴到 Delta Spec；必须补充完整边界、异常与范围说明。

### 6. 强制输出（必须执行）

完成步骤 5 后，**必须**按以下格式输出，等待用户后续指令再进行任何操作：

```
✅ 生成完成 — 请审查以下文件：
- proposal.md：onespec/changes/<id>-<name>/proposal.md
- Delta Specs 草稿：
  - [x] onespec/changes/<id>-<name>/specs/xxx.md
  - [x] onespec/changes/<id>-<name>/specs/yyy.md

下一步建议（根据变更复杂度选择）：
- 简单变更（无新增 API、影响模块 ≤2、总工时 ≤8h）→ 使用 onespec-task SKILL，参数 id=<id> name=<name> skip_design=true
- 复杂变更 → 使用 onespec-design SKILL，参数 id=<id> name=<name>
```

### 7. 结果验证
- proposal.md 已创建，Spec Impact 勾选状态已同步。
- specs/ 下已按 Spec Impact 列表生成对应草稿文件。
- 每个 Delta Spec 草稿内容与 proposal.md 分析一致（无凭空编造）。

## 错误处理

| 情况 | 处理方式 |
|------|---------|
| API 返回描述为空 | 暂停，询问用户功能细节 |
| 需求模棱两可 | 生成初始版本后与用户迭代，不预先追问 |
| 模板文件缺失 | 使用内联回退结构并发出警告 |
