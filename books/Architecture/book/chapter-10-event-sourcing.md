# Chapter 10: Event Sourcing — Storing Every Change as an Immutable Event

> *"Don't tell me what the world looks like today. Show me everything that happened, and I'll figure it out myself."*

---

## 10.1 — What Is Event Sourcing?

Event sourcing is an architectural pattern where state changes are stored as an immutable sequence of events rather than as the current state. Instead of overwriting a row in a database, you append a new event describing what changed. The current state is derived by replaying all events from the beginning (or from a snapshot).

```
            TRADITIONAL (CRUD) STORAGE
  ┌────────────────────────────────────────────────┐
  │                                                │
  │   accounts table:                              │
  │   ┌────┬─────────┬─────────┐                   │
  │   │ id │ balance │ status  │                   │
  │   ├────┼─────────┼─────────┤                   │
  │   │ 1  │ 250.00  │ active  │  ← current state │
  │   └────┴─────────┴─────────┘                   │
  │                                                │
  │   History: LOST when overwritten               │
  └────────────────────────────────────────────────┘

            EVENT SOURCED STORAGE
  ┌────────────────────────────────────────────────┐
  │                                                │
  │   events table (append-only):                  │
  │   ┌────┬──────────────────┬─────────┬──────┐   │
  │   │seq │ event_type       │ data    │ time │   │
  │   ├────┼──────────────────┼─────────┼──────┤   │
  │   │ 1  │ AccountCreated   │ {…}     │ 10:00│   │
  │   │ 2  │ MoneyDeposited   │ {…}     │ 10:05│   │
  │   │ 3  │ MoneyWithdrawn   │ {…}     │ 10:15│   │
  │   │ 4  │ MoneyDeposited   │ {…}     │ 10:30│   │
  │   └────┴──────────────────┴─────────┴──────┘   │
  │                                                │
  │   Current state = replay all events → $250     │
  │   History: FULLY PRESERVED                     │
  └────────────────────────────────────────────────┘
```

### Core Principles

| Principle | Description |
|---|---|
| **Append-only** | Events are never modified or deleted |
| **Immutable** | Once written, an event is permanent |
| **Ordered** | Events form a chronological sequence per aggregate |
| **State derivation** | Current state is computed by replaying events |
| **Complete history** | Every change is recorded; nothing is lost |

---

## 10.2 — Event Sourcing vs CRUD

| Aspect | CRUD | Event Sourcing |
|---|---|---|
| **Storage** | Current state only | All state changes |
| **History** | Lost on update | Complete and immutable |
| **Audit** | Requires separate audit log | Built-in |
| **Time travel** | Not possible | Reconstruct state at any point |
| **Debugging** | Reproduce from logs only | Replay exact sequence |
| **Schema changes** | Migrations required | New events use new schema; old events preserved |
| **Storage efficiency** | Compact (one row) | Growing (one row per change) |
| **Query simplicity** | Direct queries on current state | Requires projections for queries |
| **Complexity** | Lower | Higher |

---

## 10.3 — When to Use Event Sourcing

### Good Fit ✅

- Financial systems (banking, trading, accounting)
- Audit-critical domains (healthcare, legal)
- Collaboration systems (document editing, CRMs)
- Systems requiring time-travel debugging
- Event-driven architectures with CQRS
- Domains where "how did we get here?" matters

### Poor Fit ❌

- Simple CRUD applications
- Systems with no audit requirements
- High-throughput logging (events grow without bound)
- Teams new to distributed systems

---

## 10.4 — Event Store Design

### 10.4.1 — Event Schema

```python
"""
Core event sourcing primitives: events, aggregates, and event store.
"""
from __future__ import annotations

import json
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class Event:
    """Immutable domain event."""
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    aggregate_id: str = ""
    aggregate_type: str = ""
    event_type: str = ""
    version: int = 0
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    data: dict[str, Any] = field(default_factory=dict)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "aggregate_id": self.aggregate_id,
            "aggregate_type": self.aggregate_type,
            "event_type": self.event_type,
            "version": self.version,
            "timestamp": self.timestamp,
            "data": self.data,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, d: dict[str, Any]) -> Event:
        return cls(**d)
```

### 10.4.2 — Aggregate Root

```python
class AggregateRoot(ABC):
    """Base class for event-sourced aggregates."""

    def __init__(self, aggregate_id: str) -> None:
        self._aggregate_id = aggregate_id
        self._version = 0
        self._uncommitted_events: list[Event] = []

    @property
    def aggregate_id(self) -> str:
        return self._aggregate_id

    @property
    def version(self) -> int:
        return self._version

    def get_uncommitted_events(self) -> list[Event]:
        events = list(self._uncommitted_events)
        self._uncommitted_events.clear()
        return events

    def _apply_event(self, event_type: str, data: dict[str, Any]) -> None:
        """Apply an event and record it."""
        self._version += 1
        event = Event(
            aggregate_id=self._aggregate_id,
            aggregate_type=type(self).__name__,
            event_type=event_type,
            version=self._version,
            data=data,
        )
        self._apply(event)
        self._uncommitted_events.append(event)

    def _apply(self, event: Event) -> None:
        """Apply an event to update state. Override in subclasses."""
        handler = getattr(self, f"_on_{event.event_type.lower()}", None)
        if handler:
            handler(event)

    def _load_from_history(self, events: list[Event]) -> None:
        """Rebuild aggregate state from historical events."""
        for event in events:
            self._apply(event)
            self._version = event.version
```

### 10.4.3 — Event Store Implementation

```python
class EventStore:
    """In-memory event store (replace with database in production)."""

    def __init__(self) -> None:
        self._streams: dict[str, list[Event]] = {}
        self._subscribers: list[Any] = []

    def append(self, event: Event) -> None:
        """Append an event to the stream."""
        stream = self._streams.setdefault(event.aggregate_id, [])

        # Optimistic concurrency: check version
        expected_version = event.version - 1
        if stream and stream[-1].version != expected_version:
            raise ConcurrencyError(
                f"Expected version {expected_version}, "
                f"got {stream[-1].version}"
            )

        stream.append(event)
        self._notify_subscribers(event)

    def load(self, aggregate_id: str) -> list[Event]:
        """Load all events for an aggregate."""
        return list(self._streams.get(aggregate_id, []))

    def load_from_version(self, aggregate_id: str, version: int) -> list[Event]:
        """Load events from a specific version."""
        events = self._streams.get(aggregate_id, [])
        return [e for e in events if e.version > version]

    def subscribe(self, handler: Any) -> None:
        self._subscribers.append(handler)

    def _notify_subscribers(self, event: Event) -> None:
        for handler in self._subscribers:
            handler(event)

    def get_all_events(self) -> list[Event]:
        return [e for stream in self._streams.values() for e in stream]


class ConcurrencyError(Exception):
    """Raised when concurrent modifications are detected."""
    pass
```

---

## 10.5 — Projections: Building Read Models

Projections transform event streams into query-optimized read models.

```
  PROJECTION ARCHITECTURE
  ════════════════════════

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Event Store  │────►│  Projection  │────►│  Read Model  │
  │  (all events) │     │  Handler     │     │  (optimized) │
  └──────────────┘     └──────────────┘     └──────────────┘

  Events:
  AccountCreated → MoneyDeposited → MoneyWithdrawn → MoneyDeposited

  Projection produces:
  ┌────┬─────────┬────────────┬─────────────────┐
  │ id │ balance │ total_dep  │ transaction_cnt │
  ├────┼─────────┼────────────┼─────────────────┤
  │ 1  │ 250.00  │ 500.00     │ 3               │
  └────┴─────────┴────────────┴─────────────────┘
```

```python
"""
Projections for reading event-sourced data.
Each projection builds a different read-optimized view.
"""
from dataclasses import dataclass, field


@dataclass
class AccountSummary:
    """Read model: account summary for dashboard."""
    account_id: str
    owner_name: str = ""
    balance: float = 0.0
    total_deposited: float = 0.0
    total_withdrawn: float = 0.0
    transaction_count: int = 0
    last_transaction_at: str = ""
    is_active: bool = True


@dataclass
class TransactionLog:
    """Read model: transaction history for a specific account."""
    account_id: str
    transactions: list[dict[str, Any]] = field(default_factory=list)


class AccountSummaryProjection:
    """Projects account events into summary view."""

    def __init__(self) -> None:
        self._summaries: dict[str, AccountSummary] = {}

    def handle_event(self, event: Event) -> None:
        account_id = event.aggregate_id
        summary = self._summaries.setdefault(account_id, AccountSummary(account_id=account_id))

        if event.event_type == "AccountCreated":
            summary.owner_name = event.data.get("owner_name", "")
            summary.is_active = True

        elif event.event_type == "MoneyDeposited":
            amount = event.data.get("amount", 0)
            summary.balance += amount
            summary.total_deposited += amount
            summary.transaction_count += 1
            summary.last_transaction_at = event.timestamp

        elif event.event_type == "MoneyWithdrawn":
            amount = event.data.get("amount", 0)
            summary.balance -= amount
            summary.total_withdrawn += amount
            summary.transaction_count += 1
            summary.last_transaction_at = event.timestamp

        elif event.event_type == "AccountClosed":
            summary.is_active = False

    def get_summary(self, account_id: str) -> AccountSummary | None:
        return self._summaries.get(account_id)

    def get_all_summaries(self) -> list[AccountSummary]:
        return list(self._summaries.values())


class TransactionLogProjection:
    """Projects account events into transaction log view."""

    def __init__(self) -> None:
        self._logs: dict[str, TransactionLog] = {}

    def handle_event(self, event: Event) -> None:
        if event.event_type not in ("MoneyDeposited", "MoneyWithdrawn"):
            return

        account_id = event.aggregate_id
        log = self._logs.setdefault(account_id, TransactionLog(account_id=account_id))
        log.transactions.append({
            "type": event.event_type,
            "amount": event.data.get("amount", 0),
            "timestamp": event.timestamp,
            "description": event.data.get("description", ""),
        })

    def get_log(self, account_id: str) -> TransactionLog | None:
        return self._logs.get(account_id)
```

---

## 10.6 — Snapshots: Optimizing Replay

When an aggregate has thousands of events, replaying from the beginning is slow. Snapshots capture the state at a point in time.

```
  SNAPSHOT STRATEGY
  ═══════════════════

  Events:  E1 → E2 → E3 → ... → E999 → E1000 → E1001 → E1002
                                  │
                           ┌──────▼──────┐
                           │  SNAPSHOT   │
                           │  v999       │
                           │  balance=500│
                           └─────────────┘

  Load strategy:
  1. Load latest snapshot (v999)
  2. Apply only events after snapshot (E1000, E1001, E1002)
  3. Total: 1 snapshot + 3 events (instead of 1002 events)

  Snapshot interval: Every 100-1000 events (tune based on aggregate size)
```

```python
"""
Snapshot support for event-sourced aggregates.
Reduces replay time for aggregates with many events.
"""
from dataclasses import dataclass


@dataclass
class Snapshot:
    aggregate_id: str
    aggregate_type: str
    version: int
    state: dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SnapshotStore:
    """Store and retrieve aggregates snapshots."""

    def __init__(self, snapshot_interval: int = 100) -> None:
        self._snapshots: dict[str, Snapshot] = {}
        self._snapshot_interval = snapshot_interval

    def should_snapshot(self, event_count: int) -> bool:
        return event_count % self._snapshot_interval == 0

    def save(self, snapshot: Snapshot) -> None:
        key = f"{snapshot.aggregate_type}:{snapshot.aggregate_id}"
        existing = self._snapshots.get(key)
        if existing is None or snapshot.version > existing.version:
            self._snapshots[key] = snapshot

    def get_latest(self, aggregate_type: str, aggregate_id: str) -> Snapshot | None:
        key = f"{aggregate_type}:{aggregate_id}"
        return self._snapshots.get(key)


class Account(AggregateRoot):
    """Event-sourced bank account with snapshot support."""

    def __init__(self, account_id: str) -> None:
        super().__init__(account_id)
        self.owner_name: str = ""
        self.balance: float = 0.0
        self.is_active: bool = True

    @classmethod
    def create(cls, account_id: str, owner_name: str, initial_balance: float) -> Account:
        account = cls(account_id)
        account._apply_event("AccountCreated", {
            "owner_name": owner_name,
            "initial_balance": initial_balance,
        })
        return account

    def deposit(self, amount: float, description: str = "") -> None:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._apply_event("MoneyDeposited", {
            "amount": amount,
            "description": description,
            "new_balance": self.balance + amount,
        })

    def withdraw(self, amount: float, description: str = "") -> None:
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self._apply_event("MoneyWithdrawn", {
            "amount": amount,
            "description": description,
            "new_balance": self.balance - amount,
        })

    def close(self) -> None:
        self._apply_event("AccountClosed", {})

    # Event handlers (applied during replay)
    def _on_accountcreated(self, event: Event) -> None:
        self.owner_name = event.data.get("owner_name", "")
        self.balance = event.data.get("initial_balance", 0)
        self.is_active = True

    def _on_moneydeposited(self, event: Event) -> None:
        self.balance = event.data.get("new_balance", self.balance + event.data["amount"])

    def _on_moneywithdrawn(self, event: Event) -> None:
        self.balance = event.data.get("new_balance", self.balance - event.data["amount"])

    def _on_accountclosed(self, event: Event) -> None:
        self.is_active = False

    def to_snapshot(self) -> dict[str, Any]:
        return {
            "owner_name": self.owner_name,
            "balance": self.balance,
            "is_active": self.is_active,
        }

    @classmethod
    def from_snapshot(cls, account_id: str, state: dict[str, Any]) -> Account:
        account = cls(account_id)
        account.owner_name = state["owner_name"]
        account.balance = state["balance"]
        account.is_active = state["is_active"]
        return account
```

---

## 10.7 — Time Travel: Reconstructing Past State

One of the most powerful features of event sourcing is the ability to reconstruct the state at any point in time.

```python
"""
Time travel: reconstruct aggregate state at any point in time.
"""
def get_account_state_at(
    event_store: EventStore,
    account_id: str,
    target_version: int,
) -> Account:
    """Rebuild account state as it was at a specific version."""
    account = Account(account_id)
    events = event_store.load(account_id)

    for event in events:
        if event.version > target_version:
            break
        account._apply(event)
        account._version = event.version

    return account


def get_balance_history(event_store: EventStore, account_id: str) -> list[dict]:
    """Track how balance changed over time."""
    account = Account(account_id)
    events = event_store.load(account_id)
    history = []

    for event in events:
        account._apply(event)
        account._version = event.version
        if event.event_type in ("MoneyDeposited", "MoneyWithdrawn"):
            history.append({
                "version": event.version,
                "event": event.event_type,
                "amount": event.data.get("amount", 0),
                "balance_after": account.balance,
                "timestamp": event.timestamp,
            })

    return history
```

---

## 10.8 — Event Schema Evolution

As your application evolves, event schemas change. You need strategies to handle old events.

```
  SCHEMA EVOLUTION STRATEGIES
  ═══════════════════════════

  Strategy 1: Upcasting
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ Event v1 │────►│ Upcaster │────►│ Event v3 │
  └──────────┘     └──────────┘     └──────────┘

  Strategy 2: Weak Schema (flexible data field)
  Event { "type": "MoneyDeposited", "data": { ... } }
  Old events keep their original shape; new events add fields.

  Strategy 3: Event Versioning
  MoneyDeposited_v1 { amount }
  MoneyDeposited_v2 { amount, currency, exchange_rate }
```

```python
"""
Event upcasting: transform old event versions to the current version.
"""
from typing import Callable


class EventUpcaster:
    """Transform old event versions to current schema."""

    def __init__(self) -> None:
        self._upcasters: dict[str, Callable[[Event], Event]] = {}

    def register(self, event_type: str, upcaster: Callable[[Event], Event]) -> None:
        self._upcasters[event_type] = upcaster

    def upcast(self, event: Event) -> Event:
        upcaster = self._upcasters.get(event.event_type)
        if upcaster:
            return upcaster(event)
        return event


def upcast_money_deposited_v1(event: Event) -> Event:
    """Transform MoneyDeposited v1 (no currency) to current version."""
    return Event(
        event_id=event.event_id,
        aggregate_id=event.aggregate_id,
        aggregate_type=event.aggregate_type,
        event_type="MoneyDeposited",
        version=event.version,
        timestamp=event.timestamp,
        data={
            "amount": event.data["amount"],
            "currency": "USD",  # default for old events
            "description": event.data.get("description", ""),
            "new_balance": event.data.get("new_balance", 0),
        },
        metadata=event.metadata,
    )


# --- Demo ---
upcaster = EventUpcaster()
upcaster.register("MoneyDeposited_v1", upcast_money_deposited_v1)

old_event = Event(
    aggregate_id="acc-1",
    event_type="MoneyDeposited_v1",
    version=2,
    data={"amount": 100.0, "description": "Initial deposit"},
)

upcasted = upcaster.upcast(old_event)
print(f"Original: {old_event.event_type} → {old_event.data}")
print(f"Upcasted: {upcasted.event_type} → {upcasted.data}")
```

---

## 10.9 — Real-World Case Studies

### 10.9.1 — EventStoreDB

EventStoreDB is a purpose-built database for event sourcing:

| Feature | Description |
|---|---|
| **Append-only streams** | Events are immutable; streams are ordered |
| **Projections** | Built-in JavaScript/C# projection engine |
| **Subscriptions** | Catch-up, persistent, and volatile subscriptions |
| **Competing consumers** | Consumer groups for parallel processing |
| **HTTP + gRPC** | Accessible from any language |

### 10.9.2 — Greg Young's Original Vision

Greg Young, the originator of event sourcing, advocates for it in:

- **Domain-Driven Design**: Events capture domain language
- **Audit compliance**: Events provide a complete, immutable audit trail
- **Temporal queries**: "What was the state on March 15th?"

### 10.9.3 — Financial Systems

Major banks use event sourcing for:

| Use Case | Benefit |
|---|---|
| **Ledger entries** | Every transaction is an immutable event |
| **Regulatory compliance** | Complete audit trail with no gaps |
| **Reconciliation** | Replay events to verify balances |
| **Fraud detection** | Analyze event patterns for anomalies |

---

## 10.10 — Anti-Patterns and Pitfalls

```
  COMMON EVENT SOURCING MISTAKES
  ═══════════════════════════════

  ✗ Treating events as a log (mutable)
    → Events MUST be immutable

  ✗ Not planning for schema evolution
    → Old events must remain readable

  ✗ No snapshot strategy
    → Replay becomes impossibly slow at scale

  ✗ Storing events in a relational DB without proper indexing
    → Query performance degrades rapidly

  ✗ Publishing events inside transactions
    → Use the outbox pattern instead

  ✗ Not testing projection rebuilds
    → Projections must be deterministic and rebuildable
```

---

## 10.11 — Architecture Decision Matrix

```
  DECISION: SHOULD I USE EVENT SOURCING?

  ┌─────────────────────────────┬──────────────────────────────────────────┐
  │  Scenario                   │  Recommendation                          │
  ├─────────────────────────────┼──────────────────────────────────────────┤
  │  Financial/audit required   │  Yes — built-in audit trail              │
  │  Need time-travel debugging │  Yes — reconstruct any past state        │
  │  CQRS already adopted       │  Yes — natural pairing                   │
  │  Simple CRUD app            │  No — unnecessary complexity             │
  │  High-throughput logging    │  No — use a log stream instead           │
  │  Small team                 │  No — learn basics first                 │
  │  Complex domain with events │  Yes — events capture domain language    │
  └─────────────────────────────┴──────────────────────────────────────────┘
```

---

## 10.12 — Practice Exercises

### Exercise 1: Implement Event Sourcing

Build a simple inventory management system with event sourcing:
- Events: ItemAdded, ItemRemoved, StockAdjusted
- Aggregate: InventoryItem
- Projection: StockLevelView

### Exercise 2: Snapshot + Replay

Implement the snapshot mechanism from Section 10.6:
1. Create an account and perform 200 deposits/withdrawals
2. Take a snapshot every 50 events
3. Measure replay time with and without snapshots
4. Compare: 200 events vs 1 snapshot + 50 events

### Exercise 3: Time Travel Debugging

Given a bug report "the balance was wrong at 3:00 PM yesterday":
1. Load all events for the account
2. Reconstruct state at the reported time
3. Identify which event caused the incorrect state
4. Propose a fix

---

## 10.13 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **What is Event Sourcing** | Store state changes as immutable events; derive current state by replay |
| **Events** | Immutable, ordered, append-only records of what happened |
| **Aggregate** | Domain entity rebuilt from its event stream |
| **Projections** | Read models built by processing event streams |
| **Snapshots** | Periodic state captures to speed up replay |
| **Time Travel** | Reconstruct state at any point by replaying events up to that version |
| **Schema Evolution** | Upcasting transforms old events to current schemas |
| **CRUD vs ES** | CRUD loses history; ES preserves everything |
| **CQRS + ES** | Natural pairing; write model stores events, read model is projected |

### When to Use Event Sourcing

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  USE EVENT SOURCING WHEN:                                │
  │  ✓ Audit trail is a hard requirement                     │
  │  ✓ "How did we get here?" questions are frequent         │
  │  ✓ You need time-travel debugging                        │
  │  ✓ Domain events are the core of your business           │
  │  ✓ CQRS is already part of your architecture             │
  │                                                          │
  │  AVOID WHEN:                                             │
  │  ✗ Simple CRUD without audit needs                       │
  │  ✗ High-throughput logging (use event streams instead)    │
  │  ✗ Teams new to distributed systems                      │
  │  ✗ The domain doesn't naturally express itself as events  │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 11 — CAP Theorem](chapter-11-cap-theorem.md) → Understanding the trade-offs in distributed systems.*
