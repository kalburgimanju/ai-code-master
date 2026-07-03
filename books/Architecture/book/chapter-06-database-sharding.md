# Chapter 6: Database Sharding — Splitting Data Across Many Databases

> *"Sharding is what happens when a single database can no longer hold the weight of the world you've stored in it — you distribute the burden so that no single point collapses."*
>
> — Manjunath Kalburgi

---

## 6.1 — What Is Database Sharding?

At its core, **sharding** is the practice of horizontally partitioning data across multiple database instances, each known as a **shard**. Each shard holds only a subset of the total dataset, yet — through a routing layer — the entire collection of shards appears as a single logical database to the application.

```
                         SHARDED ARCHITECTURE
  ┌─────────────────────────────────────────────────────────┐
  │                     Application Layer                   │
  └────────────────────┬────────────────────────────────────┘
                       │  queries with shard key
                       ▼
              ┌─────────────────┐
              │   Shard Router   │
              │  (Proxy/Layer)   │
              └──┬────┬────┬───┘
                 │    │    │
          ┌──────┘    │    └──────┐
          ▼           ▼           ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │  Shard A   │ │  Shard B   │ │  Shard C   │
   │ users 0-99 │ │users 100.. │ │users 200.. │
   └────────────┘ └────────────┘ └────────────┘
```

Sharding solves three problems simultaneously:

| Problem | How Sharding Helps |
|---|---|
| **Storage limits** | Each shard only stores a fraction of rows |
| **Compute limits** | Queries hit only the relevant shard(s) |
| **Write throughput** | Writes distribute across multiple hosts |

Sharding is different from **replication** (copying the same data to multiple nodes for high availability) and from **partitioning** within a single database (e.g., PostgreSQL table partitioning). Sharding spans **multiple independent database processes**.

---

## 6.2 — When to Shard

Sharding introduces real operational complexity. Before you shard, exhaust these alternatives:

```
  SHOULD YOU SHARD?

  Is your dataset > 1TB or growing > 50 GB/month?
       │
       ├── NO ──► Use a bigger server (vertical scaling)
       │          Use read replicas for read-heavy workloads
       │          Optimize queries and indexes
       │
       ├── MAYBE ──► Try table partitioning first
       │             Try caching (Redis/Memcached)
       │
       └── YES ──► Is write throughput the bottleneck?
                   │
                   ├── NO ──► Read replicas + caching
                   │
                   └── YES ──► Plan your sharding strategy
                               ▼
                         ★ SHARD ★
```

**Rule of thumb**: Sharding is a last resort. It should be the answer only when vertical scaling, read replicas, caching, and partitioning have all been exhausted or are clearly insufficient.

---

## 6.3 — Sharding Strategies

### 6.3.1 — Hash-Based Sharding

A hash function computes a shard index from the shard key:

```
  shard_index = hash(shard_key) % num_shards
```

**Example (Python)**:

```python
import hashlib
from typing import Any


def hash_shard(shard_key: Any, num_shards: int) -> int:
    """Determine which shard owns a given key using consistent hashing."""
    digest = hashlib.sha256(str(shard_key).encode()).hexdigest()
    return int(digest, 16) % num_shards


# --- Demonstration ---
users = [
    {"_id": 1, "name": "Alice"},
    {"_id": 2, "name": "Bob"},
    {"_id": 3, "name": "Charlie"},
    {"_id": 4, "name": "Diana"},
]

for user in users:
    shard = hash_shard(user["_id"], num_shards=4)
    print(f"User {user['name']} (id={user['_id']}) → Shard {shard}")
```

**Output** (values depend on hash function):
```
User Alice  (id=1) → Shard 2
User Bob    (id=2) → Shard 0
User Charlie(id=3) → Shard 3
User Diana  (id=4) → Shard 1
```

**Pros**: Even data distribution; simple to implement.
**Cons**: Resharding is painful (changing `num_shards` redistributes nearly everything); range queries span all shards.

### 6.3.2 — Range-Based Sharding

Assign contiguous key ranges to each shard:

```
  ┌──────────────────────────────────────────────────┐
  │              RANGE-BASED SHARDING                │
  │                                                  │
  │   Shard A          Shard B          Shard C      │
  │   ┌──────────┐    ┌──────────┐    ┌──────────┐  │
  │   │ id 1-100 │    │id 101-200│    │id 201-300│  │
  │   └──────────┘    └──────────┘    └──────────┘  │
  │                                                  │
  │   SELECT * WHERE id BETWEEN 50 AND 150;          │
  │        │                                         │
  │        ├── hits Shard A (ids 50-100)             │
  │        └── hits Shard B (ids 101-150)            │
  │                                                  │
  └──────────────────────────────────────────────────┘
```

**Pros**: Range queries efficient for contiguous ranges; easy to understand.
**Cons**: Hotspots — recent data (e.g., new users) all land on the newest shard; uneven distribution.

### 6.3.3 — Geo-Based Sharding

Assign shards by geographic region:

```
  ┌─────────────────────────────────────────────────────┐
  │              GEO-BASED SHARDING                     │
  │                                                     │
  │        ┌──────────┐   ┌──────────┐   ┌──────────┐  │
  │        │ Shard US │   │ Shard EU │   │ Shard AP │  │
  │        │          │   │          │   │          │  │
  │        │ Americas │   │  Europe  │   │Asia-Pac  │  │
  │        │ users    │   │  users   │   │ users    │  │
  │        └──────────┘   └──────────┘   └──────────┘  │
  │                                                     │
  │   User from Mumbai  ──► Shard AP                   │
  │   User from Berlin  ──► Shard EU                   │
  │   User from NYC     ──► Shard US                   │
  └─────────────────────────────────────────────────────┘
```

**Pros**: Low latency for region-local queries; data residency compliance.
**Cons**: Uneven data distribution; users who travel need careful routing.

### 6.3.4 — Comparison Table

| Criterion | Hash | Range | Geo |
|---|---|---|---|
| **Data distribution** | Even | Uneven | Depends on user base |
| **Range queries** | Poor (scatter-gather) | Good (single shard) | Poor |
| **Resharding difficulty** | High | Medium | Low |
| **Hotspot risk** | Low | High | Medium |
| **Best for** | High-write workloads, IDs | Time-series, sequential data | Multi-region apps |

---

## 6.4 — Choosing a Shard Key

The shard key is the most consequential decision in sharding. A poor shard key leads to hotspots, unbalanced shards, and performance degradation.

```
  GOOD SHARD KEY CHARACTERISTICS
  ═══════════════════════════════

  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
  │   HIGH CARDINALITY│     │  EVENLY DISTRIB. │     │  QUERY FREQUENCY │
  │                  │     │                  │     │                  │
  │  Millions of     │     │  No single value │     │  Common queries  │
  │  unique values   │     │  dominates       │     │  include the key │
  └──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Common shard keys by use case**:

| Application | Shard Key | Reasoning |
|---|---|---|
| Social network | `user_id` | Users are the unit of data affinity |
| E-commerce | `tenant_id` or `store_id` | Multi-tenant isolation |
| IoT / time-series | `device_id` + time bucket | Data locality per device |
| Multi-tenant SaaS | `tenant_id` | Tenant isolation + easy lookup |
| Chat application | `conversation_id` | Messages in a conversation stay together |

---

## 6.5 — Code Examples

### 6.5.1 — MongoDB Sharding (via mongos)

MongoDB has built-in sharding. You enable it on a collection and designate a shard key:

```javascript
// --- Step 1: Connect to the mongos router ---
use admin;

// --- Step 2: Add shards (run once per replica set) ---
sh.addShard("shard1-replica/rs1.example.com:27017");
sh.addShard("shard2-replica/rs2.example.com:27017");
sh.addShard("shard3-replica/rs3.example.com:27017");

// --- Step 3: Enable sharding on the database ---
sh.enableSharding("myapp");

// --- Step 4: Shard the collection ---
// Hashed shard key for even distribution:
sh.shardCollection("myapp.orders", { customer_id: "hashed" });

// OR range-based shard key:
sh.shardCollection("myapp.logs", { timestamp: 1 });
```

```python
# Python: Using PyMongo to insert into a sharded cluster
from pymongo import MongoClient


def main() -> None:
    # mongos router handles routing automatically
    client = MongoClient(
        "mongodb://mongos.example.com:27017",
        replicaSet="configReplSet",
    )
    db = client["myapp"]
    orders = db["orders"]

    # Insert many orders — mongos routes each to the correct shard
    orders.insert_many([
        {"customer_id": 1001, "item": "Widget", "price": 29.99},
        {"customer_id": 1002, "item": "Gadget", "price": 49.99},
        {"customer_id": 1003, "item": "Doohickey", "price": 19.99},
    ])

    # Query — mongos fans out if needed, returns merged results
    result = orders.find({"customer_id": 1001})
    for doc in result:
        print(doc)

    client.close()


if __name__ == "__main__":
    main()
```

### 6.5.2 — PostgreSQL: Manual Sharding via Proxy

PostgreSQL does not have built-in sharding, but you can implement it with a **proxy layer** or use **Citus** (an extension). Here's a manual approach with a Python router:

```python
"""
Manual PostgreSQL sharding with a hash-based router.
Each shard is a separate PostgreSQL instance.
"""
import hashlib
from dataclasses import dataclass

import psycopg2


@dataclass(frozen=True)
class Shard:
    name: str
    host: str
    port: int
    database: str
    user: str
    password: str

    def connect(self) -> psycopg2.extensions.connection:
        return psycopg2.connect(
            host=self.host,
            port=self.port,
            dbname=self.database,
            user=self.user,
            password=self.password,
        )


class ShardedDB:
    """Simple hash-based sharding router for PostgreSQL."""

    def __init__(self, shards: list[Shard]) -> None:
        self._shards = shards
        self._num_shards = len(shards)

    def _get_shard(self, shard_key: int) -> Shard:
        digest = hashlib.sha256(str(shard_key).encode()).hexdigest()
        index = int(digest, 16) % self._num_shards
        return self._shards[index]

    def insert_user(self, user_id: int, name: str, email: str) -> None:
        shard = self._get_shard(user_id)
        conn = shard.connect()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (id, name, email)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
                    """,
                    (user_id, name, email),
                )
            conn.commit()
            print(f"  ✓ Inserted user {user_id} into {shard.name}")
        finally:
            conn.close()

    def get_user(self, user_id: int) -> dict | None:
        shard = self._get_shard(user_id)
        conn = shard.connect()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, email FROM users WHERE id = %s",
                    (user_id,),
                )
                row = cur.fetchone()
                if row:
                    return {"id": row[0], "name": row[1], "email": row[2]}
                return None
        finally:
            conn.close()

    def cross_shard_query(self, sql: str) -> list[dict]:
        """Scatter-gather: run query on every shard, merge results."""
        results: list[dict] = []
        for shard in self._shards:
            conn = shard.connect()
            try:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    columns = [desc[0] for desc in cur.description]
                    for row in cur.fetchall():
                        results.append(dict(zip(columns, row)))
            finally:
                conn.close()
        return results


# --- Usage ---
if __name__ == "__main__":
    shards = [
        Shard("shard-0", "localhost", 5432, "myapp_shard0", "user", "pass"),
        Shard("shard-1", "localhost", 5433, "myapp_shard1", "user", "pass"),
        Shard("shard-2", "localhost", 5434, "myapp_shard2", "user", "pass"),
    ]

    db = ShardedDB(shards)

    db.insert_user(1001, "Alice", "alice@example.com")
    db.insert_user(1002, "Bob", "bob@example.com")
    db.insert_user(1003, "Charlie", "charlie@example.com")

    user = db.get_user(1001)
    print(f"\n  Fetched: {user}")

    # Cross-shard query (expensive — avoids this in production)
    all_users = db.cross_shard_query("SELECT id, name FROM users")
    print(f"\n  All users across shards: {all_users}")
```

**PostgreSQL Schema for Each Shard**:

```sql
-- Run on every shard
CREATE TABLE users (
    id    BIGINT PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE INDEX idx_users_email ON users (email);
```

### 6.5.3 — TypeScript: Shard Router Service

```typescript
/**
 * A TypeScript shard router demonstrating hash-based sharding.
 * In production, replace the in-memory map with real DB connections.
 */

import { createHash } from "crypto";

interface ShardConfig {
  name: string;
  host: string;
  port: number;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
}

class ShardRouter {
  private shards: ShardConfig[];
  private numShards: number;

  constructor(shards: ShardConfig[]) {
    this.shards = shards;
    this.numShards = shards.length;
  }

  private getShardIndex(shardKey: number): number {
    const digest = createHash("sha256")
      .update(String(shardKey))
      .digest("hex");
    return parseInt(digest, 16) % this.numShards;
  }

  getShard(shardKey: number): ShardConfig {
    const index = this.getShardIndex(shardKey);
    return this.shards[index];
  }

  /**
   * Routes an insert to the correct shard.
   * In production, this would execute the SQL against the shard connection.
   */
  routeInsert(record: UserRecord): { shard: ShardConfig; sql: string } {
    const shard = this.getShard(record.id);
    const sql = `
      INSERT INTO users (id, name, email)
      VALUES (${record.id}, '${record.name}', '${record.email}')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
    `.trim();
    return { shard, sql };
  }

  /**
   * Scatter-gather: fan out a query to all shards and merge.
   */
  routeScatterGather(
    _sql: string,
  ): { shard: ShardConfig; sql: string }[] {
    return this.shards.map((shard) => ({
      shard,
      sql: _sql,
    }));
  }
}

// --- Usage ---
const router = new ShardRouter([
  { name: "shard-0", host: "db0.local", port: 5432 },
  { name: "shard-1", host: "db1.local", port: 5433 },
  { name: "shard-2", host: "db2.local", port: 5434 },
]);

const users: UserRecord[] = [
  { id: 1001, name: "Alice", email: "alice@example.com" },
  { id: 1002, name: "Bob", email: "bob@example.com" },
  { id: 1003, name: "Charlie", email: "charlie@example.com" },
];

console.log("=== Routing Inserts ===");
for (const user of users) {
  const result = router.routeInsert(user);
  console.log(`User ${user.id} → ${result.shard.name}`);
  console.log(`  SQL: ${result.sql}\n`);
}

console.log("=== Scatter-Gather Query ===");
const queries = router.routeScatterGather("SELECT id, name FROM users");
for (const q of queries) {
  console.log(`  ${q.shard.name}: ${q.sql}`);
}
```

---

## 6.6 — Resharding

Resharding — adding or removing shards while the system is live — is one of the hardest problems in distributed systems.

```
  RESHARDING: ADDING A NEW SHARD
  ═══════════════════════════════════

  BEFORE (3 shards):            AFTER (4 shards):
  ┌──────────────────┐          ┌──────────────────┐
  │ Shard 0 (33%)    │          │ Shard 0 (25%)    │
  │ Shard 1 (33%)    │   ──►    │ Shard 1 (25%)    │
  │ Shard 2 (33%)    │          │ Shard 2 (25%)    │
  └──────────────────┘          │ Shard 3 (25%)    │
                                └──────────────────┘
                                Each shard loses ~8% of data
```

### Consistent Hashing

**Consistent hashing** minimizes data movement during resharding. Instead of `hash % N`, nodes and keys are placed on a ring:

```
              CONSISTENT HASH RING

                    Shard A
                      │
            ┌─────────┼─────────┐
            │    ╭────┴────╮    │
            │    │  Ring   │    │
  Shard C ──┤    │         │    ├── Shard B
            │    ╰────┬────╯    │
            │         │         │
            └─────────┼─────────┘
                      │
                (keys between two
                 shards belong to the
                 clockwise shard)

  When Shard D is added between A and B:
  ONLY the keys between A and B move to D.
  All other keys stay put.
```

```python
"""
Consistent hashing implementation for shard routing.
"""
import hashlib
import bisect
from typing import Any


class ConsistentHashRing:
    """A ring-based consistent hash for shard routing."""

    def __init__(self, nodes: list[str], virtual_nodes: int = 150) -> None:
        self._ring: dict[int, str] = {}
        self._sorted_keys: list[int] = []
        self._virtual_nodes = virtual_nodes

        for node in nodes:
            self.add_node(node)

    def _hash(self, key: str) -> int:
        digest = hashlib.md5(key.encode()).hexdigest()
        return int(digest, 16)

    def add_node(self, node: str) -> None:
        for i in range(self._virtual_nodes):
            virtual_key = f"{node}:v{i}"
            h = self._hash(virtual_key)
            self._ring[h] = node
            bisect.insort(self._sorted_keys, h)

    def remove_node(self, node: str) -> None:
        for i in range(self._virtual_nodes):
            virtual_key = f"{node}:v{i}"
            h = self._hash(virtual_key)
            del self._ring[h]
            self._sorted_keys.remove(h)

    def get_node(self, item: Any) -> str:
        if not self._ring:
            raise ValueError("Ring has no nodes")

        h = self._hash(str(item))
        idx = bisect.bisect_right(self._sorted_keys, h)
        if idx == len(self._sorted_keys):
            idx = 0  # Wrap around to the beginning of the ring
        return self._ring[self._sorted_keys[idx]]


# --- Demonstration ---
ring = ConsistentHashRing(["shard-0", "shard-1", "shard-2"])

keys = [f"user:{i}" for i in range(1, 21)]
print("=== Initial Assignment ===")
initial = {}
for key in keys:
    node = ring.get_node(key)
    initial.setdefault(node, []).append(key)

for node, items in sorted(initial.items()):
    print(f"  {node}: {len(items)} keys")

# Add a new shard and reassign
print("\n=== After Adding shard-3 ===")
ring.add_node("shard-3")

after = {}
for key in keys:
    node = ring.get_node(key)
    after.setdefault(node, []).append(key)

moves = 0
for key in keys:
    before = initial.get(
        key,
        [n for n, items in initial.items() if key in items][0],
    )
    after_node = ring.get_node(key)
    if before != after_node:
        moves += 1

for node, items in sorted(after.items()):
    print(f"  {node}: {len(items)} keys")

print(f"\n  Keys moved: {moves}/{len(keys)} "
      f"({moves/len(keys)*100:.1f}%)")
print(f"  Without consistent hashing, ~25% would move.")
```

---

## 6.7 — Cross-Shard Queries

The hardest part of sharding is querying data that spans multiple shards.

```
  CROSS-SHARD QUERY PATTERNS
  ═══════════════════════════

  Pattern 1: Scatter-Gather
  ┌────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Router │────►│ Shard A  │     │ Shard B  │     │ Shard C  │
  │        │────►│          │     │          │     │          │
  │        │────►│          │     │          │     │          │
  │        │◄────│ result A │     │          │     │          │
  │        │◄────│          │     │ result B │     │          │
  │        │◄────│          │     │          │     │ result C │
  │ merged │     └──────────┘     └──────────┘     └──────────┘
  └────────┘

  Pattern 2: Secondary Index Table
  ┌──────────────────────────────────────┐
  │  Central Index (e.g., Redis/Elastic) │
  │  email → shard mapping              │
  └──────────┬───────────────────────────┘
             │ lookup email → shard
             ▼
        Route to correct shard
```

```python
"""
Cross-shard aggregation with scatter-gather.
"""
from dataclasses import dataclass


@dataclass
class Order:
    order_id: int
    user_id: int
    amount: float


# Simulated shards (in production, these are separate databases)
SHARD_DATA: dict[str, list[Order]] = {
    "shard-0": [
        Order(1, 1001, 29.99),
        Order(2, 1002, 49.99),
    ],
    "shard-1": [
        Order(3, 1003, 19.99),
        Order(4, 1004, 99.99),
    ],
    "shard-2": [
        Order(5, 1005, 59.99),
        Order(6, 1001, 39.99),
    ],
}


def scatter_gather_total_per_user() -> dict[int, float]:
    """Sum order amounts per user across all shards."""
    merged: dict[int, float] = {}

    for shard_name, orders in SHARD_DATA.items():
        for order in orders:
            merged[order.user_id] = (
                merged.get(order.user_id, 0.0) + order.amount
            )

    return merged


def scatter_gather_global_total() -> float:
    """Sum all order amounts across shards."""
    return sum(
        order.amount
        for orders in SHARD_DATA.values()
        for order in orders
    )


# --- Run ---
totals = scatter_gather_total_per_user()
print("=== Total per User (cross-shard aggregation) ===")
for user_id, total in sorted(totals.items()):
    print(f"  User {user_id}: ${total:.2f}")

print(f"\n=== Global Total: ${scatter_gather_global_total():.2f} ===")
```

---

## 6.8 — Anti-Patterns and Pitfalls

```
  COMMON SHARDING MISTAKES
  ═════════════════════════

  ✗ Using a low-cardinality shard key (e.g., "country" with 5 values)
    → 20% of users create 80% of load on one shard

  ✗ Relying on auto-increment IDs as shard keys
    → All new writes go to the newest shard (hotspot)

  ✗ Ignoring cross-shard joins
    → Performance degrades 10-100x when queries span shards

  ✗ Sharding too early
    → Premature complexity kills velocity

  ✗ Choosing a shard key you can't change later
    → Resharding becomes a rewrite project
```

---

## 6.9 — Architecture Decision Matrix

```
  DECISION: SHOULD I SHARD?

  ┌────────────────────────────────┬───────────────────────────────────┐
  │  Factor                        │  Threshold to Shard               │
  ├────────────────────────────────┼───────────────────────────────────┤
  │  Dataset size                  │  > 1 TB (or > 500 GB hot data)    │
  │  Write throughput              │  > 50,000 writes/sec              │
  │  Single-server cost            │  > $5,000/month and still capped  │
  │  Vertical scaling              │  No larger instances available    │
  │  Read replicas                 │  Already maxed out                │
  │  Caching hit rate              │  < 80% and still slow             │
  └────────────────────────────────┴───────────────────────────────────┘
```

---

## 6.10 — Practice Exercises

### Exercise 1: Shard Key Evaluation

Given an e-commerce platform with the following tables, propose a shard key for each and justify your choice:

| Table | Row Count | Growth Rate | Most Common Query |
|---|---|---|---|
| `users` | 10M | 100K/month | `SELECT * FROM users WHERE id = ?` |
| `orders` | 100M | 1M/month | `SELECT * FROM orders WHERE user_id = ?` |
| `products` | 500K | 1K/month | `SELECT * FROM products WHERE category = ?` |
| `reviews` | 500M | 5M/month | `SELECT * FROM reviews WHERE product_id = ?` |

### Exercise 2: Implement Consistent Hashing

Extend the `ConsistentHashRing` class from Section 6.6:

1. Add a method `get_distribution()` that returns the percentage of keys each node owns.
2. Add 5 new nodes one at a time and print the distribution after each addition.
3. Verify that the percentage of keys moved is approximately `1/N` where `N` is the number of nodes.

### Exercise 3: Cross-Shard Pagination

Design an API endpoint `GET /api/orders?page=1&limit=20` that paginates across 4 shards. Consider:

1. How do you merge and sort results from all shards?
2. What is the performance cost of `LIMIT 20 OFFSET 0` across shards?
3. How would you use a **cursor-based** pagination approach instead?

### Exercise 4: Resharding Migration

Write a script (Python or TypeScript) that migrates data from a 3-shard setup to a 4-shard setup using consistent hashing. Your script should:

1. Read all keys from each existing shard.
2. Compute the new shard assignment for each key.
3. Copy only the keys that need to move.
4. Verify that no keys were lost or duplicated.

---

## 6.11 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **What is sharding** | Horizontal partitioning across multiple independent database instances |
| **When to shard** | Only after exhausting vertical scaling, read replicas, caching, and partitioning |
| **Shard key** | The single most important decision — affects distribution, performance, and resharding ease |
| **Hash sharding** | Even distribution, poor range query support |
| **Range sharding** | Great for range queries, creates hotspots |
| **Geo sharding** | Low latency, data residency compliance |
| **Consistent hashing** | Minimizes data movement during resharding |
| **Cross-shard queries** | Expensive scatter-gather operations; design shard key to minimize them |
| **Resharding** | One of the hardest problems; plan for it from day one |
| **Anti-pattern** | Sharding too early; choosing an irrevocable shard key |

### When to Use Sharding

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  USE SHARDING WHEN:                                      │
  │  ✓ Write throughput exceeds single-server capacity       │
  │  ✓ Dataset exceeds single-server storage                 │
  │  ✓ You've exhausted all other scaling strategies         │
  │  ✓ You have the operational team to manage shards        │
  │                                                          │
  │  AVOID SHARDING WHEN:                                    │
  │  ✗ A bigger server or read replica would suffice         │
  │  ✗ Your team lacks distributed systems experience        │
  │  ✗ You don't have clear hot-spot-free shard key options  │
  │  ✗ Your primary need is high availability (use repl.)    │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 7 — Database Replication](chapter-07-database-replication.md) → Copying data across nodes for high availability and read scaling.*
