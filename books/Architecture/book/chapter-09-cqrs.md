# Chapter 9: CQRS — Separating Read and Write Operations

> *"The moment you realize that reading and writing have fundamentally different needs, you've unlocked a new level of architectural clarity."*

---

## 9.1 — What Is CQRS?

**CQRS** (Command Query Responsibility Segregation) is an architectural pattern that separates the model for **writing data** (commands) from the model for **reading data** (queries). Instead of a single model handling both read and write operations, CQRS creates two distinct models optimized for their respective concerns.

```
                 TRADITIONAL (CRUD) ARCHITECTURE
  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │              ┌──────────────┐                   │
  │              │  ONE MODEL   │                   │
  │              │  ──────────  │                   │
  │              │  • Read      │                   │
  │              │  • Write     │                   │
  │              │  • Validate  │                   │
  │              │  • Transform │                   │
  │              └──────┬───────┘                   │
  │                     │                           │
  │              ┌──────▼───────┐                   │
  │              │   DATABASE   │                   │
  │              └──────────────┘                   │
  └─────────────────────────────────────────────────┘

                 CQRS ARCHITECTURE
  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │  ┌──────────────┐         ┌──────────────┐     │
  │  │ WRITE MODEL  │         │  READ MODEL  │     │
  │  │ (Commands)   │         │  (Queries)   │     │
  │  │ ──────────── │         │  ──────────── │     │
  │  │ • Validate   │         │  • Denormalize│     │
  │  │ • Enforce    │         │  • Optimize   │     │
  │  │   business   │         │    for reads  │     │
  │  │   rules      │         │  • Flatten    │     │
  │  └──────┬───────┘         └──────┬───────┘     │
  │         │                        │              │
  │  ┌──────▼───────┐         ┌──────▼───────┐     │
  │  │ WRITE DB     │──sync──►│  READ DB     │     │
  │  │ (normalized) │         │  (denormal.) │     │
  │  └──────────────┘         └──────────────┘     │
  └─────────────────────────────────────────────────┘
```

### Core Principles

| Principle | Description |
|---|---|
| **Separation of Concerns** | Write model enforces business rules; read model optimizes for queries |
| **Independent Scaling** | Scale reads and writes independently |
| **Optimized Models** | Each model is shaped for its specific purpose |
| **Eventual Consistency** | Read model is updated asynchronously from write model |
| **Polyglot Persistence** | Write and read databases can use different technologies |

---

## 9.2 — Commands vs Queries

```
  COMMANDS (Writes)              QUERIES (Reads)
  ════════════════               ═══════════════

  • CreateOrder                  • GetOrderById
  • UpdateUserProfile            • ListOrdersByUser
  • CancelSubscription           • GetOrderSummary
  • ProcessPayment               • SearchProducts
  • DeactivateUser               • GetDashboardStats

  Side effects: YES              Side effects: NO
  Returns: void / confirmation   Returns: data
  Validates: business rules      Validates: nothing (just returns)
```

### The Fundamental Difference

| Aspect | Command (Write) | Query (Read) |
|---|---|---|
| **Purpose** | Change state | Return state |
| **Return value** | Void, ID, or success/failure | Data (DTOs, views) |
| **Validation** | Business rules, invariants | Input format only |
| **Optimization** | Consistency, integrity | Speed, throughput |
| **Database** | Normalized, ACID | Denormalized, eventual |
| **Caching** | Rarely cached | Aggressively cached |
| **Complexity** | Higher (domain logic) | Lower (simple queries) |

---

## 9.3 — When to Use CQRS

### Good Fit ✅

- Complex domains with rich business logic
- Systems where read and write workloads differ dramatically
- Applications requiring different data views for different consumers
- Event-sourced systems (CQRS pairs naturally with event sourcing)
- Collaboration-heavy systems (concurrent edits, conflict resolution)
- Systems where read performance is critical (e-commerce, dashboards)

### Poor Fit ❌

- Simple CRUD applications
- Small domains with straightforward data models
- Teams without distributed systems experience
- Systems where strong consistency is always required

---

## 9.4 — Read and Write Models in Detail

### 9.4.1 — Write Model (Command Side)

The write model is a rich domain model that enforces business invariants:

```
  WRITE MODEL RESPONSIBILITIES
  ════════════════════════════

  ┌──────────────────────────────────────┐
  │            COMMAND                    │
  │     (e.g., PlaceOrder)               │
  └───────────────┬──────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────┐
  │         VALIDATE                      │
  │  • Business rules                    │
  │  • Invariants                        │
  │  • Preconditions                     │
  └───────────────┬──────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────┐
  │         EXECUTE                       │
  │  • Apply state change                │
  │  • Emit domain event                 │
  └───────────────┬──────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────┐
  │         PERSIST                       │
  │  • Save to write database            │
  │  • Publish event for read sync       │
  └──────────────────────────────────────┘
```

### 9.4.2 — Read Model (Query Side)

The read model is a flat, denormalized projection optimized for specific query patterns:

```
  READ MODEL RESPONSIBILITIES
  ═══════════════════════════

  ┌──────────────────────────────────────┐
  │            QUERY                      │
  │     (e.g., GetUserOrders)            │
  └───────────────┬──────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────┐
  │         READ                          │
  │  • Denormalized data                 │
  │  • Pre-computed aggregations         │
  │  • Cached results                    │
  └───────────────┬──────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────┐
  │         RETURN                        │
  │  • DTO (no domain objects)           │
  │  • No business logic                 │
  │  • Flat, client-ready structure      │
  └──────────────────────────────────────┘
```

---

## 9.5 — Synchronization Between Read and Write

The critical challenge in CQRS is keeping the read model in sync with the write model.

```
  SYNC PATTERNS
  ══════════════

  1. SYNCHRON (Simple)
     Write DB ──► Sync ──► Read DB
     ✅ Strong consistency
     ❌ Tight coupling; both sides scale together

  2. ASYNCHRONOUS (Event-Based)
     Write DB ──► Event ──► Event Bus ──► Read Projection
     ✅ Independent scaling; eventual consistency
     ❌ Lag between write and read availability

  3. HYBRID
     Write DB ──► Event ──► Read DB (async)
              └──► Local cache (sync for own writes)
     ✅ Read-your-own-writes; scalable reads
     ❌ More complex implementation
```

---

## 9.6 — Code Example: CQRS with Python

```python
"""
Complete CQRS implementation in Python with event-based synchronization.
Demonstrates the separation of write and read models.
"""
from __future__ import annotations

import json
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any


# ═══════════════════════════════════════════
# DOMAIN EVENTS
# ═══════════════════════════════════════════

@dataclass(frozen=True)
class DomainEvent:
    """Base class for all domain events."""
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass(frozen=True)
class OrderPlaced(DomainEvent):
    order_id: str = ""
    customer_id: str = ""
    items: tuple[dict[str, Any],] = ()
    total: float = 0.0


@dataclass(frozen=True)
class OrderConfirmed(DomainEvent):
    order_id: str = ""
    confirmed_at: str = ""


@dataclass(frozen=True)
class OrderCancelled(DomainEvent):
    order_id: str = ""
    reason: str = ""


# ═══════════════════════════════════════════
# WRITE MODEL (Command Side)
# ═══════════════════════════════════════════

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


@dataclass
class Order:
    """Write-side domain entity with business rules."""
    order_id: str
    customer_id: str
    items: list[dict[str, Any]]
    status: OrderStatus = OrderStatus.PENDING
    total: float = 0.0
    events: list[DomainEvent] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.total = sum(item["price"] * item["quantity"] for item in self.items)

    def validate(self) -> None:
        """Enforce business invariants."""
        if not self.customer_id:
            raise ValueError("customer_id is required")
        if not self.items:
            raise ValueError("Order must have at least one item")
        if self.total <= 0:
            raise ValueError("Order total must be positive")
        for item in self.items:
            if item.get("quantity", 0) <= 0:
                raise ValueError(f"Invalid quantity for item: {item.get('name')}")
            if item.get("price", 0) < 0:
                raise ValueError(f"Invalid price for item: {item.get('name')}")

    def place(self) -> OrderPlaced:
        """Place the order — validates and emits event."""
        self.validate()
        event = OrderPlaced(
            order_id=self.order_id,
            customer_id=self.customer_id,
            items=tuple(tuple(item.items()) for item in self.items),
            total=self.total,
        )
        self.events.append(event)
        return event

    def confirm(self) -> OrderConfirmed:
        """Confirm the order."""
        if self.status != OrderStatus.PENDING:
            raise ValueError(f"Cannot confirm order in {self.status.value} status")
        event = OrderConfirmed(
            order_id=self.order_id,
            confirmed_at=datetime.now(timezone.utc).isoformat(),
        )
        self.events.append(event)
        self.status = OrderStatus.CONFIRMED
        return event

    def cancel(self, reason: str) -> OrderCancelled:
        """Cancel the order."""
        if self.status == OrderStatus.CANCELLED:
            raise ValueError("Order is already cancelled")
        event = OrderCancelled(order_id=self.order_id, reason=reason)
        self.events.append(event)
        self.status = OrderStatus.CANCELLED
        return event


class OrderCommandHandler:
    """Handles write commands for orders."""

    def __init__(self, event_store: EventStore) -> None:
        self._event_store = event_store

    def handle_place_order(
        self, customer_id: str, items: list[dict[str, Any]]
    ) -> str:
        order = Order(
            order_id=str(uuid.uuid4()),
            customer_id=customer_id,
            items=items,
        )
        event = order.place()
        self._event_store.append(event)
        return order.order_id

    def handle_confirm_order(self, order_id: str) -> None:
        order = self._rebuild_order(order_id)
        event = order.confirm()
        self._event_store.append(event)

    def handle_cancel_order(self, order_id: str, reason: str) -> None:
        order = self._rebuild_order(order_id)
        event = order.cancel(reason)
        self._event_store.append(event)

    def _rebuild_order(self, order_id: str) -> Order:
        """Rebuild order state from events."""
        events = self._event_store.get_events(order_id)
        order: Order | None = None
        for event in events:
            if isinstance(event, OrderPlaced):
                order = Order(
                    order_id=event.order_id,
                    customer_id=event.customer_id,
                    items=[dict(item) for item in event.items],
                )
                order.status = OrderStatus.PENDING
            elif isinstance(event, OrderConfirmed) and order:
                order.status = OrderStatus.CONFIRMED
            elif isinstance(event, OrderCancelled) and order:
                order.status = OrderStatus.CANCELLED
        if order is None:
            raise ValueError(f"Order {order_id} not found")
        return order


# ═══════════════════════════════════════════
# READ MODEL (Query Side)
# ═══════════════════════════════════════════

@dataclass
class OrderReadView:
    """Denormalized read model for orders."""
    order_id: str
    customer_id: str
    customer_name: str = ""
    item_count: int = 0
    total: float = 0.0
    status: str = "pending"
    placed_at: str = ""
    confirmed_at: str = ""
    items_summary: str = ""


class OrderReadProjection:
    """Projects write events into read-optimized views."""

    def __init__(self) -> None:
        self._orders: dict[str, OrderReadView] = {}
        self._customer_orders: dict[str, list[str]] = {}

    def handle_event(self, event: DomainEvent) -> None:
        """Update read model based on domain event."""
        if isinstance(event, OrderPlaced):
            items = [dict(item) for item in event.items]
            view = OrderReadView(
                order_id=event.order_id,
                customer_id=event.customer_id,
                item_count=len(items),
                total=event.total,
                status="pending",
                placed_at=event.timestamp,
                items_summary=", ".join(item.get("name", "Unknown") for item in items),
            )
            self._orders[event.order_id] = view
            self._customer_orders.setdefault(event.customer_id, []).append(event.order_id)

        elif isinstance(event, OrderConfirmed):
            if event.order_id in self._orders:
                self._orders[event.order_id].status = "confirmed"
                self._orders[event.order_id].confirmed_at = event.confirmed_at

        elif isinstance(event, OrderCancelled):
            if event.order_id in self._orders:
                self._orders[event.order_id].status = "cancelled"

    def get_order(self, order_id: str) -> OrderReadView | None:
        return self._orders.get(order_id)

    def get_customer_orders(self, customer_id: str) -> list[OrderReadView]:
        order_ids = self._customer_orders.get(customer_id, [])
        return [self._orders[oid] for oid in order_ids if oid in self._orders]

    def get_total_revenue(self) -> float:
        return sum(o.total for o in self._orders.values() if o.status in ("confirmed", "pending"))


# ═══════════════════════════════════════════
# EVENT STORE
# ═══════════════════════════════════════════

class EventStore:
    """Simple in-memory event store."""
    def __init__(self) -> None:
        self._events: dict[str, list[DomainEvent]] = {}

    def append(self, event: DomainEvent) -> None:
        aggregate_id = getattr(event, "order_id", "global")
        self._events.setdefault(aggregate_id, []).append(event)

    def get_events(self, aggregate_id: str) -> list[DomainEvent]:
        return list(self._events.get(aggregate_id, []))

    def get_all_events(self) -> list[DomainEvent]:
        return [e for events in self._events.values() for e in events]


# ═══════════════════════════════════════════
# DEMONSTRATION
# ═══════════════════════════════════════════

def main() -> None:
    # Setup
    event_store = EventStore()
    command_handler = OrderCommandHandler(event_store)
    projection = OrderReadProjection()

    # Simulate events
    order_id_1 = command_handler.handle_place_order(
        customer_id="cust-001",
        items=[
            {"name": "Widget", "price": 29.99, "quantity": 2},
            {"name": "Gadget", "price": 49.99, "quantity": 1},
        ],
    )

    order_id_2 = command_handler.handle_place_order(
        customer_id="cust-001",
        items=[{"name": "Doohickey", "price": 19.99, "quantity": 3}],
    )

    command_handler.handle_confirm_order(order_id_1)

    # Project events to read model
    for event in event_store.get_all_events():
        projection.handle_event(event)

    # Query the read model
    print("=== Read Model: Customer Orders ===")
    for view in projection.get_customer_orders("cust-001"):
        print(f"  Order {view.order_id[:8]}... status={view.status}, total=${view.total:.2f}")
        print(f"    Items: {view.items_summary}")

    print(f"\n  Total Revenue: ${projection.get_total_revenue():.2f}")


if __name__ == "__main__":
    main()
```

---

## 9.7 — TypeScript CQRS Implementation

```typescript
/**
 * CQRS implementation in TypeScript with event-based synchronization.
 */

// ═══════════════════════════════════════════
// DOMAIN EVENTS
// ═══════════════════════════════════════════

interface DomainEvent {
  eventId: string;
  timestamp: string;
  aggregateId: string;
}

interface OrderPlacedEvent extends DomainEvent {
  type: "OrderPlaced";
  customerId: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
}

interface OrderConfirmedEvent extends DomainEvent {
  type: "OrderConfirmed";
  confirmedAt: string;
}

type OrderEvent = OrderPlacedEvent | OrderConfirmedEvent;

// ═══════════════════════════════════════════
// WRITE MODEL
// ═══════════════════════════════════════════

class OrderWriteModel {
  private events: OrderEvent[] = [];

  constructor(
    public readonly orderId: string,
    public customerId: string = "",
    public status: "pending" | "confirmed" | "cancelled" = "pending",
    public total: number = 0
  ) {}

  place(customerId: string, items: Array<{ name: string; price: number; quantity: number }>): OrderPlacedEvent {
    if (!customerId) throw new Error("customer_id is required");
    if (items.length === 0) throw new Error("Order must have at least one item");

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (total <= 0) throw new Error("Order total must be positive");

    this.customerId = customerId;
    this.total = total;

    const event: OrderPlacedEvent = {
      type: "OrderPlaced",
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      aggregateId: this.orderId,
      customerId,
      items,
      total,
    };

    this.events.push(event);
    return event;
  }

  confirm(): OrderConfirmedEvent {
    if (this.status !== "pending") {
      throw new Error(`Cannot confirm order in ${this.status} status`);
    }

    const event: OrderConfirmedEvent = {
      type: "OrderConfirmed",
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      aggregateId: this.orderId,
      confirmedAt: new Date().toISOString(),
    };

    this.events.push(event);
    this.status = "confirmed";
    return event;
  }

  getUncommittedEvents(): OrderEvent[] {
    return [...this.events];
  }
}

// ═══════════════════════════════════════════
// READ MODEL
// ═══════════════════════════════════════════

interface OrderReadView {
  orderId: string;
  customerId: string;
  itemCount: number;
  total: number;
  status: string;
  placedAt: string;
  confirmedAt: string;
}

class OrderReadProjection {
  private orders = new Map<string, OrderReadView>();
  private customerOrders = new Map<string, string[]>();

  handleEvent(event: OrderEvent): void {
    switch (event.type) {
      case "OrderPlaced":
        this.orders.set(event.aggregateId, {
          orderId: event.aggregateId,
          customerId: event.customerId,
          itemCount: event.items.length,
          total: event.total,
          status: "pending",
          placedAt: event.timestamp,
          confirmedAt: "",
        });
        const existing = this.customerOrders.get(event.customerId) ?? [];
        existing.push(event.aggregateId);
        this.customerOrders.set(event.customerId, existing);
        break;

      case "OrderConfirmed":
        const order = this.orders.get(event.aggregateId);
        if (order) {
          order.status = "confirmed";
          order.confirmedAt = event.confirmedAt;
        }
        break;
    }
  }

  getOrder(orderId: string): OrderReadView | undefined {
    return this.orders.get(orderId);
  }

  getCustomerOrders(customerId: string): OrderReadView[] {
    const ids = this.customerOrders.get(customerId) ?? [];
    return ids.map((id) => this.orders.get(id)).filter((o): o is OrderReadView => o !== undefined);
  }
}

// ═══════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════

function demo(): void {
  const projection = new OrderReadProjection();

  // Write side
  const order1 = new OrderWriteModel(crypto.randomUUID());
  const event1 = order1.place("cust-001", [
    { name: "Widget", price: 29.99, quantity: 2 },
    { name: "Gadget", price: 49.99, quantity: 1 },
  ]);

  const event2 = order1.confirm();

  // Project to read model
  projection.handleEvent(event1);
  projection.handleEvent(event2);

  // Read side
  const view = projection.getOrder(order1.orderId);
  console.log("Order:", view);
}

demo();
```

---

## 9.8 — CQRS + Event Sourcing

CQRS pairs naturally with event sourcing. The write model stores events; the read model is rebuilt from those events:

```
  CQRS + EVENT SOURCING
  ═══════════════════════

  WRITE SIDE                     READ SIDE
  ┌──────────────┐              ┌──────────────┐
  │   Command    │              │    Query     │
  └──────┬───────┘              └──────┬───────┘
         │                             │
         ▼                             ▼
  ┌──────────────┐    events    ┌──────────────┐
  │ Event Store  │────────────►│  Projection  │
  │ (append-only)│              │  (read DB)   │
  └──────────────┘              └──────────────┘

  Event Store: OrderPlaced → OrderConfirmed → ...
  Projection: Flattened view optimized for queries
```

---

## 9.9 — Real-World Case Studies

### 9.9.1 — Microsoft's CQRS Journey

Microsoft documented a CQRS reference implementation for a conference management system:

| Aspect | Write Side | Read Side |
|---|---|---|
| **Model** | Rich domain model | Flat DTOs |
| **Database** | SQL Server (normalized) | SQL Server (denormalized views) |
| **Sync** | Domain events via bus | Event handlers update read DB |
| **Scaling** | Single writer | Multiple read replicas |

### 9.9.2 — EventStoreDB

EventStoreDB is a database built specifically for event sourcing with CQRS:

- **Write side**: Append-only event stream per aggregate
- **Read side**: Projections (JavaScript/C# handlers) build read models
- **Subscription**: Persistent subscriptions for async projection updates

### 9.9.3 — DDD Communities

Domain-Driven Design communities widely adopt CQRS for:

- **Collaborative domains** (Google Docs-style editing)
- **Analytics dashboards** (write once, read many complex queries)
- **Multi-tenant SaaS** (different read views per tenant)

---

## 9.10 — Anti-Patterns and Pitfalls

```
  COMMON CQRS MISTAKES
  ══════════════════════

  ✗ Applying CQRS to simple CRUD applications
    → Adds complexity without benefit

  ✗ Synchronous read model updates
    → Tight coupling defeats the purpose

  ✗ Forgetting about read-your-own-writes
    → Users see stale data after their own writes

  ✗ Not handling projection rebuilds
    → Read model must be rebuildable from event stream

  ✗ Over-engineering the write side
    → Start simple; add complexity only when needed

  ✗ Using different databases without considering operational cost
    → Two databases means two backup strategies, two monitoring setups
```

---

## 9.11 — Architecture Decision Matrix

```
  DECISION: SHOULD I USE CQRS?

  ┌─────────────────────────────┬──────────────────────────────────────────┐
  │  Scenario                   │  Recommendation                          │
  ├─────────────────────────────┼──────────────────────────────────────────┤
  │  Simple CRUD app            │  No — single model is fine               │
  │  Read/write ratio > 100:1   │  Yes — optimize reads independently     │
  │  Complex business rules     │  Yes — rich write model                  │
  │  Multiple read consumers    │  Yes — project different views           │
  │  Event sourcing desired     │  Yes — CQRS is the natural fit          │
  │  Real-time dashboard        │  Yes — dedicated read projections        │
  │  Small team, simple domain  │  No — premature complexity               │
  │  Strong consistency needed  │  Maybe — use synchronous sync            │
  └─────────────────────────────┴──────────────────────────────────────────┘
```

---

## 9.12 — Practice Exercises

### Exercise 1: Build a CQRS System

Implement a simple task management system with CQRS:
- Write side: CreateTask, CompleteTask, AssignTask commands
- Read side: TaskListView with filters by status and assignee
- Use events to synchronize read and write models

### Exercise 2: Read Model Rebuild

Given the event store from the code example, implement a `rebuild_read_model()` function that:
1. Reads all events from the event store
2. Replays them through the projection
3. Produces a complete read model
4. Verify the rebuilt model matches the live projection

### Exercise 3: Sync Strategies

Compare synchronous vs asynchronous synchronization:
1. Implement both approaches
2. Measure the lag in the async version
3. Discuss when you would choose each approach

---

## 9.13 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **What is CQRS** | Separate write (command) and read (query) models |
| **Commands** | Change state; enforce business rules; return void/ID |
| **Queries** | Return data; no side effects; optimized for reads |
| **Write model** | Rich domain model; normalized database |
| **Read model** | Flat DTOs; denormalized; pre-computed |
| **Synchronization** | Events published from write side; projected to read side |
| **Eventual consistency** | Read model lags behind write model |
| **Scaling** | Independent scaling of read and write sides |
| **CQRS + Event Sourcing** | Natural pairing; event store as write model |

### When to Use CQRS

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  USE CQRS WHEN:                                          │
  │  ✓ Read and write workloads differ dramatically          │
  │  ✓ Complex business rules need a rich write model        │
  │  ✓ Multiple consumers need different data views          │
  │  ✓ Event sourcing is part of your architecture           │
  │  ✓ Read performance is critical (dashboards, search)     │
  │                                                          │
  │  AVOID CQRS WHEN:                                        │
  │  ✗ Simple CRUD with straightforward data models          │
  │  ✗ Small teams without distributed systems experience    │
  │  ✗ Strong consistency is always required                 │
  │  ✗ The domain is simple and not worth the complexity     │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 10 — Event Sourcing](chapter-10-event-sourcing.md) → Storing every change as an immutable event.*
