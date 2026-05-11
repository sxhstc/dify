---
name: onespec-complete
description: 归档 OneSpec 变更提案，将 Delta Spec 合并到主规范并完成生命周期闭环。当用户提到"onespec-complete"、"归档变更"、"完成变更" 或 "合并规范"时触发此技能。
---

# OneSpec 变更归档

## 阶段 0：参数识别

按以下优先级确定 `<id>-<name>`：

| 优先级 | 条件 | 操作 |
|--------|------|------|
| 1 | 用户明确提供 `id` 和 `name` | 直接使用 |
| 2 | 用户仅提供 `id` | 扫描 `onespec/changes/`，匹配 `<id>-*` 目录，补全 `name` |
| 3 | 活跃文件路径含 `onespec/changes/<id>-<name>/` | 从路径提取参数 |
| 4 | 对话历史中提及 `onespec-implement` 等相关命令 | 从历史提取 `<id>-<name>` |
| 5 | 以上均不满足 | 提示用户输入必需参数 |

> ❌ **禁止**：推断出多个可能性时，禁止自动选择——必须列出选项请用户确认。

## 阶段 1：前置检查

1. 验证 `onespec/changes/<id>-<name>/` 目录存在。
2. 读取 `onespec/changes/<id>-<name>/tasks.md`，统计各状态任务数量。
3. 扫描 `onespec/changes/<id>-<name>/specs/`，列出待合并文件及 `onespec/specs/` 中同名文件数。

> ❌ **禁止**：存在 `In Progress` 或 `Pending` 状态任务时，禁止跳过确认直接归档。

## 强制检查点（必须执行，不可跳过）

完成阶段 0-1 后，**必须**按以下模板输出，等待用户回复「归档」后才继续：

```
---
⚠️ 归档操作确认（不可逆）

- 变更提案：`<id>-<name>`
- 任务状态：[全部完成 / 存在 N 个未完成任务：任务名1、任务名2]
- 将覆盖文件：`onespec/specs/` 下 X 个同名文件（列出文件名）
- 归档路径：`onespec/archive/<yyyyMMdd>-<id>-<name>/`

确认执行请回复「归档」，取消请回复「取消」。
---
```

## 阶段 2-4：执行（用户回复「归档」后）

执行前读取 [references/generation-rules.md](references/generation-rules.md)。

### 阶段 2：合并规范

按 generation-rules.md §1 将 `specs/` 下文件合并至 `onespec/specs/`。

> ❌ **禁止**：目标目录固定为 `onespec/specs/`，禁止手动拼接或修改目标路径。

### 阶段 3：归档提案

按 generation-rules.md §2 将变更目录移动到归档目录。

### 阶段 4：更新 Proposal 状态

按 generation-rules.md §3 将归档后 `proposal.md` 的 `status` 更新为 `completed`。

### 阶段 5：输出结果

按 generation-rules.md §4 输出固定格式完成确认。

## 关键约束

- **路径基准**：所有路径以仓库根目录为基准，不限制跨工作区的上下文收集。
