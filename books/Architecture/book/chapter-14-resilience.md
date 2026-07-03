# Chapter 14: Resilience Engineering — Keeping Systems Running During Failures

> *"Everything fails, all the time."*
> — Werner Vogels, CTO of Amazon

---

## 14.1 — What Is Resilience Engineering?

Resilience engineering is the discipline of designing systems that can withstand, adapt to, and recover from failures — whether they come from hardware crashes, network partitions, traffic spikes, or bugs in your own code. It is not about preventing failures; it is about ensuring that when failures happen (and they always do), the system continues to deliver value, even if at reduced capacity.

This is fundamentally different from **fault tolerance**. Fault tolerance is a specific technique: the ability of a system to continue operating when one or more components fail (often via redundancy). Resilience engineering is broader — it encompasses fault tolerance but also includes degradation strategies, recovery mechanisms, and the organizational practices that keep systems operational.

```
  RESILIENT vs NON-RESILIENT SYSTEM BEHAVIOR
  ═══════════════════════════════════════════

  NON-RESILIENT SYSTEM:
  ─────────────────────
  Request ──► Service A ──► Service B ──► Service C
                                         ╳ FAILS!
  Result: Complete outage. All requests fail.
  User sees: "500 Internal Server Error"

  Timeline:
  t=0s  ████████████████  Full capacity (100%)
  t=1s  ░░░░░░░░░░░░░░░░  Dead (0%)
              ▲
              └── Single point of failure kills everything


  RESILIENT SYSTEM:
  ─────────────────
  Request ──► Service A ──► Service B ──► Service C
                                          ╳ FAILS!
               │                │              │
               └── circuit      └── retry     └── fallback
                   breaker         + backoff      to cache

  Result: Graceful degradation. Most requests still succeed.
  User sees: Product recommendation from cache (slightly stale)

  Timeline:
  t=0s  ████████████████  Full capacity (100%)
  t=1s  ████████░░░░░░░░  Degraded (60%)  ← still operational
  t=5s  ████████████░░░░  Recovering (80%)
  t=10s ████████████████  Restored (100%)
```

### The Goal: Graceful Degradation, Not Perfect Uptime

| Concept | Definition | Example |
|---|---|---|
| **Perfect uptime** | System never fails | Impossible in distributed systems |
| **Fault tolerance** | System survives component failure | Redundant databases, replicated services |
| **Graceful degradation** | System reduces functionality under stress | Serve cached data when DB is slow |
| **Self-healing** | System detects and fixes its own failures | Auto-restart crashed containers |
| **Resilience** | All of the above, plus adaptation and learning | Chaos engineering, error budgets |

The key insight is that **every component will fail eventually**. The question is not *if* your database, network, or third-party API will go down — it is *when*, and whether your system degrades gracefully or catastrophically.

### Resilience Patterns Overview

```
  RESILIENCE PATTERN TAXONOMY
  ═══════════════════════════

  FAILURE PREVENTION          FAILURE DETECTION        FAILURE RECOVERY
  ─────────────────          ──────────────────       ─────────────────
  • Circuit Breaker          • Health Checks          • Retry + Backoff
  • Rate Limiting            • Heartbeat              • Fallback
  • Bulkhead                 • Timeout                • Auto-Restart
  • Load Shedding            • Anomaly Detection      • Failover
```

---

## 14.2 — Circuit Breaker Pattern

The circuit breaker is the most important resilience pattern. Inspired by electrical circuit breakers that trip when current exceeds a safe threshold, the software circuit breaker monitors calls to a remote service and **trips open** when failures exceed a configurable threshold — preventing further calls and allowing the downstream service time to recover.

### The Three States

```
  CIRCUIT BREAKER STATE MACHINE
  ═════════════════════════════

  ┌──────────┐   failures ≥ threshold   ┌──────────┐
  │          │ ────────────────────────► │          │
  │  CLOSED  │                           │   OPEN   │
  │ (normal) │ ◄──────────────────────── │ (reject) │
  └──────────┘   successes ≥ threshold   └──────────┘
       ▲                                       │
       │                                       │ timeout expires
       │           ┌──────────┐                │
       │           │          │                │
       └───────────│HALF-OPEN │ ◄──────────────┘
         success   │ (probe)  │   probe request
                   └──────────┘
                       │
                       │ failure
                       ▼
                    ┌──────────┐
                    │   OPEN   │
                    │ (reject) │
                    └──────────┘

  CLOSED:       Requests flow through normally. Failures are counted.
  OPEN:         All requests are immediately rejected. No calls to the
                downstream service. This gives it time to recover.
  HALF-OPEN:    After a timeout, a single probe request is allowed through.
                If it succeeds, circuit closes. If it fails, circuit opens again.
```

### Configuration Parameters

| Parameter | Description | Typical Value |
|---|---|---|
| `failure_threshold` | Number of failures before opening | 5 |
| `success_threshold` | Consecutive successes to close from half-open | 3 |
| `timeout` | Seconds to wait before trying half-open | 30s |
| `half_open_max_calls` | Max concurrent calls in half-open state | 1 |
| `failure_rate_threshold` | Percentage of failures to trigger open (alternative to count) | 50% |
| `minimum_calls` | Minimum calls before evaluating failure rate | 20 |

```python
"""
Thread-safe Circuit Breaker implementation with configurable thresholds.

The circuit breaker monitors calls to a downstream service and trips
open when failures exceed a threshold, preventing cascading failures.
"""
import time
import threading
from enum import Enum
from dataclasses import dataclass, field
from typing import Any, Callable


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


@dataclass
class CircuitBreakerConfig:
    """Configuration for the circuit breaker."""
    failure_threshold: int = 5
    success_threshold: int = 3
    timeout: float = 30.0  # seconds before half-open
    half_open_max_calls: int = 1
    name: str = "default"


class CircuitOpenError(Exception):
    """Raised when a call is attempted while the circuit is open."""

    def __init__(self, breaker_name: str, retry_after: float) -> None:
        self.breaker_name = breaker_name
        self.retry_after = retry_after
        super().__init__(
            f"Circuit breaker '{breaker_name}' is OPEN. "
            f"Retry after {retry_after:.1f}s."
        )


class CircuitBreaker:
    """
    A thread-safe circuit breaker that protects downstream services
    from cascading failures by stopping calls when error rates are high.

    Usage:
        breaker = CircuitBreaker(CircuitBreakerConfig(failure_threshold=3))

        try:
            result = breaker.call(lambda: requests.get(url, timeout=5))
        except CircuitOpenError:
            result = fallback_value
    """

    def __init__(self, config: CircuitBreakerConfig | None = None) -> None:
        self._config = config or CircuitBreakerConfig()
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time = 0.0
        self._half_open_calls = 0
        self._lock = threading.Lock()
        self._total_calls = 0
        self._total_failures = 0
        self._total_rejections = 0

    @property
    def state(self) -> CircuitState:
        """Current state of the circuit breaker."""
        with self._lock:
            if self._state == CircuitState.OPEN:
                # Check if timeout has elapsed → transition to half-open
                elapsed = time.monotonic() - self._last_failure_time
                if elapsed >= self._config.timeout:
                    self._state = CircuitState.HALF_OPEN
                    self._success_count = 0
                    self._half_open_calls = 0
            return self._state

    def _on_success(self) -> None:
        """Handle a successful call."""
        with self._lock:
            self._failure_count = 0
            if self._state == CircuitState.HALF_OPEN:
                self._success_count += 1
                if self._success_count >= self._config.success_threshold:
                    self._state = CircuitState.CLOSED
                    self._success_count = 0

    def _on_failure(self) -> None:
        """Handle a failed call."""
        with self._lock:
            self._failure_count += 1
            self._total_failures += 1
            self._last_failure_time = time.monotonic()

            if self._state == CircuitState.HALF_OPEN:
                # Probe failed — reopen the circuit
                self._state = CircuitState.OPEN
            elif self._failure_count >= self._config.failure_threshold:
                self._state = CircuitState.OPEN

    def call(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        """
        Execute a function through the circuit breaker.

        Raises CircuitOpenError if the circuit is open.
        Returns the function's result if the circuit is closed or half-open.
        """
        current_state = self.state  # triggers state transition check

        if current_state == CircuitState.OPEN:
            self._total_rejections += 1
            remaining = self._config.timeout - (
                time.monotonic() - self._last_failure_time
            )
            raise CircuitOpenError(self._config.name, max(0, remaining))

        if current_state == CircuitState.HALF_OPEN:
            with self._lock:
                if self._half_open_calls >= self._config.half_open_max_calls:
                    self._total_rejections += 1
                    raise CircuitOpenError(self._config.name, 0.0)
                self._half_open_calls += 1

        self._total_calls += 1
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception:
            self._on_failure()
            raise

    def get_stats(self) -> dict[str, Any]:
        """Return current circuit breaker statistics."""
        return {
            "name": self._config.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "total_calls": self._total_calls,
            "total_failures": self._total_failures,
            "total_rejections": self._total_rejections,
            "failure_rate": (
                self._total_failures / self._total_calls
                if self._total_calls > 0
                else 0.0
            ),
        }


# --- Demo ---
breaker = CircuitBreaker(
    CircuitBreakerConfig(
        name="payment-service",
        failure_threshold=3,
        success_threshold=2,
        timeout=2.0,
    )
)

call_count = 0

def unreliable_service() -> str:
    """Simulates a service that fails intermittently."""
    global call_count
    call_count += 1
    if call_count % 4 == 0:
        return "success"
    raise ConnectionError("Service unavailable")

print("=== Circuit Breaker Demo ===")
for i in range(12):
    try:
        result = breaker.call(unreliable_service)
        print(f"  Call {i+1:>2}: ✅ {result}")
    except CircuitOpenError as e:
        print(f"  Call {i+1:>2}: 🔴 CIRCUIT OPEN (retry in {e.retry_after:.1f}s)")
    except ConnectionError:
        print(f"  Call {i+1:>2}: ❌ Call failed")

    stats = breaker.get_stats()
    if i in (4, 9):
        print(f"         Stats: {stats}")
    time.sleep(0.1)

print(f"\\n  Final: {breaker.get_stats()}")
```

---

## 14.3 — Retry Pattern with Exponential Backoff

When a transient failure occurs (network glitch, brief overload, temporary unavailability), the simplest recovery strategy is to try again. But naively retrying in a tight loop can make things worse — flooding a struggling service with repeated requests. The solution is **exponential backoff**: increasing the wait time between retries.

### Backoff Strategies Comparison

```
  BACKOFF TIMING STRATEGIES
  ══════════════════════════

  Fixed Backoff (1s intervals):
  │──R──│──R──│──R──│──R──│──R──│──R──│
  t=0   t=1   t=2   t=3   t=4   t=5
  Problem: Every retry hits at the same rate — no relief for the server.

  Exponential Backoff (base=1s):
  │──R────────│──R────────────────────────│──R──────────────────────────────────────────────────│
  t=0         t=1                         t=3                                    t=7
  Wait: 1s          2s                          4s
  Problem: Multiple clients retry in sync ("thundering herd").

  Exponential Backoff + Jitter:
  │──R──────│──R────────────│──R──────────────────────────────────────│
  t=0       t=0.7           t=2.4                                    t=6.1
  Wait: 0.7s       1.7s                           3.7s
  Solution: Random jitter spreads retries across time.
```

### When NOT to Retry

Not all operations are safe to retry. The critical distinction is **idempotency**:

| Operation Type | Safe to Retry? | Why |
|---|---|---|
| `GET /users/123` | Yes | Read-only, no side effects |
| `PUT /users/123` with full body | Yes | Idempotent — same result on repeat |
| `POST /orders` without idempotency key | **No** | May create duplicate orders |
| `POST /payments` | Depends | Only with idempotency key |
| `DELETE /users/123` | Yes | Idempotent — already deleted is fine |
| `PATCH /balance` (add $10) | **No** | Non-idempotent — charges twice |

```python
"""
Retry with exponential backoff and jitter.
Thread-safe implementation with configurable strategies.
"""
import random
import time
import threading
from enum import Enum
from dataclasses import dataclass
from typing import Any, Callable


class BackoffStrategy(Enum):
    FIXED = "fixed"
    EXPONENTIAL = "exponential"
    EXPONENTIAL_WITH_JITTER = "exponential_with_jitter"


@dataclass
class RetryConfig:
    """Configuration for retry behavior."""
    max_retries: int = 3
    base_delay: float = 1.0  # seconds
    max_delay: float = 30.0  # seconds
    backoff_strategy: BackoffStrategy = BackoffStrategy.EXPONENTIAL_WITH_JITTER
    retryable_exceptions: tuple[type[Exception], ...] = (Exception,)
    jitter_range: float = 0.5  # ±50% jitter


class RetryExhaustedError(Exception):
    """Raised when all retry attempts have been exhausted."""

    def __init__(self, attempts: int, last_exception: Exception) -> None:
        self.attempts = attempts
        self.last_exception = last_exception
        super().__init__(
            f"All {attempts} retry attempts exhausted. "
            f"Last error: {last_exception}"
        )


class RetryHandler:
    """
    Executes a function with configurable retry logic and backoff.

    Supports fixed, exponential, and jittered backoff strategies.

    Usage:
        handler = RetryHandler(RetryConfig(max_retries=3))
        result = handler.execute(lambda: requests.get(url, timeout=5))
    """

    def __init__(self, config: RetryConfig | None = None) -> None:
        self._config = config or RetryConfig()
        self._lock = threading.Lock()
        self._call_count = 0
        self._retry_count = 0

    def _calculate_delay(self, attempt: int) -> float:
        """Calculate the delay before the next retry."""
        if self._config.backoff_strategy == BackoffStrategy.FIXED:
            delay = self._config.base_delay
        elif self._config.backoff_strategy == BackoffStrategy.EXPONENTIAL:
            delay = min(
                self._config.base_delay * (2 ** attempt),
                self._config.max_delay,
            )
        else:  # EXPONENTIAL_WITH_JITTER
            delay = min(
                self._config.base_delay * (2 ** attempt),
                self._config.max_delay,
            )
            jitter = delay * self._config.jitter_range
            delay += random.uniform(-jitter, jitter)
            delay = max(0, delay)

        return delay

    def execute(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        """
        Execute func with retries on transient failures.

        Returns the function's result on success.
        Raises RetryExhaustedError if all attempts fail.
        """
        last_exception = Exception("No attempts made")
        total_attempts = self._config.max_retries + 1

        with self._lock:
            self._call_count += 1

        for attempt in range(total_attempts):
            try:
                result = func(*args, **kwargs)
                if attempt > 0:
                    with self._lock:
                        self._retry_count += 1
                return result
            except self._config.retryable_exceptions as e:
                last_exception = e
                if attempt < self._config.max_retries:
                    delay = self._calculate_delay(attempt)
                    time.sleep(delay)
                continue

        raise RetryExhaustedError(total_attempts, last_exception)

    def get_stats(self) -> dict[str, int]:
        """Return retry statistics."""
        with self._lock:
            return {
                "total_calls": self._call_count,
                "total_retries": self._retry_count,
            }


# --- Demo ---
print("=== Retry with Exponential Backoff + Jitter ===")

handler = RetryHandler(
    RetryConfig(
        max_retries=4,
        base_delay=0.5,
        backoff_strategy=BackoffStrategy.EXPONENTIAL_WITH_JITTER,
    )
)

call_counter = 0

def flaky_api_call() -> str:
    """Simulate an API that fails for the first 3 attempts."""
    global call_counter
    call_counter += 1
    if call_counter <= 3:
        raise ConnectionError(f"Attempt {call_counter}: Connection refused")
    return f"Success on attempt {call_counter}"

try:
    result = handler.execute(flaky_api_call)
    print(f"  Result: {result}")
except RetryExhaustedError as e:
    print(f"  Failed after {e.attempts} attempts: {e.last_exception}")

print(f"  Stats: {handler.get_stats()}")
```

---

## 14.4 — Bulkhead Pattern

Named after the watertight compartments in a ship's hull, the bulkhead pattern **isolates resources** so that a failure in one component cannot exhaust resources needed by other components. In software, this typically means separating thread pools, connection pools, or memory allocations per service or operation.

```
  BULKHEAD PATTERN — RESOURCE ISOLATION
  ══════════════════════════════════════

  WITHOUT BULKHEADS:                WITH BULKHEADS:
  ┌───────────────────┐             ┌───────────┬───────────┬───────────┐
  │   SHARED POOL     │             │ Pool: A   │ Pool: B   │ Pool: C   │
  │   (20 threads)    │             │ (10)      │ (5)       │ (5)       │
  │                   │             │           │           │           │
  │  Service A floods │             │ A uses    │ B uses    │ C uses    │
  │  ──────────────── │             │ max 10    │ max 5     │ max 5     │
  │  Pool exhausted!  │             │           │           │           │
  │                   │             │ Failure   │           │           │
  │  Service B starved│             │ in A uses │ B and C   │ B and C   │
  │  Service C starved│             │ only A's  │ unaffected│ unaffected│
  └───────────────────┘             │ pool      │           │           │
                                    └───────────┴───────────┴───────────┘
  One service can hog all          Each service gets its own
  resources, starving others       guaranteed resources
```

### Bulkhead Types

| Type | Isolation Unit | Use Case |
|---|---|---|
| **Thread pool** | Dedicated threads per service | Prevent one slow service from blocking others |
| **Connection pool** | Separate DB/HTTP connections | Database per tenant, HTTP per upstream |
| **Semaphore** | Counting semaphore per operation | Limit concurrent calls to a single API |
| **Memory** | Separate memory quotas | Prevent OOM from one feature killing the whole process |

```python
"""
Bulkhead pattern implementation with thread pool isolation.
Each downstream service gets its own bounded thread pool.
"""
import time
import threading
from concurrent.futures import ThreadPoolExecutor, Future
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class BulkheadConfig:
    """Configuration for a bulkhead."""
    name: str
    max_concurrent: int = 10
    max_wait_time: float = 5.0  # seconds to wait for a slot


class BulkheadFullError(Exception):
    """Raised when the bulkhead has no available slots."""

    def __init__(self, bulkhead_name: str) -> None:
        self.bulkhead_name = bulkhead_name
        super().__init__(
            f"Bulkhead '{bulkhead_name}' is full. "
            f"No slots available for new requests."
        )


class Bulkhead:
    """
    Thread pool bulkhead that isolates resources per downstream service.

    Each bulkhead maintains its own thread pool with a fixed maximum
    concurrency. When the pool is full, new requests are rejected
    (or wait up to max_wait_time for a slot).

    Usage:
        payment_bulkhead = Bulkhead(BulkheadConfig("payment", max_concurrent=5))
        result = payment_bulkhead.call(process_payment, order_id="123")
    """

    def __init__(self, config: BulkheadConfig) -> None:
        self._config = config
        self._pool = ThreadPoolExecutor(
            max_workers=config.max_concurrent,
            thread_name_prefix=f"bulkhead-{config.name}",
        )
        self._active_count = 0
        self._total_calls = 0
        self._rejected_count = 0
        self._lock = threading.Lock()
        self._semaphore = threading.Semaphore(config.max_concurrent)

    def call(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        """
        Execute a function within this bulkhead's resource pool.

        Blocks up to max_wait_time waiting for a slot.
        Raises BulkheadFullError if no slot becomes available.
        """
        acquired = self._semaphore.acquire(
            timeout=self._config.max_wait_time
        )
        if not acquired:
            with self._lock:
                self._rejected_count += 1
            raise BulkheadFullError(self._config.name)

        with self._lock:
            self._active_count += 1
            self._total_calls += 1

        try:
            future = self._pool.submit(func, *args, **kwargs)
            return future.result(timeout=self._config.max_wait_time)
        finally:
            self._active_count -= 1
            self._semaphore.release()

    def get_stats(self) -> dict[str, Any]:
        """Return bulkhead utilization statistics."""
        with self._lock:
            return {
                "name": self._config.name,
                "max_concurrent": self._config.max_concurrent,
                "active_count": self._active_count,
                "total_calls": self._total_calls,
                "rejected_count": self._rejected_count,
                "utilization": (
                    self._active_count / self._config.max_concurrent
                ),
            }

    def shutdown(self) -> None:
        """Gracefully shut down the bulkhead's thread pool."""
        self._pool.shutdown(wait=True)


# --- Demo ---
print("=== Bulkhead Pattern Demo ===")

payment_bulkhead = Bulkhead(BulkheadConfig("payment-service", max_concurrent=3))
search_bulkhead = Bulkhead(BulkheadConfig("search-service", max_concurrent=3))

def slow_payment(order_id: str) -> str:
    """Simulate a slow payment processing call."""
    time.sleep(0.5)
    return f"Payment processed for order {order_id}"

def fast_search(query: str) -> str:
    """Simulate a fast search call."""
    time.sleep(0.1)
    return f"Search results for: {query}"

# Simulate: payment service is slow, but search is unaffected
import concurrent.futures

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    # Flood the payment bulkhead
    payment_futures = [
        executor.submit(payment_bulkhead.call, slow_payment, f"order-{i}")
        for i in range(6)
    ]

    # Search still works independently
    search_result = search_bulkhead.call(fast_search, "resilience patterns")

    print(f"  Search result: {search_result}")
    print(f"  Payment stats: {payment_bulkhead.get_stats()}")
    print(f"  Search stats:  {search_bulkhead.get_stats()}")

payment_bulkhead.shutdown()
search_bulkhead.shutdown()
```

---

## 14.5 — Timeout Pattern

Timeouts are the most fundamental resilience pattern — and the one most often forgotten. A call without a timeout can block a thread indefinitely, consuming resources and eventually causing cascading failures as thread pools are exhausted.

### Types of Timeouts

| Timeout Type | What It Limits | Example |
|---|---|---|
| **Connection timeout** | Time to establish a TCP connection | 3 seconds to connect to host |
| **Read timeout** | Time waiting for a response after connection | 10 seconds for server to respond |
| **Write timeout** | Time to send the full request body | 5 seconds to upload payload |
| **Total timeout** | End-to-end deadline for the entire operation | 30 seconds for full RPC call |
| **Idle timeout** | Time a connection can stay open without activity | 60 seconds for keep-alive |

### The Cascading Timeout Problem

```
  CASCADING TIMEOUT PROBLEM
  ═════════════════════════

  Client (30s timeout)
      │
      ▼
  Gateway (30s timeout)          ← Gateway doesn't know DB is slow,
      │                            so it uses the same timeout.
      ▼
  Service A (30s timeout)        ← Service A also uses 30s.
      │
      ▼
  Service B (30s timeout)        ← Everyone uses the same timeout.
      │
      ▼
  Database (slow query: 25s)

  Total possible wait: 30 + 30 + 30 + 30 = 120s
  But client only allows 30s!

  FIX: Timeouts should DECREASE at each layer:
  ─────────────────────────────────────────────
  Client:     30s
  Gateway:    25s  (leaves 5s for network + processing)
  Service A:  20s  (leaves 5s for downstream calls)
  Service B:  15s  (leaves 5s for database)
  Database:   10s  (max query time)
```

```python
"""
Timeout pattern with cascading deadline propagation.
Ensures that downstream calls never exceed their parent's deadline.
"""
import time
import threading
from dataclasses import dataclass, field


class TimeoutError(Exception):
    """Raised when an operation exceeds its deadline."""

    def __init__(self, operation: str, timeout: float) -> None:
        self.operation = operation
        self.timeout = timeout
        super().__init__(
            f"Operation '{operation}' timed out after {timeout:.1f}s"
        )


@dataclass
class DeadlineContext:
    """
    Propagates a deadline through a call chain.

    Each layer calculates the remaining time from the parent's deadline
    and uses that as its own timeout — ensuring no single layer can
    consume more than its fair share of the total budget.
    """
    operation: str
    total_timeout: float
    _start_time: float = field(default_factory=time.monotonic)
    _lock: threading.Lock = field(default_factory=threading.Lock)

    @property
    def remaining(self) -> float:
        """Time remaining before deadline, in seconds."""
        elapsed = time.monotonic() - self._start_time
        return max(0, self.total_timeout - elapsed)

    @property
    def is_expired(self) -> bool:
        """Whether the deadline has been reached."""
        return self.remaining <= 0

    def child_context(self, operation: str, reserved_time: float = 0.5) -> "DeadlineContext":
        """
        Create a child context with an adjusted timeout.

        Reserves `reserved_time` seconds for the caller's own processing
        after the child returns.
        """
        child_timeout = max(0.1, self.remaining - reserved_time)
        return DeadlineContext(
            operation=operation,
            total_timeout=child_timeout,
            _start_time=time.monotonic(),
        )


def call_with_deadline(
    context: DeadlineContext,
    func,
    *args,
    **kwargs,
):
    """
    Execute a function, enforcing the deadline from the context.

    Raises TimeoutError if the deadline is exceeded.
    """
    if context.is_expired:
        raise TimeoutError(context.operation, context.total_timeout)

    # Set a threading-based alarm for the timeout
    result_holder = [None]
    exception_holder = [None]

    def target():
        try:
            result_holder[0] = func(*args, **kwargs)
        except Exception as e:
            exception_holder[0] = e

    thread = threading.Thread(target=target, daemon=True)
    thread.start()
    thread.join(timeout=context.remaining)

    if thread.is_alive():
        raise TimeoutError(context.operation, context.total_timeout)

    if exception_holder[0] is not None:
        raise exception_holder[0]

    return result_holder[0]


# --- Demo ---
print("=== Cascading Timeout Demo ===")

root = DeadlineContext(operation="GET /checkout", total_timeout=5.0)
print(f"  Root deadline: {root.total_timeout:.1f}s, remaining: {root.remaining:.1f}s")

# Simulate call chain with decreasing timeouts
auth_ctx = root.child_context("auth-service", reserved_time=0.5)
print(f"  Auth timeout:  {auth_ctx.total_timeout:.1f}s")

order_ctx = auth_ctx.child_context("order-service", reserved_time=0.5)
print(f"  Order timeout: {order_ctx.total_timeout:.1f}s")

db_ctx = order_ctx.child_context("database-query", reserved_time=0.5)
print(f"  DB timeout:    {db_ctx.total_timeout:.1f}s")
```

---

## 14.6 — Fallback Pattern

When a downstream service fails or is too slow, the fallback pattern provides an alternative response — degraded, but still useful. The key is choosing the *right* fallback for each situation.

### Fallback Strategies

```
  FALLBACK DECISION TREE
  ══════════════════════

  Is the operation a READ?
  ├── YES ──► Is there a cached copy?
  │           ├── YES ──► Return cached data (stale is OK)
  │           └── NO  ──► Return default/empty value
  │
  └── NO (WRITE/MUTATION) ──► Is it safe to retry later?
                              ├── YES ──► Queue for retry (async)
                              └── NO  ──► Return error to caller
```

| Fallback Type | Use Case | Trade-off |
|---|---|---|
| **Cache fallback** | Product catalog, user profiles | Data may be stale |
| **Default value** | Recommendations, ratings | Generic but available |
| **Degraded functionality** | Search without ranking, video without HD | Less value, still functional |
| **Queue for later** | Order processing, email sending | Eventual consistency |
| **Static response** | Service status, maintenance message | No dynamic data |

```python
"""
Fallback pattern with multiple strategies.
Demonstrates cache fallback, default value, and degraded functionality.
"""
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class FallbackStrategy:
    """A fallback strategy with a condition and handler."""
    name: str
    condition: Callable[[], bool] = lambda: True
    handler: Callable[..., Any] | None = None


class FallbackChain:
    """
    Chains multiple fallback strategies together.
    When the primary call fails, strategies are tried in order
    until one succeeds or all are exhausted.

    Usage:
        chain = FallbackChain()
        chain.set_primary(lambda: call_external_api())
        chain.add_fallback(FallbackStrategy(
            name="cache",
            handler=lambda: get_from_cache(key),
        ))
        chain.add_fallback(FallbackStrategy(
            name="default",
            handler=lambda: {"recommendations": []},
        ))
        result = chain.execute()
    """

    def __init__(self) -> None:
        self._primary: Callable[..., Any] | None = None
        self._fallbacks: list[FallbackStrategy] = []
        self._executed_strategy: str = "none"

    def set_primary(self, func: Callable[..., Any]) -> None:
        """Set the primary function to execute."""
        self._primary = func

    def add_fallback(self, strategy: FallbackStrategy) -> None:
        """Add a fallback strategy to the chain."""
        self._fallbacks.append(strategy)

    def execute(self, *args: Any, **kwargs: Any) -> Any:
        """
        Execute the primary function, falling back on failure.

        Tries each fallback in order until one succeeds.
        """
        # Try primary
        if self._primary:
            try:
                result = self._primary(*args, **kwargs)
                self._executed_strategy = "primary"
                return result
            except Exception:
                pass

        # Try fallbacks in order
        for fallback in self._fallbacks:
            if not fallback.condition():
                continue
            try:
                result = fallback.handler(*args, **kwargs) if fallback.handler else None
                self._executed_strategy = f"fallback:{fallback.name}"
                return result
            except Exception:
                continue

        self._executed_strategy = "all_failed"
        raise RuntimeError("Primary and all fallback strategies failed")

    @property
    def strategy_used(self) -> str:
        """Return the name of the strategy that provided the result."""
        return self._executed_strategy


# --- Demo ---
print("=== Fallback Chain Demo ===")

# Simulate cache and primary service
cache = {"product:123": {"id": 123, "name": "Widget", "price": 9.99, "stale": True}}

def primary_service() -> dict:
    """Simulate a service that is currently down."""
    raise ConnectionError("Payment service unavailable")

def cache_lookup() -> dict:
    """Look up product in cache."""
    return cache.get("product:123", {})

def default_response() -> dict:
    """Return a sensible default."""
    return {"id": 123, "name": "Unknown Product", "price": 0.0, "note": "Data unavailable"}

chain = FallbackChain()
chain.set_primary(primary_service)
chain.add_fallback(FallbackStrategy(name="cache", handler=cache_lookup))
chain.add_fallback(FallbackStrategy(name="default", handler=default_response))

result = chain.execute()
print(f"  Result: {result}")
print(f"  Strategy used: {chain.strategy_used}")
```

---

## 14.7 — Rate Limiting for Resilience

Rate limiting is not just an API management tool — it is a critical resilience pattern. By limiting the rate at which requests are processed, rate limiting protects services from sudden traffic spikes, prevents resource exhaustion, and ensures that a single misbehaving client cannot bring down the entire system.

### Rate Limiting as a Resilience Tool

```
  RATE LIMITING PROTECTS AGAINST:
  ═══════════════════════════════

  ┌───────────────────┐
  │   NORMAL LOAD     │     ┌───────────────────────┐
  │   ~~~████████~~~  │     │   RATE LIMITER         │
  │   ~~~████████~~~  │────►│   ┌─────────────────┐  │
  └───────────────────┘     │   │ Allowed: pass   │──┼──► Service
                            │   └─────────────────┘  │    (healthy)
  ┌───────────────────┐     │   ┌─────────────────┐  │
  │   TRAFFIC SPIKE   │     │   │ Over limit:     │  │
  │   ████████████████│────►│   │ reject/shed     │──┼──► Service
  │   ████████████████│     │   └─────────────────┘  │    (protected)
  └───────────────────┘     └───────────────────────┘

  ┌───────────────────┐
  │   DDOS ATTACK     │     ┌───────────────────────┐
  │   ████████████████│     │   RATE LIMITER         │
  │   ████████████████│────►│   Block > 99%          │──► Service
  │   ████████████████│     │   Allow < 1%           │    (survives)
  └───────────────────┘     └───────────────────────┘
```

Rate limiting connects directly to the API Gateway patterns from Chapter 8. At the gateway level, rate limiting protects the entire system. At the service level, per-service rate limiting protects individual components. Both layers are important.

### Multi-Layer Rate Limiting

| Layer | Protects Against | Implementation |
|---|---|---|
| **Client-side** | Client bugs sending too many requests | Client-side throttling |
| **Gateway** | External traffic spikes, abuse | API Gateway rate limiting |
| **Service** | Internal cascading overloads | Per-service rate limiter |
| **Dependency** | Overwhelming downstream services | Outbound call rate limiting |

---

## 14.8 — Load Shedding

Load shedding is the practice of **deliberately dropping requests** when the system is under extreme load, rather than letting all requests fail slowly. It is better to return a fast "503 Service Unavailable" to some requests than to let every request time out.

### Priority-Based Shedding

```
  LOAD SHEDDING BY PRIORITY
  ═════════════════════════

  System Capacity: 1000 requests/second
  Current Load: 1500 requests/second (150% of capacity)

  ┌─────────────────────────────────────────────────┐
  │  PRIORITY 1: CRITICAL (always serve)            │
  │  • Payment processing                           │
  │  • Authentication                               │
  │  → Serve 100% of these                         │
  ├─────────────────────────────────────────────────┤
  │  PRIORITY 2: IMPORTANT (serve if capacity)      │
  │  • Product search                               │
  │  • Order placement                              │
  │  → Serve ~70% of these                         │
  ├─────────────────────────────────────────────────┤
  │  PRIORITY 3: NORMAL (shed under pressure)       │
  │  • Recommendations                              │
  │  • Reviews                                      │
  │  → Serve ~30% of these                         │
  ├─────────────────────────────────────────────────┤
  │  PRIORITY 4: BEST-EFFORT (shed first)           │
  │  • Analytics events                             │
  │  • Background sync                              │
  │  → Serve ~10% of these                         │
  └─────────────────────────────────────────────────┘
```

```python
"""
Priority-based load shedding.
Drops lower-priority requests first when the system is under pressure.
"""
import time
import threading
from enum import IntEnum
from dataclasses import dataclass, field
from typing import Any, Callable


class Priority(IntEnum):
    """Request priorities — lower value = higher priority."""
    CRITICAL = 1
    IMPORTANT = 2
    NORMAL = 3
    BEST_EFFORT = 4


@dataclass
class LoadShedderConfig:
    """Configuration for the load shedder."""
    max_concurrent: int = 100
    high_watermark: float = 0.8  # start shedding at 80% capacity
    critical_reserve: float = 0.2  # reserve 20% for critical requests


class RequestShedError(Exception):
    """Raised when a request is shed due to overload."""

    def __init__(self, priority: Priority, reason: str) -> None:
        self.priority = priority
        self.reason = reason
        super().__init__(f"Request shed (priority={priority.name}): {reason}")


class LoadShedder:
    """
    Tracks system load and sheds lower-priority requests when
    utilization exceeds the high watermark.

    Usage:
        shedder = LoadShedder(LoadShedderConfig(max_concurrent=100))

        with shedder.admit(priority=Priority.NORMAL) as context:
            if context.admitted:
                result = process_request()
            else:
                result = shedder.get_shed_response()
    """

    def __init__(self, config: LoadShedderConfig) -> None:
        self._config = config
        self._active_count = 0
        self._total_admitted = 0
        self._total_shed = 0
        self._lock = threading.Lock()

    @property
    def utilization(self) -> float:
        """Current utilization as a ratio (0.0 to 1.0)."""
        return self._active_count / self._config.max_concurrent

    def should_admit(self, priority: Priority) -> bool:
        """
        Determine whether a request of the given priority should be admitted.

        Higher-priority requests are admitted even at high load.
        Lower-priority requests are shed first.
        """
        with self._lock:
            util = self.utilization

            if util < self._config.high_watermark:
                return True  # Under load limit — admit everything

            # Above high watermark — check priority
            if priority == Priority.CRITICAL:
                return True  # Always admit critical requests

            if priority == Priority.IMPORTANT:
                return util < 0.95  # Admit until 95% capacity

            if priority == Priority.NORMAL:
                return util < 0.85  # Admit until 85% capacity

            # BEST_EFFORT: only admit when there's plenty of room
            return util < 0.70

    def admit_request(self, priority: Priority) -> bool:
        """Try to admit a request. Returns True if admitted, False if shed."""
        if not self.should_admit(priority):
            with self._lock:
                self._total_shed += 1
            return False

        with self._lock:
            if self._active_count < self._config.max_concurrent:
                self._active_count += 1
                self._total_admitted += 1
                return True
            else:
                self._total_shed += 1
                return False

    def release(self) -> None:
        """Release a slot after the request completes."""
        with self._lock:
            self._active_count = max(0, self._active_count - 1)

    def get_stats(self) -> dict[str, Any]:
        """Return load shedding statistics."""
        with self._lock:
            total = self._total_admitted + self._total_shed
            return {
                "active": self._active_count,
                "capacity": self._config.max_concurrent,
                "utilization": f"{self.utilization:.1%}",
                "total_admitted": self._total_admitted,
                "total_shed": self._total_shed,
                "shed_rate": f"{self._total_shed / total:.1%}" if total > 0 else "0%",
            }


# --- Demo ---
print("=== Load Shedder Demo ===")

shedder = LoadShedder(LoadShedderConfig(max_concurrent=20, high_watermark=0.8))

# Simulate overload with mixed priorities
import random

priorities = list(Priority)
for i in range(50):
    p = random.choice(priorities)
    admitted = shedder.admit_request(p)
    status = "✅" if admitted else "🚫"
    if i < 10 or i >= 45:
        print(f"  Request {i+1:>2} [{p.name:>10}]: {status}")
    elif i == 10:
        print("  ...")

print(f"\\n  Stats: {shedder.get_stats()}")
```

---

## 14.9 — Chaos Engineering

Chaos engineering is the practice of **deliberately injecting failures** into a system to discover weaknesses before they cause real outages. Popularized by Netflix's Chaos Monkey, it transforms the question from *"Will this fail?"* to *"How does this fail, and can we handle it?"*

### Netflix and the Birth of Chaos Engineering

In 2011, Netflix migrated to AWS and realized that cloud infrastructure was inherently unreliable — instances could vanish at any time. Rather than fighting this, they embraced it with the **Simian Army**:

| Tool | What It Does |
|---|---|
| **Chaos Monkey** | Randomly terminates production instances |
| **Latency Monkey** | Injects artificial delays into service calls |
| **Conformity Monkey** | Finds instances that violate best practices |
| **Chaos Gorilla** | Simulates an entire availability zone outage |
| **Chaos Kong** | Simulates an entire region outage |

### Principles of Chaos Engineering

```
  CHAOS ENGINEERING PROCESS
  ═════════════════════════

  1. DEFINE STEADY STATE
     ┌──────────────────────────────────────────┐
     │ "The system works normally when..."      │
     │  • Error rate < 0.1%                     │
     │  • p99 latency < 200ms                   │
     │  • Throughput > 1000 rps                  │
     └──────────────────────┬───────────────────┘
                            │
  2. HYPOTHESIZE              │
     ┌───────────────────────▼──────────────────┐
     │ "If we kill a database replica,          │
     │  the system will still serve reads       │
     │  from the remaining replica within 5s"   │
     └──────────────────────┬───────────────────┘
                            │
  3. INJECT REAL FAILURES    │
     ┌───────────────────────▼──────────────────┐
     │ • Terminate instances                    │
     │ • Inject network latency                 │
     │ • Fill disk / exhaust memory             │
     │ • Block network traffic between services │
     └──────────────────────┬───────────────────┘
                            │
  4. VERIFY STEADY STATE     │
     ┌───────────────────────▼──────────────────┐
     │ "Did error rate stay below 0.1%?         │
     │  Did p99 stay under 200ms?               │
     │  Did throughput stay above 1000 rps?"    │
     └──────────────────────┬───────────────────┘
                            │
  5. FIX WEAKNESSES          │
     ┌───────────────────────▼──────────────────┐
     │ If hypothesis fails → fix the system,    │
     │ then re-run the experiment.              │
     └──────────────────────────────────────────┘
```

### Fault Injection Strategies

| Strategy | What to Inject | Tool Examples |
|---|---|---|
| **Process kill** | Kill random processes/containers | Chaos Monkey, Litmus |
| **Network latency** | Add delays between services | ToxiProxy, tc/netem |
| **Network partition** | Block traffic between services | Chaos Mesh, iptables |
| **Resource exhaustion** | CPU, memory, disk, file descriptors | Stress-ng, chaos-mesh |
| **DNS failure** | Corrupt DNS responses | toxiproxy, custom |
| **Time skew** | Shift system clock forward/back | faketime, chaos-mesh |
| **State corruption** | Inject bad data into caches/DBs | Custom scripts |

### Game Day Exercises

A Game Day is a structured, planned exercise where the team simulates a major failure scenario in production (or staging) and practices their response. Unlike continuous chaos, Game Days are event-driven and involve the full team.

**Game Day Checklist:**

1. Define the scenario (e.g., "Primary database goes down")
2. Set success criteria (e.g., "Failover completes in < 60s")
3. Notify stakeholders
4. Execute the scenario
5. Observe and document the response
6. Conduct a blameless post-mortem
7. Create action items for discovered weaknesses

---

## 14.10 — Health Checks and Self-Healing

Health checks are the foundation of self-healing systems. If you cannot detect that something is broken, you cannot fix it automatically. Modern orchestration platforms (Kubernetes, ECS, Nomad) provide built-in health check mechanisms.

### Liveness vs Readiness Probes

| Probe Type | Question It Answers | Action on Failure |
|---|---|---|
| **Liveness** | "Is the process alive and not deadlocked?" | Restart the container |
| **Readiness** | "Is the process ready to accept traffic?" | Remove from load balancer |
| **Startup** | "Has the process finished initializing?" | Delay liveness/readiness checks |

```
  KUBERNETES HEALTH CHECK MODEL
  ═════════════════════════════

  ┌──────────────────────────────────────────────────────────┐
  │                    Kubernetes Pod                         │
  │                                                          │
  │  ┌──────────────────────────────────────────────┐       │
  │  │              Application Container            │       │
  │  │                                              │       │
  │  │  ┌───────────┐  ┌──────────┐  ┌──────────┐  │       │
  │  │  │ Liveness  │  │ Readiness│  │ Startup  │  │       │
  │  │  │  Probe    │  │  Probe   │  │  Probe   │  │       │
  │  │  └─────┬─────┘  └────┬─────┘  └────┬─────┘  │       │
  │  │        │              │              │        │       │
  │  │  ┌─────▼─────┐  ┌────▼─────┐  ┌────▼─────┐  │       │
  │  │  │ /healthz  │  │ /readyz  │  │ /startupz│  │       │
  │  │  │ HTTP GET  │  │ HTTP GET │  │ HTTP GET │  │       │
  │  │  └─────┬─────┘  └────┬─────┘  └────┬─────┘  │       │
  │  │        │              │              │        │       │
  │  │  Fail 3x →          Fail 3x →      Pass →   │       │
  │  │  RESTART             REMOVE         enable   │       │
  │  │  container           from LB        liveness│       │
  │  └──────────────────────────────────────────────┘       │
  └──────────────────────────────────────────────────────────┘
```

### Auto-Healing Capabilities

| Capability | Trigger | Response | Platform |
|---|---|---|---|
| **Container restart** | Liveness probe failure | Kill and restart container | Kubernetes, ECS |
| **Pod rescheduling** | Node failure | Move pods to healthy node | Kubernetes |
| **Auto-scaling** | CPU/memory/utilization threshold | Add or remove instances | Kubernetes HPA, ECS |
| **Circuit breaker** | Downstream failure rate | Stop calling failing service | Application-level |
| **Automatic failover** | Primary instance failure | Promote replica to primary | Database clusters |

```python
"""
Health check server with liveness and readiness probes.
Simulates a self-healing service with dependency checking.
"""
import time
import threading
from dataclasses import dataclass, field
from enum import Enum


class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


@dataclass
class DependencyHealth:
    """Health state of a downstream dependency."""
    name: str
    status: HealthStatus = HealthStatus.HEALTHY
    last_check: float = field(default_factory=time.monotonic)
    consecutive_failures: int = 0
    error_message: str = ""


class HealthChecker:
    """
    Health checker with liveness and readiness probe support.

    - Liveness: Is the application process alive and not deadlocked?
    - Readiness: Can the application accept traffic (are dependencies healthy)?

    Usage:
        checker = HealthChecker("my-service")
        checker.add_dependency("database", check_db_health)
        checker.add_dependency("cache", check_cache_health)

        # In HTTP server:
        # GET /healthz  → checker.liveness()
        # GET /readyz   → checker.readiness()
    """

    def __init__(self, service_name: str) -> None:
        self._service_name = service_name
        self._dependencies: dict[str, DependencyHealth] = {}
        self._check_functions: dict[str, callable] = {}
        self._started = False
        self._start_time = time.monotonic()
        self._lock = threading.Lock()

    def add_dependency(
        self, name: str, check_func: callable | None = None
    ) -> None:
        """Register a dependency with an optional health check function."""
        with self._lock:
            self._dependencies[name] = DependencyHealth(name=name)
            if check_func:
                self._check_functions[name] = check_func

    def mark_started(self) -> None:
        """Mark the application as fully started."""
        self._started = True

    def check_all(self) -> dict[str, HealthStatus]:
        """Run all dependency health checks and return their statuses."""
        results = {}
        for name, check_func in self._check_functions.items():
            try:
                healthy = check_func()
                status = HealthStatus.HEALTHY if healthy else HealthStatus.UNHEALTHY
            except Exception as e:
                status = HealthStatus.UNHEALTHY
                with self._lock:
                    self._dependencies[name].error_message = str(e)

            with self._lock:
                dep = self._dependencies[name]
                dep.status = status
                dep.last_check = time.monotonic()
                if status == HealthStatus.UNHEALTHY:
                    dep.consecutive_failures += 1
                else:
                    dep.consecutive_failures = 0
                results[name] = status

        return results

    def liveness(self) -> dict:
        """
        Liveness probe: Is the process alive?

        Returns 200 if the process is running and not deadlocked.
        Returns 500 if the process should be restarted.
        """
        uptime = time.monotonic() - self._start_time
        return {
            "status": "alive",
            "uptime_seconds": round(uptime, 1),
            "service": self._service_name,
        }

    def readiness(self) -> dict:
        """
        readiness probe: Can the service accept traffic?

        Returns 200 if all critical dependencies are healthy.
        Returns 503 if the service should be removed from the load balancer.
        """
        if not self._started:
            return {
                "status": "not_ready",
                "reason": "Application not fully started",
            }

        results = self.check_all()
        unhealthy = [
            name for name, status in results.items()
            if status == HealthStatus.UNHEALTHY
        ]

        if unhealthy:
            return {
                "status": "not_ready",
                "unhealthy_dependencies": unhealthy,
                "dependencies": {
                    name: status.value for name, status in results.items()
                },
            }

        return {
            "status": "ready",
            "dependencies": {
                name: status.value for name, status in results.items()
            },
        }


# --- Demo ---
print("=== Health Check & Self-Healing Demo ===")

checker = HealthChecker("product-service")

# Simulate dependencies
db_healthy = True
cache_healthy = True

def check_database() -> bool:
    return db_healthy

def check_cache() -> bool:
    return cache_healthy

checker.add_dependency("database", check_database)
checker.add_dependency("cache", check_cache)
checker.mark_started()

# All healthy
print("  State 1 (all healthy):")
print(f"    Liveness:  {checker.liveness()}")
print(f"    Readiness: {checker.readiness()}")

# Database fails
db_healthy = False
print("\\n  State 2 (database down):")
print(f"    Readiness: {checker.readiness()}")

# Both fail
cache_healthy = False
print("\\n  State 3 (database + cache down):")
print(f"    Readiness: {checker.readiness()}")
```

---

## 14.11 — Real-World Case Studies

### 14.11.1 — Netflix: Chaos Monkey and Hystrix

Netflix operates one of the most resilient systems in the world, serving over 200 million subscribers across 190+ countries.

| Practice | Implementation |
|---|---|
| **Chaos Monkey** | Randomly kills instances in production during business hours |
| **Hystrix** | Circuit breaker library (now deprecated in favor of Resilience4j) |
| **Zuul** | Edge gateway with per-route circuit breakers |
| **Fallback culture** | Every API call must have a fallback; code reviews enforce this |
| **Conformance testing** | Chaos Kong tests simulate entire region failures quarterly |

Netflix's key insight was cultural: they made resilience a **first-class concern** in every team's sprint. Engineers are expected to define fallbacks for every external call, and chaos experiments validate those fallbacks in production.

### 14.11.2 — Amazon: Load Shedding During Prime Day

During Prime Day 2015, Amazon experienced a massive traffic spike that overwhelmed their recommendation service. Rather than letting the entire checkout flow fail, they **shed the recommendation load** — serving a default "popular items" list instead of personalized recommendations. This preserved the core checkout flow while degrading a non-critical feature.

| Strategy | What They Did |
|---|---|
| **Priority queuing** | Checkout traffic prioritized over browsing |
| **Default fallbacks** | Recommendations fell back to "popular items" |
| **Aggressive timeouts** | 100ms timeout on non-critical calls |
| **Pre-warming** | Capacity pre-scaled for predictable traffic spikes |

### 14.11.3 — Google SRE and Error Budgets

Google's Site Reliability Engineering (SRE) team introduced the concept of **error budgets** — a quantitative framework for balancing reliability against feature velocity.

```
  ERROR BUDGET CALCULATION
  ═══════════════════════

  SLO: 99.9% availability (allows 0.1% downtime)

  Monthly error budget:
  ─────────────────────
  Total minutes in month:  43,200
  Allowed downtime:        43,200 × 0.001 = 43.2 minutes

  ┌──────────────────────────────────────────────┐
  │  Error budget remaining: 43.2 minutes        │
  │                                              │
  │  ████████████████████████░░░░░░░░░░░░░░░░░░ │
  │  Used: 18 min     │  Remaining: 25.2 min    │
  │                                              │
  │  Rule: If budget is >50% remaining,          │
  │        teams can deploy freely.              │
  │        If <50%, feature freeze until         │
  │        reliability improves.                 │
  └──────────────────────────────────────────────┘
```

| Google SRE Practice | Description |
|---|---|
| **SLO-based reliability** | Define what "good enough" means numerically |
| **Error budgets** | Allow measured risk-taking; cap unreliability |
| **Blameless post-mortems** | Focus on systemic fixes, not individual blame |
| **Toil reduction** | Automate repetitive operational tasks |
| **Capacity planning** | Proactive scaling based on traffic forecasts |

---

## 14.12 — Anti-Patterns and Pitfalls

```
  COMMON RESILIENCE MISTAKES
  ═══════════════════════════

  ✗ No timeouts on any calls
    → A slow downstream service ties up all threads. Always set timeouts.

  ✗ Retrying non-idempotent operations
    → Double-charging customers, creating duplicate orders.
    → Only retry idempotent operations or use idempotency keys.

  ✗ Retrying on every error
    → Don't retry 400 Bad Request or 403 Forbidden — those are
      permanent client errors. Only retry transient failures (5xx, timeouts).

  ✗ Circuit breaker with no fallback
    → The circuit breaker stops calls, but what does the user see?
      Always implement a fallback for when the circuit is open.

  ✗ Catching all exceptions and swallowing them
    → Failures become invisible. Log errors, emit metrics, raise alerts.

  ✗ Shared thread pool across all services
    → One slow service exhausts all threads. Use bulkheads.

  ✗ Aggressive retry without backoff
    → Creates a thundering herd. Always use exponential backoff + jitter.

  ✗ No health checks
    → Load balancers route traffic to dead instances. Always implement
      liveness and readiness probes.

  ✗ "It works on my machine" resilience testing
    → Testing resilience only in production is too late. Use chaos
      engineering in staging environments first.

  ✗ Ignoring cascading failures
    → Service A depends on B, B on C, C on D. A failure in D cascades
      back to A. Design for end-to-end resilience, not per-service.
```

| Anti-Pattern | Consequence | Fix |
|---|---|---|
| No timeouts | Thread starvation, cascading failure | Set connection, read, and total timeouts |
| Unlimited retries | Amplifies load on struggling service | Cap retries, use exponential backoff |
| Shared thread pool | One bad service kills all services | Bulkhead pattern with isolated pools |
| Swallowed exceptions | Silent failures, no alerting | Log, metric, and alert on all errors |
| No circuit breaker | Repeated calls to dead service | Circuit breaker with fallback |
| Retry storm | Overloads recovery, extends outage | Jitter + max retries + circuit breaker |
| No chaos testing | Failures discovered only in production | Regular chaos engineering experiments |
| Hardcoded timeouts | Timeout too short or too long per context | Cascading deadline propagation |

---

## 14.13 — Architecture Decision Matrix

```
  DECISION: CHOOSING RESILIENCE STRATEGIES

  ┌───────────────────────┬───────────────────────────────────────────────────┐
  │  Scenario             │  Recommended Patterns                             │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Calling an external  │  Circuit Breaker + Retry with Backoff + Fallback │
  │  API (e.g., Stripe)   │  + Timeout                                       │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Database connection  │  Connection Pool + Timeout + Retry (for          │
  │                       │  transient network errors) + Read replicas       │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Microservice call    │  Circuit Breaker + Bulkhead + Timeout +          │
  │  (internal)           │  Health Checks + Fallback                        │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  High-traffic API     │  Rate Limiting + Load Shedding + Auto-scaling +  │
  │                       │  Cache fallback                                   │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Real-time data       │  Timeout + Circuit Breaker + Stale-data          │
  │  pipeline             │  fallback + Dead letter queue                    │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Payment processing   │  Idempotency keys + Circuit Breaker +           │
  │                       │  Retry (only on timeout) + Manual queue fallback │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Startup / MVP        │  Timeouts + Basic retries + Health checks.       │
  │                       │  Add circuit breakers when you have 3+ deps.     │
  ├───────────────────────┼───────────────────────────────────────────────────┤
  │  Enterprise / large   │  All patterns + Chaos Engineering + Error        │
  │  scale                │  budgets + Load shedding + Bulkheads + SRE       │
  └───────────────────────┴───────────────────────────────────────────────────┘
```

### Pattern Complexity vs Value Matrix

```
  HIGH VALUE │
             │  ● Timeouts        ● Circuit Breaker
             │
             │  ● Retry + Backoff ● Health Checks
             │
             │  ● Fallback        ● Bulkhead
             │
             │  ● Rate Limiting   ● Load Shedding
             │
             │                    ● Chaos Engineering
             │  ● Idempotency     ● Error Budgets
  LOW VALUE  │
             └──────────────────────────────────────
              LOW COMPLEXITY              HIGH COMPLEXITY

  Start from the top-left and work your way right and down.
```

---

## 14.14 — Practice Exercises and Summary

### Exercise 1: Implement a Resilient Service Client

Build a `ResilientClient` class that wraps calls to an external service with the following patterns:

1. **Circuit breaker** with configurable failure threshold (5 failures → open, 30s timeout)
2. **Retry** with exponential backoff + jitter (max 3 retries)
3. **Timeout** (5-second deadline per call)
4. **Fallback** to a cache when the circuit is open

Write unit tests that verify:
- Calls succeed normally when the service is healthy
- After 5 consecutive failures, the circuit opens and calls are rejected
- After 30 seconds, a probe call is made (half-open state)
- The fallback cache is used when the circuit is open

### Exercise 2: Load Shedding Under Pressure

Implement a load shedder for an e-commerce API that handles three priority levels:
- `CRITICAL`: Payment, authentication (never shed)
- `NORMAL`: Search, product listing (shed at 80% capacity)
- `LOW`: Recommendations, reviews (shed at 60% capacity)

Simulate 100 concurrent requests at 120% capacity and verify:
- All CRITICAL requests are served
- NORMAL requests are served proportionally
- LOW requests are shed first
- The system responds within 200ms for admitted requests

### Exercise 3: Chaos Engineering Experiment

Design a chaos engineering experiment for a microservices system with the following services:

```
API Gateway → Auth Service → User Service → PostgreSQL
                   │
                   └→ Notification Service → Email Provider
```

Define:
1. The steady-state hypothesis (what "normal" looks like)
2. Three fault injection scenarios (one per failure mode)
3. Success criteria for each scenario
4. The expected system behavior under each fault

---

### Key Takeaways

| Concept | Summary |
|---|---|
| **Resilience engineering** | Designing systems that withstand, adapt to, and recover from failures |
| **Graceful degradation** | Reduce functionality rather than failing completely |
| **Circuit breaker** | Trip open when failures exceed a threshold; protect downstream services |
| **Retry with backoff** | Retry transient failures with increasing delays and jitter |
| **Bulkhead** | Isolate resources per service so one failure cannot starve others |
| **Timeouts** | Set deadlines on every call; cascade them through the call chain |
| **Fallback** | Provide alternative responses when primary calls fail |
| **Rate limiting** | Protect services from overload by controlling request rates |
| **Load shedding** | Deliberately drop low-priority requests under extreme load |
| **Chaos engineering** | Inject failures to discover weaknesses before production outages |
| **Health checks** | Liveness and readiness probes enable automatic detection and recovery |
| **Error budgets** | Quantitative framework for balancing reliability and feature velocity |

### The Resilience Hierarchy

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  FOUNDATION (implement first):                           │
  │  ✓ Timeouts on every external call                       │
  │  ✓ Health checks (liveness + readiness)                  │
  │  ✓ Structured error handling (no swallowed exceptions)   │
  │                                                          │
  │  CORE (implement for critical paths):                    │
  │  ✓ Circuit breaker on downstream dependencies            │
  │  ✓ Retry with exponential backoff + jitter               │
  │  ✓ Fallback strategies for every external call           │
  │                                                          │
  │  ADVANCED (implement as scale grows):                    │
  │  ✓ Bulkhead isolation for shared resource pools          │
  │  ✓ Rate limiting and load shedding                       │
  │  ✓ Cascading deadline propagation                        │
  │                                                          │
  │  MATURITY (implement for large-scale systems):           │
  │  ✓ Chaos engineering in staging and production           │
  │  ✓ Error budgets and SLO-based reliability               │
  │  ✓ Game Day exercises and blameless post-mortems         │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 15 — Clean Architecture](chapter-15-clean-architecture.md) → Organizing code for maintainability, testability, and independence from frameworks.*
