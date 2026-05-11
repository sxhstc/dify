---
name: onespec-task
description: 基于 OneSpec design.md 拆解开发任务，生成 tasks.md 并同步至禅道 Task（含去重与禅道任务 ID 回填）。当用户提到"onespec-task"、"拆解任务"、"生成任务" 或 "任务分解"触发此技能。
---

# OneSpec 任务拆解

## 参数

与 **`.cursor/commands/onespec-task.md`** 保持一致；摘要如下：

- **简写（推荐）**：`<storyId>-<executionId>`，**两段均为纯数字**，如 **`9-4`** → 变更 `id=9`、`executionID=4`，再在 `onespec/changes/9-*/` 下 **唯一** 补全 `name`。多目录须改用 **`9-bank-account-list`** 等形式。
- **`--execution=`**：显式执行 ID；与简写并存时 **本项优先**。
- **`--assign=`**：**可选**；禅道 **`assignedTo`**。**未传**：`post_tasks` **不传** `assignedTo`，禅道按 **token 绑定用户**处理；**传了**：`assignedTo` = 传入值。与「谁拆解任务」无关。
- **`--no-design`**、**`--sequential`**：同命令文档。

**id / name / executionID 推断优先级**：

| 优先级 | 条件 | 操作 |
|--------|------|------|
| 0 | 主参数匹配 `^\d+-\d+$` | 拆 `storyId`、`executionId`；`id=storyId`，`executionID=executionId`；补全 `name` 见上 |
| 1 | 活跃文件路径含 `onespec/changes/<id>-<name>/` | 直接提取 id 和 name |
| 2 | 最近对话含 onespec-design 执行结果 | 提取 id 和 name |
| 3 | 用户仅提供 id（单独数字）且无简写 | 在 `onespec/changes/` 下查找匹配目录补全 name；`executionID` 走命令「执行 ID 解析规则」 |
| 4 | 推断出多个可能性 | 列出选项请用户确认 |
| 5 | 无法推断 | 提示用户输入 |

## 前置条件

- **完整模式**：`onespec/changes/<id>-<name>/design.md` 存在
- **轻量模式**（`--no-design`）：`onespec/changes/<id>-<name>/proposal.md` 存在；tasks.md 开头须注明轻量模式警告

## 执行步骤

### 步骤 1：生成 tasks.md

按当前模式加载对应规则与模板（**互斥，仅加载其中一组**）：

**完整模式**（`design.md` 存在）：
1. 读取 [references/task-decomposition-rules.md](references/task-decomposition-rules.md) — 完整拆解原则、模块分组顺序、6 必需章节
2. 读取 [references/task-template.md](references/task-template.md) — 主任务 + 子任务结构模板
3. 读取 `onespec/changes/<id>-<name>/design.md`
4. 生成 `onespec/changes/<id>-<name>/tasks.md`

**轻量模式**（`--no-design`）：
1. 读取 [references/task-decomposition-rules-lite.md](references/task-decomposition-rules-lite.md) — 精简拆解原则、3 必需章节
2. 读取 [references/task-template-lite.md](references/task-template-lite.md) — 仅主任务格式
3. 读取 `onespec/changes/<id>-<name>/proposal.md` + `specs/` 下所有 Delta Spec
4. 生成 `onespec/changes/<id>-<name>/tasks.md`（开头注明轻量模式警告）

> ⛔ **禁止**：未完成上述加载步骤就输出确认提示；未获取用户确认就执行步骤 2。

**✋ 强制确认检查点**（必须输出以下内容，等待用户明确回复后再继续）：

---
**📋 tasks.md 已生成，请确认以下内容：**
1. 任务拆解粒度是否合理（每项工时 ≤8h，建议 2~4h）？
2. 依赖关系与并行标记（P）是否准确？
3. 需求追溯 ID 是否完整？

**确认后，请回复：**

| 用户回复 | 执行操作 |
|---------|---------|
| `同步` / `确认同步` / `ok` | 执行步骤 2（禅道 MCP 同步） |
| `跳过同步` | 保存 tasks.md，跳至步骤 3 |
| `重新生成` + 补充说明 | 按新要求重新执行步骤 1 |

> **与 Slash 命令一致**：若用户通过 **`/onespec-task`** 触发，以 `.cursor/commands/onespec-task.md` 为准：**写入 tasks.md 后须立即执行禅道同步**，不得因本 Skill 表格而额外等待。

---

### 步骤 2：同步禅道（条件执行）

读取 [references/zentao-sync.md](references/zentao-sync.md) 并按其中步骤执行。（历史 OneTeam 说明见 [oneteam-sync.md](references/oneteam-sync.md)，仅在使用 OneTeam MCP 时参考；历史云效说明见 [yunxiao-sync.md](references/yunxiao-sync.md)，已废弃。）

### 步骤 3：结果汇总

输出（固定格式）：`共拆解 N 个任务，新增 X 个，跳过 Y 个，失败 Z 个`

## 错误处理

| 场景 | 处理 |
|------|------|
| `design.md` 缺失（完整模式） | 终止，提示"如需跳过设计阶段，请使用 `--no-design`" |
| `proposal.md` 也不存在（轻量模式） | 终止，提示先运行 `onespec-change` |
| 禅道接口失败 | 生成本地 tasks.md，提示检查 executionID / 权限 |
| 同步成功但指派不符合预期 | 禅道内改派，或下次使用 `--assign=` |

## 下一步行动

- 确认后使用 onespec-implement SKILL，参数 id=<id> name=<name> 进入实现阶段
- 如需调整：直接编辑 `tasks.md` 或补充设计细节后重新运行
