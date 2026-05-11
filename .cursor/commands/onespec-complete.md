---
name: onespec-complete
description: 归档变更提案，将 Delta Spec 合并到主规范中
---

# OneSpec Complete & Archive

<background_information>
- **任务**: 此命令用于完成变更提案的生命周期，将变更后的规范合并到主线，并归档提案文件。它是 OneSpec 工作流的最后一步。
- **前置条件**:
  - 对应的变更提案目录存在。
  - 提案中的所有开发和测试任务均已标记为 Completed。
- **成功标准**:
  - 变更提案所有文件被移动并重命名至 `onespec/archive/<yyyyMMdd>-<id>-<name>`。
  - 变更提案中的 `specs` 内容已覆盖合并至主线 `onespec/specs/` 目录。
  - 归档后的 `proposal.md` 状态更新为 `completed`。
</background_information>

<instructions>
<!-- START -->
## 参数
- `id`: (可选) 需求/变更ID。如果上下文中能明确推断出唯一ID，可省略。
- `name`: (可选) 变更名称。如果上下文中能明确推断出唯一名称（例如当前已在变更目录下），可省略。

## 执行步骤

### 1. 准备工作与校验
1.  **上下文识别与参数补全**:
    - **自动推断**:
        - 检查当前活跃的编辑器文件路径，是否包含 `onespec/changes/<id>-<name>/` 模式。
        - 检查最近的对话历史或工具调用，是否刚执行过 `onespec-implement` 或其他相关命令。
    - **参数确认**:
        - 如果用户提供了 `id` 和 `name`，直接使用。
        - 如果用户仅提供了 `id`，尝试在 `onespec/changes/` 目录下查找匹配该 ID 的目录，自动补全 `name`。
        - 如果用户未提供参数，且通过上下文推断出唯一的 `<id>-<name>`，则自动使用。
        - 如果推断出多个可能性，列出选项请用户确认。
        - 如果无法推断，提示用户输入必需参数。
2.  **检查目录**:
    - 验证 `onespec/changes/<id>-<name>/` 是否存在。
3.  **检查任务状态**:
    - 读取 `onespec/changes/<id>-<name>/tasks.md`。
    - 确认所有任务状态均为 "Completed" (已完成) 或 "Cancelled" (已取消)。
    - 如果存在未完成任务，警告用户并要求确认是否强制归档。

### 2. 合并规范 (Merge Specs)
1.  **定位源与目标**:
    - 源目录: `onespec/changes/<id>-<name>/specs/` (Delta Specs)。
    - 目标目录: `onespec/specs/` (Main Specs)。
2.  **执行合并**:
    - 将源目录下的所有文件复制到目标目录。
    - **覆盖策略**: 如果目标目录已存在同名文件，直接覆盖 (因为 Delta Spec 代表了最新状态)。
    - 记录合并日志: "已将 [文件列表] 从变更提案合并到主规范。"

### 3. 归档提案 (Archive)
1.  **创建归档目录**:
    - 生成归档路径: `onespec/archive/<yyyyMMdd>-<id>-<name>/`。
    - 使用当前日期作为前缀。
2.  **移动文件**:
    - 将 `onespec/changes/<id>-<name>/` 下的所有内容移动到归档目录。
3.  **清理**:
    - 删除原 `onespec/changes/<id>-<name>/` 目录 (如果为空)。

### 4. 更新 Proposal 状态
1.  **更新状态**:
    - 在归档后的 `onespec/archive/<yyyyMMdd>-<id>-<name>/proposal.md` 文件中。
    - 将 `status` 字段更新为 `completed`。

### 5. 结果反馈
- 输出: "变更提案 [<id>-<name>] 已归档至 `onespec/archive/`。"
- 输出: "规范已同步更新至 `onespec/specs/`。"

## 关键约束
- **路径基准**: 命令中的文件读写路径以本命令文件所在仓库的根目录为基准，不限制跨工作区的上下文收集。
</instructions>