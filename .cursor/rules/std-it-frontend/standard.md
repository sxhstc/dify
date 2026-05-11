---
description: 命名规范
globs: **/*.vue, **/*.js, **/*.ts, **/*.jsx, **/*.tsx
alwaysApply: true
---

- **文件命名**：
  - 业务/工具文件：统一使用 **kebab-case**（如：`user-list.ts`、`date-utils.ts`）
  - Vue/React 组件文件：遵循项目实践，可选：
    - 方案一：`kebab-case`（如：`user-list.vue`）
    - 方案二：`PascalCase`（如：`UserList.vue` / `UserList.tsx`）

- **组件命名**：`PascalCase`
  - 示例：`UserList`、`UserTable`、`PageContainer`

- **变量 / 函数命名**：`camelCase`
  - 示例：`getUserList`、`handleSubmit`、`isLoading`

- **常量命名**：`UPPER_SNAKE_CASE`
  - 示例：`API_BASE_URL`、`DEFAULT_PAGE_SIZE`

- **类型 / 接口命名（TS）**：`PascalCase`
  - 示例：`UserInfo`、`UserListParams`、`ApiResponse<T>`

- **目录命名**：
  - 通用规则：小写 + 中划线（kebab-case），集合语义用复数（如：`components` / `services`）
