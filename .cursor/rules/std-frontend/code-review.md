---
description: 前端 Code Review 规范 - 当用户请求对 Vue/React/TypeScript/JavaScript 前端代码进行代码评审时自动应用
alwaysApply: false
---

# 前端 Code Review 规范

## P0：正确性与安全

**业务正确性**：需求完整性、边界条件处理（null/undefined/空数组）、异常处理、状态管理、异步操作

**安全性**：XSS防护（禁v-html/dangerouslySetInnerHTML处理用户输入）、CSRF防护、敏感信息保护、输入验证

## P1：性能与可靠性

**性能**：渲染优化、懒加载/代码分割、打包体积、内存泄漏防护

**可靠性**：错误处理、网络请求重试/超时、降级策略

## P2：可维护性

命名清晰、组件职责单一、DRY、复杂逻辑注释、模块边界清晰

---

## 前端专项评审关注点

**F1 组件设计**：单一职责、Props类型明确、状态提升/下沉合理、避免 prop drilling
- Vue: `<script setup>`、defineProps带类型、defineEmits明确事件
- React: Hooks顶层调用、依赖数组完整、合理memo

**F2 状态管理**：状态层级合理（组件状态/共享状态/服务端状态/URL状态）、不可变更新、批量更新、派生状态

**F3 性能优化**：memo避免重渲染、稳定key（非index）、大列表虚拟滚动、路由/组件代码分割、组件卸载清理

**F4 安全**：禁v-html/dangerouslySetInnerHTML渲染用户输入、验证URL协议防javascript:注入、不前端存密钥、Token用httpOnly Cookie

**F5 无障碍**：语义化HTML标签、键盘导航、ARIA属性、图片alt

**F6 TypeScript**：strict模式、避免any、类型守卫而非断言

**F7 API交互**：完整状态处理（loading/error/data）、卸载取消请求、缓存/重试

---

## 参考资源

- [React 文档](https://react.dev/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [WCAG 无障碍指南](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Google Web 性能最佳实践](https://web.dev/performance/)
- [OWASP 前端安全指南](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
