# Chapter 4: Caching

> *"There are only two hard things in Computer Science: cache invalidation and naming things."*
> — Phil Karlton

## What Is Caching?

Caching is the practice of storing copies of data in a temporary, fast-access storage layer so that subsequent requests can be served more quickly. Instead of computing a result or fetching data from a slow source (database, API, disk) every time, you store it in a location that's orders of magnitude faster to access.

```
Without Cache:
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───►│  Server  │───►│ Database │
│          │◄───│          │◄───│          │
└──────────┘    └──────────┘    └──────────┘
  5ms network   50ms query     ~200ms disk I/O
                Total: ~255ms

With Cache:
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───►│  Server  │───►│  Redis   │
│          │◄───│  (Cache) │◄───│  Cache   │
└──────────┘    └──────────┘    └──────────┘
  5ms network   1ms lookup     ~0.5ms memory
                Total: ~6.5ms  (40x faster!)
```

## Where to Cache

```
┌─────────────────────────────────────────────────────────┐
│                    Caching Layers                        │
│                                                         │
│  ┌───────────┐  Browser Cache / CDN                    │
│  │  Layer 1  │  Static assets, API responses           │
│  └─────┬─────┘                                         │
│        │                                                │
│  ┌─────┴─────┐  Reverse Proxy (Nginx/Varnish)         │
│  │  Layer 2  │  Full page cache, API cache             │
│  └─────┬─────┘                                         │
│        │                                                │
│  ┌─────┴─────┐  Application Cache (Redis/Memcached)   │
│  │  Layer 3  │  Query results, sessions, computed data │
│  └─────┬─────┘                                         │
│        │                                                │
│  ┌─────┴─────┐  Database Cache                         │
│  │  Layer 4  │  Query cache, buffer pool               │
│  └─────┬─────┘                                         │
│        │                                                │
│  ┌─────┴─────┐  CPU Cache (L1/L2/L3)                  │
│  │  Layer 5  │  Hardware-level caching                 │
│  └───────────┘                                         │
└─────────────────────────────────────────────────────────┘
```

## Cache Strategies

### Write-Through Cache

Writes go to both cache and database simultaneously:

```
Write Path:                    Read Path:
┌──────────┐                   ┌──────────┐
│ Client   │                   │ Client   │
└────┬─────┘                   └────┬─────┘
     │ WRITE                        │ READ
     ▼                              ▼
┌──────────┐                   ┌──────────┐
│  Cache   │──── write ────►  │  Cache   │ ← cache HIT
│ (Redis)  │                   │ (Redis)  │
└────┬─────┘                   └──────────┘
     │ sync write                    │ cache MISS
     ▼                              ▼
┌──────────┐                   ┌──────────┐
│ Database │                   │ Database │
└──────────┘                   └──────────┘
```

```python
class WriteThroughCache:
    def __init__(self, db, cache, ttl=3600):
        self.db = db
        self.cache = cache
        self.ttl = ttl

    async def set(self, key: str, value: dict):
        # Write to both simultaneously
        await self.db.save(key, value)
        await self.cache.setex(key, self.ttl, json.dumps(value))

    async def get(self, key: str) -> dict | None:
        # Read from cache first
        cached = await self.cache.get(key)
        if cached:
            return json.loads(cached)

        # Cache miss: read from DB and populate cache
        value = await self.db.get(key)
        if value:
            await self.cache.setex(key, self.ttl, json.dumps(value))
        return value
```

**Pros:** Data is always consistent. Simple to implement.
**Cons:** Write latency increases (must write to both). Cache may contain data that's never read.

### Write-Back (Write-Behind) Cache

Writes go to cache immediately; database is updated asynchronously:

```
Write Path:                    Read Path:
┌──────────┐                   ┌──────────┐
│ Client   │                   │ Client   │
└────┬─────┘                   └────┬─────┘
     │ WRITE (fast)                 │ READ
     ▼                              ▼
┌──────────┐                   ┌──────────┐
│  Cache   │                   │  Cache   │ ← always
│ (Redis)  │                   │ (Redis)  │
└────┬─────┘                   └──────────┘
     │ async flush                (DB only for cache miss)
     │ (background)
     ▼
┌──────────┐
│ Database │
└──────────┘
```

```python
class WriteBackCache:
    def __init__(self, db, cache, flush_interval=30):
        self.db = db
        self.cache = cache
        self.dirty_keys: set[str] = set()
        self.flush_interval = flush_interval

    async def set(self, key: str, value: dict):
        await self.cache.setex(key, 3600, json.dumps(value))
        self.dirty_keys.add(key)

    async def get(self, key: str) -> dict | None:
        cached = await self.cache.get(key)
        if cached:
            return json.loads(cached)
        value = await self.db.get(key)
        if value:
            await self.cache.setex(key, 3600, json.dumps(value))
        return value

    async def flush_dirty(self):
        """Background task to flush dirty keys to database."""
        while True:
            await asyncio.sleep(self.flush_interval)
            keys_to_flush = self.dirty_keys.copy()
            self.dirty_keys.clear()
            for key in keys_to_flush:
                cached = await self.cache.get(key)
                if cached:
                    await self.db.save(key, json.loads(cached))
```

**Pros:** Very fast writes. Reduces database load.
**Cons:** Risk of data loss if cache crashes before flush. More complex to implement.

### Cache-Aside (Lazy Loading)

Application manages cache explicitly:

```
Read Path:
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │────────►│  Server  │────────►│ Database │
│          │◄────────│          │◄────────│          │
└──────────┘         └────┬─────┘         └──────────┘
                          │
                   ┌──────┴──────┐
                   │   Cache     │
                   │   (check    │
                   │   first)    │
                   └─────────────┘
```

```python
class CacheAside:
    """The most common caching pattern."""

    def __init__(self, redis_client, db_client, default_ttl=3600):
        self.redis = redis_client
        self.db = db_client
        self.default_ttl = default_ttl

    async def get_or_set(self, key: str, loader: callable, ttl: int | None = None):
        """Get from cache, or load from DB and cache the result."""
        ttl = ttl or self.default_ttl

        # Step 1: Check cache
        cached = await self.redis.get(key)
        if cached is not None:
            return json.loads(cached)

        # Step 2: Cache miss — load from DB
        value = await loader()

        # Step 3: Populate cache (with some jitter to prevent stampede)
        jitter = random.randint(0, 300)
        await self.redis.setex(key, ttl + jitter, json.dumps(value))

        return value

    async def invalidate(self, key: str):
        """Remove from cache."""
        await self.redis.delete(key)

    async def invalidate_pattern(self, pattern: str):
        """Remove all matching keys."""
        cursor = 0
        while True:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            if keys:
                await self.redis.delete(*keys)
            if cursor == 0:
                break
```

**Pros:** Only caches what's actually read. Simple to implement. Cache failures don't break writes.
**Cons:** Three hits on first request (cache, miss, DB, cache write).

### Read-Through Cache

Cache layer handles DB reads automatically:

```python
class ReadThroughCache:
    def __init__(self, cache, loader_factory):
        self.cache = cache
        self.loader_factory = loader_factory

    async def get(self, key: str, ttl: int = 3600):
        cached = await self.cache.get(key)
        if cached:
            return json.loads(cached)

        # Cache automatically loads from DB
        loader = self.loader_factory(key)
        value = await loader.load()
        await self.cache.setex(key, ttl, json.dumps(value))
        return value
```

## Cache Invalidation Strategies

### Time-Based Expiration (TTL)

```python
# Simple TTL-based expiration
await redis.setex("user:123", 3600, json.dumps(user_data))  # Expires in 1 hour
```

### Event-Based Invalidation

```python
# Invalidate cache when data changes
from core.events import on

@on("user.updated")
async def invalidate_user_cache(event):
    user_id = event.data["user_id"]
    await redis.delete(f"user:{user_id}")
    await redis.delete(f"user:{user_id}:profile")

@on("product.updated")
async def invalidate_product_cache(event):
    product_id = event.data["product_id"]
    await redis.delete(f"product:{product_id}")
    # Also invalidate product lists
    keys = await redis.keys("products:list:*")
    if keys:
        await redis.delete(*keys)
```

### Version-Based Keys

```python
class VersionedCache:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def get_version(self, entity: str) -> int:
        v = await self.redis.get(f"version:{entity}")
        return int(v) if v else 1

    async def bump_version(self, entity: str):
        await self.redis.incr(f"version:{entity}")

    async def key(self, entity: str, id: str) -> str:
        version = await self.get_version(entity)
        return f"{entity}:{id}:v{version}"

    async def set(self, entity: str, id: str, data: dict, ttl: int = 3600):
        k = await self.key(entity, id)
        await self.redis.setex(k, ttl, json.dumps(data))

    async def get(self, entity: str, id: str) -> dict | None:
        k = await self.key(entity, id)
        cached = await self.redis.get(k)
        return json.loads(cached) if cached else None
```

### Tag-Based Invalidation

```python
class TaggedCache:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def set_with_tags(self, key: str, data: dict, tags: list[str], ttl: int = 3600):
        await self.redis.setex(key, ttl, json.dumps(data))
        pipe = self.redis.pipeline()
        for tag in tags:
            pipe.sadd(f"tag:{tag}", key)
        pipe.execute()

    async def invalidate_tag(self, tag: str):
        """Remove all cache entries associated with a tag."""
        keys = await self.redis.smembers(f"tag:{tag}")
        if keys:
            pipe = self.redis.pipeline()
            for key in keys:
                pipe.delete(key)
            pipe.delete(f"tag:{tag}")
            pipe.execute()
```

## CDN Caching

```
┌──────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───►│  CDN    │───►│ Origin   │───►│ Database │
│ (User)   │◄───│ (Edge)  │    │ Server   │    │          │
└──────────┘    └─────────┘    └──────────┘    └──────────┘
                 Cache HIT
              (served locally)
```

### Cache Headers

```
# Static assets (long cache)
Cache-Control: public, max-age=31536000, immutable
ETag: "abc123"

# API responses (short cache)
Cache-Control: private, max-age=60, must-revalidate
Vary: Accept, Authorization

# No caching (dynamic content)
Cache-Control: no-store, no-cache, must-revalidate
```

## Cache Stampede (Thundering Herd)

When a popular cached item expires, many requests simultaneously try to rebuild it:

```
Problem:
                    ┌───────┐
Request 1 ─────────│       │──┐
Request 2 ─────────│ Empty │──┤
Request 3 ─────────│ Cache │──┼────► ALL hit DB simultaneously!
Request 4 ─────────│       │──┤
Request N ─────────│       │──┘
                    └───────┘

Solution - Single rebuild with locking:
                    ┌───────┐
Request 1 ─────────│ Lock  │──── Rebuild cache ────► Serve
Request 2 ─────────│       │──── Wait/retry ────────► Serve
Request 3 ─────────│       │──── Wait/retry ────────► Serve
```

```python
import asyncio
import random


class StampedePrevention:
    def __init__(self, redis_client, ttl=3600, lock_timeout=10):
        self.redis = redis_client
        self.ttl = ttl
        self.lock_timeout = lock_timeout

    async def get_or_rebuild(self, key: str, rebuild_fn: callable):
        # Check cache
        value = await self.redis.get(key)
        if value:
            return json.loads(value)

        # Try to acquire lock
        lock_key = f"lock:{key}"
        acquired = await self.redis.set(lock_key, "1", nx=True, ex=self.lock_timeout)

        if acquired:
            try:
                # This process rebuilds the cache
                value = await rebuild_fn()
                # Add jitter to TTL to prevent synchronized expiration
                jittered_ttl = self.ttl + random.randint(0, 300)
                await self.redis.setex(key, jittered_ttl, json.dumps(value))
                return value
            finally:
                await self.redis.delete(lock_key)
        else:
            # Another process is rebuilding; wait and retry
            for _ in range(self.lock_timeout * 2):
                await asyncio.sleep(0.5)
                value = await self.redis.get(key)
                if value:
                    return json.loads(value)

            # Fallback: rebuild ourselves
            value = await rebuild_fn()
            await self.redis.setex(key, self.ttl, json.dumps(value))
            return value
```

## Redis Complete Example

```python
# caching_service.py
import redis.asyncio as redis
import json
import hashlib
import time
from functools import wraps


class CacheService:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis = redis.from_url(redis_url, decode_responses=True)

    # ── Basic Operations ──

    async def get(self, key: str) -> dict | None:
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set(self, key: str, value: dict, ttl: int = 3600):
        await self.redis.setex(key, ttl, json.dumps(value))

    async def delete(self, key: str):
        await self.redis.delete(key)

    # ── Pattern: Cache-Aside ──

    async def get_or_load(self, key: str, loader, ttl: int = 3600):
        cached = await self.get(key)
        if cached is not None:
            return cached

        value = await loader()
        await self.set(key, value, ttl)
        return value

    # ── Decorator ──

    def cached(self, key_prefix: str, ttl: int = 3600):
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key from function name and args
                key_data = f"{func.__name__}:{args}:{kwargs}"
                key_hash = hashlib.md5(key_data.encode()).hexdigest()
                cache_key = f"{key_prefix}:{key_hash}"

                result = await self.get(cache_key)
                if result is not None:
                    return result

                result = await func(*args, **kwargs)
                await self.set(cache_key, result, ttl)
                return result
            return wrapper
        return decorator

    # ── Rate Limiting ──

    async def check_rate_limit(self, identifier: str, limit: int, window: int) -> bool:
        key = f"ratelimit:{identifier}"
        pipe = self.redis.pipeline()
        now = time.time()

        # Sliding window: remove old entries, count current
        pipe.zremrangebyscore(key, 0, now - window)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window)

        results = await pipe.execute()
        request_count = results[2]
        return request_count <= limit

    # ── Cache Warming ──

    async def warm_cache(self, entries: list[tuple[str, dict, int]]):
        """Pre-populate cache with expected hot data."""
        pipe = self.redis.pipeline()
        for key, value, ttl in entries:
            pipe.setex(key, ttl, json.dumps(value))
        await pipe.execute()
        print(f"Warmed {len(entries)} cache entries")

    # ── Cache Statistics ──

    async def get_stats(self) -> dict:
        info = await self.redis.info("stats")
        memory = await self.redis.info("memory")
        return {
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "hit_rate": (
                info.get("keyspace_hits", 0) /
                max(1, info.get("keyspace_hits", 0) + info.get("keyspace_misses", 0))
            ),
            "memory_used": memory.get("used_memory_human", "unknown"),
            "connected_clients": (await self.redis.info("clients")).get("connected_clients", 0),
        }

    async def close(self):
        await self.redis.close()


# ── Usage Example ──

async def main():
    cache = CacheService()

    # Warm cache with popular products
    popular_products = [
        ("product:prod-1", {"id": "prod-1", "name": "Widget", "price": 29.99}, 3600),
        ("product:prod-2", {"id": "prod-2", "name": "Gadget", "price": 49.99}, 3600),
    ]
    await cache.warm_cache(popular_products)

    # Use the cache decorator
    @cache.cached("products", ttl=300)
    async def get_product(product_id: str):
        # Simulate slow DB query
        await asyncio.sleep(0.5)
        return {"id": product_id, "name": f"Product {product_id}", "price": 19.99}

    # First call: cache miss, loads from "DB"
    product = await get_product("prod-123")
    print(f"Product: {product}")

    # Second call: cache hit (instant)
    product = await get_product("prod-123")
    print(f"Product (cached): {product}")

    # Check rate limiting
    allowed = await cache.check_rate_limit("user-123", limit=100, window=60)
    print(f"Rate limit OK: {allowed}")

    # Get cache stats
    stats = await cache.get_stats()
    print(f"Cache stats: {stats}")

    await cache.close()


if __name__ == "__main__":
    asyncio.run(main())
```

## Redis vs Memcached

| Feature | Redis | Memcached |
|---------|-------|-----------|
| **Data Structures** | Strings, lists, sets, hashes, sorted sets, streams | Strings only |
| **Persistence** | RDB snapshots, AOF | None (purely in-memory) |
| **Replication** | Built-in master-replica | Not built-in |
| **Clustering** | Built-in Redis Cluster | Client-side sharding |
| **Memory Efficiency** | Higher overhead per key | Very efficient for simple data |
| **Pub/Sub** | Yes | No |
| **Lua Scripting** | Yes | No |
| **Max Value Size** | 512 MB | 1 MB |
| **Best For** | Complex caching, sessions, queues, pub/sub | Simple key-value caching |

## Cache Sizing Guide

```
Cache Size Estimation:

1. Identify hot data:
   - Top 20% of queries that hit 80% of traffic
   - User sessions, product catalogs, configuration

2. Calculate memory per entry:
   - Average JSON payload: ~1-5 KB
   - Redis overhead: ~50-100 bytes per key
   - Total per entry: ~1-6 KB

3. Size for working set + 20% headroom:
   - 100K active users × 5KB = 500 MB
   - 10K products × 3KB = 30 MB
   - Sessions × 1KB = varies
   - Headroom: +20%

4. Set eviction policy:
   - allkeys-lru: Good for general caching
   - volatile-lru: Good when mixing TTL keys
   - noeviction: When you need guaranteed availability
```

## Summary

Caching dramatically improves application performance by storing frequently accessed data in fast storage layers. The most common pattern is cache-aside (lazy loading), where the application explicitly manages what's cached. Always implement proper invalidation strategies to prevent stale data, use TTLs with jitter to prevent cache stampedes, and monitor cache hit rates to measure effectiveness.

**Key Takeaways:**
- Cache-aside is the most common and safest pattern
- Always implement TTL with random jitter to prevent synchronized expiration
- Use event-based invalidation for real-time consistency
- Redis is the Swiss Army knife of caching (use Memcached for simple key-value)
- Monitor cache hit rate — aim for 80%+ for effective caching
- Implement stampede prevention for high-traffic cached items
