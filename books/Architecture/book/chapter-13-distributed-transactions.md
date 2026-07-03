# Chapter 13: Distributed Transactions — Keeping Data Consistent Across Services

> *"In a distributed system, the only thing harder than making a transaction work is making sure all the pieces remember whether they agreed or not."*

---

## 13.1 — The Problem: Why Distributed Transactions Are Hard

In a monolithic application with a single database, transactions are straightforward. You wrap a set of operations in `BEGIN`…`COMMIT` and the database guarantees ACID properties — Atomicity, Consistency, Isolation, and Durability. Either all changes succeed, or none of them persist.

But what happens when your order placement needs to touch **four different services**, each with its own database?

```
  ORDER PLACEMENT — SINGLE DATABASE (EASY)
  ══════════════════════════════════════════

  ┌─────────────────────────────────────────────────┐
  │                 MONOLITH                         │
  │                                                  │
  │   BEGIN TRANSACTION                              │
  │     → INSERT INTO orders                         │
  │     → UPDATE inventory SET stock = stock - 1     │
  │     → INSERT INTO payments                       │
  │     → UPDATE users SET loyalty_pts = pts + 10    │
  │   COMMIT                                         │
  │                                                  │
  │   Single DB → ACID is free                       │
  └─────────────────────────────────────────────────┘


  ORDER PLACEMENT — DISTRIBUTED SERVICES (HARD)
  ═══════════════════════════════════════════════

  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │  Order    │  │ Inventory │  │ Payment   │  │ Loyalty   │
  │  Service  │  │  Service  │  │  Service  │  │  Service  │
  ├───────────┤  ├───────────┤  ├───────────┤  ├───────────┤
  │  orders   │  │ inventory │  │ payments  │  │ loyalty   │
  │   (DB)    │  │   (DB)    │  │   (DB)    │  │   (DB)    │
  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
        │              │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ Create  │   │ Reserve │   │ Charge  │   │ Award   │
   │ Order   │   │ Stock   │   │ Card    │   │ Points  │
   └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
     DB commit     DB commit     DB commit     DB commit

  4 separate databases → No shared transaction
  What if service #3 fails after services #1 and #2 committed?
```

### The Fundamental Challenge

| Scenario | Single DB | Distributed |
|---|---|---|
| **All succeed** | `COMMIT` once | Need to commit 4 times independently |
| **One fails after others commit** | `ROLLBACK` undoes everything | Partial commitment — data is inconsistent |
| **Network partition mid-transaction** | Not possible (same DB) | One service doesn't know the others committed |
| **Recovery after crash** | DB redo/undo logs handle it | Each service recovers independently |

This is the **distributed transaction problem**: you want atomicity across multiple independent databases, but there is no built-in mechanism that spans them. The solutions we will explore in this chapter — 2PC, 3PC, Sagas, TCC, and the Outbox pattern — each offer different trade-offs between consistency, availability, complexity, and performance.

---

## 13.2 — Two-Phase Commit (2PC)

Two-phase commit is the classic distributed transaction protocol. It uses a **coordinator** that orchestrates all participants through two distinct phases.

```
  TWO-PHASE COMMIT (2PC)
  ════════════════════════

  Coordinator                         Participants
  ┌──────────┐          ┌──────────────────────────────────────┐
  │          │          │  OrderDB    InventoryDB   PaymentDB   │
  │ Phase 1: │          │                                       │
  │ PREPARE  │────────► │  PREPARE   PREPARE       PREPARE     │
  │          │          │    │          │             │         │
  │          │  ◄─────── │  YES        YES           YES       │
  │          │          │                                       │
  │ Decision:│          │  All voted YES → COMMIT               │
  │ COMMIT   │          │  Any voted NO  → ABORT               │
  │          │          │                                       │
  │ Phase 2: │          │                                       │
  │ COMMIT   │────────► │  COMMIT    COMMIT         COMMIT     │
  │          │          │    │          │             │         │
  │          │  ◄─────── │  ACK        ACK           ACK       │
  │          │          │                                       │
  └──────────┘          └──────────────────────────────────────┘

  Timeline:
  ════════
  ───────┬──────────────┬──────────────┬─────────────────────
         │              │              │
         ▼              ▼              ▼
      PREPARE       DECIDE         COMMIT
      (vote)      (coordinator)   (execute)
         │              │              │
  t0 ────┘   ──t1──────┘   ──t2──────┘   ──t3───►
         │              │              │
      All can       Coordinator     All execute
      still read    decides based   final decision
      their state   on votes        (can't undo)
```

### Phase 1: Prepare

The coordinator sends a `PREPARE` message to every participant. Each participant:
1. Executes the transaction locally up to the commit point
2. Writes undo/redo logs
3. Responds with `YES` (can commit) or `NO` (must abort)

### Phase 2: Commit

- If **all participants** voted `YES` → coordinator sends `COMMIT`
- If **any participant** voted `NO` (or timed out) → coordinator sends `ABORT`

### Implementation

```python
"""
Two-Phase Commit (2PC) coordinator and participant implementation.

Protocol Flow:
1. Coordinator sends PREPARE to all participants
2. Each participant executes locally and votes YES or NO
3. Coordinator collects all votes
4. If all YES → send COMMIT; otherwise → send ABORT
5. Participants execute the final decision and acknowledge
"""
from __future__ import annotations

import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class Vote(Enum):
    """Participant vote in the prepare phase."""
    YES = "YES"
    NO = "NO"


class Decision(Enum):
    """Coordinator's final decision."""
    COMMIT = "COMMIT"
    ABORT = "ABORT"


class ParticipantState(Enum):
    """State machine for a 2PC participant."""
    INIT = "INIT"
    WAITING = "WAITING"
    PREPARED = "PREPARED"
    COMMITTED = "COMMITTED"
    ABORTED = "ABORTED"


@dataclass
class TwoPCParticipant:
    """A participant in a two-phase commit protocol.

    Each participant manages its own local transaction and
    communicates its vote to the coordinator during the prepare phase.
    """
    name: str
    state: ParticipantState = ParticipantState.INIT
    transaction_log: list[str] = field(default_factory=list)

    def prepare(self) -> Vote:
        """Execute the local transaction up to the commit point.

        Writes undo/redo logs so the transaction can be recovered
        after a crash, regardless of the coordinator's decision.

        Returns:
            Vote.YES if the local transaction succeeded,
            Vote.NO if it failed (e.g., constraint violation).
        """
        try:
            # Simulate local transaction execution
            self.transaction_log.append(f"[{self.name}] Prepared — transaction ready to commit")
            self.state = ParticipantState.WAITING
            logger.info(f"[{self.name}] Voted YES")
            return Vote.YES
        except Exception:
            self.transaction_log.append(f"[{self.name}] Failed — cannot commit")
            logger.warning(f"[{self.name}] Voted NO")
            return Vote.NO

    def commit(self) -> None:
        """Execute the commit — make the local transaction permanent."""
        self.state = ParticipantState.COMMITTED
        self.transaction_log.append(f"[{self.name}] COMMITTED")
        logger.info(f"[{self.name}] Committed")

    def abort(self) -> None:
        """Execute the abort — roll back the local transaction."""
        self.state = ParticipantState.ABORTED
        self.transaction_log.append(f"[{self.name}] ABORTED (rolled back)")
        logger.info(f"[{self.name}] Aborted")


@dataclass
class TwoPCCoordinator:
    """Coordinator for the Two-Phase Commit protocol.

    Orchestrates the prepare and commit/abort phases across
    all participants. Implements timeout-based failure detection.
    """
    participants: list[TwoPCParticipant] = field(default_factory=list)
    transaction_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    timeout_seconds: float = 5.0

    def execute(self) -> Decision:
        """Run the full 2PC protocol across all participants.

        Returns:
            Decision.COMMIT if all participants voted YES,
            Decision.ABORT if any participant voted NO or timed out.
        """
        logger.info(f"[Coordinator] Starting 2PC for transaction {self.transaction_id}")

        # ── Phase 1: Prepare ──
        votes: list[tuple[TwoPCParticipant, Vote]] = []
        for participant in self.participants:
            start = time.monotonic()
            vote = participant.prepare()
            elapsed = time.monotonic() - start

            if elapsed > self.timeout_seconds:
                logger.warning(
                    f"[Coordinator] {participant.name} timed out "
                    f"({elapsed:.2f}s > {self.timeout_seconds}s) — treating as NO"
                )
                vote = Vote.NO

            votes.append((participant, vote))

        # ── Phase 2: Commit or Abort ──
        all_yes = all(v == Vote.YES for _, v in votes)

        if all_yes:
            decision = Decision.COMMIT
            logger.info(f"[Coordinator] All voted YES → COMMIT")
            for participant, _ in votes:
                participant.commit()
        else:
            decision = Decision.ABORT
            logger.info(f"[Coordinator] Not all voted YES → ABORT")
            for participant, _ in votes:
                participant.abort()

        logger.info(
            f"[Coordinator] Transaction {self.transaction_id} "
            f"finished with decision: {decision.value}"
        )
        return decision
```

### Pros and Cons

| Aspect | Advantage | Disadvantage |
|---|---|---|
| **Consistency** | Strong — all-or-nothing guarantee | Blocked if coordinator crashes after Phase 1 |
| **Isolation** | Participants lock resources during prepare | Locks held during entire protocol → reduced throughput |
| **Availability** | N/A — sacrifices availability during partition | All participants must be reachable |
| **Complexity** | Well-understood, standardized (XA standard) | Coordinator is a single point of failure |
| **Performance** | N/A | 2 round trips + synchronous waiting |
| **Recovery** | Persistent logs enable recovery | Log corruption = lost transactions |

---

## 13.3 — Three-Phase Commit (3PC)

Three-phase commit extends 2PC by adding a **pre-commit** phase, reducing the window during which the coordinator is blocked.

```
  THREE-PHASE COMMIT (3PC)
  ══════════════════════════

  Phase 1          Phase 2            Phase 3
  ──────────       ──────────         ──────────

  Coordinator      Coordinator        Coordinator
      │                │                  │
      ├── PREPARE ────►│                  │
      │                ├── PRE-COMMIT ───►│
      │                │                  ├── COMMIT
      │◄─── VOTE ◄────┤                  │
      │                │◄─── ACK ─────────┤
      │                │                  │
      ▼                ▼                  ▼
  VOTE PHASE     PRE-COMMIT PHASE    COMMIT PHASE
  (can still     (locked in, but     (final
   change mind)   no undo logs yet)    execution)

  Comparison with 2PC:
  ═════════════════════

  2PC:   PREPARE ──────────────────────► COMMIT/ABORT
                       (long wait, holds locks)

  3PC:   PREPARE ──► PRE-COMMIT ──► COMMIT/ABORT
                  (knows all voted YES before locking)

  Key difference: After PRE-COMMIT, every participant knows
  that all others voted YES. A crash during PRE-COMMIT means
  the recovery process can safely commit (no ambiguity).
```

### How 3PC Improves Over 2PC

| Aspect | 2PC | 3PC |
|---|---|---|
| **Phases** | 2 (Prepare, Commit) | 3 (Prepare, Pre-commit, Commit) |
| **Blocking** | Coordinator crash blocks participants indefinitely | Participants can timeout and commit during pre-commit |
| **Lock holding** | Locks held from prepare until commit | Locks held only from pre-commit (shorter window) |
| **Network round trips** | 2 | 3 (extra round trip) |
| **Complexity** | Simpler | More complex; requires synchronized clocks for timeout |

> **Note:** 3PC solves the blocking problem in theory but has its own issues in practice. It assumes a partially synchronous system (bounded message delay). In fully asynchronous networks with partitions, 3PC can lead to **inconsistency** — two participants may commit at different times. In practice, 3PC is rarely used in production systems; the Saga pattern has largely replaced it.

---

## 13.4 — Saga Pattern

The Saga pattern decomposes a distributed transaction into a sequence of **local transactions**, each of which can be independently committed. If any step fails, **compensating transactions** undo the preceding steps.

```
  SAGA PATTERN — OVERVIEW
  ════════════════════════

  Forward Path (happy):
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  T1:     │   │  T2:     │   │  T3:     │   │  T4:     │
  │  Create  │──►│  Reserve │──►│  Charge  │──►│  Award   │
  │  Order   │   │  Stock   │   │  Card    │   │  Points  │
  └──────────┘   └──────────┘   └──────────┘   └──────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
    Commit 1      Commit 2      Commit 3      Commit 4


  Failure at T3 — Compensation:
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  T1:     │   │  T2:     │   │  T3:     │   │          │
  │  Create  │──►│  Reserve │──►│  Charge  │──►│  FAILS!  │
  │  Order   │   │  Stock   │   │  Card    │   │          │
  └──────────┘   └──────────┘   └────┬─────┘   └──────────┘
                                      │
                                      ▼
                                   ┌──────┐   ┌──────┐   ┌──────┐
                                   │  C2: │◄──│  C1: │◄──│  C0: │
                                   │Release│  │Un-   │   │Cancel│
                                   │Stock  │   │charge│   │Order │
                                   └──────┘   └──────┘   └──────┘

  Compensating transactions run in REVERSE order
```

### Choreography vs Orchestration

```
  CHOREOGRAPHY SAGA (event-driven, decentralized)
  ══════════════════════════════════════════════════

  ┌──────────┐    OrderCreated    ┌──────────┐    StockReserved   ┌──────────┐
  │  Order   │───────────────────►│Inventory │──────────────────►│ Payment  │
  │  Service │                    │ Service  │                    │ Service  │
  └──────────┘                    └──────────┘                    └──────────┘
       ▲                                                               │
       │     OrderCancelled ◄──── StockReleased ◄── PaymentFailed ◄───┘
       └───────────────────────────────────────────────────────────────┘

  Each service listens for events and decides what to do next.
  NO central coordinator — services are fully decoupled.


  ORCHESTRATION SAGA (centralized, explicit control flow)
  ════════════════════════════════════════════════════════

  ┌──────────────────────────────────────────────────────────────┐
  │                  SAGA ORCHESTRATOR                           │
  │                                                              │
  │  Step 1: Tell OrderService to create order                   │
  │     └── On success → Step 2                                 │
  │     └── On failure → done (nothing to compensate)            │
  │                                                              │
  │  Step 2: Tell InventoryService to reserve stock              │
  │     └── On success → Step 3                                 │
  │     └── On failure → compensate Step 1 (cancel order)       │
  │                                                              │
  │  Step 3: Tell PaymentService to charge card                  │
  │     └── On success → Step 4                                 │
  │     └── On failure → compensate Steps 2, 1                   │
  │                                                              │
  │  Step 4: Tell LoyaltyService to award points                 │
  │     └── On success → done                                   │
  │     └── On failure → compensate Steps 3, 2, 1               │
  └──────────────────────────────────────────────────────────────┘
           │              │              │              │
           ▼              ▼              ▼              ▼
      OrderService  InventoryService  PaymentService  LoyaltyService
```

### Choreography vs Orchestration Comparison

| Aspect | Choreography | Orchestration |
|---|---|---|
| **Coupling** | Low — services only know events | High — orchestrator knows all services |
| **Visibility** | Hard to see the full flow | Centralized, easy to understand |
| **Complexity** | Distributed; hard to debug | Localized in orchestrator |
| **Single point of failure** | None | Orchestrator |
| **Adding a step** | Easy — add a new listener | Modify orchestrator logic |
| **Compensation** | Each service handles its own compensation | Orchestrator manages compensation flow |
| **Best for** | Simple flows (3–4 steps) | Complex flows with many steps |

### Saga Orchestrator Implementation

```python
"""
Saga orchestrator pattern with compensating transactions.

Each step in the saga has an action (forward) and a compensator (undo).
The orchestrator runs steps sequentially, and if any step fails,
it runs compensators in reverse order for all previously completed steps.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Callable

logger = logging.getLogger(__name__)


@dataclass
class SagaStep:
    """A single step in a saga with forward action and compensator.

    Attributes:
        name: Human-readable step name for logging.
        action: Callable that performs the forward operation.
        compensator: Callable that undoes the forward operation.
    """
    name: str
    action: Callable[[], Any]
    compensator: Callable[[], Any]


@dataclass
class SagaResult:
    """Result of executing a saga."""
    success: bool
    completed_steps: list[str] = field(default_factory=list)
    compensated_steps: list[str] = field(default_factory=list)
    error: str | None = None


class SagaOrchestrator:
    """Orchestrator that executes a sequence of steps with compensation.

    On success, all steps are committed in order.
    On failure, compensators run in reverse order for all completed steps.

    Usage:
        orchestrator = SagaOrchestrator("order-saga")
        orchestrator.add_step("create_order", create_order, cancel_order)
        orchestrator.add_step("reserve_stock", reserve_stock, release_stock)
        orchestrator.add_step("charge_payment", charge_payment, refund_payment)
        result = orchestrator.execute()
    """

    def __init__(self, name: str) -> None:
        self.name = name
        self._steps: list[SagaStep] = []

    def add_step(self, name: str, action: Callable[[], Any], compensator: Callable[[], Any]) -> SagaOrchestrator:
        """Add a step to the saga.

        Args:
            name: Step identifier for logging and debugging.
            action: Forward operation — called during normal execution.
            compensator: Undo operation — called during compensation.

        Returns:
            self, for method chaining.
        """
        self._steps.append(SagaStep(name=name, action=action, compensator=compensator))
        return self

    def execute(self) -> SagaResult:
        """Execute the saga.

        Runs each step's action in sequence. If any step fails,
        runs compensators in reverse order for all completed steps.

        Returns:
            SagaResult indicating success or failure, with lists
            of completed and compensated steps.
        """
        completed: list[SagaStep] = []

        for step in self._steps:
            logger.info(f"[{self.name}] Executing step: {step.name}")
            try:
                step.action()
                completed.append(step)
                logger.info(f"[{self.name}] Step {step.name} succeeded")
            except Exception as exc:
                logger.error(f"[{self.name}] Step {step.name} failed: {exc}")
                self._compensate(completed, step.name)
                return SagaResult(
                    success=False,
                    completed_steps=[s.name for s in completed],
                    error=f"Failed at step '{step.name}': {exc}",
                )

        return SagaResult(
            success=True,
            completed_steps=[s.name for s in completed],
        )

    def _compensate(self, completed: list[SagaStep], failed_step: str) -> None:
        """Run compensators in reverse order for all completed steps."""
        logger.info(f"[{self.name}] Starting compensation after failure at: {failed_step}")
        for step in reversed(completed):
            logger.info(f"[{self.name}] Compensating step: {step.name}")
            try:
                step.compensator()
                logger.info(f"[{self.name}] Compensation for {step.name} succeeded")
            except Exception as exc:
                logger.error(
                    f"[{self.name}] CRITICAL: Compensation for {step.name} "
                    f"FAILED: {exc} — manual intervention required"
                )
```

### Usage Example

```python
"""Example: Order saga with compensation."""

# Simulated service calls
def create_order() -> dict:
    """Create order in the order database."""
    return {"order_id": "ORD-123"}

def cancel_order() -> None:
    """Cancel the order and free reserved resources."""
    print("  → Order ORD-123 cancelled")

def reserve_stock() -> dict:
    """Reserve inventory for the ordered items."""
    raise RuntimeError("Insufficient stock for SKU-WIDGET-42")

def release_stock() -> None:
    """Release any reserved inventory."""
    print("  → Stock reservation released")

def charge_payment() -> dict:
    """Charge the customer's payment method."""
    return {"charge_id": "ch_abc123"}

def refund_payment() -> None:
    """Refund the customer's payment."""
    print("  → Payment refunded")

# Build and run the saga
saga = SagaOrchestrator("order-saga")
saga.add_step("create_order", create_order, cancel_order)
saga.add_step("reserve_stock", reserve_stock, release_stock)
saga.add_step("charge_payment", charge_payment, refund_payment)

result = saga.execute()
print(f"Success: {result.success}, Error: {result.error}")

# Output:
# [order-saga] Executing step: create_order
# [order-saga] Step create_order succeeded
# [order-saga] Executing step: reserve_stock
# [order-saga] Step reserve_stock failed: Insufficient stock
# [order-saga] Starting compensation after failure at: reserve_stock
# [order-saga] Compensating step: create_order
#   → Order ORD-123 cancelled
# Success: False, Error: Failed at step 'reserve_stock': ...
```

---

## 13.5 — TCC (Try-Confirm/Cancel)

TCC is a distributed transaction pattern with three phases: **Try** (reserve resources), **Confirm** (commit), or **Cancel** (release reservations). It is similar to 2PC but operates at the application level with explicit business logic.

```
  TCC FLOW (Try-Confirm/Cancel)
  ═══════════════════════════════

  Phase 1: TRY (Reserve)
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  Order   │  │ Inventory│  │ Payment  │
  │  Service │  │ Service  │  │ Service  │
  └────┬─────┘  └────┬─────┘  └────┬─────┘
       │              │              │
       ▼              ▼              ▼
  Reserve order   Freeze stock   Hold funds
  (pending)       (reserved)     (authorized)
       │              │              │
       ├──── All reserved? ──────────┘
       │              │
       ▼              ▼
  Phase 2: CONFIRM (commit all reservations)
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Confirm  │  │ Confirm  │  │ Confirm  │
  │ order    │  │ stock    │  │ charge   │
  └──────────┘  └──────────┘  └──────────┘

  OR

  Phase 2: CANCEL (release all reservations)
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Cancel   │  │ Cancel   │  │ Cancel   │
  │ order    │  │ stock    │  │ hold     │
  └──────────┘  └──────────┘  └──────────┘


  Resource Reservation Pattern:
  ═════════════════════════════

  ┌─────────────────────────────────────────────┐
  │  TRY:   Create reservation (not commit)      │
  │         "I plan to use this resource"        │
  │         Other transactions see it as reserved│
  │                                              │
  │  CONFIRM: Convert reservation to final state │
  │         "I'm done — make it permanent"       │
  │         Cannot fail (business guarantee)     │
  │                                              │
  │  CANCEL: Release reservation                 │
  │         "I'm done — undo the reservation"    │
  │         Cannot fail (idempotent)             │
  └─────────────────────────────────────────────┘
```

### TCC vs Saga

| Aspect | TCC | Saga |
|---|---|---|
| **Phases** | 3 (Try, Confirm, Cancel) | N (one per step + compensators) |
| **Resource locking** | Application-level reservation | No explicit reservation |
| **Isolation** | Better — resources are reserved, unavailable to others | Weaker — no reservation, others may read stale data |
| **Complexity** | Higher — each service must implement Try/Confirm/Cancel | Moderate — action + compensator |
| **Latency** | Higher — 2 round trips minimum (Try + Confirm) | Lower — 1 round trip per step |
| **Idempotency required** | Yes — Confirm/Cancel must be idempotent | Yes — compensators must be idempotent |
| **Best for** | Financial systems requiring isolation | General distributed workflows |

---

## 13.6 — Outbox Pattern

The **Transactional Outbox** pattern solves the problem of reliably publishing events as part of a database transaction. Instead of publishing events directly (which can fail if the message broker is down), you write events to an **outbox table** inside the same database transaction as your business data. A separate process reads the outbox and publishes events.

```
  THE PROBLEM: DUAL WRITE
  ════════════════════════

  ┌──────────────────────────────────────────┐
  │  Service writes to DB                    │
  │     └── ✅ success                       │
  │  Service publishes event to broker       │
  │     └── ❌ broker down!                  │
  │                                          │
  │  Result: DB committed, but event lost    │
  │  Other services never know what happened │
  └──────────────────────────────────────────┘


  THE SOLUTION: TRANSACTIONAL OUTBOX
  ════════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  BEGIN TRANSACTION                           │
  │    INSERT INTO orders (…) VALUES (…)         │
  │    INSERT INTO outbox (topic, payload)       │
  │  COMMIT                                      │
  │  (Atomic: both writes succeed or both fail)  │
  └──────────────┬───────────────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────────────┐
  │  OUTBOX PROCESSOR (poller or CDC)            │
  │                                              │
  │  Polling-based:                              │
  │    SELECT * FROM outbox WHERE published=false │
  │    → Publish each to message broker          │
  │    → UPDATE outbox SET published=true        │
  │                                              │
  │  CDC-based:                                  │
  │    Debezium captures row-level changes       │
  │    → Streams outbox inserts to Kafka         │
  │    → No polling needed                       │
  └──────────────┬───────────────────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────────────────┐
  │  MESSAGE BROKER (Kafka, RabbitMQ, etc.)      │
  │  Other services consume events               │
  └──────────────────────────────────────────────┘
```

### Polling-Based Implementation

```python
"""
Transactional Outbox pattern — polling-based implementation.

The outbox table acts as a staging area for events. Business data
and the outbox entry are written in the same database transaction.
A background poller reads unpublished outbox entries, publishes them
to the message broker, and marks them as published.
"""
from __future__ import annotations

import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class OutboxEntry:
    """An entry in the transactional outbox table."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    topic: str = ""
    payload: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    published: bool = False
    published_at: str | None = None


class OutboxRepository:
    """Simulates an outbox table in the database."""

    def __init__(self) -> None:
        self._entries: list[OutboxEntry] = []

    def insert(self, topic: str, payload: dict[str, Any]) -> OutboxEntry:
        """Insert an outbox entry (called inside a business transaction)."""
        entry = OutboxEntry(topic=topic, payload=payload)
        self._entries.append(entry)
        return entry

    def get_unpublished(self) -> list[OutboxEntry]:
        """Fetch all entries that haven't been published yet."""
        return [e for e in self._entries if not e.published]

    def mark_published(self, entry_id: str) -> None:
        """Mark an entry as published after successful broker send."""
        for entry in self._entries:
            if entry.id == entry_id:
                entry.published = True
                entry.published_at = datetime.now(timezone.utc).isoformat()
                break


class MessageBroker:
    """Simulates a message broker (Kafka, RabbitMQ, etc.)."""

    def __init__(self) -> None:
        self._messages: list[dict[str, Any]] = []

    def publish(self, topic: str, payload: dict[str, Any]) -> bool:
        """Publish a message to the broker.

        Returns True on success, False on failure.
        """
        # Simulate occasional broker failures
        self._messages.append({"topic": topic, "payload": payload})
        return True


class OutboxPoller:
    """Polling-based outbox processor.

    Periodically reads unpublished entries from the outbox,
    publishes them to the message broker, and marks them as published.
    Runs as a background thread or async task.
    """

    def __init__(
        self,
        outbox: OutboxRepository,
        broker: MessageBroker,
        poll_interval: float = 1.0,
        batch_size: int = 10,
    ) -> None:
        self._outbox = outbox
        self._broker = broker
        self._poll_interval = poll_interval
        self._batch_size = batch_size
        self._running = False

    def poll_once(self) -> int:
        """Run a single poll cycle.

        Fetches unpublished entries in batches, publishes each one,
        and marks it as published on success.

        Returns:
            Number of entries published in this cycle.
        """
        entries = self._outbox.get_unpublished()[: self._batch_size]
        published_count = 0

        for entry in entries:
            success = self._broker.publish(entry.topic, entry.payload)
            if success:
                self._outbox.mark_published(entry.id)
                published_count += 1
                logger.info(
                    f"[OutboxPoller] Published {entry.id} "
                    f"to topic '{entry.topic}'"
                )
            else:
                logger.warning(
                    f"[OutboxPoller] Failed to publish {entry.id} "
                    f"— will retry on next poll"
                )

        return published_count

    def run(self, max_cycles: int | None = None) -> None:
        """Run the poller in a loop.

        Args:
            max_cycles: Stop after this many cycles (None = run forever).
        """
        self._running = True
        cycle = 0
        while self._running:
            count = self.poll_once()
            if count > 0:
                logger.info(f"[OutboxPoller] Published {count} events this cycle")
            cycle += 1
            if max_cycles and cycle >= max_cycles:
                break
            time.sleep(self._poll_interval)
```

### Polling vs CDC Comparison

| Aspect | Polling-Based | CDC-Based (Debezium) |
|---|---|---|
| **Latency** | Depends on poll interval (1–30s typical) | Near real-time (milliseconds) |
| **DB Load** | Periodic SELECT queries | Minimal — reads WAL/binlog |
| **Complexity** | Simple to implement | Requires CDC infrastructure |
| **Ordering** | Manual ordering (sequence column) | Guaranteed by database log order |
| **At-least-once** | Yes — requires idempotent consumers | Yes — built into CDC framework |
| **Best for** | Low-throughput, simple systems | High-throughput, event-driven systems |

---

## 13.7 — Eventual Consistency

Eventual consistency means that if no new updates are made, all replicas (or services) will **eventually** converge to the same state. It is the trade-off you accept for availability and performance in distributed systems.

```
  STRONG vs EVENTUAL CONSISTENCY
  ═══════════════════════════════

  STRONG CONSISTENCY:
  ┌─────────────────────────────────────────────────┐
  │  Write: User.balance = $100                     │
  │  Read:  User.balance → always $100              │
  │                                                 │
  │  Every read sees the latest write                │
  │  Requires: synchronous replication, locking     │
  └─────────────────────────────────────────────────┘

  EVENTUAL CONSISTENCY:
  ┌─────────────────────────────────────────────────┐
  │  t=0: User.balance = $100 (written to primary)  │
  │  t=1: Read from replica A → $50  (stale!)       │
  │  t=2: Read from replica A → $80  (propagating)  │
  │  t=3: Read from replica A → $100 (converged!)   │
  │                                                 │
  │  Reads may be stale temporarily                  │
  │  Eventually all replicas agree                   │
  └─────────────────────────────────────────────────┘
```

### Strategies for Dealing with Eventual Consistency

| Strategy | Description | Example |
|---|---|---|
| **Version vectors** | Attach version numbers to detect conflicts | DynamoDB uses vector clocks |
| **Read repair** | When a stale read is detected, trigger a repair | Cassandra read repair |
| **Anti-entropy** | Background process compares replicas and syncs | Merkle trees in Cassandra |
| **Quorum reads/writes** | Read/write to a majority of replicas | `R + W > N` guarantee |
| **Causal consistency** | Ensure causally related events are seen in order | Client-side timestamps |
| **CRDTs** | Conflict-free data types that merge automatically | G-Counter, LWW-Register |

### Idempotency

In eventually consistent systems, operations may be delivered **more than once**. Idempotency ensures that processing the same operation multiple times produces the same result as processing it once.

```python
"""
Idempotent operation handler for distributed transactions.

Every operation carries a unique idempotency key. The handler tracks
processed keys and skips duplicate operations. This is critical for
eventual consistency — messages may be retried on failure.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Callable

logger = logging.getLogger(__name__)


@dataclass
class IdempotencyResult:
    """Result of an idempotent operation."""
    processed: bool
    result: Any = None
    already_processed: bool = False


class IdempotencyHandler:
    """Ensures each operation is processed exactly once.

    Stores processed idempotency keys to detect and skip duplicates.
    In production, use Redis or a database table for persistence.

    Usage:
        handler = IdempotencyHandler()

        def charge_user(user_id: str, amount: float) -> dict:
            return {"charged": amount}

        # First call — processes normally
        handler.process("order-123-charge", charge_user, "user-42", 99.99)

        # Duplicate call — skipped (idempotent)
        handler.process("order-123-charge", charge_user, "user-42", 99.99)
    """

    def __init__(self) -> None:
        self._processed_keys: set[str] = set()

    def process(
        self,
        idempotency_key: str,
        operation: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> IdempotencyResult:
        """Execute an operation idempotently.

        If the idempotency key has been seen before, the operation
        is skipped and the previous result type is returned.

        Args:
            idempotency_key: Unique key identifying this operation.
            operation: The callable to execute.
            *args: Positional arguments forwarded to the operation.
            **kwargs: Keyword arguments forwarded to the operation.

        Returns:
            IdempotencyResult with the operation's result or a
            flag indicating the operation was already processed.
        """
        if idempotency_key in self._processed_keys:
            logger.info(f"Skipping duplicate operation: {idempotency_key}")
            return IdempotencyResult(processed=False, already_processed=True)

        result = operation(*args, **kwargs)
        self._processed_keys.add(idempotency_key)
        logger.info(f"Processed operation: {idempotency_key}")
        return IdempotencyResult(processed=True, result=result)

    def is_processed(self, idempotency_key: str) -> bool:
        """Check if an operation has already been processed."""
        return idempotency_key in self._processed_keys
```

---

## 13.8 — Transactional Messaging

Transactional messaging ensures that a message is sent **exactly once** — not lost, not duplicated — by coupling message sending with database state changes.

```
  TRANSACTIONAL MESSAGING PATTERN
  ═════════════════════════════════

  ┌──────────────────────────────────────────────┐
  │  SERVICE SIDE                                │
  │                                              │
  │  1. BEGIN TRANSACTION                       │
  │  2. INSERT INTO orders (…)                   │
  │  3. INSERT INTO outbox (topic, payload)      │
  │  4. COMMIT                                   │
  │                                              │
  │  (Atomic: order and outbox entry are          │
  │   committed together or not at all)           │
  └───────────────────┬──────────────────────────┘
                      │
                      ▼
  ┌──────────────────────────────────────────────┐
  │  OUTBOX RELAY                                │
  │                                              │
  │  5. Read unpublished outbox entries          │
  │  6. Publish to message broker                │
  │  7. Mark entries as published                │
  │                                              │
  │  (At-least-once delivery with idempotent     │
  │   consumer → effectively exactly-once)        │
  └───────────────────┬──────────────────────────┘
                      │
                      ▼
  ┌──────────────────────────────────────────────┐
  │  CONSUMER SIDE                               │
  │                                              │
  │  8. Receive message                          │
  │  9. Check idempotency key                    │
  │  10. Process if new (skip if duplicate)       │
  │  11. Record idempotency key                  │
  │                                              │
  │  (Idempotent processing guarantees           │
  │   exactly-once semantics)                     │
  └──────────────────────────────────────────────┘
```

### Exactly-Once Delivery: The Three Layers

| Layer | Mechanism | Guarantee |
|---|---|---|
| **Service → Outbox** | Database transaction (atomic) | No data loss between business write and event write |
| **Outbox → Broker** | Polling/CDC + broker acknowledgments | No data loss between outbox and broker |
| **Consumer processing** | Idempotency key check | No duplicate processing |

### Important Caveat

True exactly-once delivery across the entire system is impossible in distributed computing (the Two Generals Problem). What we achieve with the outbox pattern + idempotent consumers is **effectively exactly-once** semantics — the system behaves as if each message is processed exactly once, even though individual components may retry.

---

## 13.9 — Comparison Table of All Approaches

```
  DISTRIBUTED TRANSACTION PATTERNS — SIDE BY SIDE
  ═════════════════════════════════════════════════

              ┌──────────┬──────────┬──────────┬──────────┬──────────┐
              │   2PC    │   3PC    │  Saga    │   TCC    │  Outbox  │
  ────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
  Consistency │  Strong  │  Strong  │ Eventual │  Strong* │ Eventual │
  Isolation   │  High    │  High    │  Low     │  Medium  │  None**  │
  Performance │  Low     │  Medium  │  High    │  Medium  │  High    │
  Complexity  │  Medium  │  High    │  Medium  │  High    │  Low     │
  Blocking    │  Yes     │  Partial │  No      │  Yes     │  No      │
  Scalability │  Poor    │  Poor    │  Good    │  Medium  │  Good    │
  Rollback    │  Atomic  │  Atomic  │  Comp.   │  Cancel  │  Comp.   │
  ────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

  * TCC provides strong consistency within the try-confirm scope
  ** Outbox is not itself a transaction pattern; it enables reliable
     event publishing for Saga and other patterns
```

| Aspect | 2PC | 3PC | Saga | TCC | Outbox |
|---|---|---|---|---|---|
| **Consistency model** | Strong (ACID) | Strong (ACID) | Eventual | Strong (during reservation) | Eventual |
| **Atomicity mechanism** | Coordinator votes | Pre-commit + votes | Compensating transactions | Try-Confirm/Cancel | DB atomicity + at-least-once |
| **Availability** | Low — all participants must be up | Medium — timeout-based recovery | High — services are independent | Medium — all must respond to Try | High — asynchronous publishing |
| **Performance impact** | High — 2-phase synchronous | Medium — 3 round trips | Low — async, independent commits | Medium — 2-phase per step | Low — async relay |
| **Failure recovery** | Coordinator log replay | Timeout-based auto-commit | Compensating transactions in reverse | Cancel phase | Polling retry or CDC |
| **Typical use case** | Banking (XA transactions) | Academic/rarely used | E-commerce order flows | Financial reservations | Event-driven architectures |
| **Production adoption** | Legacy financial systems | Very rare | Widely adopted | Financial services | Widely adopted |
| **Failure mode** | Blocks on coordinator crash | Non-blocking but may diverge | Partial commit visible temporarily | Blocks during Try phase | Message delay (not loss) |

---

## 13.10 — Real-World Case Studies

### Amazon: Saga Pattern in Order Processing

Amazon's order processing pipeline is one of the most well-known implementations of the Saga pattern. When you place an order:

```
  AMAZON ORDER FLOW (simplified Saga)
  ═════════════════════════════════════

  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
  │ Place  │──►│ Verify │──►│Reserve │──►│ Charge │──►│ Confirm│
  │ Order  │   │Payment │   │ Stock  │   │ Card   │   │ Shipment│
  └────┬───┘   └────┬───┘   └────┬───┘   └────┬───┘   └────┬───┘
       │             │            │             │             │
       ▼             ▼            ▼             ▼             ▼
  If card is   If stock not  If charge     If shipment   Done!
  declined →   available →   fails →       fails →
  Cancel order Release stock  Cancel order  Retry or
               Cancel order                cancel

  Compensation cascade:
  ──────────────────────
  Step 5 fails → compensate 4, 3, 2, 1
  Step 4 fails → compensate 3, 2, 1
  Step 3 fails → compensate 2, 1
  Step 2 fails → compensate 1
```

**Key design decisions:**
- Each step is a local transaction in its own service database
- Compensation is idempotent — retrying a cancel order is safe
- Payment hold (authorize now, capture later) gives a natural TCC-like window
- Events flow through Amazon's internal event bus (similar to EventBridge)

### Uber: Distributed Transactions at Scale

Uber's payment system processes millions of transactions per day across multiple payment providers and currencies. Their approach combines several patterns:

```
  UBER PAYMENT ARCHITECTURE
  ══════════════════════════

  ┌──────────┐    ┌──────────────────────────────────────┐
  │ Ride     │    │  Payment Orchestrator                 │
  │ Service  │───►│                                       │
  └──────────┘    │  1. Create payment intent (outbox)    │
                  │  2. Route to payment provider          │
                  │  3. Handle 3DS / fraud checks          │
                  │  4. Confirm or deny                    │
                  │  5. Settle with merchant               │
                  │                                       │
                  └────────┬──────────┬──────────┬────────┘
                           │          │          │
                           ▼          ▼          ▼
                       ┌───────┐ ┌───────┐ ┌───────┐
                       │ Stripe│ │ Braintree│ │ Adyen │
                       └───────┘ └───────┘ └───────┘

  Pattern: Outbox + Saga + Idempotency
  - Every payment has a unique idempotency key
  - Outbox ensures events are published reliably
  - Saga compensations handle failures at any stage
```

**Key patterns:**
- **Transactional Outbox** for reliable event publishing to their Kafka-based event stream
- **Idempotency keys** on every payment API call (Stripe, Adyen, etc.)
- **Saga orchestrator** manages the multi-step payment flow with compensation
- **Circuit breaker** pattern for payment provider failover

### Banking Systems: 2PC Usage

Traditional banking systems are the primary users of Two-Phase Commit, typically implemented via the **XA standard** (distributed transaction API):

```
  BANKING TRANSFER WITH 2PC (XA)
  ════════════════════════════════

  Account A (Bank 1)         Account B (Bank 2)
  ┌──────────────────┐       ┌──────────────────┐
  │ Balance: $1000   │       │ Balance: $500    │
  └────────┬─────────┘       └────────┬─────────┘
           │                          │
     Phase 1: PREPARE            Phase 1: PREPARE
     "Can you debit $200?"       "Can you credit $200?"
           │                          │
     Phase 1: YES                Phase 1: YES
     (lock $200, log undo)       (reserve space, log undo)
           │                          │
     Phase 2: COMMIT             Phase 2: COMMIT
     Balance: $800               Balance: $700
           │                          │
     ACK ✓                       ACK ✓

  Regulatory requirement: Money transfers MUST be
  strongly consistent — no eventual consistency allowed.
  This is why banks still use 2PC/XA despite its drawbacks.
```

**Why banks use 2PC despite the drawbacks:**
- **Regulatory compliance**: Financial regulations require ACID transactions
- **Audit requirements**: Every transaction must be traceable and reversible
- **No partial commitment**: A debit without a credit (or vice versa) is unacceptable
- **XA middleware**: Application servers (WebSphere, WebLogic) provide XA transaction managers

---

## 13.11 — Anti-Patterns and Pitfalls

```
  COMMON DISTRIBUTED TRANSACTION MISTAKES
  ════════════════════════════════════════

  ✗ Using 2PC across microservices as the default choice
    → 2PC blocks resources and doesn't scale; use Saga instead

  ✗ Assuming distributed transactions are "just like local transactions"
    → Network failures, partitions, and timeouts create fundamentally
      different failure modes

  ✗ Not implementing idempotency
    → Retries in distributed systems are inevitable; without idempotency,
      duplicate processing corrupts state

  ✗ Ignoring compensating transaction failures
    → What if the compensation fails too? You need a dead-letter queue
      or manual intervention process

  ✗ Long-lived transactions in 2PC
    → Holding locks across services during the entire protocol kills
      throughput; keep transactions short

  ✗ Publishing events inside a transaction commit hook
    → If the broker is down, the commit fails or the event is lost;
      use the Outbox pattern instead

  ✗ Not testing failure scenarios
    → Simulate: network partitions, service crashes, broker outages,
      database failures — each requires different handling

  ✗ Over-compensating
    → Compensation should undo exactly what was done, not more.
      "Cancel order" should not also cancel unrelated data

  ✗ Missing dead-letter handling
    → Failed compensations need a dead-letter queue with alerting,
      not silent failures or infinite retries
```

### Pitfall Deep-Dive: The Phantom Commit

```
  THE PHANTOM COMMIT PROBLEM
  ═══════════════════════════

  Service A                    Service B
  ┌──────────┐                 ┌──────────┐
  │ Step 1:  │                 │          │
  │ Write DB │ ✅              │          │
  │ Send evt │──── event ────► │ Step 2:  │
  └──────────┘    (async)      │ Write DB │ ✅
                               │ Send evt │────►
                               └──────────┘

  Problem: Service A committed AND published the event.
  But Service B failed. Now Service A's state is committed
  but the downstream effect never happened.

  Fix: Use the Outbox pattern so the event is only published
  AFTER the database transaction commits.
```

---

## 13.12 — Architecture Decision Matrix

```
  DECISION: WHICH DISTRIBUTED TRANSACTION PATTERN TO USE?

  ┌──────────────────────────────────┬──────────────────────────────────────┐
  │  Scenario                        │  Recommendation                      │
  ├──────────────────────────────────┼──────────────────────────────────────┤
  │  Simple 2-3 service workflow     │  Saga (choreography)                 │
  │  Complex workflow (5+ steps)     │  Saga (orchestration)                │
  │  Financial transaction (regulatory)│  2PC (XA)                          │
  │  Need isolation (resource reserve)│  TCC                                │
  │  Event-driven architecture       │  Outbox + Saga                       │
  │  High throughput, eventual OK    │  Saga + Outbox                       │
  │  Cross-bank money transfer       │  2PC with XA                        │
  │  Shopping cart checkout          │  Saga (orchestration)                │
  │  Distributed cache + DB sync     │  Outbox pattern                     │
  │  Legacy monolith migration       │  Strangler + Outbox for events       │
  │  Microservices with CQRS         │  Outbox + Event Sourcing             │
  └──────────────────────────────────┴──────────────────────────────────────┘
```

### Decision Flow

```
  START: Need to coordinate across multiple services?
         │
         ├── YES
         │    ├── Need strong consistency (regulatory/compliance)?
         │    │    ├── YES → Is it a short transaction (< 1s)?
         │    │    │         ├── YES → 2PC (XA)
         │    │    │         └── NO  → TCC (try-confirm/cancel)
         │    │    └── NO → Saga pattern
         │    │         ├── Simple flow (≤ 3 steps)?
         │    │         │    └── Choreography saga
         │    │         └── Complex flow (> 3 steps)?
         │    │              └── Orchestration saga
         │    └── Need reliable event publishing?
         │         └── YES → Add Outbox pattern to any of the above
         │
         └── NO → Local transaction (ACID) is sufficient
```

---

## 13.13 — Practice Exercises

### Exercise 1: Implement a Saga Orchestrator

Build a complete Saga orchestrator with the following requirements:
- Support for steps with both forward actions and compensating transactions
- Timeout handling — if a step takes longer than N seconds, treat it as a failure
- Persistent saga state — save progress to a database so a crashed orchestrator can resume
- Dead-letter queue — if a compensation fails, store it for manual review

**Starter code:**
```python
# Extend the SagaOrchestrator from Section 13.4 with:
# 1. A timeout parameter per step
# 2. A persistence layer (SQLite or in-memory dict)
# 3. A dead-letter callback for failed compensations

orchestrator = SagaOrchestratorWithPersistence("exercise-saga")
orchestrator.add_step("create_order", create_order, cancel_order, timeout=5.0)
orchestrator.add_step("reserve_stock", reserve_stock, release_stock, timeout=3.0)
orchestrator.add_step("charge_payment", charge_payment, refund_payment, timeout=10.0)
```

### Exercise 2: Build a Transactional Outbox

Implement a complete outbox system:
1. An `OutboxWriter` that writes business data and outbox entries in the same transaction
2. A `PollingRelay` that publishes events at configurable intervals with retry logic
3. A `CDCRelay` stub that simulates change-data-capture behavior
4. An `IdempotentConsumer` that processes events exactly once

**Test scenario:**
- Simulate a broker outage during event publishing
- Verify that events survive the outage and are published on recovery
- Verify that duplicate events are handled idempotently by the consumer

### Exercise 3: Saga vs 2PC Performance Comparison

Create a benchmark comparing Saga and 2PC for an order processing flow:
1. Implement both patterns for the same flow (Order → Inventory → Payment)
2. Measure throughput with 1, 10, 50, and 100 concurrent transactions
3. Measure the impact of one participant being slow (100ms latency)
4. Plot the results and analyze where each pattern breaks down

**Metrics to capture:**
- Total throughput (transactions/second)
- Latency (p50, p95, p99)
- Resource utilization (open connections, held locks)
- Recovery time after simulated failure

---

## 13.14 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **Why distributed transactions are hard** | Multiple databases, no shared transaction manager, network failures create partial commits |
| **Two-Phase Commit (2PC)** | Coordinator-based atomic commit with prepare/vote and commit/abort phases; strong consistency but blocking |
| **Three-Phase Commit (3PC)** | Adds pre-commit phase to reduce blocking; rarely used in practice due to partition inconsistency |
| **Saga Pattern** | Decompose into local transactions with compensating transactions; choreography (decentralized) vs orchestration (centralized) |
| **TCC (Try-Confirm/Cancel)** | Application-level 2PC with explicit resource reservation; better isolation than Saga |
| **Outbox Pattern** | Write events to a DB outbox table atomically with business data; relay publishes asynchronously |
| **Eventual Consistency** | Accept temporary staleness for availability; use idempotency, version vectors, and CRDTs |
| **Transactional Messaging** | Outbox + idempotent consumer = effectively exactly-once delivery |
| **Idempotency** | Critical in distributed systems — every operation must be safe to retry |
| **Pattern selection** | 2PC for regulatory compliance, Saga for most workflows, Outbox for reliable eventing |

### When to Use What

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  USE 2PC WHEN:                                           │
  │  ✓ Regulatory requirement for strong consistency         │
  │  ✓ Short transactions (< 1 second)                       │
  │  ✓ XA transaction manager is available                   │
  │                                                          │
  │  USE SAGA WHEN:                                          │
  │  ✓ Multi-step workflow across services                   │
  │  ✓ Eventual consistency is acceptable                    │
  │  ✓ You need to scale horizontally                        │
  │                                                          │
  │  USE TCC WHEN:                                           │
  │  ✓ Resource isolation is needed before commitment        │
  │  ✓ Financial systems (stock reservation, fund holds)     │
  │  ✓ You can implement Try/Confirm/Cancel in each service  │
  │                                                          │
  │  USE OUTBOX WHEN:                                        │
  │  ✓ You publish events as part of a business transaction  │
  │  ✓ The message broker may be unavailable                 │
  │  ✓ You need reliable, ordered event delivery             │
  │                                                          │
  │  AVOID 2PC WHEN:                                         │
  │  ✗ High throughput is required                           │
  │  ✗ Services span multiple teams/organizations            │
  │  ✗ Network latency is high between participants          │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 14 — Resilience](chapter-14-resilience.md) → Building systems that survive failure.*
