---
name: onespec-bug-checklist
argument-hint: <禅道Bug ID...> [产品ID] [镜像id...]
description: 按禅道 Bug ID 生成按 BUG 提测的清单（对齐测试中心缺陷提测结构）
---

# OneSpec BUG 提测清单 (onespec-bug-checklist)

根据 **一个或多个禅道 Bug ID**（即 `bugID`）拉取详情，生成**按 BUG 提测**的 `bug-checklist.md`。结构与测试中心「缺陷列表 + 应用 + SQL + 配置 + 测试关注点」一致；**与按迭代提测的 `onespec-checklist` 并列**，入参与章节不同。

**禅道 MCP**：服务器名一般为 **`user-zentao`**（以 Settings → MCP 为准）。单条缺陷使用 **`get_bugs_bugID`**；**禁止**在未成功调用 API 时编造缺陷列表。

<background_information>
- **任务**: 产出可提交测试中心（或复制粘贴）的 **BUG 修复提测**材料；**缺陷表格字段须来自禅道 `get_bugs_bugID` 返回**，不得凭空编造。
- **输入**:
  - `缺陷Id` / `defectId` / `bugID`：（必填）**至少一个**，**可多个**（空格、逗号、分号分隔）。均为禅道 **Bug ID**（与缺陷详情 URL 中 ID 一致）。
  - `productId`：（选填）禅道 **产品** ID。未提供时，以**首次成功** `get_bugs_bugID` 返回的 `product` 为准；若多次缺陷分属不同产品，须**终止并提示用户**核对或分批生成。
  - `镜像id`：（选填）容器镜像 ID，**可多个**；与「涉及改动的应用」表格多行对应；规则见「镜像 id 确认」。
- **输出**: `onespec/checklist/bug-<目录名>/bug-checklist.md`。目录名规则见步骤 5。
- **成功标准**: 对每个输入的缺陷 ID **至少成功一次** `get_bugs_bugID`；清单中含 **缺陷列表表**及二～七节（与模板一致）。
</background_information>

<instructions>
## 参数

- `缺陷Ids`:（必填）一个或多个 **禅道 Bug ID**。
- `productId`：（选填）禅道 **产品** ID。
- `镜像id` / `imageId`:（选填）**可多个**；未提供时须执行「镜像 id 确认」后再写入。

## 执行步骤

### 1. 缺陷详情获取

1. **解析**输入中的多个 ID：`split` 空格、英文逗号、中文逗号、分号，去重、去空。
2. 对每个 **`bugID`** 调用 **`get_bugs_bugID`**：`bugID` = 缺陷 ID。
3. **失败**（某 ID 不存在或无权限）：记录该 ID，全部尝试结束后**终止并列出失败 ID**，不得用占位行冒充真实缺陷。
4. **字段映射**（写入「缺陷列表」表，以 API 实际字段为准，无则 **TBD** 或 **—**）：
   - **BugId**：`id`
   - **Bug 标题**：`title`
   - **状态**：`status`
   - **严重性**：`severity`；无法解析时 **TBD**
   - **创建人**：`openedBy`
   - **指派给**：`assignedTo`；无则 **—**
   - **创建时间**：`openedDate` 转为可读时间
5. **产品一致性**：若未传 `productId`，取第一条成功返回的 `product` 作为 `productId`；若后续缺陷的 `product` 与之一致则继续，**不一致则**提示用户分批提测或手动指定 `productId`。
6. **类型提示**：若返回数据显示非 Bug 类型，可在 Frontmatter 或表下追加一行说明「**非 Bug 类型，请确认是否仍按缺陷提测**」，**不**删除该行数据（以 API 为准）。

### 2. 关联 OneSpec（按缺陷 ID 逐项）

对每个 **`bugID`**：

1. 查 **`onespec/changes/<bugID>-*/`**
2. 若无，查 **`onespec/archive/*-<bugID>-*/`**
3. 读取存在的 `proposal.md`、`design.md`、`tasks.md`，用于填充 **SQL / 配置 / 测试关注点**（合并去重）；无则依赖 **缺陷描述** 与代码检索，**TBD** 标注。

### 3. 合并填写二～五节

1. **应用（二）**：**应用名 = Git 仓库名**（如 `bfs-bemp`）；多镜像多行。
2. **SQL（三）**：合并变更相关 SQL；无则**整节留空**（无套话）。
3. **配置（四）**：合并配置项；无则仅表头或空表；**不脱敏**。
4. **测试关注点（五）**：综合缺陷描述、关联 `design.md`、修复范围；**勾选列表**。

### 4. 镜像 id 确认

与 **`onespec-checklist`** 相同：未提供时**暂停询问**或经用户同意使用 **「待填写」**；**禁止**伪造镜像 ID。

### 5. 生成文件

1. **目录名 `bug-<slug>`**：
   - 取当前日期 **`YYYYMMDD`**（或用户指定提测日）与 **全部缺陷** Bug ID 排序后连接。
   - **文件名安全化**：非法字符替换为 `_`，合并连续 `_`，长度上限建议 **80 字符**；过长时截断为 `bug-YYYYMMDD-<前 3 个 Bug ID>-等N项`。
2. **冲突**：若 `onespec/checklist/bug-<slug>/bug-checklist.md` 已存在，若 Frontmatter 中缺陷 ID 集合与本次**相同**则可覆盖；**不同**则在 `slug` 后追加 `_<末条缺陷 id 末 8 位>`。
3. 读取模板：`.cursor/commands/spec-templates/bug-checklist.md`。
4. 写入：`onespec/checklist/bug-<slug>/bug-checklist.md`。
5. **产物排版**：不写 HTML 模板注释、`>` 编写指引、无内容时的「无 | —」占位行；**禁止**编造自测通过记录。

## 与 `onespec-checklist`（按迭代）的差异

| 维度 | 按迭代 `onespec-checklist` | 按 BUG `onespec-bug-checklist` |
| --- | --- | --- |
| 入参 | 迭代 ID（Sprint） | 一个或多个**禅道 Bug ID** |
| 禅道 API | `get_sprints`、搜索任务等 | 对每个 ID **`get_bugs_bugID`** |
| 第一节 | 业务逻辑描述（改动摘要/详细说明） | **缺陷列表**（多行） |
| 接口 | 第三节「涉及的接口」表 | **默认不单独成章**；若修复涉及对外 API，可在 **第五节测试关注点** 或 **第六节相关文档** 指向 `design.md`，不强制表格 |
| 产出路径 | `onespec/checklist/<迭代名 slug>/checklist.md` | `onespec/checklist/bug-<slug>/bug-checklist.md` |

## 关键约束

- **禁止**在未成功 `get_bugs_bugID` 时编造 Bug 标题、状态、指派人。
- **镜像 id** 与迭代清单规则一致。

</instructions>
