# Chapter 11: CAP Theorem — Trade-offs in Distributed Systems

> *"You can't have it all. Every distributed system chooses which guarantees to sacrifice when things go wrong."*

---

## 11.1 — What Is the CAP Theorem?

The **CAP Theorem** (Brewer's Theorem, 2000; proven by Gilbert and Lynch, 2002) states that a distributed data store can provide at most **two** of the following three guarantees simultaneously:

```
                    THE CAP TRIANGLE

                         Consistency
                            ╱╲
                           ╱  ╲
                          ╱    ╲
                         ╱  CP  ╲
                        ╱        ╲
                       ╱          ╲
                      ╱────────────╲
                     ╱    AP        ╲
                    ╱                ╲
                   ╱──────────────────╲
                  ╱        CA          ╲
                 ╱                      ╲
                ╱────────────────────────╲

         Availability              Partition
                                  Tolerance

  CA: Consistency + Availability (no partition tolerance)
  CP: Consistency + Partition Tolerance (sacrifice availability)
  AP: Availability + Partition Tolerance (sacrifice consistency)
```

### The Three Guarantees

| Guarantee | Definition |
|---|---|
| **Consistency (C)** | Every read receives the most recent write or an error. All nodes see the same data at the same time. |
| **Availability (A)** | Every request receives a (non-error) response, without guaranteeing it contains the most recent write. |
| **Partition Tolerance (P)** | The system continues to operate despite network partitions (messages lost between nodes). |

### The Core Insight

In a distributed system, network partitions **will** happen. You cannot prevent them. Therefore, the real choice is:

```
  WHEN A NETWORK PARTITION OCCURS:

  Option 1: CP — Stop serving reads/writes (sacrifice availability)
  Option 2: AP — Serve stale data (sacrifice consistency)

  There is no Option 3 that avoids both.
```

---

## 11.2 — Why Partitions Are Inevitable

```
  NETWORK PARTITION SCENARIO
  ═══════════════════════════

  Normal Operation:
  ┌──────────┐   ✅   ┌──────────┐
  │  Node A  │◄──────►│  Node B  │
  │ (US-East)│        │ (EU-West)│
  └──────────┘        └──────────┘

  After Partition:
  ┌──────────┐   ❌   ┌──────────┐
  │  Node A  │ ╳╳╳╳╳ │  Node B  │
  │ (US-East)│  DEAD  │ (EU-West)│
  └──────────┘  LINK  └──────────┘

  Node A: "I don't know what Node B has"
  Node B: "I don't know what Node A has"

  Both must decide: REFUSE requests or SERVE potentially stale data?
```

Real-world causes of partitions:

| Cause | Frequency | Impact |
|---|---|---|
| **Network hardware failure** | Common | Switch/router failure |
| **Cloud AZ outage** | Occasional | AWS/GCP zone failure |
| **DNS failures** | Uncommon | Name resolution broken |
| **Configuration errors** | Common | Firewall rules, routing tables |
| **Congestion** | Common | Packet loss, timeouts |
| **Cable cuts** | Rare | Undersea cables, fiber cuts |

---

## 11.3 — CP Systems: Consistency Over Availability

When a partition occurs, CP systems **refuse to serve requests** rather than return stale data.

```
  CP SYSTEM BEHAVIOR
  ═══════════════════

  ┌──────────┐   PARTITION   ┌──────────┐
  │  Node A  │ ╳╳╳╳╳╳╳╳╳╳╳ │  Node B  │
  │ (Primary)│              │ (Replica)│
  └──────────┘              └──────────┘

  Client asks Node B for data:
  Node B: "I can't reach Node A. I might have stale data."
  Node B: Returns ERROR (sacrifices availability)
```

### Examples of CP Systems

| System | Why CP |
|---|---|
| **MongoDB** (with majority write concern) | Writes require majority acknowledgment |
| **etcd** | Uses Raft consensus; minority partition cannot elect leader |
| **ZooKeeper** | Requires quorum for write operations |
| **HBase** | Depends on HMaster; region servers may become unavailable |
| **Redis Cluster** | Minority partitions cannot serve writes |
| **PostgreSQL** (synchronous replication) | Primary waits for replica acknowledgment |

### CP Trade-offs

```
  CP: WHAT YOU GAIN vs WHAT YOU LOSE

  ✅ GAIN:
  • Strong consistency (linearizability)
  • No stale reads
  • Simplified reasoning about data
  • Correct results for financial/medical data

  ❌ LOSE:
  • Availability during partitions
  • Write latency (must wait for quorum)
  • Potential downtime for reads too
  • Users see errors during network issues
```

---

## 11.4 — AP Systems: Availability Over Consistency

When a partition occurs, AP systems **continue serving requests** even if the data might be stale.

```
  AP SYSTEM BEHAVIOR
  ═══════════════════

  ┌──────────┐   PARTITION   ┌──────────┐
  │  Node A  │ ╳╳╳╳╳╳╳╳╳╳╳ │  Node B  │
  │ (Primary)│              │ (Replica)│
  └──────────┘              └──────────┘

  Client asks Node B for data:
  Node B: "I can't reach Node A, but I'll serve what I have."
  Node B: Returns STALE DATA (sacrifices consistency)
```

### Examples of AP Systems

| System | Why AP |
|---|---|
| **Cassandra** | Tunable consistency; default is AP (ONE/LOCAL_QUORUM) |
| **DynamoDB** | Eventually consistent reads by default |
| **CouchDB** | Multi-master replication; conflicts resolved later |
| **Riak** | Designed for AP with conflict resolution |
| **DNS** | Eventually consistent; cached records may be stale |

### AP Trade-offs

```
  AP: WHAT YOU GAIN vs WHAT YOU LOSE

  ✅ GAIN:
  • High availability (always responds)
  • Low latency (no waiting for quorum)
  • Resilience to network issues
  • Better user experience during failures

  ❌ LOSE:
  • Strong consistency
  • May serve stale data
  • Conflict resolution complexity
  • Harder to reason about correctness
```

---

## 11.5 — CA Systems: The Myth

CA systems provide consistency and availability but **no partition tolerance**. This is only possible when the system runs on a single node or on a perfectly reliable network — which doesn't exist in practice.

```
  CA SYSTEM: POSSIBLE ONLY WITHOUT PARTITIONS

  ┌──────────────────────────────────────┐
  │  Single Node (no distribution)       │
  │                                      │
  │  ✅ Consistent (single source)       │
  │  ✅ Available (no network to fail)   │
  │  ❌ Not partition-tolerant           │
  │  ❌ Single point of failure          │
  │                                      │
  └──────────────────────────────────────┘

  Examples: SQLite, single PostgreSQL instance

  In practice: You need partition tolerance for any distributed system.
  So the real choice is CP or AP.
```

---

## 11.6 — PACELC: Beyond CAP

The PACELC theorem extends CAP to cover normal operation (not just partitions):

```
  PACELC THEOREM
  ═══════════════

  IF there's a Partition:
    Choose between Availability and Consistency (A vs C)

  ELSE (normal operation):
    Choose between Latency and Consistency (L vs C)

  ┌───────────────────────────────────────────────┐
  │                                               │
  │  PA/EL: Cassandra, DynamoDB                   │
  │  (Available during partition,                  │
  │   Low latency normally)                       │
  │                                               │
  │  PA/EC: MongoDB (tunable)                     │
  │  (Available during partition,                  │
  │   Consistent normally)                        │
  │                                               │
  │  PC/EL: Many RDBMS with async replication    │
  │  (Consistent during partition,                 │
  │   Low latency normally)                       │
  │                                               │
  │  PC/EC: Spanner, CockroachDB                 │
  │  (Consistent during partition,                 │
  │   Consistent normally — but higher latency)   │
  │                                               │
  └───────────────────────────────────────────────┘
```

| System | Partition: A or C | Normal: L or C | Full Label |
|---|---|---|---|
| **Cassandra** | A (available) | L (low latency) | PA/EL |
| **DynamoDB** | A (available) | L (low latency) | PA/EL |
| **PostgreSQL** (sync repl) | C (consistent) | C (consistent) | PC/EC |
| **CockroachDB** | C (consistent) | C (consistent) | PC/EC |
| **MongoDB** (majority) | C (consistent) | C (consistent) | PC/EC |
| **Redis** | A (available) | L (low latency) | PA/EL |
| **Spanner** | C (consistent) | C (consistent) | PC/EC |

---

## 11.7 — Real-World Database Classifications

```
  DATABASE CAP CLASSIFICATION
  ════════════════════════════

  CP Systems (Consistency + Partition Tolerance):
  ┌─────────────────────────────────────────────────────────┐
  │  etcd         │ Consensus-based; quorum required        │
  │  ZooKeeper    │ Consensus-based; leader election        │
  │  HBase        │ Depends on HMaster availability         │
  │  MongoDB*     │ With writeConcern: majority             │
  │  Redis Cluster│ Minority shards become unavailable      │
  └─────────────────────────────────────────────────────────┘

  AP Systems (Availability + Partition Tolerance):
  ┌─────────────────────────────────────────────────────────┐
  │  Cassandra    │ Tunable; default is AP                  │
  │  DynamoDB     │ Eventually consistent reads default     │
  │  CouchDB      │ Multi-master; conflict resolution       │
  │  Riak         │ Designed for AP; CRDTs for convergence  │
  │  DNS          │ Eventually consistent                   │
  └─────────────────────────────────────────────────────────┘

  * MongoDB is tunable: writeConcern: 1 is AP; writeConcern: majority is CP
```

---

## 11.8 — Consistency Models

CAP talks about "consistency," but consistency comes in many flavors:

```
  CONSISTENCY SPECTRUM
  ═════════════════════

  STRONG ◄────────────────────────────────────────► WEAK

  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │Lineariza-│ Sequential│ Causal   │Eventual  │ Read-your│
  │bility    │           │          │          │-own-write│
  └──────────┴──────────┴──────────┴──────────┴──────────┘

  Linearizability:  Like a single copy; reads see latest write
  Sequential:       All operations appear in some total order
  Causal:           Respect cause-and-effect relationships
  Eventual:         All replicas converge eventually
  Read-your-own:    You always see your own writes (but not others')
```

| Model | Guarantee | Latency | Systems |
|---|---|---|---|
| **Linearizable** | Strictest; real-time ordering | Highest | Spanner, etcd |
| **Sequential** | Total order, but not real-time | High | ZooKeeper |
| **Causal** | Partial order respecting causation | Medium | MongoDB (causal sessions) |
| **Eventual** | Eventually consistent | Lowest | Cassandra, DynamoDB |
| **Read-your-writes** | You see your own writes | Low | Most with session stickiness |

---

## 11.9 — Making Practical Decisions

### 11.9.1 — Decision Framework

```
  CHOOSING CP vs AP
  ═══════════════════

  Ask these questions:

  1. Is stale data dangerous?
     ├── YES (financial, medical, legal) → CP
     └── NO (social media, analytics) → AP

  2. Is uptime critical?
     ├── YES (e-commerce, messaging) → AP
     └── NO (batch processing) → CP

  3. What's the cost of inconsistency?
     ├── High (double-charging, wrong medical dosage) → CP
     └── Low (delayed notification, slightly stale feed) → AP

  4. Can you handle conflicts?
     ├── YES (automated resolution) → AP
     └── NO (manual resolution needed) → CP
```

### 11.9.2 — Hybrid Approaches

Most real-world systems don't choose purely CP or AP. They use **tunable consistency**:

```python
"""
Tunable consistency: different operations get different guarantees.
"""
from enum import Enum


class ConsistencyLevel(Enum):
    ONE = "one"              # AP: fast, possibly stale
    QUORUM = "quorum"        # Middle ground
    ALL = "all"              # CP: slow, always consistent
    LOCAL_QUORUM = "local_quorum"  # AP with local consistency


class TunableConsistencyDB:
    """Simulate tunable consistency like Cassandra."""

    def __init__(self, nodes: list[str]) -> None:
        self._nodes = nodes
        self._data: dict[str, dict] = {}
        self._node_count = len(nodes)
        self._quorum = (self._node_count // 2) + 1

    def write(
        self,
        key: str,
        value: dict,
        consistency: ConsistencyLevel = ConsistencyLevel.QUORUM,
    ) -> dict:
        """Write with specified consistency level."""
        required_acks = self._get_required_acks(consistency)
        actual_acks = min(self._node_count, required_acks)

        self._data[key] = value

        return {
            "key": key,
            "value": value,
            "consistency": consistency.value,
            "acks_received": actual_acks,
            "acks_required": required_acks,
            "acknowledged_by": self._nodes[:actual_acks],
        }

    def read(
        self,
        key: str,
        consistency: ConsistencyLevel = ConsistencyLevel.QUORUM,
    ) -> dict:
        """Read with specified consistency level."""
        required_responses = self._get_required_acks(consistency)
        value = self._data.get(key)

        return {
            "key": key,
            "value": value,
            "consistency": consistency.value,
            "responses_received": min(self._node_count, required_responses),
            "is_latest": consistency in (ConsistencyLevel.ALL, ConsistencyLevel.QUORUM),
        }

    def _get_required_acks(self, consistency: ConsistencyLevel) -> int:
        if consistency == ConsistencyLevel.ONE:
            return 1
        elif consistency == ConsistencyLevel.QUORUM:
            return self._quorum
        elif consistency == ConsistencyLevel.ALL:
            return self._node_count
        elif consistency == ConsistencyLevel.LOCAL_QUORUM:
            return self._quorum
        return 1


# --- Demo ---
db = TunableConsistencyDB(["node-1", "node-2", "node-3", "node-4", "node-5"])

print("=== Tunable Consistency Demo ===\n")

# Write with different consistency levels
for level in [ConsistencyLevel.ONE, ConsistencyLevel.QUORUM, ConsistencyLevel.ALL]:
    result = db.write("user:1", {"name": "Alice"}, consistency=level)
    print(f"Write (consistency={level.value}):")
    print(f"  Acks: {result['acks_received']}/{result['acks_required']}")

# Read with different consistency levels
print()
for level in [ConsistencyLevel.ONE, ConsistencyLevel.QUORUM, ConsistencyLevel.ALL]:
    result = db.read("user:1", consistency=level)
    print(f"Read (consistency={level.value}):")
    print(f"  Latest: {result['is_latest']}, Value: {result['value']}")
```

---

## 11.10 — Real-World Case Studies

### 11.10.1 — Amazon Dynamo (2007)

Amazon's Dynamo paper is the blueprint for AP systems:

- **Goal**: "Never reject a write" — shopping cart must always be writable
- **Solution**: Vector clocks for conflict detection; last-writer-wins for resolution
- **Trade-off**: Users might see slightly stale data, but the cart is always available

### 11.10.2 — Google Spanner

Spanner achieves external consistency (stronger than linearizability):

- **Mechanism**: TrueTime API (atomic clocks + GPS) for global timestamps
- **Trade-off**: Higher write latency (must wait for TrueTime uncertainty to resolve)
- **Use case**: Financial systems where consistency is non-negotiable

### 11.10.3 — Netflix

Netflix uses AP systems for availability:

- **Cassandra** for user viewing history (eventually consistent is fine)
- **CP systems** (ZooKeeper) for cluster coordination
- **Hybrid approach**: Different data gets different guarantees

---

## 11.11 — Anti-Patterns and Pitfalls

```
  COMMON CAP MISTAKES
  ════════════════════

  ✗ Assuming CAP means "pick two and you're done"
    → CAP only applies during partitions; normal operation is different (PACELC)

  ✗ Choosing AP for financial data
    → Stale reads can cause double-charging

  ✗ Choosing CP without considering availability impact
    → Users see errors during every network hiccup

  ✗ Not testing partition scenarios
    → Your system WILL face partitions; simulate them

  ✗ Ignoring the consistency model
    → "Eventually consistent" means different things to different databases

  ✗ Treating CAP as the only consideration
    → Latency, durability, and operational complexity matter too
```

---

## 11.12 — Architecture Decision Matrix

```
  DECISION: CP OR AP?

  ┌─────────────────────────────┬──────────────────────────────────────────┐
  │  Scenario                   │  Recommendation                          │
  ├─────────────────────────────┼──────────────────────────────────────────┤
  │  Banking / payments         │  CP (never serve stale balance)          │
  │  Social media feed          │  AP (slightly stale is fine)             │
  │  E-commerce inventory       │  CP for checkout; AP for browsing        │
  │  Real-time collaboration    │  AP with CRDTs for convergence           │
  │  Configuration management   │  CP (etcd, ZooKeeper)                    │
  │  Analytics / dashboards     │  AP (eventually consistent OK)           │
  │  Chat / messaging           │  AP (message delivery matters more)      │
  │  Session storage            │  AP (rebuild on miss)                    │
  └─────────────────────────────┴──────────────────────────────────────────┘
```

---

## 11.13 — Practice Exercises

### Exercise 1: Partition Simulation

Simulate a network partition between two nodes:
1. Create two "nodes" (Python objects) that replicate data
2. Simulate a partition (disable communication)
3. Write to both sides of the partition
4. Heal the partition
5. Implement both CP (reject writes during partition) and AP (accept writes, resolve later) strategies
6. Compare the results

### Exercise 2: Consistency Level Comparison

Using the `TunableConsistencyDB` from Section 11.9:
1. Write a value with `ONE` consistency
2. Write a different value with `ALL` consistency
3. Read with each consistency level
4. Discuss which reads return which value

### Exercise 3: CAP Classification

Classify the following systems as CP or AP and justify:
1. Redis Sentinel
2. MongoDB with `readConcern: majority`
3. PostgreSQL with synchronous replication
4. Amazon S3
5. Google Cloud DNS

---

## 11.14 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **CAP Theorem** | Distributed systems can guarantee at most 2 of: Consistency, Availability, Partition Tolerance |
| **Partitions are inevitable** | Networks fail; the real choice is CP or AP |
| **CP systems** | Refuse requests during partitions; strong consistency |
| **AP systems** | Serve stale data during partitions; high availability |
| **CA systems** | Only possible on single nodes; not truly distributed |
| **PACELC** | Extends CAP: also consider latency vs consistency during normal operation |
| **Tunable consistency** | Different operations can have different guarantees |
| **Consistency models** | Linearizable > Sequential > Causal > Eventual |
| **No free lunch** | Every choice has trade-offs; understand yours |

### When to Apply CAP Thinking

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  APPLY CAP THINKING WHEN:                                │
  │  ✓ Choosing a distributed database                       │
  │  ✓ Designing multi-region architectures                  │
  │  ✓ Setting replication strategies                        │
  │  ✓ Defining SLAs for availability and consistency        │
  │  ✓ Debugging data inconsistency issues                   │
  │                                                          │
  │  REMEMBER:                                               │
  │  • CAP only applies during partitions                    │
  │  • Most systems are tunable                              │
  │  • Consistency is a spectrum, not binary                  │
  │  • Test your system under partition conditions            │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 12 — Observability](chapter-12-observability.md) → Logs, metrics, and traces — the three pillars of understanding your system.*
