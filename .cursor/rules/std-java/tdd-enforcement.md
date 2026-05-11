---
alwaysApply: false
description: TDD 强制执行规则（Java 服务端）- 当用户要求编写功能代码、修复 Bug、重构代码，或涉及金额/权限/安全等核心逻辑时使用
---

# TDD 执行规则 - Java 服务端

> **AI 须知**：执行前先读取项目代码，识别实际使用的框架、测试工具，并自动适配对应的测试写法

---

## 适用场景速查

### 快速判断

| 判断条件 | 结论 |
|---------|------|
| 用户标记 `[tdd]`/`[TDD]`/`[测试驱动]` | ✅ 强制 TDD |
| 用户标记 `[skip-test]`/`[跳过单测]` | ❌ 跳过 |
| 涉及**金额/权限/安全** | ✅ 强制 TDD |
| 复杂度评分 **≥3 分** | ✅ 必须 TDD |
| 公共/共享模块 | 🟡 建议 TDD |
| 其他情况 | ⚪ 可跳过（需告知用户） |

### 复杂度评分（≥3 分必须 TDD）

| 评分项 | 条件 | 得分 |
|-------|------|------|
| 代码规模 | > 50 行 | +1 |
| 分支逻辑 | if/switch ≥ 3 个 | +1 |
| 循环嵌套 | 嵌套循环或递归 | +1 |
| 状态管理 | 状态机或复杂状态变更 | +2 |
| Bug 修复 | 修复已知 Bug | +2 |
| 重构任务 | 重构现有代码 | +2 |
| 事务逻辑 | 涉及 @Transactional | +1 |

### 场景速查表

| 代码类型 | TDD？ | 代码类型 | TDD？ |
|---------|------|---------|------|
| 订单金额计算 | ✅✅ 必须 | 配置类 | ❌ 别用 |
| 权限校验 | ✅✅ 必须 | 一次性脚本 | ❌ 别用 |
| 状态机/工作流 | ✅✅ 必须 | 探索性原型 | ❌ 别用 |
| Service 业务逻辑 | ✅ 用 | 简单 CRUD | ⚖️ 看情况 |
| Bug 修复 | ✅ 用 | Entity/DTO 定义 | ❌ 别用 |

---

## 项目识别（AI 必须执行）

在生成测试前，**必须**读取以下文件识别框架：

| 文件 | 识别内容 |
|-----|---------|
| `pom.xml` / `build.gradle` | 测试框架（junit-jupiter/junit/testng）、Mock 工具（mockito）、断言库（assertj） |
| `src/test/java/**/*Test.java` | 现有测试代码风格 |

### 框架适配

| 框架 | 单元测试 | 集成测试 |
|-----|---------|---------|
| **Spring Boot** | `@ExtendWith(MockitoExtension.class)` | `@SpringBootTest` |
| **Quarkus** | `@QuarkusTest` + `@InjectMock` | `@QuarkusTest` + RestAssured |
| **纯 Java** | 标准 JUnit + Mockito | 无框架依赖 |

---

## TDD 执行流程

### Red-Green-Refactor 循环

#### 🔴 RED 阶段
1. 从清单取待测用例（P0→P1→P2）
2. 编写**一个**测试用例
3. 运行测试，确认**失败**
> 禁止编写任何实现代码

#### 🟢 GREEN 阶段
4. 编写最小实现代码（只让测试通过）
5. 运行测试，确认**通过**
> 禁止添加测试未覆盖的功能

#### 🔵 REFACTOR 阶段
6. 优化代码结构（消除重复、改善命名）
7. 运行测试，确认**仍通过**
> 禁止改变代码行为

#### 🔄 循环
8. 更新清单状态：⏳ → ✅
9. 取下一个用例，回到步骤 1

---

## 单测清单规范

```markdown
## 📋 单测清单 - [功能名称]

**模块**：[模块路径]
**复杂度**：[X 分] → [✅必须/🟡建议/⚪可跳过]

| # | 测试用例 | 状态 | 优先级 | 类型 |
|---|---------|------|-------|-----|
| 1 | [描述] | ⏳ | P0 | 正常 |
| 2 | [描述] | ⏳ | P1 | 边界 |

**进度**：0/X (0%) ⏸️ 请确认后开始
```

---

## 测试规范

### 覆盖范围（四类场景必测）

| 类型 | 说明 |
|-----|------|
| 正常路径 | 标准输入的预期行为 |
| 边界条件 | 临界值、最大/最小值、空集合 |
| 异常处理 | 非法输入、业务规则违反 |
| 空值场景 | null、空字符串、空集合 |

### FIRST 原则

| 原则 | 要求 |
|-----|------|
| **F**ast | 毫秒级完成，Mock 外部 IO |
| **I**ndependent | 测试间无依赖 |
| **R**epeatable | 任何环境结果一致 |
| **S**elf-validating | 只有通过/失败 |
| **T**imely | 先写测试后写实现 |

### Mock 原则

| 场景 | Mock？ |
|-----|-------|
| 数据库访问 | ✅ Mock |
| 外部 HTTP 调用 | ✅ Mock |
| 时间相关 | ✅ `Clock.fixed()` |
| 私有方法 | ❌ 测试公开接口 |

### 测试结构（Given-When-Then）

```java
@Test
void methodName_Should_ExpectedBehavior_When_Condition() {
    // Given: 准备测试数据和 Mock 行为
    when(userRepository.findById(1L)).thenReturn(Optional.of(user));
    
    // When: 执行被测方法
    User result = userService.getUserById(1L);
    
    // Then: 验证结果和交互
    assertThat(result.getEmail()).isEqualTo("test@example.com");
    verify(userRepository).findById(1L);
}
```

### 断言最佳实践（推荐 AssertJ）

```java
// 集合断言
assertThat(users).hasSize(2).extracting(User::getName).containsExactly("张三", "李四");

// 异常断言
assertThatThrownBy(() -> service.process())
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("参数错误");
```

---

## 禁止行为（红线）

| 禁止 | 原因 |
|-----|------|
| 复杂任务跳过测试 | 违背 TDD 原则 |
| 跳过时不告知用户 | 用户应有选择权 |
| 未确认就写测试 | 可能覆盖不完整 |
| 修改测试迁就实现 | 测试应验证需求 |
| 未读取项目文件直接生成测试 | 可能与项目风格不一致 |

---

## 输出格式

### 豁免说明（跳过时）

```
💡 复杂度评估：【简单】(X分)
原因：[具体原因]
建议跳过单测。如需覆盖，请告知。
```

### TDD 执行报告（完成时）

```markdown
## TDD 执行报告

| # | 测试用例 | 状态 | 类型 |
|---|---------|------|-----|
| 1 | [描述] | ✅ | 正常 |

**结果**：X/X 通过
```

---

## 用户控制标记

| 标记 | 效果 |
|-----|------|
| `[tdd]` `[TDD]` | 强制 TDD |
| `[skip-test]` | 跳过单测 |
| `[auto-confirm]` | 跳过确认环节 |
