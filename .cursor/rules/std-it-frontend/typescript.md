---
description: 现代 Web 开发的 TypeScript 编码标准和最佳实践
globs: **/*.ts, **/*.tsx, **/*.d.ts
alwaysApply: true
---

# TypeScript 最佳实践

## 类型系统
- 定义对象时优先使用 interface 而非 type
- 使用 type 定义联合类型、交叉类型和映射类型
- 避免使用 `any`，未知类型优先使用 `unknown`
- 使用严格的 TypeScript 配置
- 利用 TypeScript 内置的工具类型 (Utility Types)
- 使用泛型实现可重用的类型模式

## 命名约定
- 类型名和接口名使用大驼峰 (PascalCase)
- 变量和函数名使用小驼峰 (camelCase)
- 常量使用大写字母加下划线 (UPPER_CASE)
- 使用带有助动词的描述性名称 (如 isLoading, hasError)
- React 组件属性接口使用 'Props' 后缀 (如 ButtonProps)

## 代码组织
- 将类型定义保持在靠近使用的位置
- 共享类型和接口应从专门的类型文件中导出
- 使用桶导出 (barrel exports/index.ts) 组织导出
- 将共享类型放置在 `types` 目录中
- 将组件属性定义与组件放在一起

## 函数
- 公共函数使用显式返回类型
- 回调和方法使用箭头函数
- 使用自定义错误类型实现适当的错误处理
- 复杂类型场景使用函数重载
- 优先使用 async/await 而非 Promises

## 最佳实践
- 在 tsconfig.json 中启用严格模式
- 不可变属性使用 readonly
- 利用可辨识联合 (discriminated unions) 确保类型安全
- 使用类型守卫 (type guards) 进行运行时类型检查
- 实现适当的空值检查
- 除非必要，避免使用类型断言

## 错误处理
- 为领域特定错误创建自定义错误类型
- 对可能失败的操作使用 Result 类型
- 实现适当的错误边界
- 使用带有类型化 catch 子句的 try-catch 块
- 正确处理 Promise 拒绝

## 设计模式
- 使用建造者模式 (Builder pattern) 创建复杂对象
- 使用仓储模式 (Repository pattern) 进行数据访问
- 使用工厂模式 (Factory pattern) 创建对象
- 利用依赖注入
- 使用模块模式 (Module pattern) 进行封装

