---
name: onespec-checklist
description: 根据禅道执行（Execution）ID 拉取执行内全部工作项与执行元数据，结合 OneSpec 与代码生成测试中心对齐的提测清单（checklist.md）。当用户提到 "onespec-checklist"、"提测清单"、"测试中心"、"生成提测材料"、"按迭代提测" 时触发此技能
---

# OneSpec 提测清单

## 参数

- `executionID`：（必填）禅道 **执行 ID**（Execution ID，与 API `get_executions_executionID` 一致）。
- `projectID`：（选填）禅道 **项目 ID**；未提供时从 `get_executions_executionID` 返回的 `project` 字段获取。
- `镜像id`：（选填）容器镜像 ID，**可多个**（多服务/多制品）；**未提供时须在写入前向用户确认**，不得编造。

## 执行概要

1. **禅道 MCP**：`get_executions_executionID`（执行元数据）→ **`get_executions_executionID_stories`** + **`get_executions_executionID_tasks`** + **`get_executions_executionID_bugs`**（合并获取**执行内全部工作项**）。
2. **本地 OneSpec**：对每个工作项 ID 先查 `onespec/changes/<id>-*/`，**若无则查 `onespec/archive/*-<id>-*/`**（可能已 `onespec-complete` 归档），再合并 `proposal.md`、`design.md`、`tasks.md`。
3. **检索**：第二节 **应用名 + 镜像 id** 表（**应用名 = 仓库名**如 `bfs-bemp`；**可多行、多镜像**；镜像手动填写，缺省时先问用户）；**第一节**按单/多需求用表格写业务（无特别说明时不列交付形态/数据与范围、使用场景、角色与权限/鉴权失败等行，见命令 **§2.1**）；**第三节「涉及的接口」** 以接口列表表为主，路径参数/成功响应/异常鉴权等子表**仅在有特别说明时**追加；第三～五节**合并**多工作项的接口 / SQL / 配置；第四节为**文本**；无 SQL 时第四节可留空；配置**不脱敏**。
4. **产出**：`onespec/checklist/<执行名称slug>/checklist.md`（目录名取自 **`get_executions_executionID` 返回的 `name`** 经安全化，**不用**执行 ID；ID 只在 Frontmatter）；含 **执行内工作项表** + 一至八节；产物**不含**模板注释、`>` 编写指引、无内容时的「无 | —」占位行及「本期 PRD…」等套话（详见命令 §8）。

## 详细步骤

以仓库内命令为准：**[onespec-checklist.md](../../commands/onespec-checklist.md)**。

模板：**[checklist.md](../../commands/spec-templates/checklist.md)**。

## 约束

- 工作项列表与执行信息须来自 **MCP**，不得编造。
- **镜像 id** 不自动杜撰，**可多个**；缺失时向用户确认后再写入（或「待填写」）。
- 不自填虚假自测通过记录。
