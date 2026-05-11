---
name: onespec-testcase
description: 按禅道执行（默认）或单份 PRD 生成测试用例 testcase.md（Markdown 表格）。当用户提到 "onespec-testcase"、"迭代测试用例"、"按迭代生成用例"、"PRD 测试用例"、"生成 testcase" 时触发此技能
---

# OneSpec 测试用例（Testcase）

## 参数

- **迭代模式（默认维度）**：`executionID`（禅道执行 ID）；`projectID`（选填）；`--with-specs`（选填）。
- **单需求模式**：`prd-path` 或 `feature-name`（对应 `onespec/prd/<feature>/prd.md`）；`--with-specs`（选填）。

## 执行概要

1. **迭代模式**：`get_executions_executionID` + `get_executions_executionID_stories` / `get_executions_executionID_tasks` / `get_executions_executionID_bugs`（与 `onespec-checklist` 同源步骤）→ 各工作项按 PRD frontmatter **`zentao-story-id`** 匹配 Story `id` 定位 `onespec/prd/**/prd.md`。次级输入 `changes`/`archive` 规则不变 → **合并**为一张 §3 总表，列含 **关联工作项**。
2. **单需求模式**：读单个 PRD → 生成 `onespec/testcase/<feature-name>/testcase.md`。
3. **产出路径**：迭代 → `onespec/testcase/<执行 slug>/testcase.md`（slug 规则同 `onespec-checklist`）；单需求 → `onespec/testcase/<feature>/testcase.md`。
4. **幂等**：已存在则按命令规则询问覆盖或目录后缀。

## 详细步骤与模板

以仓库内命令为准：**[onespec-testcase.md](../../commands/onespec-testcase.md)**。

模板：**[testcase.md](../../commands/spec-templates/testcase.md)**。

## 约束

- 用例须**可追溯 PRD**（或 proposal/design），不得编造未描述行为。
- **迭代模式**工作项列表须来自 **MCP**，不得杜撰。
- **落盘正文**不含 HTML 注释与「由 onespec-testcase 生成」类 blockquote。
