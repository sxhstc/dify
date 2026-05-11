> ⚠️ **已废弃**：本文件为历史云效 MCP 参考，当前已切换为禅道 MCP（见 [zentao-sync.md](zentao-sync.md)）。

# 云效 MCP：任务工作项同步（已废弃）

**MCP 服务器名**：配置里可能叫 `yunxiao`，Cursor 对 Agent 常显示为 **`user-yunxiao`**（以 Settings → MCP 为准）。

## 前置信息

| 变量 | 来源 |
|------|------|
| `organizationId` | `get_current_organization_info.lastOrganization` |
| `spaceId` | `search_projects` 按项目名（如「银企中台」）得到项目 `id` |
| 父需求 `workItemId` | 通常即变更目录 `<id>-<name>` 中的 `<id>` |
| `workitemTypeId`（Task） | `list_work_item_types`，`projectId`=`spaceId`，`category`: `Task` |
| `assignedTo` | `get_current_organization_info.userId` 或任务描述指定用户 |

## 步骤 1：去重

调用 **`search_workitems`**：

- `organizationId`
- `category`: `"Task"`
- `spaceId`
- `perPage`: 200（或按需分页）
- **`includeDetails`: true**（建议始终开启；实测仅 `false` 时可能返回空 `items` 导致去重失效）

用返回列表构建 **`subject`（标题）→ `id`（工作项 ID）** 映射。

## 步骤 2：创建或跳过

对 `tasks.md` 每条任务：

1. 格式化标题：`【模块名】任务名称`（模块名为最近上级 `##` 标题）。
2. 若标题已在映射中：将已有 id 写入该行下 `云效工作项ID：`。
3. 否则调用 **`create_work_item`**：
   - `organizationId`, `spaceId`
   - `subject` = 格式化标题
   - `workitemTypeId` = Task 类型 id
   - `assignedTo` = 必填
   - `description` = 任务详情（含 `参考：design.md`、验收等）；`formatType`: `MARKDOWN`
   - 若平台支持：`parentId` = 父需求 `workItemId`

成功则将返回的工作项 id 写入 `云效工作项ID：`。

## 失败处理

接口失败时仍保留本地 `tasks.md`，提示检查 `spaceId`、`workitemTypeId`、令牌权限及网络。
