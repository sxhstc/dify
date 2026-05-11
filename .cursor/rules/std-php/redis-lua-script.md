---
description: Redis Lua 脚本编写规范（PHP）- 当用户需要在 PHP 项目中编写/优化 Redis Lua 脚本时使用
alwaysApply: false
---

# Redis Lua 脚本编写规范（PHP）

## 核心原则（红线）

| 规则 | 说明 |
|------|------|
| **KEYS 必须显式传递** | 禁止硬编码 key，否则集群无法路由 |
| **所有 KEYS 必须同 slot** | 集群模式多 key 操作必须使用 `{hash_tag}` |
| **脚本必须幂等** | 网络超时可能重试，逻辑必须支持重复执行 |
| **禁止长时间阻塞** | Lua 执行期间 Redis 单线程阻塞，禁大循环/大数据 |
| **优先 EVALSHA** | 减少网络传输，需处理 NOSCRIPT 降级 |

## Lua 脚本基础

### 参数传递

```lua
local key = KEYS[1]
local value = ARGV[1]
local ttl = tonumber(ARGV[2])
redis.call('SET', key, value, 'EX', ttl)
return 'OK'
```

### 返回值映射

| Lua 类型 | PHP 类型 |
|---------|----------|
| `nil` / `false` | `null` / `false` |
| `number` | `int` |
| `string` | `string` |
| `table (array)` | `array` |
| `true` | `1` |

## PHP 执行方式

### 基本执行（PhpRedis）

```php
<?php
declare(strict_types=1);

class RedisLuaService
{
    private const INCR_WITH_LIMIT = <<<'LUA'
        local current = tonumber(redis.call('GET', KEYS[1]) or 0)
        if current >= tonumber(ARGV[1]) then return -1 end
        return redis.call('INCR', KEYS[1])
    LUA;

    public function __construct(private \Redis $redis) {}

    public function incrWithLimit(string $key, int $limit): int
    {
        return (int)$this->redis->eval(self::INCR_WITH_LIMIT, [$key, (string)$limit], 1);
    }
}
```

### EVALSHA 优化（带降级）

```php
private function runScript(string $script, array $keys, array $args): mixed
{
    $sha = $this->scriptShaCache[md5($script)] ??= $this->redis->script('load', $script);
    try {
        return $this->redis->evalSha($sha, array_merge($keys, $args), count($keys));
    } catch (\RedisException $e) {
        if (str_contains($e->getMessage(), 'NOSCRIPT')) {
            unset($this->scriptShaCache[md5($script)]);
            return $this->redis->eval($script, array_merge($keys, $args), count($keys));
        }
        throw $e;
    }
}
```

## 常见场景模板

### 分布式锁

```lua
-- 加锁
if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2]) then return 1 end
return 0

-- 解锁（验证 owner）
if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
return 0
```

### 库存扣减（防超卖）

```lua
local stock = tonumber(redis.call('GET', KEYS[1]))
if not stock then return -1 end
if stock < tonumber(ARGV[1]) then return -2 end
return redis.call('DECRBY', KEYS[1], ARGV[1])
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
if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2]) then return 1 end
return 0  -- 1=首次, 0=重复
```

## 集群模式注意

```php
// ✅ 正确：Hash Tag 保证同 slot
$redis->eval($script, ['{user:1}:balance', '{user:1}:frozen', ...], 2);

// Key 命名规范：{hash_tag}:实体:属性
$lockKey = sprintf('{order:%s}:lock', $orderId);
```

## 代码审核要点

| 检查内容 | 风险 |
|---------|------|
| KEYS 是否参数传递 | 集群路由失败 |
| 多 key 是否同 slot | CROSSSLOT 错误 |
| 是否有大循环/大数据 | 阻塞 Redis |
| 是否处理 NOSCRIPT | 脚本丢失时功能失效 |
| 脚本是否幂等 | 重试数据不一致 |
| eval key 数量参数 | 参数错误导致执行失败 |
