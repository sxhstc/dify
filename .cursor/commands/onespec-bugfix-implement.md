---
name: onespec-bugfix-implement
argument-hint: <slug 或 bugId>
description: 按 bugfix.md 修复任务执行代码修改，完成后同步禅道 Bug 状态为「已修复」
---

# OneSpec BugFix Implement — 执行 Bug 修复

读取 **`bugfix.md`** 中的修复任务，逐条执行代码修改，完成后更新本地状态并同步禅道 Bug 为 **「已修复」**。

**禅道 MCP**：服务器名一般为 **`user-zentao`**（以 Settings → MCP 为准）。

<background_information>
- **前置**：已运行 `/onespec-bugfix <bugId>` 生成 `onespec/bugs/<slug>/bugfix.md`，且已审查确认。
- **定位**：Bug 修复流程的实现环节——读修复计划 → 改代码 → 勾选完成 → 同步禅道。
- **成功标准**：
  - `bugfix.md` 中修复任务全部勾选为已完成
  - 代码修改与 bugfix.md 描述一致
  - 禅道 Bug 状态更新为「已修复」
</background_information>

<instructions>
## 参数
- `slug`:（必填其一）`onespec/bugs/<slug>/` 的目录名。
- `bugId`:（必填其一）禅道 Bug ID；命令会在 `onespec/bugs/` 下查找 Frontmatter 中 `bug-id` 匹配的目录。
- `task_index`:（可选）指定执行某一条修复任务（从 1 开始的序号）。不指定则按顺序执行所有未完成任务。

## 执行步骤

### 1. 定位 bugfix.md

1. **参数识别**：
   - 若提供 `slug` → 直接定位 `onespec/bugs/<slug>/bugfix.md`。
   - 若提供 `bugId` → 遍历 `onespec/bugs/*/bugfix.md`，匹配 Frontmatter 中 `bug-id` 字段。
   - 若均未提供 → 检查 `onespec/bugs/` 下是否仅有一个目录，是则自动使用；否则列出选项请用户确认。
2. **校验**：
   - 文件不存在 → 终止：「请先运行 `/onespec-bugfix <bugId>` 生成修复文档。」
   - Frontmatter `status` 为 `completed` → 提示：「该 Bug 修复已标记完成。若需重新执行，请先将 status 改回 pending。」

### 2. 解析修复任务

1. **读取 bugfix.md**：完整读取文件内容。
2. **解析第四节「修复任务」**：
   - 提取所有 `- [ ]` 复选框任务（未完成）和 `- [x]` 任务（已完成）。
   - 构建任务列表：标题、修改说明、涉及文件、验收标准。
3. **确定执行范围**：
   - 若指定 `task_index` → 定位该条任务。
   - 若未指定 → 筛选所有未完成任务，按顺序执行。
   - 若全部已完成 → 提示「所有修复任务已完成」，跳到步骤 5。

### 3. 逐条执行修复

对每条待执行任务：

1. **加载上下文**：
   - 读取 bugfix.md 第二节「根因分析」、第三节「影响范围」。
   - 读取任务中标注的目标文件。
   - 读取项目规范（`.cursor/rules/` 中相关规则）。
2. **代码修改**：
   - 依据任务的「修改说明」执行代码变更。
   - **遵循原则**：
     - 保持代码风格一致（遵循项目已有模式）。
     - 仅修改任务范围内的代码，不扩大变更范围。
     - 若发现 bugfix.md 的修复方案有误或不可行 → **暂停**，提示用户更新 bugfix.md，不擅自偏离。
3. **验证（若可行）**：
   - 若项目有 lint / type-check 配置 → 运行检查受影响文件。
   - 若有对应单测 → 运行并确认通过。
4. **更新 bugfix.md**：
   - 将该任务从 `- [ ]` 改为 `- [x]`。

### 4. 更新 bugfix.md 状态

1. 检查第四节所有任务是否已完成（全部 `- [x]`）。
2. 若全部完成 → 将 Frontmatter `status` 从 `pending`/`in-progress` 更新为 `completed`。
3. 若部分完成 → 将 `status` 更新为 `in-progress`。

### 5. 同步禅道状态为「已修复」

仅在 **所有修复任务已完成**（`status: completed`）时执行：

1. **读取 Frontmatter**：取 `bug-id`。
2. **调用解决 API**：调用 **`put_bugs_bugID_resolve`**：
   - `bugID` = `bug-id`
   - `payload` = `{ "resolution": "fixed" }`
3. **结果处理**：
   - 成功 → 在 bugfix.md Frontmatter 中追加 `zentao-synced: true`。
   - 失败 → 输出警告：「禅道状态同步失败，请手动在禅道中将 Bug 标记为已修复。错误：<错误信息>」。

### 6. 结果反馈

1. **输出摘要**：
   ```
   ✅ Bug 修复完成
   - Bug: <bug-id> - <title>
   - 修复任务: N/N 已完成
   - 禅道状态: 已同步为「已修复」/ 同步失败（需手动）
   - 文件变更: <列出修改的文件>
   ```
2. **后续指引**：
   - 「请运行测试验证修复效果。」
   - 「如需生成提测清单，运行 `/onespec-bug-checklist <bugId>`。」
   - 「如需提交 PR，按正常 Git 流程操作。」

## 关键约束

- **任务范围**：仅实现 bugfix.md 中描述的修复任务，不做范围外的修改。
- **方案对齐**：若发现修复方案有误 → 暂停并提醒，不擅自偏离 bugfix.md。
- **状态一致性**：本地 bugfix.md 的 status 与禅道 Bug 状态保持一致。
- **不编造**：禅道状态更新基于 `put_bugs_bugID_resolve` API 调用。
- **路径基准**：命令中的文件读写路径以本命令文件所在仓库的根目录为基准，不限制跨工作区的上下文收集。
</instructions>

## 工具指导
- **先读取**：完整读取 bugfix.md → 读取涉及的代码文件 → 再动手改
- **改完即勾**：每条任务改完代码立即更新 bugfix.md 的复选框
- **最后同步**：全部完成后再调用 `put_bugs_bugID_resolve`

## 安全与回退

### 错误场景
- **bugfix.md 不存在**：终止，提示先运行 `/onespec-bugfix`
- **修复方案与代码矛盾**：暂停当前任务，提示用户更新 bugfix.md
- **禅道同步失败**：不阻断，输出手动操作指引
- **部分任务完成中断**：`status` 保持 `in-progress`，下次执行时从未完成任务继续

### 与现有命令的关系
| 完成后 | 推荐操作 |
| --- | --- |
| 需出提测材料 | `/onespec-bug-checklist <bugId>` |
| 需提交代码 | 正常 Git flow（分支 → commit → PR） |
| 发现需要更大改动 | 中止 bugfix 流程，转 `/onespec-change` |
