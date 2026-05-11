---
name: onespec-implement
description: 根据 OneSpec design.md 和 tasks.md 执行代码实现，严格遵循设计规范，实现后更新任务状态并可同步禅道工作项状态。当用户提到"onespec-implement"、"执行任务"、"开始实现" 或 "代码实现"时触发此技能
---

# OneSpec 代码实现

## 参数

- `id` / `name`：可从上下文自动推断（见下表）
- `task_id`：（可选）指定 `禅道任务ID` 或 tasks.md 中任务序号，未指定则展示待处理列表

**参数推断优先级**：

| 优先级 | 条件 | 操作 |
|--------|------|------|
| 1 | 用户明确提供 `id` 和 `name` | 直接使用 |
| 2 | 用户仅提供 `id` | 在 `onespec/changes/` 下查找匹配目录补全 `name` |
| 3 | 当前活跃文件路径含 `onespec/changes/<id>-<name>/` | 提取 `id` 和 `name` |
| 4 | 最近对话历史含 onespec-task 执行结果 | 提取 `id` 和 `name` |
| 5 | 推断出多个可能性 | 列出选项请用户确认 |
| 6 | 无法推断 | 提示用户输入 |

## 执行步骤

### 步骤 1：文件校验

1. 验证 `onespec/changes/<id>-<name>/proposal.md` 存在。缺失则**硬停止**：提示先运行 `onespec-change`。
2. 检测 `design.md` 是否存在（**软检查**，记录结果供步骤 2 使用，不终止）。
3. 验证 `tasks.md` 存在。缺失则**硬停止**：提示先运行 `onespec-task`。

> ⛔ 禁止未完成三项校验便进入步骤 2。

### 步骤 2：任务选择与范围确认

1. 解析 `tasks.md`，筛选状态为「未处理」或「进行中」的任务。
2. 定位目标任务：提供了 `task_id` → 直接定位；未提供 → 展示待处理列表，提示用户选择。
3. 确定实现模式：
   ```
   IF design.md 存在
     → 完整模式：以 design.md 相关章节为主要实现依据 + proposal.md 背景信息
   ELSE
     → 轻量模式：以 proposal.md + specs/ 相关 Delta Spec 为实现依据
   ```
4. 将 `proposal.md` 的 `status` 更新为 `implementing`（当前状态不是时）。

> ⛔ 禁止在用户回复「开始」前进入步骤 3。

✋ **强制确认检查点**（必须输出，等待用户确认后再继续）：

```
---
📋 任务确认 — 请确认以下实现范围
- 变更目录：`onespec/changes/<id>-<name>/`
- 实现模式：[完整模式（design.md）/ 轻量模式（proposal.md + specs/）]
- 目标任务：`[task_id]` [任务标题]
- 涉及文件（来自 design.md / proposal.md）：
  - `path/to/file.ts`（[新增 / 修改 / 删除]）

确认请回复「开始」，或说明修正意见。
---
```

**示例**（`onespec/changes/123456-batch-export/`，完整模式，T-003）：

```
目标任务：T-003 新增 OrderExportService#batchExport 方法
涉及文件：
  - src/service/OrderExportService.java（新增 batchExport 方法）
  - src/dto/ExportRequest.java（新增请求 DTO）
```

### 步骤 3：代码分析与实现

**代码搜索范围约束**：

**搜索方式**（按优先级）：
1. **结构认知**：先确认模块目录结构（如 `ls -R src/modules`），避免盲目搜索
2. **L1 精确查找（优先）**：按 design.md 标注路径或推测类名/文件名时，必须使用 `Glob` 或 `Grep`
3. **L2 语义搜索（兜底）**：仅在无法推测名称时使用 `SemanticSearch`（每次聚焦单一问题）
4. **读取约束**：命中文件后用 `Read(offset, limit ≤ 60)` 精读相关片段，禁止全目录扫描或整文件 Read

| 约束项 | 规则 |
|--------|------|
| 优先复用对话上下文 | 前序步骤已包含的文件内容直接引用，不重复 Read |
| 搜索文件数量上限 | 结果超 5 个时取相关度最高的 3 个；其余仅记录路径，不读取 |
| 单文件行数限制 | 超 300 行时只读取任务相关代码段（前后各 20 行） |
| 跳过文件 | `*Test.java`、`*.spec.ts`、`*_test.go` 等测试文件 |

生成代码变更时：保持代码风格一致 · 遵守项目 `.mdc` 规范 · 优先实现核心逻辑再处理边缘情况。

> ⛔ 禁止修改当前任务范围外的无关代码。  
> ⛔ 发现 design.md 与代码现状有偏差时，**必须暂停**并提示用户更新设计文档，不得擅自偏离继续实现。

### 步骤 4：状态更新

1. 修改 `tasks.md` 中对应任务的状态为「已完成」（Completed）。
2. 禅道同步：

   **2a. 询问是否同步**（与 `/onespec-implement` 命令冲突时以 **命令正文** 为准）：

   | 用户回复 | 操作 |
   |---------|------|
   | 「同步」/「确认」 | 进入 2b |
   | 「跳过」 | 跳过，步骤 5 标注「跳过」 |

   **2b. 清单**：列出本次已完成且含 **`禅道任务ID：`** 的条目。

   **2c. 执行**：读取 [references/zentao-sync.md](references/zentao-sync.md)，对每个任务 ID 调用 **`put_tasks_taskID_finish`** 完成任务。

### 步骤 5：结果反馈

**必须使用以下固定模板输出**：

```
---
✅ 任务执行完毕 — `[task_id]` [任务标题]
- 变更文件：
  - `path/to/file.ts`（[新增/修改/删除]：[一句话说明改了什么]）
- tasks.md 状态：✅ 已更新为「已完成」
- 禅道同步：[✅ 已同步 / ⏭️ 跳过 / ❌ 失败：{原因}]

下一步：请运行单元测试或手动验证变更。完成后可选择下一个任务。
---
```

## 错误处理

| 情况 | 处理 |
|------|------|
| proposal.md / tasks.md 缺失 | 硬停止，提示对应命令（`onespec-change` / `onespec-task`） |
| design.md 缺失 | 切换轻量模式，继续执行，不终止 |
| 发现设计偏差 | 暂停，提示用户修正 design.md 后重新运行 |
| 禅道同步失败 | 不终止，在结果模板中标注失败原因，提示在禅道手动更新状态 |
