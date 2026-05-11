---
name: onespec-change
description: 起草变更提案，从禅道研发需求获取需求详情并生成 proposal
---

# OneSpec Change Proposal

此命令用于初始化一个新的变更提案。它会从 **禅道**（通过 MCP）按 **Story ID** 拉取需求信息，结合代码库生成 `proposal.md` 与 `specs/` 下 Delta Spec 草稿。

**禅道 MCP**：服务器名为 **`user-zentao`**。拉取需求使用 **`get_stories_storyID`**。

<background_information>
- **任务**: 基于工作项中的需求描述，结合代码逻辑，以 EARS 格式生成全面的、可测试的变更需求文档
- **成功标准**:
  - 创建与指导上下文一致的完整需求变更文档
  - 遵循项目的 EARS 模式和所有验收标准的约束
  - 关注核心功能而非实现细节
  - 更新元数据以跟踪生成状态
</background_information>

<instructions>
<!-- START -->
## 参数
- `id`: (必填) **禅道研发需求 Story ID**（纯数字）
- `name`: (必填) 变更名称 (简短的英文或拼音，用于目录名)

## 执行步骤

### 1. 准备工作与目录创建
1.  **验证参数**:
    - 确保提供了 `id` 和 `name`。
2.  **创建目录结构**:
    - 创建根目录: `onespec/changes/<id>-<name>/`
    - 创建规格目录: `onespec/changes/<id>-<name>/specs/`

### 2. 获取需求详情（禅道 MCP）
1.  **调用工具**:
    - **`get_stories_storyID`**（MCP 服务器 `user-zentao`）：参数 `{ "storyID": "<id>" }`。
2.  **解析响应**:
    - 标题 → `story.title`
    - 需求描述 → `story.spec`（HTML 格式，原文保留用于模板 `[API返回的需求描述]`）；若描述中包含飞书链接，使用 WebFetch 抓取正文内容并补充到描述中
    - 处理人 → `story.assignedTo`（用户名字符串）
    - 优先级 → `story.pri`

### 3. 代码上下文分析
1.  **搜索相关代码**:
    - 根据工作项标题和关键词，在代码库中进行搜索（使用 `codebase_search` 或 `grep`）。
    - 定位与需求相关的核心业务代码文件。
2.  **理解现有逻辑**:
    - 读取相关代码文件，理解当前的业务逻辑实现。

### 4. 生成提案文档 (Proposal)
1.  **读取模板**:
    - 读取模板文件: `.cursor/commands/spec-templates/proposal.md`。
2.  **生成文件**:
    - 创建文件: `onespec/changes/<id>-<name>/proposal.md`。
3.  **智能填充内容**:
    - **基础信息（严格替换）**:
        - `id: <工作项ID>` -> 替换为实际 `<id>`
        - `author: <user>` -> 替换为当前操作系统用户名
        - `[需求标题]` -> 替换为工作项标题
        - `[处理人]` -> 替换为禅道返回的 `story.assignedTo`（若无则填「未知」）
        - `<priority>` -> 替换为禅道返回的 `story.pri`（若无则填「未提供」）
        - `[API返回的需求描述]` -> 替换为 **禅道返回的 `story.spec` 原文**
    - **智能生成章节（基于需求和代码上下文）**:
        - **2. 变更详情 (Change Analysis)**: 结合代码现状（From）和需求目标（To），分析并填写核心变更点。**注意：'To' 字段必须使用 EARS 语法 (e.g., *When <trigger>, the <system> shall <response>*) 来准确描述目标行为。**
        - **3. 规范变更规划 (Spec Impact)**: 根据受影响的代码模块，推断需要修改或新增的 Spec 文档列表。
        - **4. 验证计划 (Test Plan)**: 根据变更逻辑，生成核心的测试场景和验证点。
    - **约束**:
        - 除了上述允许生成的章节外，**严禁**生成或修改其他模板结构（如标题、Frontmatter 结构等）。
        - 如果无法确定具体代码逻辑，保持对应章节为空或仅填写已知部分，不要编造。

### 5. 自动生成 Delta Spec 草稿
1.  **读取 Spec Impact 列表**:
    - 解析刚生成的 `proposal.md` 中「3. 规范变更规划 (Spec Impact)」章节，提取所有待创建/修改的 Spec 条目（包含 Added / Modified 类型及目标路径）。
2.  **读取模板**:
    - 读取 Delta Spec 模板: `.cursor/commands/spec-templates/spec.md`。
3.  **逐条生成草稿**:
    - 针对 Spec Impact 列表中的每一条目，在 `onespec/changes/<id>-<name>/specs/` 下创建对应的 `.md` 文件（目录按需创建）。
    - **智能填充内容**（在 proposal.md 已有分析基础上**精化**，而非复制）:
        - `id` / `status` / `specType` / `targetSpec`: 根据条目类型填写。
        - **文档标题和引用**: 使用 Spec Impact 条目描述作为标题；在文档引言中注明对应 `proposal.md §2.x` 的变更点编号，建立引用关系而非重复内容。
        - **需求描述 (EARS)**: 以 proposal.md 对应变更点的粗粒度 EARS 为基础，**补充本模块的完整行为规范**（主流程、前置约束、异常与边界），不得简单复制。
        - **验收标准**: 以 proposal.md 验证计划中对应场景为起点，**细化为含前提/操作/预期结果的可测试标准**，可直接映射到测试用例，不得简单复制。
        - **范围说明**: 根据 Spec Impact 列表中各条目的边界，明确本 Spec 与相邻 Spec 的分工，防止跨文件重叠。
    - **约束**: 严禁将 proposal.md 内容原样复制到 spec 草稿中；无法精化的章节保留模板占位符，由用户补充。
4.  **同步更新 proposal.md 的 Spec Impact 勾选状态**:
    - 将已生成草稿的条目从 `- [ ]` 更新为 `- [x]`，以标记草稿已创建（待审查）。

### 6. 提示用户审查
1.  **提示用户**:
    - "已生成提案草稿 `proposal.md` 及以下 Delta Spec 草稿，请审查并按需修改："
    - 列出已生成的 Spec 文件路径清单。
2.  **后续指引**:
    - 确认 `proposal.md` 和 `specs/*.md` 内容准确后，根据复杂度决策进入下一阶段。

### 7. 结果验证
- 确认 `proposal.md` 已创建，且 Spec Impact 勾选状态已同步。
- 确认 `specs/` 目录下已按 Spec Impact 列表生成对应的 Delta Spec 草稿文件。
- 确认每个 Delta Spec 草稿内容与 proposal.md 中的分析一致（无凭空编造）。

## 关键约束
- **关注 WHAT，而非 HOW**: 描述业务目标和系统行为，避免涉及具体代码实现细节
- **数据一致性**: 工作项 ID、标题、原始描述必须原样保留，严禁意译删减改变含义
- **模板规范**: 生成的 EARS 需求描述应准确填入 Proposal 模板的 `Spec Impact` 或 `Change Analysis` 对应章节
- **需求验证**: 需求必须是可测试和可验证的
- **主语选择**: 为 EARS 语句选择合适的主语 (软件的系统/服务名称)
- **迭代策略**: 先生成初始版本，然后根据用户反馈进行迭代 (不要预先问一系列问题)
- **路径基准**: 命令中的文件读写路径以本命令文件所在仓库的根目录为基准，不限制跨工作区的上下文收集。

</instructions>

## 工具指导
- **先读取**: 生成前加载所有上下文 (spec, rules, templates)
- **最后写入**: 仅在完全生成后更新 proposal.md
- **WebSearch/WebFetch**: 仅在需要外部领域知识时使用

## 安全与回退

### 错误场景
- **项目描述缺失**: 如果 [API返回的需求描述] 为空，询问用户功能细节
- **需求模棱两可**: 提出初始版本并与用户迭代，而不是预先问很多问题
- **模板缺失**: 如果模板文件不存在，使用内联回退结构并发出警告
- **需求不完整**: 生成后，明确询问用户需求是否涵盖了所有预期的功能
- **指导目录为空**: 警告用户项目上下文缺失，可能会影响需求质量

### 下一阶段: 判断复杂度并决策

**如果需求获批**:
- 审查 `onespec/changes/<id>-<name>/proposal.md`（重点关注 From/To、Impact、Test Plan）
- 审查 `onespec/changes/<id>-<name>/specs/` 目录下已自动生成的 Delta Spec 草稿，按需补充或修正内容
- **可选差距梳理**（针对现有代码库/棕地项目）:
  - 基于需求关键词在代码库中搜索，列出受影响的模块/组件/集成点/配置项
  - 将结论回填到 `proposal.md` 的 Change Analysis / Spec Impact 章节，作为设计输入

**判断变更复杂度（在提示用户后给出建议路径）**:

> 如果满足以下**全部**条件，属于**简单变更**，可跳过设计阶段直接拆解任务：
> - 无新增/修改的 API 接口或协议契约
> - 无数据库 Schema 变更（无新增/修改表、字段、索引）
> - 影响模块 ≤ 2 个
> - 预计总工时 ≤ 8 小时
> - 完全复用已有模式，无需架构决策
>
> **简单变更** → 直接运行 `/onespec-task <id>-<name> --no-design` 跳过设计阶段拆解任务
>
> **复杂变更** → 运行 `/onespec-design <id>-<name>` 进入设计阶段

**如果需要修改**:
- 提供反馈并更新 `proposal.md` / `specs/*.md`；必要时重新运行 `/onespec-change <id> <name>` 生成新草稿

**注意**: 简单变更可跳过设计阶段；复杂变更在进入设计阶段之前，批准是强制性的。