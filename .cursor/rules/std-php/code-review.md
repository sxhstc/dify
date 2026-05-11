---
description: PHP 后端 Code Review 规范 - 当用户请求对 PHP/Laravel/Symfony 等后端代码进行代码评审时自动应用
alwaysApply: false
---

# PHP 后端 Code Review 规范

## 关注点

### P0：正确性与安全（必须通过）

**业务正确性**：
- 需求实现完整性
- 边界条件处理（null、空字符串、空数组、最大/最小值）
- 异常处理完整性
- 并发与幂等性（队列/任务/重复请求）

**安全性**：
- SQL 注入防护（参数化查询）
- 认证授权检查（越权访问）
- 输入验证与清理（白名单）
- 敏感信息保护（日志脱敏、配置不硬编码）
- 文件上传安全（类型/大小/路径）
- SSRF/命令注入风险

### P1：性能与可靠性

**性能**：
- 算法复杂度合理
- 数据库查询优化（索引、N+1、慢查询）
- 缓存策略合理
- 资源释放（连接、流）

**可靠性**：
- 超时与重试（外部依赖）
- 降级策略（按需）
- 错误日志可定位（包含上下文且脱敏）

### P2：可维护性

- 分层清晰，边界明确（Controller/Service/Repository）
- 命名清晰表达意图
- 方法职责单一
- DRY（避免重复逻辑）
- 注释解释“为什么”

### P3：可观测性（可选）

- 关键操作日志与 TraceId
- 指标/告警（延迟、错误率）
- 健康检查端点

## PHP 专项关注点

### 类型与 strict_types（高优先级）

- 是否启用 `declare(strict_types=1);`
- 参数/返回值类型是否完整
- null 处理是否明确（`?T` 与默认值语义）
- 是否避免弱比较陷阱（`==`）

### 异常体系与错误边界（高优先级）

- 是否区分业务异常与系统异常
- 是否在边界层统一映射错误
- 对外响应是否避免泄露堆栈/SQL/内部路径
- 日志是否包含足够上下文且脱敏

### 依赖注入与隐藏依赖（中优先级）

- 是否使用构造器注入
- 是否避免 Service Locator/全局静态单例
- 是否避免直接 `new` 外部依赖

### 数据库访问与事务（高优先级）

- 是否参数化查询（禁止拼接 SQL）
- 是否存在 N+1 查询
- 事务边界是否合理（Service 层）
- 是否正确处理唯一约束/并发写入异常

### 模板与输出安全（中优先级）

- 输出到 HTML 是否正确转义（XSS）
- 是否避免将用户输入直接拼到 HTML/JS
- 生成链接/跳转是否校验目标（open redirect）

### Composer 依赖与工具链（中优先级）

**AI 评审前必须识别项目实际工具**（不要强制引入新工具）：
- 静态分析：PHPStan / Psalm
- 代码风格：PHP-CS-Fixer / PHP_CodeSniffer
- 单测：PHPUnit / Pest
- 依赖审计：`composer audit`

## 参考资源

- [PHP Manual](https://www.php.net/manual/en/)
- [PSR 标准（PSR-12 等）](https://www.php-fig.org/psr/)
- [OWASP Cheat Sheets](https://owasp.org/www-project-cheat-sheets/)

