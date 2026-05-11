---
name: onespec-testcase
argument-hint: <禅道执行ID> [projectID] [--with-specs] | <prd-path 或 feature-name> [--with-specs]
description: 按禅道执行或单份 PRD 生成测试用例（Markdown 表格），输出至 onespec/testcase/
---

# OneSpec Testcase（测试用例）

测试用例文档**以执行为默认维度**：按 **禅道执行 ID** 拉取执行内工作项，合并各需求对应 PRD 生成 **`onespec/testcase/<执行 slug>/testcase.md`**（目录命名与 `onespec-checklist` 一致）。亦支持 **单需求模式**：仅针对 **`onespec/prd/<feature-name>/prd.md`** 生成 **`onespec/testcase/<feature-name>/testcase.md`**。

**禅道 MCP**：服务器名为 **`user-zentao`**（以 Settings → MCP 为准）。执行与工作项使用 **`get_executions_executionID`**、**`get_executions_executionID_stories`** + **`get_executions_executionID_tasks`** + **`get_executions_executionID_bugs`**，与 **`onespec-checklist`** 相同。

<background_information>
- **任务**: 将 PRD（及必要时 proposal/design）中的可验证陈述转化为结构化测试用例，**正文以 Markdown 表格为主**。
- **输入（二选一）**:
  - **迭代模式**（推荐）：`executionID`（必填）— 禅道 **执行 ID**；`projectID`（选填）— 项目 ID；`--with-specs`（选填）— 合并读 `onespec/specs/` 等与执行内需求相关的规范。
  - **单需求模式**：`prd-path` 或 `feature-name`（对应 `onespec/prd/<feature>/prd.md`）；`--with-specs`（选填）。
- **输出**:
  - 迭代模式：`onespec/testcase/<执行目录名>/testcase.md`（**`<执行目录名>` = `get_executions_executionID` 返回的 `name` 经安全化 slug，不用执行 ID**；执行 ID 写入 Frontmatter `zentao-execution-id`）。
  - 单需求模式：`onespec/testcase/<feature-name>/testcase.md`。
- **成功标准**:
  - **迭代模式**：已成功调用禅道 MCP 取得该执行工作项列表（可为空）；用例表覆盖**能关联到 PRD** 的需求之 EARS / 验收标准 / 接口与错误码；每条用例含编号、**关联工作项**（禅道编号）、可追溯 PRD、步骤、预期结果。
  - **单需求模式**：已读取目标 PRD 全文，覆盖规则同上（无「关联工作项」列时可填 PRD frontmatter 中的工作项 ID 或 **—**）。
</background_information>

<instructions>
<!-- START -->
## 参数

- **迭代模式**：`executionID`（必填）；`projectID`（选填）；`--with-specs`（选填）。
- **单需求模式**：`prd-path` 或 `feature-name`；`--with-specs`（选填）。

### 模式判定

1. 若用户**显式给出执行 ID**（参数名 `executionID`）或**第一个参数为执行语境**（与禅道 Execution ID 一致），进入 **迭代模式**。
2. 若第一个参数可解析为**已存在的** `onespec/prd/<name>/prd.md` 的 `<name>`，或路径以 `onespec/prd/` 结尾为 `prd.md`，进入 **单需求模式**。
3. **歧义**（极少）：同时满足时**优先迭代模式**当且仅当 `get_executions_executionID(executionID)` 成功；否则按单需求模式尝试读 PRD；仍无法判定则**列出选项请用户确认**。

## 幂等性

1. **单需求模式**：若 `onespec/testcase/<feature-name>/testcase.md` 已存在 → 暂停询问 **覆盖 / 取消**。
2. **迭代模式**：与 `onespec-checklist` **相同**：若 `onespec/testcase/<slug>/testcase.md` 已存在，读 Frontmatter `zentao-execution-id`：与本次 `executionID` **相同**可覆盖；**不同**则在 `slug` 后追加 `_<executionID>` 作为目录名，避免误覆盖。

---

## A. 迭代模式执行步骤

### A.1 禅道：执行与工作项（与 onespec-checklist 对齐）

按 **[onespec-checklist.md](./onespec-checklist.md)** **「### 1. 禅道：执行与工作项列表」** 全文执行（`get_executions_executionID` → 解析 `projectID` → `get_executions_executionID_stories` + `get_executions_executionID_tasks` + `get_executions_executionID_bugs`）。**禁止**在未成功调用禅道 MCP 时编造工作项。

- 记录：执行名称、起止时间、项目中文名，用于 Frontmatter 与 §1 文档说明表。
- 汇总 **执行内工作项表** 列：**ID**、**禅道编号**（`Story-<id>` / `Task-<id>` / `Bug-<id>`）、**标题**、**类型**、**状态**（与 checklist 一致）。

### A.2 工作项 → PRD / 文档映射

对每个 **需求类**（Story 或与团队约定纳入测试的需求类型）工作项：

1. 在仓库 **`onespec/prd/**/prd.md`** 中检索：PRD frontmatter **`zentao-story-id`** 与当前 Story `id` **一致**则命中。
2. 若未命中：在 **`onespec/changes/<id>-*/`** 或 **`onespec/archive/*-<id>-*/`** 查找 `proposal.md` / `design.md`，作为**次级输入**生成用例（粒度可粗，**标注「无 PRD，来源 proposal/design」**）。
3. 若均无：**在「执行内工作项与 PRD 映射」表中标记「无本地 PRD」**，用例仅列 **烟雾 / 回归占位行** 或 **TBD**（不得编造业务细节）。

### A.3 合并生成用例

1. **用例编号**：全执行**连续编号** `TC-<EXEC_PREFIX>-NNN`（三位递增）。`<EXEC_PREFIX>` 取自 **执行目录 slug**：大写、非字母数字替换为 `_`，过长时截取 **至多 20 字符**，保证全仓库可读性。
2. **「关联工作项」列**：填禅道 **编号**（如 `Story-3`）；无则 **TBD**。
3. **「关联 PRD」列**：`prd` 相对路径 + 章节或 EARS 摘要；来自 proposal/design 时写 **`changes/<id>-<name>/design.md §x`** 等。
4. 对每个已映射 PRD **重复执行「§B.3 用例设计规则」**（与单需求相同），合并入 **同一张 §3 测试用例总表**（多需求）。
5. **§4 接口专项**：若执行内多个接口 PRD，可合并一张接口表或按需求分子节（**二级标题 `#### <禅道编号> <标题>`**），避免单表过宽。
6. **§5 追溯矩阵**：可按工作项分子表，或总表增加 **工作项** 列。

### A.4 套用模板并写入

1. 读取 `.cursor/commands/spec-templates/testcase.md`。
2. **`执行目录名`**：与 **[onespec-checklist.md](./onespec-checklist.md)** **「### 8. 生成文件」** 中 **「确定输出目录名 `执行目录名`」** 规则**完全一致**（`get_executions_executionID` 返回的 `name` → slug；冲突追加 `_` + executionID 后缀）。
3. 将输出路径改为：`onespec/testcase/<执行目录名>/testcase.md`（**不是** `onespec/checklist/`）。
4. 删除全部 HTML 注释；不得写入 blockquote 元说明。
5. 汇报路径、工作项数、已映射 PRD 数、用例条数。

---

## B. 单需求模式执行步骤

### B.1 定位并读取 PRD

1. 解析 `prdFile` 与 `feature-name`。
2. `Read` 读取 `prdFile`；失败则终止。
3. 从 PRD frontmatter 继承 **`zentao-story-id`**（优先）或历史字段（若有），用于「关联工作项」列或追溯说明。
4. 提取：标题、需求等级、角色与权限、EARS、数据与接口、验收标准、非功能、范围外。

### B.2 可选：补充 Spec / 设计

若 `--with-specs`：按原规则读取 `onespec/specs/` 等，**仍以 PRD 为权威**。

### B.3 用例设计规则（迭代内每条 PRD 亦适用）

1. **编号**（仅单需求模式）：`TC-<FEATURE_UPPER>-001` 递增；`<FEATURE_UPPER>` 来自 `feature-name`。
2. **分类**：`功能`、`接口`、`安全`、`边界`、`异常`、`非功能`。
3. **关联 PRD**：章节号、`验收标准` 序号或 EARS 短摘要。
4. **每条 EARS「shall」** 至少 **1** 条用例；**每条验收标准** 至少 **1** 条（可合并重复）。
5. **接口类 PRD**：成功路径 + PRD 写明的各 HTTP 状态码各至少 **1** 条。
6. **非功能**：有指标则单列；不可测标 **TBD**。
7. **范围外**：不生成正向必测用例。

### B.4 表格格式约束

1. **§3 测试用例总表** 列：**用例编号 | 关联工作项**（迭代模式必填；单需求有则填禅道编号或 frontmatter ID，无则 **—**）**| 分类 | 关联 PRD | 用例标题 | 优先级 | 前置条件 | 测试步骤 | 预期结果**。
2. 测试步骤：单元格内 **`1) 2) 3)`** 或中文分号分隔。
3. 优先级：P0 / P1 / P2（与风险及 PRD 一致）。
4. **§5 追溯矩阵**：验收标准 / EARS → 用例编号。

### B.5 套用模板并写入

1. 读取模板；替换占位符；`generated-at` 为当前日期。
2. 创建 `onespec/testcase/<feature-name>/`，写入 `testcase.md`。
3. 单需求模式下 **「## 迭代内工作项与 PRD 映射」** 整节可省略，或改为一行说明「单需求，无迭代汇总」。

---

## 关键约束

- **禁止**未读取 PRD（或无文档时）编造具体业务规则与接口字段。
- **禁止**将 PRD **范围外** 写为必测功能。
- 产物 **不含** HTML 注释与「由 onespec-testcase 生成」类 blockquote；**不含**无内容的占位示例表行。
- **迭代模式**下工作项列表须来自禅道 MCP。

## 与相关命令的关系

- **`onespec-checklist`**：同执行维度产出 **提测清单**；本命令产出 **测试用例表**，目录 slug 规则一致，可同一执行各生成一份。
- **`onespec-generate-prd`**：PRD 为用例主输入来源。

</instructions>

</output>
