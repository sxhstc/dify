---
description: Redis Lua 脚本编写规范（Java）- 当用户需要在 Java 项目中编写/优化 Redis Lua 脚本时使用
alwaysApply: false
---

# Redis Lua 脚本编写规范

---

## 核心原则（红线）

| 规则 | 说明 |
|-----|------|
| **KEYS 必须显式传递** | 禁止硬编码 key，否则集群模式下无法正确路由 |
| **所有 KEYS 必须在同一 slot** | 集群模式下多 key 操作必须使用 `{hash_tag}` |
| **脚本必须幂等** | 网络超时可能导致重试，脚本逻辑必须支持重复执行 |
| **禁止长时间阻塞** | Lua 执行期间 Redis 单线程阻塞，禁止大循环/大数据操作 |
| **优先使用 EVALSHA** | 减少网络传输，需处理 NOSCRIPT 降级 |

---

## Lua 脚本基础

### 参数传递

```lua
local key = KEYS[1]
local value = ARGV[1]
local ttl = tonumber(ARGV[2])
redis.call('SET', key, value, 'EX', ttl)
return 'OK'
```

### 返回值类型映射

| Lua 类型 | Java 类型 |
|---------|----------|
| `nil` | `null` |
| `number` | `Long` |
| `string` | `String` / `byte[]` |
| `table (array)` | `List<Object>` |

---

## Java 执行方式

### Spring Data Redis（推荐）

```java
private static final RedisScript<Long> INCR_LIMIT_SCRIPT = new DefaultRedisScript<>(
    """
    local current = tonumber(redis.call('GET', KEYS[1]) or 0)
    if current >= tonumber(ARGV[1]) then return -1 end
    return redis.call('INCR', KEYS[1])
    """, Long.class);

public Long incrWithLimit(String key, long limit) {
    return redisTemplate.execute(INCR_LIMIT_SCRIPT, List.of(key), String.valueOf(limit));
}
```

### OPPOKVClient

```java
private volatile String scriptSha;

public boolean rateLimit(String key, int limit, int window) {
    try {
        if (scriptSha == null) scriptSha = kvClient.scriptLoad(SCRIPT);
        return Long.valueOf(1).equals(kvClient.evalsha(scriptSha, 1, key, String.valueOf(limit), String.valueOf(window)));
    } catch (Exception e) {
        if (e.getMessage() != null && e.getMessage().contains("NOSCRIPT")) {
            scriptSha = null;
            return Long.valueOf(1).equals(kvClient.eval(SCRIPT, 1, key, String.valueOf(limit), String.valueOf(window)));
        }
        throw e;
    }
}
```

---

## 常见场景模板

### 分布式锁

```lua
-- 加锁
local key, owner, ttl = KEYS[1], ARGV[1], tonumber(ARGV[2])
if redis.call('SET', key, owner, 'NX', 'EX', ttl) then return 1 end
return 0

-- 解锁（必须验证持有者）
if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
return 0
```

### 库存扣减

```lua
local stock = redis.call('GET', KEYS[1])
if stock == false then return -1 end
stock = tonumber(stock)
local amount = tonumber(ARGV[1])
if stock < amount then return -2 end
redis.call('SET', KEYS[1], stock - amount)
return stock - amount
```

### 滑动窗口限流

```lua
local key, window, limit, now = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
if redis.call('ZCARD', key) >= limit then return 0 end
redis.call('ZADD', key, now, now .. '-' .. math.random())
redis.call('PEXPIRE', key, window)
return 1
```

### 幂等性检查

```lua
local added = redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', tonumber(ARGV[2]))
if added then return 1 end
return 0
```

---

## 集群模式注意事项

### Hash Tag 保证同 Slot

```java
// ❌ 多 key 可能分布不同 slot
kvClient.eval(script, 2, "user:1:balance", "user:1:frozen", ...);

// ✅ 使用 {hash_tag}
kvClient.eval(script, 2, "{user:1}:balance", "{user:1}:frozen", ...);
```

### Key 命名规范

```java
String lockKey = "{order:" + orderId + "}:lock";
String stockKey = "{sku:" + skuId + "}:stock";
```

---

## 性能检查清单

| 检查项 | 说明 |
|-------|------|
| 循环次数 | 单次执行控制在 1000 次以内 |
| 数据量 | 单次操作数据量 < 1MB |
| 执行时间 | 脚本执行 < 100ms |

---

## 常见错误

| 错误 | 原因 | 解决方案 |
|-----|------|---------|
| `NOSCRIPT` | 脚本未加载 | 降级到 EVAL 或重新 SCRIPT LOAD |
| `CROSSSLOT` | 多 key 不在同一 slot | 使用 Hash Tag |
| `BUSY` | 脚本执行超时 | 优化脚本或 SCRIPT KILL |

---

## 代码审核指南

### 必须检查

| 检查内容 | 风险 |
|---------|------|
| KEYS 是否通过参数传递 | 硬编码导致集群路由失败 |
| 多 key 是否同 slot | CROSSSLOT 错误 |
| 是否有大循环/大数据操作 | 阻塞 Redis 主线程 |
| 是否处理 NOSCRIPT 降级 | 脚本丢失导致功能失效 |

### 建议检查

| 检查内容 | 风险 |
|---------|------|
| 脚本是否幂等 | 重试导致数据不一致 |
| 是否使用 EVALSHA | 网络传输开销 |
