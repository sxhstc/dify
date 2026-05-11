---
name: onespec-design
description: 基于 Proposal 和 Delta Spec 生成 OneSpec 详细设计文档（design.md），涵盖接口定义、数据模型、核心业务逻辑。当用户提到"onespec-design"、"生成设计"、"创建设计文档" 或 "写设计文档"时触发此技能。
---

# OneSpec 详细设计

## 参数

- `id` / `name`：从活跃文件路径 `onespec/changes/<id>-<name>/` 或对话历史推断；推断多个候选时列选项确认；无法推断时提示输入

## 阶段 1：准备与校验

**1.1** 校验 `onespec/changes/<id>-<name>/proposal.md` 是否存在；不存在 → **硬停止**，提示先运行 `onespec-change`。

**1.2** 校验 Delta Specs：

| 优先级 | 条件 | 执行动作 |
|--------|------|---------|
| 1 | `specs/` 不存在或无 `.md` 文件 | **硬停止**，提示先运行 `onespec-change` 或手动创建 |
| 2 | 所有 Spec `status` 均为 `draft` | **暂停**，提示「已口头/线下确认请回复 yes，否则请将已确认文件的 status 改为 reviewed」，等待 `yes` 后继续 |
| 3 | 至少一个 `status` 为 `reviewed` / `approved` | 正常继续，使用全部 Spec 作为输入 |

**禁止**：全 `draft` 且未收到用户 `yes` 时继续执行。

**1.3** 将 `proposal.md` 的 `status` 更新为 `designing`；扫描 `.cursor/rules/ai-readme/RULE.mdc` 读取现有架构模式。

## 阶段 2：生成详细设计

**2.1 跨服务上下文（条件读取）**

```
IF Spec/Proposal 内容涉及：跨服务 API 调用 | 多系统数据同步 | 认证/鉴权流程 | 消息队列/事件驱动
   → 读取 .cursor/rules/product-wiki/*.mdc
ELSE（纯单服务内部逻辑）
   → 跳过，避免重复加载上游步骤已注入的上下文
```

**2.2 代码分析**：读取 [generation-rules.md](references/generation-rules.md) 获取分析深度规则与搜索范围约束，执行代码探索。

**禁止**：重复 Read 对话历史中已出现的文件；搜索结果 >5 个文件时不得全部读取。

**2.3 生成 design.md**：读取 [design-template.md](references/design-template.md)，结合 `proposal.md` 与全部 Spec，生成 `onespec/changes/<id>-<name>/design.md`。

**禁止**：写具体实现代码（仅限架构与接口签名）；对不确定代码逻辑猜测填充。

**2.4 完成后强制输出**（格式固定，不得省略）：

---
**✅ 设计文档已生成 — 请审查：**
- 路径：`onespec/changes/<id>-<name>/design.md`
- Proposal 状态：已更新为 `designing`
- 发现深度：[全面 / 轻量 / 极少]
- 关键发现：
  1. [影响设计的见解 1]
  2. [影响设计的见解 2]

**下一步**：
- 设计通过 → 使用 onespec-task SKILL，参数 id=<id> name=<name>
- 需要修改 → 提供反馈后重新运行 onespec-design SKILL，参数 id=<id> name=<name>

> ⚠️ 进入实现阶段前，设计审批是强制要求。
---

## 阶段 3：石墨文档（默认跳过）

**默认**：不创建石墨、不调用 `shimo-mcp-doc`，阶段 2 结束即完成。

**仅当用户在本轮明确说「要同步石墨」时**：再询问目录 ID、检查 `shimo-mcp-doc`、调用 `shimo-API0072`。

## 错误处理

| 场景 | 处理 |
|------|------|
| `specs/` 为空 | 硬停止，提示先运行 `onespec-change` |
| 全 draft + 用户未确认 | 暂停，不继续执行 |
| 模板缺失 | 使用内联基本结构并警告 |
| 架构指导缺失 | 警告"设计可能不符合项目标准"，继续但输出中注明 |
| 无效需求 ID | 停止，提示修复目录命名为 `onespec/changes/<id>-<name>/` |
