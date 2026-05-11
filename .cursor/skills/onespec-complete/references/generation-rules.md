---
alwaysApply: true
---

# OneSpec Complete — 执行规则

## §1 合并规范（阶段 2）

**源目录**：`onespec/changes/<id>-<name>/specs/`
**目标目录**：`onespec/specs/`（固定，不可修改）

覆盖策略：

| 情况 | 操作 |
|------|------|
| 目标已有同名文件 | 直接覆盖（Delta Spec 代表最新状态） |
| 目标无同名文件 | 新建文件 |

合并完成后，输出合并日志：

```
已合并 [N 个文件] → onespec/specs/：
- specs/xxx.md → onespec/specs/xxx.md [覆盖]
- specs/yyy.md → onespec/specs/yyy.md [新建]
```

---

## §2 归档规范（阶段 3）

**归档路径**：`onespec/archive/<yyyyMMdd>-<id>-<name>/`
- `yyyyMMdd` 使用执行当日日期（如 `20260313`）

操作顺序（严格按序执行）：

1. 创建归档目录 `onespec/archive/<yyyyMMdd>-<id>-<name>/`
2. 将 `onespec/changes/<id>-<name>/` 下**全部内容**移动至归档目录
3. 删除已清空的 `onespec/changes/<id>-<name>/` 目录

---

## §3 Proposal 状态更新（阶段 4）

**目标文件**：`onespec/archive/<yyyyMMdd>-<id>-<name>/proposal.md`

将 frontmatter 中的 `status` 字段更新为 `completed`：

```yaml
status: completed
```

若 frontmatter 中无 `status` 字段，则追加至 frontmatter 末尾（`---` 之前）。

---

## §4 完成输出模板（阶段 5）

**必须**按以下格式输出，不得省略任何字段：

```
✅ 归档完成

- 变更提案：`<id>-<name>`
- 合并规范：[N 个文件] 已同步至 `onespec/specs/`
- 归档位置：`onespec/archive/<yyyyMMdd>-<id>-<name>/`
- Proposal 状态：已更新为 `completed`
```

---

## §5 执行示例

**示例 1（用户直接输入 ID + Name）**：
- 输入：`123456 user-auth-sso`
- 源目录：`onespec/changes/123456-user-auth-sso/specs/`
- 合并目标：`onespec/specs/`
- 归档路径：`onespec/archive/20260313-123456-user-auth-sso/`
- Proposal 路径：`onespec/archive/20260313-123456-user-auth-sso/proposal.md`

**示例 2（从活跃文件路径推断）**：
- 活跃文件：`onespec/changes/789012-batch-export/tasks.md`
- 推断参数：`id=789012`，`name=batch-export`
- 源目录：`onespec/changes/789012-batch-export/specs/`
- 归档路径：`onespec/archive/20260313-789012-batch-export/`
