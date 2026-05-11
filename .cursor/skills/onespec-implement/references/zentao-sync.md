# 禅道 MCP：任务状态更新

**MCP 服务器名**：`user-zentao`。

完成任务实现后，若 `tasks.md` 中该行已有 **`禅道任务ID：`**，可调用：

**`put_tasks_taskID_finish`**

- `taskID`：tasks.md 中的禅道任务 ID
- `payload`：
  - `currentConsumed`：实际工时（小时）
  - `realStarted`：实际开始日期（如 `2026-04-16`）
  - `finishedDate`：完成日期

无 `禅道任务ID` 则跳过同步并在结果中标注。
