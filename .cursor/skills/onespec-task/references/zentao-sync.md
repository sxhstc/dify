---
alwaysApply: true
---

# 禅道 MCP：任务同步

**MCP 服务器名**：**`user-zentao`**（以 Settings → MCP 面板为准）。

## 前置信息

| 变量 | 来源（优先级从高到低） |
|------|------------------------|
| `executionID` | ① 主参数简写 **`storyId-executionId`** 中的 **executionId**；② **`--execution=`**；③ 用户粘贴的 **执行-需求 URL** 经 MCP 校验后的执行 ID；④ 仍未得到时按 `onespec-task.md`「执行 ID 解析规则」调用 `get_executions`（多执行 **禁止** 自动二选一） |
| `assignedTo` | **仅**在用户传入 **`--assign=账号`** 时写入 **`post_tasks` payload**。**未传 `--assign`**：**不传 `assignedTo`**，由 **禅道按 MCP 所带 token 绑定的用户** 处理。**不使用** `mcp.json` 的 `username` 等字段兜底。 |

> ⚠️ 禅道任务创建依赖 `executionID`。业务上的「release 版本名」不等于 ID；多迭代并行时优先使用简写 **`9-4`** 或 **`--execution=`**。  
> 若用户粘贴 **「执行-需求」视图** URL（如 `execution-storyView-*.html`），应按 `onespec-task.md` 规则解析并校验出 **`executionID`**，再与 `post_tasks` 对齐。

## Token 与负责人

- **只配 token、未传 `--assign`**：`post_tasks` **省略 `assignedTo`**。  
- **传了 `--assign`**：`payload.assignedTo` = 传入账号。  
- 指派结果与预期不符：在禅道内改派，或下次带 **`--assign=`**。

## 步骤 1：去重

调用 **`get_executions_executionID_tasks`**：

- `executionID`：当前执行/迭代 ID

用返回列表构建 **`name`（任务名）→ `id`（任务 ID）** 映射。

## 步骤 2：创建或跳过

对 `tasks.md` 每条任务：

1. 格式化标题：`【模块名】任务名称`（模块名为最近上级 `##` 标题）。
2. 若标题已在映射中：将已有 id 写入该行下 `禅道任务ID：`。
3. 否则调用 **`post_tasks`**：
   - `name` = 格式化标题
   - `executionID` = 当前执行/迭代 ID
   - `type` = `devel`
   - **`assignedTo`**：**仅当**本轮命令存在 **`--assign`** 时加入 `payload`；否则 **不包含**该键
   - `story` = 禅道 Story 数字 **id**（与 `proposal` / 简写 **storyId** 一致时建议填写）

成功则将返回的任务 id 写入 `禅道任务ID：`。

## 失败处理

接口失败时仍保留本地 `tasks.md`，提示检查 `executionID`、令牌权限及网络。
