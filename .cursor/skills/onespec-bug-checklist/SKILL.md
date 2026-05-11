---
name: onespec-bug-checklist
description: 按禅道 Bug ID（可多个）生成 BUG 修复提测清单 bug-checklist.md（缺陷列表、应用、SQL、配置、测试关注点）。当用户提到 "onespec-bug-checklist"、"按 BUG 提测"、"缺陷提测"、"bug 提测清单" 时触发
---

# OneSpec BUG 提测清单

## 参数

- `缺陷Id`：（必填）**一个或多个**禅道 **Bug ID**，与 `get_bugs_bugID` 的 `bugID` 参数一致。
- `productId`：（选填）禅道产品 ID；未提供时从首次 `get_bugs_bugID` 的 `product` 推断，跨产品缺陷需分批或人工处理。
- `镜像id`：（选填）可多个；未提供须在写入前确认或「待填写」，不得编造。

## 执行概要

1. **禅道 MCP**：对每个缺陷 ID 调用 **`get_bugs_bugID`**（**user-zentao** 等以 Settings 为准）。
2. **本地 OneSpec**：对每个 `bugID` 查 `onespec/changes/<id>-*/`，无则 `onespec/archive/*-<id>-*/`，合并 `proposal` / `design` / `tasks` 以辅助 SQL、配置、测试关注点。
3. **产出**：`onespec/checklist/bug-<slug>/bug-checklist.md`；**非** `checklist.md`（与按迭代清单区分）。
4. **结构**：缺陷列表表 + 应用 + SQL + 配置 + 测试关注点 + 可选相关文档与自测表；**不写**迭代维度的「业务逻辑描述」整节（与 `onespec-checklist` 不同）。

## 详细步骤

以仓库内命令为准：**[onespec-bug-checklist.md](../../commands/onespec-bug-checklist.md)**。

模板：**[bug-checklist.md](../../commands/spec-templates/bug-checklist.md)**。

## 约束

- 缺陷列表字段须来自 **`get_bugs_bugID`**，不得编造。
- 默认只认**禅道 Bug ID**。
