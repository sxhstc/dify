---
alwaysApply: true
---

> ⚠️ **历史参考**：本文件为历史 OneTeam 参考，当前已切换为禅道 MCP（见 [zentao-sync.md](zentao-sync.md)）。

# OneTeam 同步步骤（历史参考）

## 执行步骤

### 1. 获取现有任务（去重基准）

调用 `oneteam_mcp OneTeamPortal-API0009`，建立 `格式化标题 → TaskID` 映射。

### 2. 格式化标题

识别每个任务所属最近的 `##` 二级标题作为模块名，格式化为 `【模块名】任务名称`。若任务不在任何模块标题下，保持原任务标题不变。

### 3. 检查重复

用格式化标题与 API0009 返回结果对比：

- **已存在** → 跳过创建，记录日志「任务 【模块名】任务名称 已存在，ID: [TaskID]」，直接回填 TaskID
- **不存在** → 继续步骤 4

### 4. 创建新任务

调用 `oneteam_mcp OneTeamPortal-API0006`，参数映射：

| 参数 | 来源 | 缺失时处理 |
|------|------|----------|
| `id` | 父需求 ID | 必填，缺失则终止整个同步 |
| `title` | `【模块名】任务名称` | 按步骤2规则自动格式化 |
| `content` | 任务描述（含设计章节引用与需求 ID） | 必填 |
| `priority` | tasks.md 中的优先级 | 未显式给出时按默认规则推断，并在 content 中说明 |
| `expectHour` | tasks.md 预计工时（小时） | 留空 + 提示 |
| `startTime` / `endTime` | 预计开始/结束日期（yyyy-MM-dd） | 可省略 |
| `sprint` | 迭代名称（上下文可获得时填写） | 可省略 |
| `assignUser` | 处理人 | 可省略 |
| `status` | 固定值 `未处理` | — |

### 5. 回填 TaskID

创建成功后，在 `tasks.md` 对应任务需求行之后追加 `OneTeam TaskID：{{TASK_ID}}`。

---

## 禁止事项

- 禁止因单个任务 API 失败而终止整个同步流程；失败时记录错误信息，继续处理下一个任务
- 禁止在回填 TaskID 时修改 tasks.md 的其他任何内容
