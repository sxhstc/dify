---
description: Vue 2 应用的最佳实践和模式
globs: **/*.vue, **/*.js
alwaysApply: true
---

# Vue.js 2 (选项式 API) 最佳实践

## 组件结构
- **必须**使用选项式 API (Options API)
- 保持组件小巧且专注
- 使用 JavaScript (ES6+) 编写逻辑 (不使用 TypeScript)
- 实现适当的 Props 验证 (使用对象语法定义 props)
- 保持模板逻辑最小化

## 选项式 API (Options API)
- **Data**: 必须是一个返回对象的函数 (`data() { return { ... } }`) 以防止状态污染
  - **注意**: 谨记 Vue 2 的响应式系统限制 (如对象属性添加/删除，数组索引修改)
  - 必须时使用 `this.$set` 或 `Vue.set` 处理响应式丢失问题
- **Computed**: 使用计算属性处理复杂逻辑和派生状态，避免在模板中编写复杂表达式
- **Watch**: 使用侦听器响应数据变化，注意配置 `deep` 和 `immediate` 选项
- **Methods**: 包含组件的所有事件处理和业务逻辑方法
- **Lifecycle**: 妥善处理生命周期钩子 (`mounted`, `beforeDestroy` 等)
- **Mixins**: 谨慎使用 Mixins 复用逻辑 (易导致命名冲突和来源不清晰)，优先考虑提取为纯函数工具或高阶组件 (HOC)

## 状态管理 (Vuex)
- **必须**使用 Vuex 进行全局状态管理
- 保持 Store 模块化 (Modules)
- 严格遵循 Vuex 3.x 数据流：
  - **State**: 单一状态树
  - **Getters**: 派生状态 (类似计算属性)
  - **Mutations**: **同步**修改状态的唯一方式
  - **Actions**: 处理异步逻辑并提交 (commit) Mutations
- 严禁在组件中直接修改 `$store.state`
- 使用辅助函数 (`mapState`, `mapGetters`, `mapActions`, `mapMutations`) 简化组件内的 Store 访问

## JavaScript 最佳实践
- 使用现代 ES6+ 语法
- 使用 JSDoc 注释提供代码文档和简单的类型提示
- 避免使用 `var`，优先使用 `const` 和 `let`
- 保持清晰的变量和函数命名
- 处理异步操作时优先使用 `async/await`
- 在 `methods` 中注意 `this` 指向，尽量避免使用箭头函数定义顶层 methods

## 性能优化
- 列表渲染必须设置唯一的 `key` (避免使用 index)
- 路由组件和大型组件使用懒加载 (Webpack 动态导入)
- 避免在 `data` 中深层嵌套大型不可变数据 (可使用 `Object.freeze` 避免被转换为响应式)
- 及时销毁定时器和事件监听器 (在 `beforeDestroy` 中)
- 合理使用 `v-show` (频繁切换) 与 `v-if` (条件渲染)

## 路由 (Vue Router 3.x)
- 使用 Vue Router 3.x
- 配置路由懒加载: `component: () => import('@/views/Home.vue')`
- 实现适当的导航守卫 (`beforeEach`) 进行权限控制
- 使用路由元信息 (`meta`) 管理页面标题和权限配置

## 构建和工具 (Webpack)
- 使用 Webpack 作为构建工具
- 确保正确配置 `vue-loader` (v15+)
- 使用 `babel-loader` 确保浏览器兼容性
- 配置 `resolve.alias` 简化路径引用 (如 `@` 指向 `src`)
- 利用 Webpack 的 `SplitChunksPlugin` 进行代码分割
- 配置开发环境的热重载 (HMR)

## 测试
- 使用 Vue Test Utils v1 进行组件测试
- 针对 Vuex 的 Mutations 和 Actions 编写单元测试
- 测试组件的关键交互和渲染输出
