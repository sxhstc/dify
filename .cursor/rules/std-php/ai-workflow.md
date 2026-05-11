---
alwaysApply: false
globs: '**/*.php'
---

# AI 生成 PHP 代码的要求

> 通用原则（工作流、编码偏好、完成验证、审核指南）见 `../std-common/ai-workflow.mdc`。本文件仅补充 PHP 语言特有约束。

---

## 严格类型（红线）

每个 PHP 文件**必须**声明严格类型，所有函数/方法**必须**有参数和返回值类型声明：

```php
<?php
declare(strict_types=1);

function findUser(int $id): ?User { ... }
```

---

## 异常处理

分层设计：Repository 抛领域异常 → Service 语义转换 → Controller 映射对外响应。

- 对外响应**禁止暴露**堆栈、SQL、内部路径等敏感信息
- 异常信息必须包含定位问题的上下文（关键参数、操作名等）

---

## XSS 防护

输出到 HTML 的内容**必须转义**：

```php
// ✅
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');

// ❌
echo $userInput;
```

---

## Composer

- 变更依赖后同步 `composer.lock`
- 建议 `composer audit` 检查已知漏洞

---

## PHP 特有审核清单

生成 PHP 代码后，在通用审核指南基础上额外检查：

- [ ] 是否声明 `strict_types=1` 且类型声明完整
- [ ] 异常是否分层处理，对外响应是否隐藏内部细节
- [ ] 输出到 HTML 是否转义（XSS）
- [ ] DB 查询是否参数化（SQL 注入）
- [ ] Controller 是否混入业务逻辑
