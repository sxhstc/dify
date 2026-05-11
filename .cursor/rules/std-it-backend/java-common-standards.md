---
description: 中心级Java公共编码规范 - 所有Java项目必须遵循的基础规范
globs: "**/*.java"
alwaysApply: true
---

# 中心级 Java 公共编码规范

本规范汇集了流程IT中心各项目组的Java编码最佳实践，是所有Java项目必须遵循的基础规范。

## 1. 代码格式规范

### 1.1 基本格式
- **缩进**: 使用4个空格，禁止使用Tab
- **编码**: UTF-8
- **换行**: Unix风格（LF）
- **行宽**: 最大120字符
- **文件结尾**: 保留一个空行

### 1.2 空格规则
```java
// ✅ 正确：运算符两侧添加空格
int sum = a + b;

// ❌ 错误
int sum=a+b;

// ✅ 正确：逗号后添加空格
method(param1, param2, param3);

// ❌ 错误
method(param1,param2,param3);

// ✅ 正确：关键字与括号之间添加空格
if (condition) {
    doSomething();
}

// ❌ 错误
if(condition){
    doSomething();
}
```

### 1.3 大括号规则
```java
// ✅ 正确：左大括号不换行
if (condition) {
    doSomething();
} else {
    doOtherThing();
}

// ❌ 错误：K&R风格以外的大括号格式
if (condition) 
{
    doSomething();
}
```

### 1.4 导入语句
- **禁止使用通配符**: 不使用 `import java.util.*`
- **顺序**: Java标准库 → 第三方库 → 项目内部类
- **分组**: 不同分组之间空一行

```java
import java.util.List;
import java.util.Date;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import com.oppo.project.service.UserService;
```

## 2. 命名规范

### 2.1 基本规则

| 类型 | 规则 | 示例 |
|------|------|------|
| 类名 | 大驼峰命名法(PascalCase) | `UserService`, `OrderController` |
| 方法名 | 小驼峰命名法(camelCase) | `getUserById()`, `saveOrder()` |
| 变量名 | 小驼峰命名法(camelCase) | `userName`, `orderCount` |
| 常量 | 全大写下划线分隔 | `MAX_PAGE_SIZE`, `DEFAULT_TIMEOUT` |
| 包名 | 全小写，点分隔 | `com.oppo.project.service` |

### 2.2 类命名约定

| 类型 | 命名规范 | 示例 |
|------|---------|------|
| Controller | `XxxController` | `UserController` |
| Service接口 | `XxxService` 或 `IXxxService` | `UserService`, `IUserService` |
| Service实现 | `XxxServiceImpl` | `UserServiceImpl` |
| Mapper/DAO | `XxxMapper` | `UserMapper` |
| 持久化对象 | `XxxPO` 或 `XxxEntity` | `UserPO`, `UserEntity` |
| 视图对象 | `XxxVO` | `UserVO` |
| 数据传输对象 | `XxxDTO` | `UserDTO` |
| 查询对象 | `XxxQuery` | `UserQuery` |
| 表单对象 | `XxxForm` | `UserSaveForm` |
| 枚举类 | `XxxEnum` | `UserStatusEnum` |
| 常量类 | `XxxConstant` 或 `XxxConstants` | `AppConstant` |
| 工具类 | `XxxUtil` 或 `XxxUtils` | `DateUtil`, `StringUtils` |
| 异常类 | `XxxException` | `ServiceException` |
| 配置类 | `XxxConfig` | `RedisConfig` |

### 2.3 方法命名约定

| 操作类型 | 命名规范 | 示例 |
|---------|---------|------|
| 获取单个对象 | `get`/`find` + 名词 | `getUser()`, `findById()` |
| 获取多个对象 | `list`/`query` + 名词 | `listUsers()`, `queryByCondition()` |
| 分页查询 | `page` + 名词 | `pageList()`, `pageQuery()` |
| 保存/新增 | `save`/`insert`/`add` | `saveUser()`, `insertRecord()` |
| 更新 | `update`/`modify` | `updateUser()`, `modifyStatus()` |
| 删除 | `delete`/`remove` | `deleteUser()`, `removeById()` |
| 批量操作 | `batch` + 动词 | `batchSave()`, `batchDelete()` |
| 布尔判断 | `is`/`has`/`can` | `isValid()`, `hasPermission()` |
| 数据校验 | `validate`/`check` | `validateUser()`, `checkParams()` |
| 数据转换 | `convert`/`to` | `convertToVO()`, `toDTO()` |

### 2.4 变量命名约定

| 变量类型 | 命名规范 | 示例 |
|---------|---------|------|
| 集合类型 | 复数形式或带List/Map后缀 | `users`, `userList`, `userMap` |
| 布尔类型 | `is`/`has`/`can`/`should` 开头 | `isValid`, `hasPermission` |
| 日期时间 | 带Date/Time后缀 | `createDate`, `updateTime` |
| 数量 | 带Count/Size后缀 | `userCount`, `pageSize` |

## 3. 注释规范

### 3.1 类注释（强制）
```java
/**
 * 类功能描述
 * 
 * @author 作者姓名
 * @since 版本号 或 @date YYYY-MM-DD
 */
public class UserService {
    // 类实现
}
```

### 3.2 方法注释（public方法强制）
```java
/**
 * 方法功能描述
 * 
 * @param userId 用户ID，不能为空
 * @return 用户信息，不存在返回null
 * @throws ServiceException 当用户不存在时抛出
 */
public UserVO getUserById(Long userId) {
    // 方法实现
}
```

### 3.3 字段注释
```java
// POJO类字段使用Swagger注解
@ApiModelProperty("用户名")
private String userName;

// 常量字段使用行注释或块注释
/** 最大重试次数 */
private static final int MAX_RETRY_COUNT = 3;
```

### 3.4 注释原则
- **保持同步**: 注释必须与代码同步更新
- **使用中文**: 注释统一使用中文，便于团队理解
- **解释原因**: 注释应解释"为什么"，而不仅仅是"是什么"
- **避免冗余**: 不写显而易见的注释

## 4. 分层架构规范

### 4.1 标准分层结构
```
Controller层 (Web层)
    ↓ 接收请求、参数校验、调用Service、返回响应
Service层 (业务逻辑层)
    ↓ 业务逻辑处理、事务管理、数据组装
Mapper层 (数据访问层)
    ↓ 数据库CRUD操作
数据库
```

### 4.2 Controller层规范
```java
@RestController
@RequestMapping("/api/v1/user")
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // ✅ 正确：Controller只负责接收请求和返回响应
    @PostMapping("/save")
    public Result<Boolean> save(@RequestBody @Validated UserSaveForm form) {
        return Result.success(userService.save(form));
    }
    
    // ❌ 错误：Controller中编写业务逻辑
    @PostMapping("/save")
    public Result<Boolean> save(@RequestBody UserSaveForm form) {
        // 不要在Controller中写业务逻辑
        if (userMapper.selectByName(form.getName()) != null) {
            throw new ServiceException("用户已存在");
        }
        userMapper.insert(convertToEntity(form));
        return Result.success(true);
    }
}
```

### 4.3 Service层规范
```java
public interface UserService {
    UserVO getDetail(Long userId);
    boolean save(UserSaveForm form);
}

@Slf4j
@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserVO getDetail(Long userId) {
        log.info("查询用户详情, userId: {}", userId);
        UserPO userPO = userMapper.selectById(userId);
        return convertToVO(userPO);
    }
    
    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean save(UserSaveForm form) {
        log.info("保存用户信息, form: {}", form);
        UserPO userPO = convertToPO(form);
        return userMapper.insert(userPO) > 0;
    }
}
```

### 4.4 Mapper层规范
```java
@Mapper
public interface UserMapper extends BaseMapper<UserPO> {
    
    /**
     * 根据条件查询用户列表
     * 
     * @param query 查询条件
     * @return 用户列表
     */
    List<UserPO> selectByCondition(UserQuery query);
}
```

## 5. 异常处理规范

### 5.1 异常分类
- **业务异常**: 可预期的业务错误，使用自定义业务异常
- **系统异常**: 不可预期的技术异常

### 5.2 异常处理原则
```java
// ✅ 正确：抛出具体的业务异常
public UserVO getUser(Long userId) {
    UserPO user = userMapper.selectById(userId);
    if (user == null) {
        throw new ServiceException("USER_NOT_FOUND", "用户不存在");
    }
    return convertToVO(user);
}

// ❌ 错误：捕获异常后不处理
public UserVO getUser(Long userId) {
    try {
        return userService.getUser(userId);
    } catch (Exception e) {
        // 禁止吞掉异常
        return null;
    }
}

// ✅ 正确：捕获异常并记录日志
public UserVO getUser(Long userId) {
    try {
        return userService.getUser(userId);
    } catch (Exception e) {
        log.error("查询用户失败, userId: {}", userId, e);
        throw new ServiceException("查询用户失败", e);
    }
}
```

### 5.3 异常使用规范
- Controller层不处理异常，由全局异常处理器统一处理
- Service层抛出业务异常，不捕获异常（除非需要特殊处理）
- 使用`try-with-resources`确保资源正确释放

## 6. 日志规范

### 6.1 日志框架
使用SLF4J + Logback，通过`@Slf4j`注解引入日志对象

### 6.2 日志级别

| 级别 | 使用场景 |
|------|---------|
| **ERROR** | 系统错误，需要立即关注和处理 |
| **WARN** | 警告信息，潜在问题但不影响系统运行 |
| **INFO** | 重要业务流程节点，关键操作记录 |
| **DEBUG** | 调试信息，开发环境使用 |

### 6.3 日志格式
```java
// ✅ 正确：使用占位符
log.info("用户登录成功, userId: {}, userName: {}", userId, userName);

// ❌ 错误：字符串拼接
log.info("用户登录成功, userId: " + userId + ", userName: " + userName);

// ✅ 正确：异常日志包含堆栈信息
log.error("处理用户数据失败, userId: {}", userId, e);

// ❌ 错误：只打印异常消息
log.error("处理用户数据失败: " + e.getMessage());
```

### 6.4 日志禁忌
- **禁止**: 使用`System.out.println()`
- **禁止**: 打印敏感信息（密码、身份证号、银行卡号、用户token等）
- **禁止**: 在循环中大量打印日志
- **禁止**: 生产环境使用DEBUG级别

## 7. 数据库操作规范

### 7.1 ORM框架
推荐使用MyBatis-Plus，继承`BaseMapper<T>`获得基础CRUD方法

### 7.2 SQL规范
```java
// ✅ 正确：使用#{}防止SQL注入
@Select("SELECT * FROM t_user WHERE user_name = #{userName}")
UserPO selectByName(@Param("userName") String userName);

// ❌ 错误：使用${}会导致SQL注入
@Select("SELECT * FROM t_user WHERE user_name = '${userName}'")
UserPO selectByName(@Param("userName") String userName);

// ✅ 正确：明确指定字段
SELECT user_id, user_name, email FROM t_user WHERE status = 1

// ❌ 错误：使用SELECT *
SELECT * FROM t_user WHERE status = 1
```

### 7.3 性能优化
```java
// ❌ 错误：在循环中查询数据库（N+1问题）
for (Long userId : userIds) {
    UserPO user = userMapper.selectById(userId);
    // 处理user
}

// ✅ 正确：批量查询
List<UserPO> users = userMapper.selectBatchIds(userIds);
for (UserPO user : users) {
    // 处理user
}
```

### 7.4 事务管理
```java
@Transactional(rollbackFor = Exception.class)
@Override
public boolean saveUser(UserSaveForm form) {
    // 数据库操作
    userMapper.insert(userPO);
    return true;
}

// 只读操作
@Transactional(readOnly = true)
@Override
public UserVO getUser(Long userId) {
    return convertToVO(userMapper.selectById(userId));
}
```

## 8. 空值处理规范

### 8.1 空值检查
```java
// ✅ 正确：使用工具类判空
if (StringUtils.isNotBlank(userName)) {
    // 处理逻辑
}

if (CollectionUtils.isNotEmpty(userList)) {
    userList.forEach(this::process);
}

if (Objects.isNull(user)) {
    throw new ServiceException("用户不存在");
}
```

### 8.2 返回值处理
```java
// ✅ 正确：返回空集合而非null
public List<UserVO> getUsers() {
    List<UserPO> users = userMapper.selectList(null);
    if (CollectionUtils.isEmpty(users)) {
        return Collections.emptyList();
    }
    return users.stream().map(this::convertToVO).collect(Collectors.toList());
}

// ❌ 错误：返回null
public List<UserVO> getUsers() {
    return null;
}
```

### 8.3 Optional使用
```java
// ✅ 正确：使用Optional处理可能为null的返回值
public Optional<UserVO> findUser(Long userId) {
    UserPO user = userMapper.selectById(userId);
    return Optional.ofNullable(user).map(this::convertToVO);
}
```

## 9. 集合操作规范

### 9.1 泛型使用
```java
// ✅ 正确：使用泛型保证类型安全
List<String> names = new ArrayList<>();
Map<String, UserVO> userMap = new HashMap<>();

// ❌ 错误：使用原始类型
List names = new ArrayList();
Map userMap = new HashMap();
```

### 9.2 Stream API
```java
// ✅ 正确：使用Stream API进行集合操作
List<String> activeUserNames = users.stream()
    .filter(user -> user.isActive())
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());
```

### 9.3 初始化容量
```java
// ✅ 正确：已知集合大小时指定初始容量
List<UserVO> userList = new ArrayList<>(users.size());
Map<String, Object> map = new HashMap<>(16);
```

## 10. Lombok使用规范

### 10.1 常用注解
```java
// 实体类
@Data
@TableName("t_user")
public class UserPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String userName;
}

// Service类
@Slf4j
@Service
public class UserServiceImpl implements UserService {
    public void process() {
        log.info("处理用户信息");
    }
}

// 配置属性类
@Data
@ConfigurationProperties(prefix = "app.config")
public class AppConfig {
    private String name;
    private int timeout;
}
```

### 10.2 使用原则
- 实体类和DTO可以使用`@Data`
- 日志统一使用`@Slf4j`
- 构造器注入使用`@RequiredArgsConstructor`

## 11. 代码质量规范

### 11.1 方法和类长度
- 方法代码行数不超过50行
- 类代码行数不超过500行
- 圈复杂度不超过15

### 11.2 避免魔法值
```java
// ❌ 错误：使用魔法值
if (user.getStatus() == 1) {
    // 处理
}

// ✅ 正确：使用枚举或常量
if (user.getStatus() == UserStatusEnum.ACTIVE.getCode()) {
    // 处理
}

// 或
public static final int STATUS_ACTIVE = 1;
if (user.getStatus() == STATUS_ACTIVE) {
    // 处理
}
```

### 11.3 设计原则
- **单一职责原则**: 一个类只负责一个功能领域
- **开闭原则**: 对扩展开放，对修改关闭
- **依赖倒置原则**: 依赖抽象而不是具体实现
- **DRY原则**: 不重复自己，提取公共逻辑
- **KISS原则**: 保持简单

## 12. 安全规范

### 12.1 输入验证
```java
// ✅ 正确：使用参数校验注解
@PostMapping("/save")
public Result<Boolean> save(@RequestBody @Validated UserSaveForm form) {
    return Result.success(userService.save(form));
}

// Form类中添加校验注解
@Data
public class UserSaveForm {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度为2-20个字符")
    private String userName;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
}
```

## 14. 禁止事项

### 14.1 代码禁忌
- ❌ 使用`System.out.println()`输出日志
- ❌ 硬编码敏感信息（密码、密钥等）
- ❌ 忽略异常（空catch块）
- ❌ 使用过时的API
- ❌ 在循环中进行数据库查询或服务调用
- ❌ 直接返回null（应返回空集合或Optional）
- ❌ 在事务中调用外部服务

### 14.2 格式禁忌
- ❌ 使用Tab缩进
- ❌ 使用`import *`通配符导入
- ❌ 超长行不换行
- ❌ 缺少类和方法注释

---

**版本**: v1.0  
**更新日期**: 2025-11-27  
**维护团队**: 流程IT中心
