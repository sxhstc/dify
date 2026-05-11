---
name: onespec-design
description: 基于 Proposal 和 Delta Spec 生成详细设计文档
---

# OneSpec Design Document

此命令用于基于变更提案 (Proposal) 和增量规范 (Delta Spec) 生成详细设计文档。

<background_information>
- **任务**: 生成全面的技术设计文档，将需求 (WHAT) 转化为架构设计 (HOW)
- **成功标准**:
  - 所有需求都映射到具有清晰接口的技术组件
  - 完成适当的架构发现和研究
  - 设计与指导上下文和现有模式保持一致
  - 包含复杂架构的可视化图表
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
        - 检查最近的对话历史或工具调用，是否刚执行过 `onespec-change`。
    - **参数确认**:
        - 如果用户提供了 `id` 和 `name`，直接使用。
        - 如果用户仅提供了 `id`，尝试在 `onespec/changes/` 目录下查找匹配该 ID 的目录，自动补全 `name`。
        - 如果用户未提供参数，且通过上下文推断出唯一的 `<id>-<name>`，则自动使用。
        - 如果推断出多个可能性，列出选项请用户确认。
        - 如果无法推断，提示用户输入必需参数。
2.  **校验变更提案**:
    - 检查路径 `onespec/changes/<id>-<name>/proposal.md` 是否存在。
    - **如果不存在**:
        - 终止流程。
        - 提示用户: "未找到变更提案文件。请先运行 `onespec-change` 初始化变更提案。"
3.  **定位并校验 Delta Specs**:
    - **第一级：文件存在性校验（硬停止）**:
        - 检查 `onespec/changes/<id>-<name>/specs/` 下是否存在 `.md` 文件。
        - **如果目录不存在或目录下无任何 `.md` 文件**:
            - **终止流程**。
            - 提示用户: "未找到 Delta Spec 文件。Delta Spec 是设计的核心输入，缺失将导致设计输出不可控。请确认 `/onespec-change` 已生成 Spec 草稿，或在 `specs/` 下手动创建。"
    - **第二级：审查状态校验（需用户明确确认）**:
        - 读取所有 Delta Spec 文件的 Frontmatter，检查 `status` 字段。
        - **如果所有文件的 `status` 均为 `draft`**:
            - **暂停流程，等待用户明确确认**。
            - 提示用户: "所有 Delta Spec 的状态仍为 `draft`，尚未完成审查确认。未经确认的规范可能导致设计输出偏差。如已完成口头/线下确认，请回复 `yes` 继续；否则请先将已确认文件的 `status` 更新为 `reviewed`。"
            - 用户输入 `yes` 后才继续，否则终止。
        - **如果存在至少一个 `status` 为 `reviewed` 或 `approved` 的文件**:
            - 正常继续，使用全部 Spec 文件作为输入。
4.  **读取模板**:
    - 读取详细设计模板: `.cursor/commands/spec-templates/design.md`。
5.  **确认输出目录**:
    - 目标文件将保存在 `onespec/changes/<id>-<name>/design.md` (与 specs 同级)。
6.  **更新 Proposal 状态**:
    - 读取 `onespec/changes/<id>-<name>/proposal.md`。
    - 将 `status` 字段更新为 `designing`。

### 2. 生成详细设计
1.  **分析与生成**:
    - 读取 `proposal.md` (获取背景和需求)。
    - 读取 `specs/` 目录下的所有 Delta Spec 文件 (获取具体的技术规范变更)。
    - 结合模板 `.cursor/commands/spec-templates/design.md`，生成详细设计文档。
    - **重点关注**:
        - 接口定义变更 (API Changes)。
        - 数据模型变更 (Schema Changes)。
        - 核心业务逻辑实现 (Business Logic)。
2.  **保存文档**:
    - 保存为: `onespec/changes/<id>-<name>/design.md`。

### 3. 石墨文档（默认跳过）
- **默认**: **不**创建石墨文档、**不**调用 `shimo-mcp-doc`；步骤 2 完成后直接结束或进入输出描述。
- **仅当用户在本轮对话中明确要求「同步到石墨」时** 再执行：询问目录 ID → 检查已安装 `shimo-mcp-doc` → 使用 `shimo-API0072` 创建并写入 `design.md`（详见石墨说明）。

## 关键约束
- **类型安全**:
   - 强制执行与项目技术栈一致的强类型。
   - 对于静态类型语言，定义显式类型/接口并避免不安全的转换。
   - 对于 TypeScript，切勿使用 `any`；首选精确类型和泛型。
   - 对于动态类型语言，在可用的地方提供类型提示/注释 (例如 Python 类型提示) 并在边界处验证输入。
   - 清晰地记录公共接口和契约，以确保跨组件的类型安全。
- **最新信息**: 使用 WebSearch/WebFetch 获取外部依赖和最佳实践
- **指导对齐**: 尊重指导上下文（如 .cursor/rules/ai-readme/RULE.mdc）中的现有架构模式
- **模板遵循**: 严格遵循 `.cursor/commands/spec-templates/design.md` 模板结构和生成说明
- **设计重点**: 仅限架构和接口定义（Signature），避免具体实现逻辑代码
- **路径基准**: 命令中的文件读写路径以本命令文件所在仓库的根目录为基准，不限制跨工作区的上下文收集。
</instructions>

## 工具指导
- **先读取**: 在采取行动之前加载所有上下文 (specs, templates, rules)
- **不确定时研究**: 对外部依赖、API 和最新最佳实践使用 WebSearch/WebFetch
- **分析现有代码**: 使用 Grep 在代码库中查找模式和集成点
- **最后写入**: 仅在所有研究和分析完成后生成 design.md

## 输出描述

**命令执行输出** (与 design.md 内容分开):

1. **状态**: 确认设计文档已在 `onespec/changes/<id>-<name>/design.md` 生成
2. **发现类型**: 执行了哪种发现过程 (全面/轻量/极少)
3. **关键发现**: 来自发现过程并影响设计的 2-3 个关键见解
4. **下一步行动**: 批准工作流指导 (见安全与回退)

**格式**: 简洁的 Markdown (200 字以内) - 这是命令输出，不是设计文档本身

**注意**: 实际的设计文档遵循 `.cursor/commands/spec-templates/design.md` 结构，并输出到变更目录中。

## 安全与回退

### 错误场景

**Delta Spec 全为草稿且用户未确认**:
- **触发时机**: 步骤 1.3 第二级校验发现所有 Spec `status=draft`，且用户未回复 `yes`
- **停止执行**
- **建议操作**:
  - 审查 `onespec/changes/<id>-<name>/specs/*.md` 内容，确认 EARS 描述和验收标准准确
  - 将已确认文件的 `status` 更新为 `reviewed`，再重新运行 `/onespec-design`
  - 如内容需要修正，更新后重新运行 `/onespec-change <id> <name>` 生成新草稿

**输入缺失（specs/ 为空）**:
- **触发时机**: 步骤 1.3 第一级校验发现 `specs/` 目录不存在或无 `.md` 文件
- **停止执行**
- **建议操作**:
  - 确认 `/onespec-change` 是否已正常完成（应自动生成 Spec 草稿）
  - 若未生成，重新运行 `/onespec-change <id> <name>`
  - 若需手动补充，在 `onespec/changes/<id>-<name>/specs/` 下按 `.cursor/commands/spec-templates/spec.md` 格式创建

**模板缺失**:
- **用户消息**: "模板文件 `.cursor/commands/spec-templates/design.md` 缺失"
- **建议操作**: "检查仓库设置或恢复模板文件"
- **回退**: 使用内联基本结构并发出警告

**指导上下文缺失**:
- **警告**: "指导目录为空或缺失 - 设计可能不符合项目标准"
- **继续**: 继续生成，但在输出中注明限制

**发现复杂性不明确**:
- **默认**: 使用全面发现过程（优先覆盖关键上下文与风险）
- **理由**: 过度研究总比遗漏关键上下文好
- **无效的需求 ID**:
  - **停止执行**: 如果 `<id>` 不可用/不唯一，停止并指示用户提供或修复变更目录命名为 `onespec/changes/<id>-<name>/`。

### 下一阶段: 拆解任务

**如果设计获批**:
- 审查生成的 `onespec/changes/<id>-<name>/design.md` 设计
- 运行 `/onespec-task <id>-<name>` 生成 `tasks.md` 并同步至禅道（Task）

**如果需要修改**:
- 提供反馈并重新运行 `/onespec-design <id>-<name>`
- 现有 `design.md` 用作参考（迭代更新）

**注意**: 在进入实现阶段之前，设计批准是强制性的。
