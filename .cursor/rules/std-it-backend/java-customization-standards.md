---
description: 中心级Java定制化要求规范 - 可根据项目特点进行调整的规范模板
globs: "**/*.java"
alwaysApply: false
---

# 中心级 Java 定制化要求规范

本规范提供了可根据项目特点进行调整的规范模板。各项目组应在遵循《Java公共编码规范》的基础上，根据实际技术栈和业务需求，从以下模板中选择适合的配置。

## 1. 技术栈版本配置

### 1.1 Java版本
根据项目需求选择以下版本之一：

| 版本 | 适用场景 | 特性支持 |
|------|---------|---------|
| **Java 8** | 老项目维护、传统企业应用 | Lambda、Stream API、Optional |
| **Java 11** | 推荐版本、新项目首选 | var关键字、HTTP Client、String新方法 |
| **Java 17** | 最新LTS版本 | Records、Sealed Classes、Pattern Matching |

### 1.2 Spring Boot版本

| 版本 | Java要求 | 适用场景 |
|------|---------|---------|
| **Spring Boot 2.3.x** | Java 8+ | 老项目维护 |
| **Spring Boot 2.5.x** | Java 8+ | 稳定版本 |
| **Spring Boot 2.7.x** | Java 8+ | 推荐版本 |
| **Spring Boot 3.x** | Java 17+ | 新项目/升级项目 |

### 1.3 数据库选型

| 数据库 | 使用场景 | 注意事项 |
|--------|---------|---------|
| **MySQL 8.0** | 通用业务系统 | 默认使用InnoDB引擎 |
| **Oracle 11g/19c** | 企业级应用、MES系统 | 注意SQL方言差异 |
| **OceanBase** | 高并发分布式场景 | 兼容MySQL协议 |
| **PostgreSQL** | 复杂数据类型场景 | JSON支持较好 |

## 2. 框架特定注解配置

### 2.1 Controller层注解模板

**模板A：GCommon框架（推荐）**
```java
@GCommonAPI(tag = "模块名称", description = "模块描述")
@GCommonLog
@UserAuthorization  // 需要权限控制时添加
public class UserController {
    
    @ApiOperation(value = "接口描述")
    @PostMapping("/api/v2/user/list")
    public PageResultVO<UserVO> list(@RequestBody UserQuery query) {
        return userService.pageList(query);
    }
}
```

**模板B：标准Spring MVC**
```java
@RestController
@RequestMapping("/api/v1/user")
@Api(tags = "用户管理")
public class UserController {
    
    @ApiOperation(value = "接口描述")
    @PostMapping("/list")
    public Result<PageResult<UserVO>> list(@RequestBody UserQuery query) {
        return Result.success(userService.pageList(query));
    }
}
```

**模板C：HZero框架**
```java
@RestController("userController.v1")
@RequestMapping("/v1")
@Api(tags = SwaggerApiConfig.USER_MODULE)
public class UserController extends BaseController {
    
    @Permission(level = ResourceLevel.ORGANIZATION)
    @ApiOperation(value = "接口描述")
    @GetMapping("/{organizationId}/users")
    @ProcessLovValue
    public ResponseEntity<Page<UserVO>> list(@PathVariable Long organizationId,
                                             UserQuery query,
                                             PageRequest pageRequest) {
        return Results.success(userService.pageList(organizationId, query, pageRequest));
    }
}
```

### 2.2 开放接口注解

**对外开放接口（第三方调用）**
```java
// 模式A：GCommon框架
@GCommonAPI(value = "/openapi/v1/user", tag = "用户开放接口")
@GCommonResponseBody(enabled = false)
public class UserOpenApiController {
    // 接口实现
}

// 模式B：AppAuthorization
@AppAuthorization
@Controller
@RequestMapping(value = "/openapi/userController", produces = {"application/json;charset=UTF-8"})
public class UserOpenApiController {
    // 接口实现
}
```

### 2.3 数据源注解

**单数据源**
```java
@Service
public class UserServiceImpl implements UserService {
    // 默认数据源
}
```

**多数据源（动态切换）**
```java
// MyBatis-Plus多数据源
@DS("master")  // 主库
public class WriteServiceImpl {
}

@DS("slave")   // 从库
public class ReadServiceImpl {
}

// 支持多数据源的事务
@DSTransactional
public void saveWithTransaction() {
}
```

## 3. 返回值封装模板

### 3.1 统一返回格式模板

**模板A：ResultVO（GCommon框架）**
```java
@Data
public class ResultVO<T> {
    private String code;      // 状态码，"0"表示成功
    private String msg;       // 消息
    private T data;           // 数据
}

// 使用示例
public ResultVO<UserVO> getUser(Long userId) {
    ResultVO<UserVO> result = new ResultVO<>();
    result.setCode("0");
    result.setMsg("ok");
    result.setData(userService.getDetail(userId));
    return result;
}
```

**模板B：Result（通用）**
```java
@Data
public class Result<T> {
    private int code;         // 状态码，200表示成功
    private String message;   // 消息
    private T data;           // 数据
    
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        return result;
    }
    
    public static <T> Result<T> fail(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }
}
```

**模板C：ResponseEntity（HZero框架）**
```java
public ResponseEntity<UserVO> getUser(Long userId) {
    return Results.success(userService.getDetail(userId));
}
```

### 3.2 分页返回格式

**模板A：PageResultVO**
```java
@Data
public class PageResultVO<T> {
    private Long total;       // 总记录数
    private List<T> rows;     // 数据列表
}
```

**模板B：PageResult**
```java
@Data
public class PageResult<T> {
    private Long total;       // 总记录数
    private Integer pageNum;  // 当前页码
    private Integer pageSize; // 每页大小
    private List<T> list;     // 数据列表
}
```

**模板C：IPage（MyBatis-Plus）**
```java
public IPage<UserVO> pageList(UserQuery query) {
    Page<UserPO> page = new Page<>(query.getPageNum(), query.getPageSize());
    return userMapper.selectPage(page, buildWrapper(query))
                     .convert(this::convertToVO);
}
```

## 4. 异常处理模板

### 4.1 业务异常类模板

**模板A：ServiceException（枚举错误码）**
```java
public class ServiceException extends RuntimeException {
    private String code;
    private String message;
    
    public ServiceException(IErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
        this.message = errorCode.getMessage();
    }
    
    public ServiceException(IErrorCode errorCode, Object... args) {
        super(String.format(errorCode.getMessage(), args));
        this.code = errorCode.getCode();
        this.message = String.format(errorCode.getMessage(), args);
    }
}

// 错误码枚举
public enum UserErrorCodeEnum implements IErrorCode {
    USER_NOT_FOUND("USER_001", "用户不存在"),
    USER_ALREADY_EXISTS("USER_002", "用户已存在"),
    USER_NAME_INVALID("USER_003", "用户名格式不正确");
    
    private final String code;
    private final String message;
}
```

**模板B：BizException（简单异常）**
```java
public class BizException extends RuntimeException {
    private int code;
    private String message;
    
    public BizException(String message) {
        super(message);
        this.code = 500;
        this.message = message;
    }
    
    public BizException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
```

### 4.2 全局异常处理模板

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // 业务异常处理
    @ExceptionHandler(ServiceException.class)
    public Result<Void> handleServiceException(ServiceException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }
    
    // 参数校验异常处理
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().stream()
            .map(ObjectError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return Result.fail("PARAM_ERROR", message);
    }
    
    // 系统异常处理
    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail("SYSTEM_ERROR", "系统繁忙，请稍后重试");
    }
}
```

## 5. 日志记录模板

### 5.1 基础日志（@Slf4j）
```java
@Slf4j
@Service
public class UserServiceImpl implements UserService {
    
    public UserVO getUser(Long userId) {
        log.info("查询用户开始, userId: {}", userId);
        
        UserPO user = userMapper.selectById(userId);
        if (user == null) {
            log.warn("用户不存在, userId: {}", userId);
            throw new ServiceException(UserErrorCodeEnum.USER_NOT_FOUND);
        }
        
        log.info("查询用户成功, userId: {}, userName: {}", userId, user.getUserName());
        return convertToVO(user);
    }
}
```

### 5.2 业务日志（LogComponent）
适用于需要记录完整调用链路的场景：

```java
@Service
@Slf4j
public class OrderServiceImpl implements OrderService {
    
    @Autowired
    private LogComponent logComponent;
    
    public void createOrder(OrderDTO orderDTO) {
        String traceId = IDGenerator.getLocalUuid();
        
        // 开始日志
        logComponent.startLog(traceId, "WMS", "订单创建", 
            "/api/order/create", "API", 
            "创建订单", new String[]{orderDTO.getOrderNo()});
        
        try {
            // 记录请求参数
            logComponent.recordDocLog(traceId, JSON.toJSONString(orderDTO), 
                "请求参数", "INFO", "2");
            
            // 业务处理
            doCreateOrder(orderDTO);
            
            // 更新日志状态为成功
            logComponent.updateLogStatus(traceId, "2", "订单创建成功");
            
        } catch (ServiceException e) {
            // 业务异常，状态为4
            logComponent.updateLogStatus(traceId, "4", e.getMessage());
            throw e;
        } catch (Exception e) {
            // 系统异常，状态为3
            log.error("订单创建失败", e);
            logComponent.updateLogStatus(traceId, "3", e.getMessage());
            throw new ServiceException("订单创建失败");
        }
    }
}
```

## 6. 国际化支持模板

### 6.1 错误码国际化

**国际化文件结构**
```
src/main/resources/i18n/
├── messages.properties          # 默认配置（中文）
├── messages_zh_CN.properties    # 中文配置
└── messages_en_US.properties    # 英文配置
```

**配置内容示例**
```properties
# messages_zh_CN.properties
USER_001=用户不存在
USER_002=用户已存在
USER_003=用户名格式不正确，请输入2-20个字符

# messages_en_US.properties
USER_001=User not found
USER_002=User already exists
USER_003=Invalid username format, please enter 2-20 characters
```

**使用示例**
```java
// 获取国际化消息
String message = LocalMessageUtil.getMessage("USER_001");
throw new ServiceException("USER_001", message);

// 带参数的国际化消息
String message = LocalMessageUtil.getMessage("USER_INVALID", "单号%s不存在", orderNo);
throw new ServiceException(message);
```

## 7. 包结构模板

### 7.1 标准三层架构（推荐）
```
com.oppo.{project}
├── controller/         # 控制器层
│   └── UserController.java
├── service/           # 服务接口层
│   └── UserService.java
├── service.impl/      # 服务实现层
│   └── UserServiceImpl.java
├── mapper/            # 数据访问层
│   └── UserMapper.java
├── pojo/              # 数据对象
│   ├── po/           # 持久化对象
│   ├── vo/           # 视图对象
│   ├── dto/          # 数据传输对象
│   ├── query/        # 查询对象
│   └── form/         # 表单对象
├── config/            # 配置类
├── common/            # 公共组件
│   ├── constant/     # 常量
│   ├── enums/        # 枚举
│   ├── exception/    # 异常
│   └── util/         # 工具类
└── Application.java   # 启动类
```

### 7.2 DDD分层架构
```
com.oppo.{project}.{module}
├── interfaces/                # 用户接口层
│   ├── controller/           # REST控制器
│   ├── vo/                   # 视图对象
│   ├── validator/            # 参数验证器
│   ├── convert/              # VO/DTO转换器
│   └── rpc/                  # RPC接口
├── application/              # 应用服务层
│   ├── service/              # 应用服务接口
│   ├── service.impl/         # 应用服务实现
│   └── bo/                   # 业务对象
├── domain/                   # 领域层
│   ├── entity/               # 领域实体
│   ├── repository/           # 仓储接口
│   ├── service/              # 领域服务
│   └── vo/                   # 值对象
└── infrastructure/           # 基础设施层
    ├── repository.impl/      # 仓储实现
    ├── mapper/               # MyBatis Mapper
    ├── po/                   # 持久化对象
    └── config/               # 配置类
```

### 7.3 微服务多模块架构
```
{project}-parent/
├── {project}-api/             # API接口定义模块
│   ├── dto/                   # DTO定义
│   ├── vo/                    # VO定义
│   ├── enums/                 # 枚举定义
│   └── api/                   # Feign接口定义
├── {project}-core/            # 核心业务模块
│   ├── service/               # 服务层
│   ├── repository/            # 数据访问层
│   └── entity/                # 实体类
├── {project}-client/          # Feign客户端模块
│   └── client/                # Feign客户端实现
└── {project}-server/          # 服务启动模块
    ├── controller/            # 控制器层
    ├── config/                # 配置类
    └── Application.java       # 启动类
```

## 8. API设计模板

### 8.1 RESTful URL设计

**URL路径规范**
```
# Web接口前缀
/api/v{version}/{module}

# 开放接口前缀
/openapi/v{version}/{module}

# RPC接口前缀（内部调用）
/rpc/v{version}/{module}
```

**操作映射**
```
GET    /api/v1/users              # 获取用户列表
GET    /api/v1/users/{id}         # 获取用户详情
POST   /api/v1/users              # 创建用户
PUT    /api/v1/users/{id}         # 更新用户
DELETE /api/v1/users/{id}         # 删除用户
POST   /api/v1/users/batch-delete # 批量删除
POST   /api/v1/users/export       # 导出
POST   /api/v1/users/import       # 导入
```

### 8.2 分页参数规范

**查询字符串传递（推荐）**
```
POST /api/v1/users/list?pageIndex=1&pageSize=10
Body: { "userName": "张三", "status": 1 }
```

**请求体传递**
```
POST /api/v1/users/list
Body: { 
    "userName": "张三", 
    "status": 1,
    "pageIndex": 1,
    "pageSize": 10
}
```

## 9. 配置管理模板

### 9.1 配置文件结构
```
src/main/resources/
├── application.yml              # 主配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
├── application-uat.yml          # UAT环境
├── application-prod.yml         # 生产环境
├── mapper/                      # MyBatis XML
└── i18n/                        # 国际化资源
```

### 9.2 配置属性绑定
```java
@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    /** 应用名称 */
    private String name;
    
    /** 超时时间（秒） */
    private int timeout = 30;
    
    /** 是否启用缓存 */
    private boolean cacheEnabled = true;
    
    /** 缓存配置 */
    private CacheConfig cache = new CacheConfig();
    
    @Data
    public static class CacheConfig {
        private int expireTime = 3600;
        private int maxSize = 1000;
    }
}
```

## 10. 缓存策略模板

### 10.1 Redis缓存配置
```java
@Configuration
@EnableCaching
public class RedisConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### 10.2 缓存注解使用
```java
@Service
public class UserServiceImpl implements UserService {
    
    // 查询缓存
    @Cacheable(value = "user", key = "#userId")
    public UserVO getUser(Long userId) {
        return convertToVO(userMapper.selectById(userId));
    }
    
    // 更新缓存
    @CachePut(value = "user", key = "#form.userId")
    public UserVO updateUser(UserUpdateForm form) {
        // 更新逻辑
    }
    
    // 删除缓存
    @CacheEvict(value = "user", key = "#userId")
    public void deleteUser(Long userId) {
        userMapper.deleteById(userId);
    }
}
```

### 10.3 缓存Key规范
```java
// 缓存Key命名规范
// 格式: {业务模块}:{对象类型}:{唯一标识}

// 示例
String userCacheKey = "user:info:" + userId;           // 用户信息
String orderCacheKey = "order:detail:" + orderId;      // 订单详情
String configCacheKey = "system:config:" + configKey;  // 系统配置
```

## 11. 项目定制化检查清单

在项目初始化时，请根据以下清单进行配置选择：

- [ ] **Java版本**: Java 8 / Java 11 / Java 17
- [ ] **Spring Boot版本**: 2.3.x / 2.5.x / 2.7.x / 3.x
- [ ] **数据库类型**: MySQL / Oracle / OceanBase / PostgreSQL
- [ ] **ORM框架**: MyBatis / MyBatis-Plus / JPA
- [ ] **Controller注解风格**: GCommon / 标准Spring MVC / HZero
- [ ] **返回值封装**: ResultVO / Result / ResponseEntity
- [ ] **异常处理**: ServiceException / BizException / 自定义
- [ ] **日志方式**: @Slf4j / LogComponent
- [ ] **包结构**: 标准三层 / DDD分层 / 微服务多模块
- [ ] **国际化支持**: 是 / 否
- [ ] **缓存支持**: Redis / 本地缓存 / 无缓存
- [ ] **API文档**: Swagger / Knife4j / SpringDoc

---

**版本**: v1.0  
**更新日期**: 2025-11-27  
**维护团队**: 流程IT中心

## 附录：各项目组技术栈参考

| 项目组 | Java | Spring Boot | 数据库 | ORM | Controller注解 |
|--------|------|-------------|--------|-----|----------------|
| CHR | 11 | 2.3.4 | MySQL 8.0 | MyBatis-Plus | @GCommonAPI |
| G-FSC | 8 | 2.3.x | MySQL | MyBatis-Plus | @RestController |
| G-FWMS | 8 | 2.x | MySQL/Oracle | MyBatis-Plus | @GCommonAPI |
| G-SWMS | 8 | 2.x | MySQL | MyBatis-Plus | @GCommonAPI |
| G-SRM | 8 | 2.1.2 | MySQL | MyBatis | HZero框架 |
| G-RDP | 11 | 2.x | - | - | @GCommonAPI |
| G-RS | 11 | 2.7.18 | MySQL 8.0 | MyBatis-Plus | @RestController |
| AMES | 8 | - | Oracle | 自定义DBist | @Controller |
| 大数据 | 8/11 | 2.5.6 | MySQL | MyBatis-Plus | @RestController |
| 营销IT | 8 | 2.x | MySQL | MyBatis-Plus | ESA Restlight |
| 行政 | 8 | 2.x | MySQL | MyBatis-Plus | @RestController |
