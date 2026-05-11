---
description: 现代 Web 应用的 Vue.js 最佳实践和模式
globs: **/*.vue, **/*.ts
alwaysApply: true
---

# Vue.js 最佳实践

## 组件结构
- 优先使用组合式 API (Composition API) 而非选项式 API (Options API)
- 保持组件小巧且专注
- 使用适当的 TypeScript 集成
- 实现适当的 Props 验证
- 使用适当的 Emit 声明
- 保持模板逻辑最小化

## 组合式 API (Composition API)
- 正确使用 ref 和 reactive
- 实现适当的生命周期钩子
- 使用 Composables (可组合函数) 处理可重用逻辑
- 保持 setup 函数整洁
- 使用适当的计算属性 (computed properties)
- 实现适当的侦听器 (watchers)

## 状态管理
- 使用 Pinia 进行状态管理
- 保持 Store 模块化
- 使用适当的状态组合
- 实现适当的 Actions
- 使用适当的 Getters
- 正确处理异步状态

## 性能
- 使用适当的组件懒加载
- 实现适当的缓存
- 使用适当的计算属性
- 避免不必要的侦听器
- 正确选择 v-show 与 v-if
- 实现适当的 key 管理

## 路由
- 正确使用 Vue Router
- 实现适当的导航守卫
- 使用适当的路由元字段 (meta fields)
- 正确处理路由参数
- 实现适当的懒加载
- 使用适当的导航方法

## 表单
- 正确使用 v-model
- 实现适当的验证
- 正确处理表单提交
- 显示适当的加载状态
- 使用适当的错误处理
- 实现适当的表单重置

## TypeScript 集成
- 使用适当的组件类型定义
- 实现适当的 Prop 类型
- 使用适当的 Emit 声明
- 处理适当的类型推断
- 使用适当的 Composable 类型
- 实现适当的 Store 类型

## 测试
- 编写适当的单元测试
- 实现适当的组件测试
- 正确使用 Vue Test Utils
- 正确测试 Composables
- 实现适当的模拟 (mocking)
- 测试异步操作

## 最佳实践
- 遵循 Vue 风格指南
- 使用适当的命名约定
- 保持组件组织有序
- 实现适当的错误处理
- 使用适当的事件处理
- 记录复杂逻辑

## 构建和工具
- 使用 Vite 进行开发
- 配置适当的构建设置
- 使用适当的环境变量
- 实现适当的代码分割
- 使用适当的资源处理
- 配置适当的优化

