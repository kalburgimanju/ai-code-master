# Chapter 7: Database Replication — Copying Data Across Nodes for High Availability

> *"Replication is not about having two of everything — it's about never having zero of anything when you need it."*

---

## 7.1 — What Is Database Replication?

Database replication is the process of copying and maintaining data across multiple database servers (nodes). The goal is to ensure that data is available even if one server fails, and to distribute read load across multiple instances.

```
                    REPLICATION ARCHITECTURE
  ┌───────────────────────────────────────────────────────┐
  │                                                       │
  │          ┌──────────────────────┐                     │
  │          │   PRIMARY (Leader)   │                     │
  │          │   ─────────────────  │                     │
  │          │   • Accepts WRITES   │                     │
  │          │   • Source of truth  │                     │
  │          └──────────┬───────────┘                     │
  │                     │                                 │
  │          ┌──────────┼──────────┐                      │
  │          │          │          │                       │
  │          ▼          ▼          ▼                       │
  │   ┌──────────┐ ┌──────────┐ ┌──────────┐             │
  │   │ REPLICA 1│ │ REPLICA 2│ │ REPLICA 3│             │
  │   │ (Follower)│ │(Follower)│ │(Follower)│             │
  │   │ • Reads  │ │ • Reads  │ │ • Reads  │             │
  │   │ • Standby│ │ • Standby│ │ • Standby│             │
  │   └──────────┘ └──────────┘ └──────────┘             │
  │                                                       │
  │   Writes → Primary → Replicated to → Replicas         │
  │   Reads  → Distributed across any Replica             │
  └───────────────────────────────────────────────────────┘
```

Replication solves three fundamental problems:

| Problem | How Replication Helps |
|---|---|
| **High Availability** | If the primary dies, a replica can be promoted |
| **Read Scaling** | Distribute read queries across many replicas |
| **Disaster Recovery** | Geographically distant replicas survive regional outages |

---

## 7.2 — Replication Topologies

### 7.2.1 — Primary-Replica (Leader-Follower)

The most common topology. One primary accepts all writes; replicas read the primary's changes and apply them locally.

```
        ┌──────────────┐
        │   PRIMARY    │
        │   (Leader)   │
        └──────┬───────┘
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
   ┌───────┐┌───────┐┌───────┐
   │Replica││Replica││Replica│
   │   1   ││   2   ││   3   │
   └───────┘└───────┘└───────┘

   ✅ Simple mental model
   ✅ Strong consistency possible
   ✅ Primary is the single source of truth
   ❌ Single point of failure for writes
   ❌ Primary can become a bottleneck
```

### 7.2.2 — Multi-Primary (Multi-Leader)

Multiple nodes accept writes. Each primary replicates to the others (and to their respective replicas).

```
   ┌──────────┐  writes  ┌──────────┐
   │ PRIMARY 1│◄────────►│ PRIMARY 2│
   │ (US-East)│  replicate│(EU-West) │
   └────┬─────┘          └────┬─────┘
        │                     │
        ▼                     ▼
   ┌──────────┐         ┌──────────┐
   │ Replica  │         │ Replica  │
   └──────────┘         └──────────┘

   ✅ Write availability in multiple regions
   ✅ Survives regional failures
   ❌ Conflict resolution is complex
   ❌ Harder to maintain consistency
```

### 7.2.3 — Cascading Replication

Replicas replicate from other replicas, not directly from the primary.

```
   PRIMARY ──► Replica A ──► Replica B ──► Replica C

   ✅ Reduces load on primary
   ❌ Higher replication lag downstream
   ❌ Failure propagation risk
```

### 7.2.4 — Topology Comparison

| Feature | Primary-Replica | Multi-Primary | Cascading |
|---|---|---|---|
| **Write availability** | Single node | Multiple nodes | Single node |
| **Conflict risk** | None | High | None |
| **Replication lag** | Low | Medium | Increases downstream |
| **Complexity** | Low | High | Medium |
| **Best for** | Most applications | Multi-region active-active | Large read fan-out |

---

## 7.3 — Synchronous vs Asynchronous Replication

This is one of the most consequential architectural decisions in database design.

```
  SYNCHRONOUS REPLICATION
  ════════════════════════

  Client ──► PRIMARY ──► Replicate ──► Wait for ACK ──► Respond
                            │
                            ▼
                     ┌──────────┐
                     │ REPLICA  │
                     │ • Apply  │
                     │ • ACK    │──────────► (acks flow back)
                     └──────────┘

  ✅ Zero data loss (RPO = 0)
  ❌ Higher write latency
  ❌ If replica is down, primary may block


  ASYNCHRONOUS REPLICATION
  ═════════════════════════

  Client ──► PRIMARY ──► Respond immediately
                            │
                            ▼ (background)
                     ┌──────────┐
                     │ REPLICA  │
                     │ • Apply  │
                     │   later  │
                     └──────────┘

  ✅ Low write latency
  ❌ Data loss possible if primary fails before replication
  ❌ Replication lag can grow
```

### 7.3.1 — Semi-Synchronous Replication

A compromise: the primary waits for at least one replica to acknowledge before confirming the write.

```
  Client ──► PRIMARY ──► Replicate to 1+ replicas ──► Respond
                             │            │
                             ▼            ▼
                      ┌──────────┐  ┌──────────┐
                      │ REPLICA A│  │ REPLICA B│
                      │ (sync)   │  │ (async)  │
                      └──────────┘  └──────────┘

  ✅ Survives single-node failure without data loss
  ❌ Slightly higher latency than fully async
```

### Comparison Table

| Aspect | Sync | Semi-Sync | Async |
|---|---|---|---|
| **Data loss risk (RPO)** | 0 | 0 (if 1+ replicas alive) | Up to full lag window |
| **Write latency** | High (round-trip) | Medium | Low |
| **Availability impact** | Replica failure blocks writes | Degrades gracefully | None |
| **Best for** | Financial, medical | Most production systems | High-throughput logging |

---

## 7.4 — PostgreSQL Replication in Practice

### 7.4.1 — Streaming Replication (Synchronous)

PostgreSQL's native streaming replication is based on WAL (Write-Ahead Log) shipping.

```python
"""
PostgreSQL streaming replication setup and monitoring.
Requires psycopg2: pip install psycopg2-binary
"""
import time
from dataclasses import dataclass

import psycopg2


@dataclass
class ReplicaStatus:
    name: str
    state: str
    sync_state: str
    sent_lsn: str
    write_lsn: str
    flush_lsn: str
    replay_lsn: str
    replication_lag_bytes: int


def monitor_replication(primary_dsn: str) -> list[ReplicaStatus]:
    """Query pg_stat_replication on the primary to monitor replica health."""
    conn = psycopg2.connect(primary_dsn)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    application_name,
                    state,
                    sync_state,
                    sent_lsn::text,
                    write_lsn::text,
                    flush_lsn::text,
                    replay_lsn::text,
                    pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
                FROM pg_stat_replication
                ORDER BY application_name;
            """)
            results = []
            for row in cur.fetchall():
                results.append(ReplicaStatus(
                    name=row[0],
                    state=row[1],
                    sync_state=row[2],
                    sent_lsn=row[3],
                    write_lsn=row[4],
                    flush_lsn=row[5],
                    replay_lsn=row[6],
                    replication_lag_bytes=row[7] or 0,
                ))
            return results
    finally:
        conn.close()


def format_lag(lag_bytes: int) -> str:
    """Human-readable replication lag."""
    if lag_bytes < 1024:
        return f"{lag_bytes} B"
    elif lag_bytes < 1024 ** 2:
        return f"{lag_bytes / 1024:.1f} KB"
    elif lag_bytes < 1024 ** 3:
        return f"{lag_bytes / 1024**2:.1f} MB"
    else:
        return f"{lag_bytes / 1024**3:.2f} GB"


# --- Monitoring loop (run periodically) ---
def watch_replication(primary_dsn: str, interval_seconds: int = 5) -> None:
    """Continuously monitor replication lag and alert on thresholds."""
    MAX_LAG_BYTES = 100 * 1024 * 1024  # 100 MB threshold

    while True:
        replicas = monitor_replication(primary_dsn)
        for rep in replicas:
            lag_str = format_lag(rep.replication_lag_bytes)
            status = "✅" if rep.replication_lag_bytes < MAX_LAG_BYTES else "⚠️  ALERT"
            print(
                f"  {status} {rep.name}: state={rep.state}, "
                f"sync={rep.sync_state}, lag={lag_str}"
            )

            if rep.replication_lag_bytes >= MAX_LAG_BYTES:
                print(f"    ⚠️  Replication lag exceeds threshold! "
                      f"Consider investigation.")

        time.sleep(interval_seconds)


if __name__ == "__main__":
    DSN = "host=primary.example.com dbname=myapp user=replicator password=secret"
    watch_replication(DSN)
```

### 7.4.2 — Logical Replication (Selective)

Logical replication replicates at the database object level (tables, schemas), not the entire database.

```sql
-- On the PRIMARY (publisher):
CREATE PUBLICATION my_publication FOR TABLE users, orders;

-- On the REPLICA (subscriber):
CREATE SUBSCRIPTION my_subscription
    CONNECTION 'host=primary.example.com dbname=myapp user=replicator password=secret'
    PUBLICATION my_publication;
```

```python
"""
Logical replication with conflict monitoring.
Useful when you need selective table replication or
version-aware schema migrations.
"""
from dataclasses import dataclass

import psycopg2


@dataclass
class ConflictInfo:
    relation: str
    oid: int
    conflicting_lsn: str
    error_message: str


def check_logical_replication_conflicts(subscriber_dsn: str) -> list[ConflictInfo]:
    """Monitor logical replication for conflicts on the subscriber."""
    conn = psycopg2.connect(subscriber_dsn)
    try:
        with conn.cursor() as cur:
            # Check subscription status
            cur.execute("""
                SELECT
                    subname,
                    subenabled,
                    subconninfo
                FROM pg_subscription;
            """)
            subscriptions = cur.fetchall()
            for sub in subscriptions:
                print(f"  Subscription: {sub[0]}, enabled={sub[1]}")

            # Check replication slots
            cur.execute("""
                SELECT
                    slot_name,
                    active,
                    xmin,
                    pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) AS lag_bytes
                FROM pg_replication_slots;
            """)
            slots = cur.fetchall()
            for slot in slots:
                print(
                    f"  Slot: {slot[0]}, active={slot[1]}, "
                    f"lag={slot[3] or 0} bytes"
                )

            return []
    finally:
        conn.close()
```

---

## 7.5 — Replication Lag: The Silent Killer

Replication lag is the delay between a write committed on the primary and the same write being available on a replica. It causes a class of bugs that are extremely difficult to diagnose.

```
  THE "READ-YOUR-OWN-WRITE" PROBLEM
  ═══════════════════════════════════

  Time ──►

  1. User writes to PRIMARY: UPDATE users SET name = 'Alice' WHERE id = 1
  2. User immediately reads from REPLICA: SELECT name FROM users WHERE id = 1
  3. Replica still has OLD data (name = 'Bob') ← REPLICATION LAG!

  ┌────────────┐          ┌────────────┐
  │  PRIMARY   │          │  REPLICA   │
  │  name=Alice│─────────►│  name=Bob  │  ← Not yet applied
  │  (t=0)     │  lag: 5s │  (stale)  │
  └────────────┘          └────────────┘
```

### Strategies to Mitigate Replication Lag

| Strategy | How It Works | Trade-off |
|---|---|---|
| **Read-after-write routing** | Route reads to the primary immediately after a write | Reduces read scaling benefit |
| **Causal consistency tokens** | Pass a timestamp/LSN from the write; the replica waits until it has replayed past that point | Adds latency to reads |
| **Synchronous replication** | The primary waits for the replica to confirm | Higher write latency |
| **Lag monitoring** | Alert when lag exceeds threshold; route away from lagging replicas | Reactive, not preventive |

---

## 7.6 — Handling Primary Failover

When the primary dies, a replica must be promoted. This process is called **failover**.

```
  FAILOVER SEQUENCE
  ═══════════════════

  Step 1: DETECT            Step 2: ELECT            Step 3: PROMOTE
  ┌──────────┐             ┌──────────┐             ┌──────────┐
  │ PRIMARY  │             │ PRIMARY  │             │ PRIMARY  │
  │ (dead)   │             │ (dead)   │             │ (dead)   │
  └──────────┘             └──────────┘             └──────────┘
       │                        │                        │
  Health check              Consensus                Promote
  fails (3x)                protocol                  replica
       │                        │                        │
       ▼                        ▼                        ▼
  ┌──────────┐             ┌──────────┐             ┌──────────┐
  │ REPLICA 1│             │ REPLICA 1│             │ NEW      │
  │          │             │(selected)│             │ PRIMARY  │
  └──────────┘             └──────────┘             └──────────┘

  Step 4: REPOINT            Step 5: RESUME
  ┌──────────┐               ┌──────────┐
  │ NEW      │               │ NEW      │
  │ PRIMARY  │               │ PRIMARY  │
  └────┬─────┘               └────┬─────┘
       │                           │
  App reads                   Application
  updated config              resumes normal
  or DNS changes              operations
```

### Failover Checklist

```
  FAILOVER CHECKLIST
  ══════════════════

  □ Detect primary failure (heartbeat timeout, e.g., 3 failures in 10s)
  □ Ensure no split-brain (two primaries simultaneously)
  □ Select the most up-to-date replica (highest replay_lsn)
  □ Promote the selected replica to primary
  □ Update DNS / connection strings / load balancer
  □ Reconfigure remaining replicas to follow the new primary
  □ Verify no data loss (compare LSN positions)
  □ Notify monitoring / on-call
  □ Investigate root cause of primary failure
```

---

## 7.7 — Multi-Primary Conflict Resolution

When multiple nodes accept writes, conflicts are inevitable.

```
  CONFLICT SCENARIO
  ═══════════════════

  Primary US-East:  UPDATE users SET balance = 150 WHERE id = 1;  (t=10:00:01)
  Primary EU-West:  UPDATE users SET balance = 200 WHERE id = 1;  (t=10:00:01)

  Both committed locally. Now they replicate to each other.
  Which value wins?
```

### Conflict Resolution Strategies

| Strategy | Description | When to Use |
|---|---|---|
| **Last-Write-Wins (LWV)** | Timestamp-based; latest write overwrites | Simple data, loss acceptable |
| **Merge function** | Custom logic to combine values (e.g., SUM of balances) | Numeric aggregations |
| **Conflict-free Replicated Data Types (CRDTs)** | Data structures that converge automatically | Counter, set, register types |
| **Application-level resolution** | Application detects and resolves conflicts | Complex business logic required |
| **Partition by write ownership** | Each node owns different keys (no conflicts) | Multi-tenant with region affinity |

```python
"""
Last-writer-wins conflict resolution for multi-primary replication.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class VersionedRecord:
    key: str
    value: str
    updated_at: datetime
    origin_node: str

    def __repr__(self) -> str:
        return (
            f"Record(key={self.key!r}, value={self.value!r}, "
            f"at={self.updated_at.isoformat()}, node={self.origin_node!r})"
        )


class LastWriterWinsResolver:
    """Resolve replication conflicts using last-write-wins with timestamp tie-breaking."""

    def __init__(self, node_id: str) -> None:
        self.node_id = node_id
        self.records: dict[str, VersionedRecord] = {}

    def write(self, key: str, value: str, timestamp: datetime | None = None) -> None:
        """Local write on this node."""
        ts = timestamp or datetime.now(timezone.utc)
        record = VersionedRecord(key=key, value=value, updated_at=ts, origin_node=self.node_id)
        self._merge_or_insert(record)

    def receive_replica(self, record: VersionedRecord) -> None:
        """Receive a replicated record and resolve conflicts."""
        self._merge_or_insert(record)

    def _merge_or_insert(self, incoming: VersionedRecord) -> None:
        existing = self.records.get(incoming.key)
        if existing is None:
            self.records[incoming.key] = incoming
            return

        # LWW: compare timestamps, then node_id for tie-breaking
        if incoming.updated_at > existing.updated_at:
            self.records[incoming.key] = incoming
        elif incoming.updated_at == existing.updated_at and incoming.origin_node > existing.origin_node:
            self.records[incoming.key] = incoming
        # else: existing wins (no change)

    def get(self, key: str) -> VersionedRecord | None:
        return self.records.get(key)


# --- Demonstration ---
resolver = LastWriterWinsResolver(node_id="us-east")

resolver.write("user:1:balance", "150", datetime(2026, 1, 1, 10, 0, 1))
print("After US-East write:", resolver.get("user:1:balance"))

# Replicate from EU-West (earlier timestamp — loses the conflict)
eu_record = VersionedRecord(
    key="user:1:balance",
    value="200",
    updated_at=datetime(2026, 1, 1, 10, 0, 0),  # 1 second earlier
    origin_node="eu-west",
)
resolver.receive_replica(eu_record)
print("After EU-West replicate:", resolver.get("user:1:balance"))
# The US-East value (150) wins because it had the later timestamp
```

---

## 7.8 — Replication Patterns by Database

| Database | Native Replication | Type | Notes |
|---|---|---|---|
| **PostgreSQL** | Streaming + Logical | WAL-based | Synchronous or asynchronous; logical for selective tables |
| **MySQL** | InnoDB Replica | Binlog-based | Semi-sync available via plugin |
| **MongoDB** | Replica Sets | Oplog-based | Automatic failover with elections |
| **CockroachDB** | Raft Consensus | Multi-region | Automatic replication with consistency guarantees |
| **Cassandra** | Gossip Protocol | Tunable | QUORUM reads/writes for consistency |
| **Redis** | Sentinel / Cluster | Async | For caching; not recommended for durability |

---

## 7.9 — Replication Monitoring Dashboard

```python
"""
Replication health monitoring — production-ready metrics collection.
Emits metrics suitable for Prometheus or similar monitoring systems.
"""
from dataclasses import dataclass
from enum import Enum


class ReplicaHealth(Enum):
    HEALTHY = "healthy"
    LAGGING = "lagging"
    DISCONNECTED = "disconnected"
    SYNCED = "synced"


@dataclass
class ReplicationMetric:
    replica_name: str
    lag_bytes: int
    lag_seconds: float
    state: str
    health: ReplicaHealth
    last_write_lsn: str
    replay_lsn: str


THRESHOLDS = {
    "lag_warning_bytes": 10 * 1024 * 1024,     # 10 MB
    "lag_critical_bytes": 100 * 1024 * 1024,    # 100 MB
    "lag_disconnected_seconds": 300,             # 5 minutes
}


def evaluate_replica_health(
    lag_bytes: int,
    lag_seconds: float,
    is_connected: bool,
) -> ReplicaHealth:
    """Determine replica health based on lag and connectivity."""
    if not is_connected:
        return ReplicaHealth.DISCONNECTED
    if lag_bytes == 0:
        return ReplicaHealth.SYNCED
    if lag_bytes >= THRESHOLDS["lag_critical_bytes"]:
        return ReplicaHealth.LAGGING
    return ReplicaHealth.HEALTHY


def generate_alert(metric: ReplicationMetric) -> str | None:
    """Generate an alert message if the replica needs attention."""
    if metric.health == ReplicaHealth.DISCONNECTED:
        return f"🔴 CRITICAL: Replica {metric.replica_name} is disconnected!"
    if metric.health == ReplicaHealth.LAGGING:
        lag_mb = metric.lag_bytes / (1024 * 1024)
        return (
            f"🟡 WARNING: Replica {metric.replica_name} lagging by "
            f"{lag_mb:.1f} MB ({metric.lag_seconds:.1f}s)"
        )
    return None


# --- Example metrics output ---
def print_dashboard(metrics: list[ReplicationMetric]) -> None:
    """Print a text-based replication dashboard."""
    print("\n" + "=" * 70)
    print("  REPLICATION DASHBOARD")
    print("=" * 70)
    print(f"  {'Replica':<15} {'State':<12} {'Lag':<12} {'Health':<12}")
    print("-" * 70)
    for m in metrics:
        health_icon = {
            ReplicaHealth.SYNCED: "🟢",
            ReplicaHealth.HEALTHY: "🟢",
            ReplicaHealth.LAGGING: "🟡",
            ReplicaHealth.DISCONNECTED: "🔴",
        }[m.health]
        lag_str = f"{m.lag_bytes / 1024**2:.1f} MB" if m.lag_bytes > 0 else "0 B"
        print(f"  {m.replica_name:<15} {m.state:<12} {lag_str:<12} {health_icon} {m.health.value}")
    print("=" * 70)


# --- Sample data ---
sample_metrics = [
    ReplicationMetric("replica-1", 0, 0.0, "streaming", ReplicaHealth.SYNCED, "0/1000000", "0/1000000"),
    ReplicationMetric("replica-2", 5_000_000, 2.3, "streaming", ReplicaHealth.HEALTHY, "0/1000000", "0/FE7A00"),
    ReplicationMetric("replica-3", 150_000_000, 45.7, "streaming", ReplicaHealth.LAGGING, "0/1000000", "0/800000"),
    ReplicationMetric("replica-4", 0, 0.0, "disconnected", ReplicaHealth.DISCONNECTED, "0/1000000", "0/500000"),
]

print_dashboard(sample_metrics)

for metric in sample_metrics:
    alert = generate_alert(metric)
    if alert:
        print(f"\n  {alert}")
```

---

## 7.10 — Real-World Case Studies

### 7.10.1 — GitHub's MySQL Replication

GitHub runs one of the largest MySQL deployments in the world. Their replication topology includes:

- **Primary** in their US data center
- **Read replicas** for every production database
- **Orchestration** via `Orchestrator` — a tool that automates failover, topology management, and repair
- **Semi-synchronous** replication to prevent data loss during failover

Key lesson: **Automate failover**. Manual failover at 3 AM is error-prone and slow.

### 7.10.2 — PostgreSQL at Instagram

Instagram uses PostgreSQL with:

- **Streaming replication** for read replicas
- **Logical replication** for selective table sync to analytics
- Custom **connection pooler** (PgBouncer) to handle thousands of connections

### 7.10.3 — CockroachDB Multi-Region

CockroachDB uses Raft consensus to replicate data across regions:

| Configuration | Replication Factor | Behavior |
|---|---|---|
| Single region | 3 replicas | Survives 1 node failure |
| Multi-region (3 regions) | 3 replicas (1 per region) | Survives 1 region failure |
| Multi-region (5 regions) | 5 replicas | Survives 2 region failures |

---

## 7.11 — Anti-Patterns and Pitfalls

```
  COMMON REPLICATION MISTAKES
  ════════════════════════════

  ✗ Assuming replicas are always consistent with the primary
    → Read-after-write requires routing to primary or waiting for lag

  ✗ Ignoring replication lag monitoring
    → Silent data inconsistency for users

  ✗ Running long transactions on the primary
    → Replication lag spikes; replicas fall behind

  ✗ Using replication as a backup strategy
    → Replication copies errors too (logical deletes, corruption)

  ✗ Not testing failover regularly
    → Failover only works if you practice it

  ✗ Having too many replicas per primary
    → Primary must ship WAL to every replica; I/O increases
```

---

## 7.12 — Architecture Decision Matrix

```
  DECISION: WHAT REPLICATION STRATEGY?

  ┌──────────────────────────┬────────────────────────────────────────┐
  │  Scenario                │  Recommended Approach                   │
  ├──────────────────────────┼────────────────────────────────────────┤
  │  Read scaling            │  Primary + async replicas              │
  │  High availability       │  Semi-sync primary + 2+ replicas       │
  │  Multi-region reads      │  Async replicas per region             │
  │  Multi-region writes     │  Multi-primary + conflict resolution   │
  │  Zero data loss          │  Synchronous replication               │
  │  High write throughput   │  Async replication + accept lag        │
  │  Compliance (GDPR)       │  Regional primary + local replicas     │
  └──────────────────────────┴────────────────────────────────────────┘
```

---

## 7.13 — Practice Exercises

### Exercise 1: Lag-Aware Read Router

Implement a Python function `route_read()` that accepts a list of replicas and a consistency token (LSN). It should return the first replica whose `replay_lsn` is greater than or equal to the token. If no replica qualifies, route to the primary.

### Exercise 2: Failover Simulation

Write a script that simulates a primary failure:
1. Create 3 "nodes" (dictionaries with state)
2. The primary is "alive" for 10 iterations, then "dies"
3. Implement a `detect_failure()` function that checks heartbeats
4. Implement `promote_replica()` that selects the replica with the highest LSN
5. Verify the new primary handles incoming "writes"

### Exercise 3: Conflict Resolution

Given two multi-primary nodes, each with the following writes:
- Node A: `{name: "Alice", age: 30, timestamp: 10:00:01}`
- Node B: `{name: "Alice", age: 31, timestamp: 10:00:02}`

Implement and compare: (a) last-write-wins, (b) field-level merge, (c) application-defined merge. Which preserves the most data?

---

## 7.14 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **What is replication** | Copying data across nodes for availability and read scaling |
| **Primary-replica** | One leader for writes, many followers for reads |
| **Multi-primary** | Multiple leaders; requires conflict resolution |
| **Synchronous** | Zero data loss but higher write latency |
| **Asynchronous** | Lower latency but risk of data loss during failover |
| **Semi-synchronous** | Best compromise for most production systems |
| **Replication lag** | The delay between primary write and replica availability |
| **Failover** | Automatic promotion of a replica when the primary fails |
| **Conflict resolution** | LWW, CRDTs, or custom merge functions for multi-primary |
| **Monitoring** | Always monitor lag; alert before users notice |

### When to Use Replication

```
  ┌──────────────────────────────────────────────────────┐
  │                                                      │
  │  USE REPLICATION WHEN:                               │
  │  ✓ You need high availability (no single point of   │
  │    failure)                                          │
  │  ✓ Read traffic exceeds single-server capacity       │
  │  ✓ You need geographic redundancy                    │
  │  ✓ You want zero-downtime deployments               │
  │                                                      │
  │  COMBINE WITH SHARDING WHEN:                         │
  │  ✓ Both reads AND writes exceed single-server        │
  │    capacity                                          │
  │  ✓ Dataset is too large for one server               │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 8 — API Gateway](chapter-08-api-gateway.md) → Routing, securing, and managing requests at the edge.*
