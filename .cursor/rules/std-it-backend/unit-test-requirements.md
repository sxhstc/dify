---
description: 单元测试要求和最佳实践，确保生成的代码符合单元测试标准，保持测试通过率，并提高代码可测试性。
globs: *.java
alwaysApply: true
---

# 🧪 单元测试要求和最佳实践

## 🎯 核心原则

### ✅ 代码生成时必须遵循的规则

1. **保持向后兼容性**
   - **严禁破坏现有测试**：生成的代码必须确保所有现有的单元测试继续通过
   - **在修改代码前**：必须检查是否有相关的测试文件，确保修改不会导致测试失败
   - **API变更**：如果必须修改公共API，需要同时更新对应的测试用例

2. **代码可测试性设计**
   - **依赖注入**：优先使用依赖注入（DI），避免硬编码依赖，便于mock和测试
   - **单一职责**：每个类和方法应该只做一件事，便于独立测试
   - **接口抽象**：对外部依赖（数据库、HTTP客户端、文件系统等）使用接口抽象
   - **避免静态方法**：除非必要，避免使用静态方法，静态方法难以mock和测试

3. **测试覆盖率要求**
   - **新功能必须包含测试**：为所有新添加的公共方法编写单元测试
   - **边界条件测试**：测试正常路径、边界条件和异常情况
   - **最小覆盖率**：新代码的测试覆盖率应不低于70%

## 📋 单元测试编写规范

### 1. 测试类命名和组织

- **命名规范**：测试类名 = 被测试类名 + `Test`（例如：`UserService` → `UserServiceTest`）
- **包结构**：测试类应放在 `src/test/java` 目录下，包结构与源代码保持一致
- **测试方法命名**：使用描述性名称，格式为 `test[被测试方法名][测试场景]` 或使用 `@DisplayName` 注解

```java
// ✅ 好的示例
@Test
void testGetUserById_WhenUserExists_ReturnsUser() {
    // 测试代码
}

@Test
@DisplayName("当用户不存在时应该返回null")
void testGetUserById_WhenUserNotExists_ReturnsNull() {
    // 测试代码
}
```

### 2. 测试结构（AAA模式）

所有测试方法应遵循 **Arrange-Act-Assert** 模式：

```java
@Test
void testMethod() {
    // Arrange: 准备测试数据和环境
    UserService userService = new UserService(mockRepository);
    User expectedUser = new User("123", "John");
    when(mockRepository.findById("123")).thenReturn(expectedUser);
    
    // Act: 执行被测试的方法
    User result = userService.getUserById("123");
    
    // Assert: 验证结果
    assertNotNull(result);
    assertEquals("John", result.getName());
    verify(mockRepository).findById("123");
}
```

### 3. 测试独立性

- **每个测试必须独立**：测试之间不能有依赖关系，可以以任何顺序运行
- **使用 `@BeforeEach` 和 `@AfterEach`**：设置和清理测试环境
- **避免共享状态**：不要在测试类中使用静态变量或实例变量来共享状态

```java
class UserServiceTest {
    private UserService userService;
    private UserRepository mockRepository;
    
    @BeforeEach
    void setUp() {
        mockRepository = mock(UserRepository.class);
        userService = new UserService(mockRepository);
    }
    
    @AfterEach
    void tearDown() {
        // 清理资源（如果需要）
    }
}
```

### 4. Mock和Stub的使用

- **使用Mockito**：对外部依赖进行mock
- **验证交互**：使用 `verify()` 验证方法调用
- **Stub返回值**：使用 `when().thenReturn()` 设置返回值
- **避免过度mock**：只mock必要的依赖，不要mock被测试的类本身

```java
@Test
void testCreateUser() {
    // Arrange
    UserRepository mockRepository = mock(UserRepository.class);
    UserService userService = new UserService(mockRepository);
    User newUser = new User("123", "John");
    when(mockRepository.save(any(User.class))).thenReturn(newUser);
    
    // Act
    User result = userService.createUser(newUser);
    
    // Assert
    assertNotNull(result);
    assertEquals("123", result.getId());
    verify(mockRepository).save(newUser);
}
```

### 5. 异常测试

- **测试异常情况**：使用 `assertThrows()` 验证异常抛出
- **验证异常消息**：检查异常消息是否符合预期

```java
@Test
void testGetUserById_WhenIdIsNull_ThrowsException() {
    // Arrange
    UserService userService = new UserService(mockRepository);
    
    // Act & Assert
    IllegalArgumentException exception = assertThrows(
        IllegalArgumentException.class,
        () -> userService.getUserById(null)
    );
    assertEquals("User ID cannot be null", exception.getMessage());
}
```

### 6. 边界条件测试

- **空值测试**：测试 `null`、空字符串、空集合等
- **边界值测试**：测试最小值、最大值、临界值
- **极端情况**：测试大量数据、超时情况等

```java
@Test
void testCalculateTotal_WithEmptyList_ReturnsZero() {
    // 测试空集合
}

@Test
void testCalculateTotal_WithNullList_ThrowsException() {
    // 测试null值
}

@Test
void testCalculateTotal_WithMaxValue_HandlesCorrectly() {
    // 测试边界值
}
```

## 🔍 代码审查检查清单

在生成或修改代码时，必须检查以下事项：

### ✅ 生成代码前

1. **查找相关测试文件**
   ```bash
   # 如果修改 UserService.java
   # 检查是否存在 UserServiceTest.java
   ```

2. **理解现有测试**
   - 阅读相关测试文件，了解测试覆盖的场景
   - 识别可能受影响的测试用例

3. **评估影响范围**
   - 确定修改是否会影响公共API
   - 确定是否需要更新测试用例

### ✅ 生成代码时

1. **保持API兼容性**
   - 如果必须修改方法签名，确保提供重载方法或保持向后兼容
   - 使用 `@Deprecated` 标记即将废弃的方法

2. **提高可测试性**
   - 使用依赖注入而不是硬编码依赖
   - 将复杂逻辑拆分为可测试的小方法
   - 避免在业务逻辑中直接实例化外部依赖

3. **编写测试用例**
   - 为新功能编写对应的测试用例
   - 确保测试覆盖正常路径和异常路径

### ✅ 生成代码后

1. **运行现有测试**
   ```bash
   # 运行所有测试
   mvn test
   
   # 或运行特定测试类
   mvn test -Dtest=UserServiceTest
   ```

2. **验证测试通过率**
   - 确保所有现有测试通过
   - 确保新添加的测试通过
   - 检查测试覆盖率是否达标

3. **代码审查**
   - 检查代码是否符合可测试性原则
   - 检查测试用例是否充分

## 🚫 禁止的做法

### ❌ 破坏测试的行为

1. **不要删除或修改测试方法**，除非明确要求
2. **不要修改测试的预期行为**，除非业务逻辑确实需要改变
3. **不要忽略测试失败**，必须修复导致测试失败的代码
4. **不要跳过测试**，除非有特殊原因（需要添加 `@Disabled` 并说明原因）

### ❌ 降低可测试性的做法

1. **避免硬编码依赖**
   ```java
   // ❌ 不好的做法
   public class UserService {
       private UserRepository repository = new UserRepositoryImpl();
   }
   
   // ✅ 好的做法
   public class UserService {
       private final UserRepository repository;
       
       public UserService(UserRepository repository) {
           this.repository = repository;
       }
   }
   ```

2. **避免使用静态方法进行业务逻辑**
   ```java
   // ❌ 难以测试
   public static User getUser(String id) {
       return UserRepository.getInstance().findById(id);
   }
   
   // ✅ 可测试
   public User getUser(String id) {
       return repository.findById(id);
   }
   ```

3. **避免在构造函数中执行复杂逻辑**
   ```java
   // ❌ 难以测试
   public class UserService {
       public UserService() {
           this.repository = new UserRepositoryImpl();
           this.cache = new CacheManager().init();
           // 复杂的初始化逻辑
       }
   }
   
   // ✅ 可测试
   public class UserService {
       public UserService(UserRepository repository, CacheManager cache) {
           this.repository = repository;
           this.cache = cache;
       }
   }
   ```

## 📊 测试覆盖率目标

- **新代码覆盖率**：≥ 70%
- **关键业务逻辑覆盖率**：≥ 90%
- **工具类覆盖率**：≥ 80%
- **边界条件和异常处理**：必须100%覆盖

## 🛠️ 工具和框架

### 推荐使用的测试框架

- **JUnit 5**：单元测试框架
- **Mockito**：Mock框架
- **AssertJ**：流畅的断言库（可选）
- **Testcontainers**：集成测试（数据库、消息队列等）
- **Spring Boot Test**：Spring应用测试支持

### 测试工具命令

```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserServiceTest

# 运行特定测试方法
mvn test -Dtest=UserServiceTest#testGetUserById

# 生成测试覆盖率报告
mvn test jacoco:report

# 查看覆盖率报告
# 报告位置：target/site/jacoco/index.html
```

## 📝 示例：完整的测试类

```java
package com.oppo.columbus.cooperation.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("用户服务单元测试")
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @BeforeEach
    void setUp() {
        // 如果需要，可以在这里设置通用的mock行为
    }
    
    @Test
    @DisplayName("当用户存在时，应该返回用户信息")
    void testGetUserById_WhenUserExists_ReturnsUser() {
        // Arrange
        String userId = "123";
        User expectedUser = new User(userId, "John");
        when(userRepository.findById(userId)).thenReturn(expectedUser);
        
        // Act
        User result = userService.getUserById(userId);
        
        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("John", result.getName());
        verify(userRepository, times(1)).findById(userId);
    }
    
    @Test
    @DisplayName("当用户不存在时，应该返回null")
    void testGetUserById_WhenUserNotExists_ReturnsNull() {
        // Arrange
        String userId = "999";
        when(userRepository.findById(userId)).thenReturn(null);
        
        // Act
        User result = userService.getUserById(userId);
        
        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findById(userId);
    }
    
    @Test
    @DisplayName("当用户ID为null时，应该抛出异常")
    void testGetUserById_WhenIdIsNull_ThrowsException() {
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.getUserById(null)
        );
        assertEquals("User ID cannot be null", exception.getMessage());
        verify(userRepository, never()).findById(any());
    }
}
```

## ⚠️ 重要提醒

1. **每次代码修改后，必须运行相关测试确保通过**
2. **如果测试失败，优先修复代码而不是修改测试（除非测试本身有问题）**
3. **新功能必须包含对应的测试用例**
4. **保持测试代码的质量，测试代码也是代码，需要遵循相同的编码规范**

---

**记住：好的测试是代码质量的保障，也是重构的信心来源。编写可测试的代码和充分的测试用例，是每个开发者的责任。**
