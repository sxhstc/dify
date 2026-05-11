---
alwaysApply: false
globs: '**/*.java'
---

# AI 生成 Java 代码的要求

> 通用原则（工作流、编码偏好、完成验证、审核指南）见 `../std-common/ai-workflow.mdc`。本文件仅补充 Java 语言特有约束。

---

## 依赖注入

```java
// ❌ 字段注入：不可测试，依赖隐式
@Autowired private UserRepository userRepository;

// ✅ 构造器注入：依赖显式，final 不可变
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
}
```

---

## 异常处理

分层设计：业务异常继承 `RuntimeException`，包含错误码；系统异常统一兜底。

```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String userId) {
        super("用户不存在: " + userId);
    }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(UserNotFoundException e) {
        return ResponseEntity.status(NOT_FOUND)
            .body(new ErrorResponse("USER_NOT_FOUND", e.getMessage()));
    }
}
```

---

## 线程安全

单例 Service **禁止可变实例变量**（多线程共享同一实例）：

```java
@Service
public class UserService {
    // private User currentUser;  // ❌ 多线程不安全
    private final UserRepository userRepository;  // ✅ final 不可变
}
```

---

## 事务管理

- 写操作：`@Transactional(rollbackFor = Exception.class)` — 默认只回滚 `RuntimeException`，必须显式指定
- 读操作：`@Transactional(readOnly = true)` — 标记只读，优化性能
- 事务方法必须是 `public`，同类内调用不会触发事务代理

---

## ORM 要点

- **避免 N+1**：关联查询使用 `JOIN FETCH` 或批量加载，禁止循环内逐条查询
- **参数绑定**：必须使用 `#{id}` / `:param` 等参数化方式，禁止字符串拼接 SQL

```java
// ✅ JOIN FETCH 避免 N+1
@Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.status = :status")
List<Order> findOrdersWithUsers(@Param("status") OrderStatus status);
```

---

## Java 特有审核清单

生成 Java 代码后，在通用审核指南基础上额外检查：

- [ ] 单例 Service 是否有可变实例变量
- [ ] 事务边界是否合理（rollbackFor、readOnly）
- [ ] 是否存在 N+1 查询
- [ ] SQL 是否参数绑定
- [ ] 异常是否分层（业务异常 vs 系统异常）
