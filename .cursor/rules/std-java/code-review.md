---
description: Java 后端 Code Review 规范 - 当用户请求对 Java/Spring Boot/Spring Cloud 后端代码进行代码评审时自动应用
alwaysApply: false
---

# Java 后端 Code Review 规范

---

## 通用评审关注点

### P0：正确性与安全（必须通过）

#### 业务正确性
- 需求实现完整性
- 边界条件处理（null、空集合、最大/最小值）
- 异常处理完整性
- 并发安全（线程安全、事务隔离）
- 幂等性（重复请求处理）

#### 安全性
- SQL 注入防护
- 认证授权检查
- 敏感信息保护（加密、脱敏）
- 输入验证和清理
- 依赖库安全漏洞

### P1：性能与可靠性（重要）

#### 性能
- 算法复杂度合理
- 数据库查询优化（索引、N+1、慢查询）
- 缓存策略合理
- 资源释放（连接、流）

#### 可靠性
- 错误处理和重试机制
- 超时处理
- 降级策略
- 熔断机制

### P2：可维护性（建议）

- 命名清晰表达意图
- 方法职责单一（不超过 50 行）
- 代码重复检查（DRY）
- 注释解释"为什么"
- 模块边界清晰

### P3：可观测性（可选）

- 关键操作日志
- 结构化日志（TraceId）
- 监控指标
- 健康检查端点

---

## Java 专项评审关注点

### J1：Spring Boot 规范

#### 分层架构
- Controller 只做请求处理，不含业务逻辑
- Service 负责业务逻辑、事务管理
- Repository/Mapper 只做数据访问

#### 依赖注入
- 必须使用构造器注入（`@RequiredArgsConstructor` + `private final`）
- 禁止字段注入（`@Autowired` 注解在字段上）
- 避免循环依赖
- 单例 Bean 禁止存储可变状态

#### 配置管理
- 使用 `@ConfigurationProperties` 管理配置
- 禁止硬编码配置值
- 敏感配置加密存储

### J2：异常处理

- 禁止吞掉异常（catch 后不处理）
- 禁止使用 `e.printStackTrace()`
- 业务异常返回友好提示
- 系统异常记录完整日志并包装
- 使用全局异常处理器 `@RestControllerAdvice`

### J3：并发安全

#### 线程安全
- 避免可变共享状态（单例存储状态）
- 复合操作使用原子类或锁
- ThreadLocal 必须在 finally 中清理

#### 分布式锁
- 必须设置超时时间
- 释放锁前检查是否当前线程持有

### J4：事务管理

- 事务边界在 Service 层
- 避免事务自调用（同类方法互调事务失效）
- 事务中避免远程调用
- 使用 `@Transactional(rollbackFor = Exception.class)`
- 只读操作加 `readOnly = true`
- 异常不要在 catch 中吞掉，否则事务不回滚

### J5：数据库访问

#### SQL 安全
- 必须使用参数化查询，禁止字符串拼接 SQL
- MyBatis 使用 `#{}` 而非 `${}`
- 批量操作限制数量

#### 查询优化
- 避免 N+1 查询，使用 JOIN FETCH 或批量查询
- 查询条件建立索引
- 深度分页使用游标分页
- 按需查询字段

### J6：API 设计

- RESTful 风格：资源导向、名词复数
- 正确使用 HTTP 方法
- 所有输入使用 Bean Validation（`@Valid`）

### J7：日志规范

- 正确使用日志级别（ERROR/WARN/INFO/DEBUG）
- 敏感信息脱敏
- 使用占位符，禁止字符串拼接
- 异常日志保留堆栈（异常作为最后参数）

### J8：安全专项

#### 认证授权
- 所有接口都需要鉴权
- 数据权限校验（防越权访问）

#### 敏感数据
- 密码使用 BCrypt 加密存储
- 返回数据使用 VO 过滤敏感字段

### J9：代码规范

- 命名规范：类名 PascalCase、方法名 camelCase、常量 UPPER_SNAKE_CASE
- Optional 仅用于返回值，不作为方法参数
- Stream 禁止副作用，禁止重复使用

---

## 参考资源

- [Alibaba Java 开发手册](https://github.com/alibaba/p3c)
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [Spring Boot 最佳实践](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [OWASP Java 安全指南](https://owasp.org/www-project-cheat-sheets/)
- [Effective Java](https://www.oracle.com/java/technologies/effectivejava.html)
