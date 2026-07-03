# Chapter 12: Observability — Logs, Metrics, and Traces

> *"If you can't measure it, you can't manage it. If you can't trace it, you can't debug it."*

---

## 12.1 — What Is Observability?

Observability is the ability to understand the internal state of a system by examining its external outputs. Unlike monitoring (which tells you *what* is broken), observability tells you *why* it's broken and *how* it got there.

```
              MONITORING vs OBSERVABILITY

  MONITORING (known unknowns):
  ┌──────────────────────────────────────────────┐
  │  "Is the CPU above 90%?"                    │
  │  "Is the error rate above 1%?"              │
  │  "Is the disk full?"                         │
  │                                              │
  │  Pre-defined alerts on known metrics         │
  │  Answers: "Is something wrong?"              │
  └──────────────────────────────────────────────┘

  OBSERVABILITY (unknown unknowns):
  ┌──────────────────────────────────────────────┐
  │  "Why is the checkout flow slow for users    │
  │   in Germany but not in the US?"             │
  │  "What's causing intermittent 503s only     │
  │   when the payment service is under load?"   │
  │                                              │
  │  Explore arbitrary questions about state     │
  │  Answers: "Why is something wrong?"          │
  └──────────────────────────────────────────────┘
```

### The Three Pillars

```
  THE THREE PILLARS OF OBSERVABILITY
  ═══════════════════════════════════

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │   LOGS   │  │  METRICS │  │  TRACES  │
  │          │  │          │  │          │
  │ What     │  │ How much │  │ Where    │
  │ happened │  │ / how    │  │ did the  │
  │          │  │ fast     │  │ request  │
  │Event data│  │ Numeric  │  │ go?      │
  │          │  │ time     │  │          │
  │          │  │ series   │  │ Request  │
  │          │  │          │  │ flow map │
  └──────────┘  └──────────┘  └──────────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
               ┌──────▼──────┐
               │ CORRELATION │
               │  Link all   │
               │  three to   │
               │  understand │
               └─────────────┘
```

| Pillar | Data Type | Primary Use | Example |
|---|---|---|---|
| **Logs** | Text/structured events | Debugging specific events | `ERROR: Payment failed for order #1234` |
| **Metrics** | Numeric time series | Aggregated trends & alerts | `request_latency_p99: 245ms` |
| **Traces** | Request flow graph | Understanding request paths | `GET /checkout → auth → payment → respond` |

---

## 12.2 — Structured Logging

Structured logs replace unstructured text with machine-parseable key-value pairs.

```
  UNSTRUCTURED LOG (BAD):
  ──────────────────────
  2026-07-02 10:15:23 ERROR: Payment failed for order 1234, user 5678,
  amount $99.99, reason: card declined, stripe_id: ch_xxx

  STRUCTURED LOG (GOOD):
  ──────────────────────
  {
    "timestamp": "2026-07-02T10:15:23Z",
    "level": "ERROR",
    "message": "Payment failed",
    "service": "payment-service",
    "order_id": "1234",
    "user_id": "5678",
    "amount": 99.99,
    "currency": "USD",
    "reason": "card_declined",
    "stripe_id": "ch_xxx",
    "trace_id": "abc-123-def-456",
    "span_id": "span-789"
  }
```

### Why Structured Logs Matter

| Aspect | Unstructured | Structured |
|---|---|---|
| **Searchability** | grep only (slow, error-prone) | Exact field queries |
| **Aggregation** | Parse required | Direct field aggregation |
| **Alerting** | Pattern matching on text | Field-based conditions |
| **Correlation** | Manual | Automatic via trace_id |
| **Storage** | Bloated text | Efficient columnar storage |

```python
"""
Production-ready structured logging with correlation IDs.
"""
import json
import logging
import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, field
from typing import Any


class StructuredLogger:
    """JSON-structured logger with trace correlation."""

    def __init__(self, service_name: str) -> None:
        self._service = service_name
        self._logger = logging.getLogger(service_name)
        self._logger.setLevel(logging.DEBUG)
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(message)s"))
        self._logger.addHandler(handler)

    def _log(self, level: str, message: str, **kwargs: Any) -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "service": self._service,
            "message": message,
            **kwargs,
        }
        log_func = getattr(self._logger, level.lower(), self._logger.info)
        log_func(json.dumps(entry, default=str))

    def info(self, message: str, **kwargs: Any) -> None:
        self._log("INFO", message, **kwargs)

    def warning(self, message: str, **kwargs: Any) -> None:
        self._log("WARNING", message, **kwargs)

    def error(self, message: str, **kwargs: Any) -> None:
        self._log("ERROR", message, **kwargs)

    def debug(self, message: str, **kwargs: Any) -> None:
        self._log("DEBUG", message, **kwargs)


@dataclass
class TraceContext:
    """Distributed tracing context."""
    trace_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    span_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    parent_span_id: str = ""
    operation: str = ""
    start_time: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TracedLogger:
    """Logger that includes trace context in every log entry."""

    def __init__(self, service_name: str) -> None:
        self._logger = StructuredLogger(service_name)
        self._context: TraceContext | None = None

    def set_context(self, context: TraceContext) -> None:
        self._context = context

    def info(self, message: str, **kwargs: Any) -> None:
        extras = {}
        if self._context:
            extras["trace_id"] = self._context.trace_id
            extras["span_id"] = self._context.span_id
            extras["operation"] = self._context.operation
        extras.update(kwargs)
        self._logger.info(message, **extras)

    def error(self, message: str, **kwargs: Any) -> None:
        extras = {}
        if self._context:
            extras["trace_id"] = self._context.trace_id
            extras["span_id"] = self._context.span_id
        extras.update(kwargs)
        self._logger.error(message, **extras)


# --- Demo ---
logger = TracedLogger("payment-service")
ctx = TraceContext(operation="process_payment")
logger.set_context(ctx)

logger.info("Payment processing started", order_id="1234", amount=99.99)
logger.info("Stripe charge initiated", stripe_customer_id="cus_xxx")
logger.error("Payment failed", reason="card_declined", order_id="1234")
```

---

## 12.3 — Metrics: The Four Golden Signals

Google's SRE book defines four golden signals for monitoring:

```
  THE FOUR GOLDEN SIGNALS
  ═══════════════════════

  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ LATENCY  │  │TRAFFIC   │  │  ERRORS  │  │SATURATION│
  │          │  │          │  │          │  │          │
  │ How long │  │ How many │  │ What     │  │ How full │
  │ requests │  │ requests │  │ fraction │  │ is the   │
  │ take     │  │ per      │  │ are      │  │ system?  │
  │          │  │ second   │  │ failing  │  │          │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

| Signal | What to Measure | Alert Threshold Example |
|---|---|---|
| **Latency** | Request duration (p50, p95, p99) | p99 > 500ms |
| **Traffic** | Requests per second, concurrent connections | RPS drops 50% from baseline |
| **Errors** | Error rate (4xx, 5xx), exception count | Error rate > 1% |
| **Saturation** | CPU, memory, disk, connection pool usage | CPU > 80% for 5 min |

### RED and USE Methods

```
  RED METHOD (for services):
  ─────────────────────────
  R - Rate:     requests per second
  E - Errors:   errors per second
  D - Duration: latency distribution

  USE METHOD (for resources):
  ─────────────────────────
  U - Utilization: % of resource in use
  S - Saturation:  queue depth / waiting
  E - Errors:      error events on resource
```

```python
"""
Metrics collection with Prometheus-style counters, gauges, and histograms.
"""
import time
import threading
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any


class Counter:
    """Monotonically increasing counter (e.g., total requests)."""

    def __init__(self, name: str, description: str = "") -> None:
        self.name = name
        self.description = description
        self._value = 0.0
        self._labels: dict[str, float] = {}
        self._lock = threading.Lock()

    def inc(self, amount: float = 1.0, **labels: str) -> None:
        key = self._label_key(labels)
        with self._lock:
            self._labels[key] = self._labels.get(key, 0.0) + amount
            self._value += amount

    def get(self, **labels: str) -> float:
        key = self._label_key(labels)
        return self._labels.get(key, 0.0)

    @property
    def value(self) -> float:
        return self._value

    def _label_key(self, labels: dict[str, str]) -> str:
        return "|".join(f"{k}={v}" for k, v in sorted(labels.items()))


class Gauge:
    """Value that can go up and down (e.g., current connections)."""

    def __init__(self, name: str, description: str = "") -> None:
        self.name = name
        self.description = description
        self._value = 0.0

    def set(self, value: float) -> None:
        self._value = value

    def inc(self, amount: float = 1.0) -> None:
        self._value += amount

    def dec(self, amount: float = 1.0) -> None:
        self._value -= amount

    @property
    def value(self) -> float:
        return self._value


class Histogram:
    """Distribution of values (e.g., request latency)."""

    def __init__(self, name: str, buckets: list[float] | None = None) -> None:
        self.name = name
        self._buckets = buckets or [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
        self._bucket_counts: dict[float, int] = {b: 0 for b in self._buckets}
        self._count = 0
        self._total = 0.0
        self._lock = threading.Lock()

    def observe(self, value: float) -> None:
        with self._lock:
            self._count += 1
            self._total += value
            for bucket in self._buckets:
                if value <= bucket:
                    self._bucket_counts[bucket] += 1

    @property
    def count(self) -> int:
        return self._count

    @property
    def mean(self) -> float:
        return self._total / self._count if self._count > 0 else 0.0

    def percentile(self, p: float) -> float:
        """Estimate the p-th percentile from bucket counts."""
        target = int(self._count * p)
        cumulative = 0
        for bucket in self._buckets:
            cumulative += self._bucket_counts[bucket]
            if cumulative >= target:
                return bucket
        return self._buckets[-1]


class MetricsCollector:
    """Centralized metrics collection."""

    def __init__(self) -> None:
        self._counters: dict[str, Counter] = {}
        self._gauges: dict[str, Gauge] = {}
        self._histograms: dict[str, Histogram] = {}

    def counter(self, name: str, description: str = "") -> Counter:
        if name not in self._counters:
            self._counters[name] = Counter(name, description)
        return self._counters[name]

    def gauge(self, name: str, description: str = "") -> Gauge:
        if name not in self._gauges:
            self._gauges[name] = Gauge(name, description)
        return self._gauges[name]

    def histogram(self, name: str, buckets: list[float] | None = None) -> Histogram:
        if name not in self._histograms:
            self._histograms[name] = Histogram(name, buckets)
        return self._histograms[name]

    def render_prometheus(self) -> str:
        """Render all metrics in Prometheus exposition format."""
        lines = []
        for name, counter in self._counters.items():
            lines.append(f"# HELP {name} {counter.description}")
            lines.append(f"# TYPE {name} counter")
            for label_key, value in counter._labels.items():
                labels = label_key if label_key else ""
                lines.append(f'{name}{{{labels}}} {value}')

        for name, gauge in self._gauges.items():
            lines.append(f"# HELP {name} {gauge.description}")
            lines.append(f"# TYPE {name} gauge")
            lines.append(f"{name} {gauge.value}")

        for name, hist in self._histograms.items():
            lines.append(f"# TYPE {name} histogram")
            for bucket, count in hist._bucket_counts.items():
                lines.append(f'{name}_bucket{{le="{bucket}"}} {count}')
            lines.append(f'{name}_count {hist.count}')
            lines.append(f'{name}_sum {hist._total}')

        return "\n".join(lines)


# --- Demo with Four Golden Signals ---
metrics = MetricsCollector()

# Simulate requests
http_requests = metrics.counter("http_requests_total", "Total HTTP requests")
http_errors = metrics.counter("http_errors_total", "Total HTTP errors")
request_duration = metrics.histogram("http_request_duration_seconds", [0.01, 0.05, 0.1, 0.25, 0.5, 1.0])
active_connections = metrics.gauge("active_connections", "Current active connections")

import random

for _ in range(100):
    method = random.choice(["GET", "POST", "PUT"])
    status = random.choice(["200", "200", "200", "200", "200", "200", "200", "200", "500", "503"])
    latency = random.expovariate(10)  # mean 0.1s

    http_requests.inc(method=method, status=status)
    request_duration.observe(latency)
    active_connections.inc()
    if status in ("500", "503"):
        http_errors.inc(method=method, status=status)

# Print metrics summary
print("=== Metrics Summary ===")
print(f"Total requests: {http_requests.value}")
print(f"Total errors: {http_errors.value}")
print(f"Error rate: {http_errors.value / http_requests.value * 100:.1f}%")
print(f"Mean latency: {request_duration.mean * 1000:.1f}ms")
print(f"p50 latency: {request_duration.percentile(0.5) * 1000:.1f}ms")
print(f"p95 latency: {request_duration.percentile(0.95) * 1000:.1f}ms")
print(f"p99 latency: {request_duration.percentile(0.99) * 1000:.1f}ms")
print(f"Active connections: {active_connections.value}")
```

---

## 12.4 — Prometheus and Grafana

```
  PROMETHEUS + GRAFANA STACK
  ═══════════════════════════

  ┌──────────┐     ┌──────────────┐     ┌──────────────┐
  │ Services │────►│  Prometheus  │────►│   Grafana    │
  │ (metrics │     │  (scrape &   │     │  (dashboards │
  │  export) │     │   store)     │     │   & alerts)  │
  └──────────┘     └──────────────┘     └──────────────┘
       │                   │
       │            ┌──────▼──────┐
       │            │ Alertmanager│
       │            │ (PagerDuty, │
       │            │  Slack)     │
       │            └─────────────┘
       │
  /metrics endpoint on each service
```

### Prometheus Query Examples (PromQL)

```promql
# Request rate (per second, by status code)
rate(http_requests_total[5m])

# Error rate
rate(http_errors_total[5m]) / rate(http_requests_total[5m])

# 99th percentile latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Apdex score (satisfaction ratio)
(
  rate(http_request_duration_seconds_bucket{le="0.5"}[5m])
  + rate(http_request_duration_seconds_bucket{le="2"}[5m])
) / 2 / rate(http_request_duration_seconds_total[5m])
```

### Grafana Dashboard Panels

```
  GRAFANA DASHBOARD LAYOUT
  ═════════════════════════

  ┌─────────────────┬─────────────────┬─────────────────┐
  │   Request Rate  │  Error Rate     │   P99 Latency   │
  │   ┌─────────┐   │  ┌─────────┐    │   ┌─────────┐   │
  │   │ ~~~~~~~~│   │  │    ~~~  │    │   │ ~~~~~~~~│   │
  │   │ ~~~~~~~~│   │  │    ~~~  │    │   │ ~~~~~~~~│   │
  │   └─────────┘   │  └─────────┘    │   └─────────┘   │
  │   1,234 req/s   │  0.3%           │   245ms         │
  ├─────────────────┼─────────────────┼─────────────────┤
  │   CPU Usage     │  Memory Usage   │  Active Conns   │
  │   ┌─────────┐   │  ┌─────────┐    │   ┌─────────┐   │
  │   │ ██████  │   │  │ █████   │    │   │ ~~~~~~~~│   │
  │   │ ██████  │   │  │ █████   │    │   │ ~~~~~~~~│   │
  │   └─────────┘   │  └─────────┘    │   └─────────┘   │
  │   67%           │  4.2 GB         │   892           │
  └─────────────────┴─────────────────┴─────────────────┘
```

---

## 12.5 — Distributed Tracing with OpenTelemetry

OpenTelemetry is the standard for distributed tracing, providing vendor-neutral instrumentation.

```
  DISTRIBUTED TRACING FLOW
  ════════════════════════

  Trace ID: abc-123-def-456

  ┌─────────────────────────────────────────────────────────┐
  │ GET /checkout                                           │
  │ [Gateway]           [Order Svc]        [Payment Svc]   │
  │ ┌──────────┐        ┌──────────┐       ┌──────────┐    │
  │ │ validate │──2ms──►│ create   │──5ms──►│ charge   │    │
  │ │ token    │        │ order    │       │ card     │    │
  │ └──────────┘        └──────────┘       └──────────┘    │
  │      15ms                120ms              800ms       │
  │                                                         │
  │ Total: 935ms                                            │
  │ Bottleneck: Payment Service (800ms = 85% of total)     │
  └─────────────────────────────────────────────────────────┘
```

### OpenTelemetry Concepts

| Concept | Description |
|---|---|
| **Trace** | End-to-end request path across services |
| **Span** | A single unit of work within a trace |
| **Span Context** | Propagated across service boundaries (trace ID, span ID) |
| **Exporter** | Sends spans to a backend (Jaeger, Zipkin, OTLP) |
| **Propagator** | Injects/extracts span context from HTTP headers |

```python
"""
Distributed tracing with OpenTelemetry (simplified implementation).
Demonstrates trace propagation across service boundaries.
"""
import json
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class Span:
    """A single unit of work in a distributed trace."""
    trace_id: str
    span_id: str
    parent_span_id: str
    operation_name: str
    service_name: str
    start_time: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    end_time: str = ""
    duration_ms: float = 0.0
    status: str = "OK"
    attributes: dict[str, Any] = field(default_factory=dict)
    events: list[dict[str, Any]] = field(default_factory=list)

    def finish(self) -> None:
        self.end_time = datetime.now(timezone.utc).isoformat()


class Tracer:
    """Simplified distributed tracer."""

    def __init__(self, service_name: str) -> None:
        self.service_name = service_name
        self._spans: list[Span] = []
        self._current_trace_id: str | None = None
        self._current_span_id: str | None = None

    def start_trace(self, operation: str) -> Span:
        """Start a new trace."""
        trace_id = str(uuid.uuid4())
        span_id = str(uuid.uuid4())[:8]
        span = Span(
            trace_id=trace_id,
            span_id=span_id,
            parent_span_id="",
            operation_name=operation,
            service_name=self.service_name,
        )
        self._current_trace_id = trace_id
        self._current_span_id = span_id
        self._spans.append(span)
        return span

    def start_span(self, operation: str) -> Span:
        """Start a child span."""
        span = Span(
            trace_id=self._current_trace_id or str(uuid.uuid4()),
            span_id=str(uuid.uuid4())[:8],
            parent_span_id=self._current_span_id or "",
            operation_name=operation,
            service_name=self.service_name,
        )
        self._current_span_id = span.span_id
        self._spans.append(span)
        return span

    def inject_headers(self, span: Span) -> dict[str, str]:
        """Inject trace context into HTTP headers for propagation."""
        return {
            "traceparent": f"00-{span.trace_id}-{span.span_id}-01",
            "tracestate": f"service={self.service_name}",
        }

    def extract_headers(self, headers: dict[str, str]) -> tuple[str, str]:
        """Extract trace context from incoming HTTP headers."""
        traceparent = headers.get("traceparent", "")
        if traceparent:
            parts = traceparent.split("-")
            if len(parts) >= 3:
                return parts[1], parts[2]  # trace_id, parent_span_id
        return str(uuid.uuid4()), ""

    def get_trace(self, trace_id: str) -> list[Span]:
        return [s for s in self._spans if s.trace_id == trace_id]

    def render_trace(self, trace_id: str) -> str:
        """Render a trace as a waterfall diagram."""
        spans = self.get_trace(trace_id)
        if not spans:
            return "No trace found"

        lines = [f"\n  Trace: {trace_id}", "  " + "=" * 60]

        for span in spans:
            depth = "    " if span.parent_span_id else "  "
            duration = f"{span.duration_ms:.1f}ms" if span.duration_ms else "..."
            lines.append(
                f"  {depth}├─ {span.operation_name} "
                f"({span.service_name}) [{duration}]"
            )

        return "\n".join(lines)


# --- Simulate multi-service trace ---
gateway_tracer = Tracer("api-gateway")
order_tracer = Tracer("order-service")
payment_tracer = Tracer("payment-service")

# Gateway receives request
span = gateway_tracer.start_trace("GET /checkout")
time.sleep(0.01)
span.duration_ms = 15.0
span.finish()

# Gateway calls Order Service (propagate trace)
headers = gateway_tracer.inject_headers(span)

# Order Service receives request (extract trace)
trace_id, parent_id = order_tracer.extract_headers(headers)
order_tracer._current_trace_id = trace_id
order_span = order_tracer.start_span("create_order")
time.sleep(0.02)
order_span.duration_ms = 120.0
order_span.finish()

# Order Service calls Payment Service
headers = order_tracer.inject_headers(order_span)
trace_id, parent_id = payment_tracer.extract_headers(headers)
payment_tracer._current_trace_id = trace_id
payment_span = payment_tracer.start_span("charge_card")
time.sleep(0.03)
payment_span.duration_ms = 800.0
payment_span.finish()

# Render the complete trace
print("\n=== Distributed Trace ===")
for tracer in [gateway_tracer, order_tracer, payment_tracer]:
    print(tracer.render_trace(trace_id))
```

---

## 12.6 — Log Aggregation Architecture

```
  LOG AGGREGATION PIPELINE
  ═════════════════════════

  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │Service A│  │Service B│  │Service C│
  │ (stdout)│  │ (stdout)│  │ (stdout)│
  └────┬────┘  └────┬────┘  └────┬────┘
       │            │            │
       ▼            ▼            ▼
  ┌─────────────────────────────────────┐
  │          Fluent Bit / Filebeat      │
  │        (log collection agent)       │
  └─────────────────┬───────────────────┘
                    │
                    ▼
  ┌─────────────────────────────────────┐
  │          Kafka / Kinesis            │
  │        (log streaming buffer)       │
  └─────────────────┬───────────────────┘
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │Elastic-  │ │ S3 / GCS │ │ClickHouse│
  │search    │ │(cold      │ │(analytics│
  │(search)  │ │ storage)  │ │ queries) │
  └──────────┘ └──────────┘ └──────────┘
       │
       ▼
  ┌──────────┐
  │ Kibana / │
  │ Grafana  │
  └──────────┘
```

---

## 12.7 — Alerting Best Practices

```
  ALERTING HIERARCHY
  ═══════════════════

  ┌──────────────────────────────────────────────────────┐
  │  P1: PAGE (wake someone up)                          │
  │  • Service completely down                           │
  │  • Data loss or corruption                           │
  │  • Revenue-impacting outage                          │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │  P2: TICKET (investigate during business hours)      │
  │  • Elevated error rate (> 5%)                        │
  │  • Latency degradation (p99 > 2x baseline)          │
  │  • Disk usage > 85%                                  │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │  P3: LOG (review in next sprint)                     │
  │  • Unusual traffic patterns                          │
  │  • Slow queries approaching threshold                │
  │  • Certificate expiring in 30 days                   │
  └──────────────────────────────────────────────────────┘
```

| Best Practice | Description |
|---|---|
| **Alert on symptoms, not causes** | Alert on high latency, not on high CPU |
| **Include runbooks** | Every alert should link to a resolution guide |
| **Avoid alert fatigue** | Only alert on actionable items |
| **Use multi-window multi-burn-rate** | Combine short and long windows for reliability |
| **Escalation policies** | Define who gets paged and when |

---

## 12.8 — Real-World Case Studies

### 12.8.1 — Google's Monarch

Google's Monarch monitoring system:
- Ingests **billions** of time series points per second
- Stores **trillions** of data points
- Powers all of Google's internal monitoring (Search, Gmail, YouTube)

### 12.8.2 — Uber's Observability Stack

Uber uses a custom observability platform:
- **M3** for metrics (open-source, handles 1M+ metrics/second)
- **Jaeger** for distributed tracing (also open-sourced by Uber)
- **Structured logging** via a centralized logging pipeline

### 12.8.3 — Grafana Ecosystem

| Tool | Purpose |
|---|---|
| **Grafana** | Dashboard visualization |
| **Prometheus** | Metrics collection and storage |
| **Loki** | Log aggregation (like Prometheus for logs) |
| **Tempo** | Distributed tracing backend |
| **Mimir** | Long-term Prometheus storage |
| **Pyroscope** | Continuous profiling |

---

## 12.9 — Anti-Patterns and Pitfalls

```
  COMMON OBSERVABILITY MISTAKES
  ══════════════════════════════

  ✗ Logging everything at INFO level
    → Log levels lose meaning; use DEBUG for verbose output

  ✗ No correlation IDs across services
    → Impossible to trace requests across microservices

  ✗ Alerting on every metric spike
    → Alert fatigue makes real issues invisible

  ✗ Not testing observability in staging
    → You discover monitoring gaps only in production

  ✗ Storing all logs forever
    → Unbounded storage costs; set retention policies

  ✗ Ignoring the golden signals
    → Focus on latency, traffic, errors, and saturation
```

---

## 12.10 — Architecture Decision Matrix

```
  DECISION: CHOOSING AN OBSERVABILITY STACK

  ┌──────────────────────┬────────────────────────────────────────────┐
  │  Scenario            │  Recommended Stack                         │
  ├──────────────────────┼────────────────────────────────────────────┤
  │  Startup / small     │  Grafana Cloud (managed)                   │
  │  team                │                                            │
  │  Self-hosted         │  Prometheus + Grafana + Loki + Tempo      │
  │  AWS-native          │  CloudWatch + X-Ray + OpenSearch           │
  │  GCP-native          │  Cloud Monitoring + Cloud Trace + Logs     │
  │  High-scale          │  M3 + Jaeger + ELK                        │
  │  OpenTelemetry first │  OTel Collector + any backend              │
  └──────────────────────┴────────────────────────────────────────────┘
```

---

## 12.11 — Practice Exercises

### Exercise 1: Structured Logging

Convert the following unstructured log into structured JSON:
```
2026-07-02 10:15:23 ERROR user 5678 failed to checkout: payment declined for order 1234 amount $99.99
```

### Exercise 2: SLI/SLO Definition

For an e-commerce API, define:
1. Three SLIs (Service Level Indicators)
2. An SLO (Service Level Objective) for each
3. An error budget calculation

### Exercise 3: Distributed Trace Analysis

Given a trace with the following spans:
- Gateway: 15ms
- Auth Service: 5ms
- Order Service: 120ms (DB query: 110ms)
- Payment Service: 800ms

Identify the bottleneck and propose two optimization strategies.

---

## 12.12 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **Observability** | Understanding internal state from external outputs |
| **Three pillars** | Logs (what happened), Metrics (how much/fast), Traces (where it went) |
| **Structured logging** | JSON logs with key-value fields for searchability |
| **Golden signals** | Latency, Traffic, Errors, Saturation |
| **RED/USE** | Service-centric vs resource-centric metric frameworks |
| **Prometheus** | Pull-based metrics collection with PromQL |
| **Grafana** | Dashboard visualization for metrics, logs, and traces |
| **OpenTelemetry** | Vendor-neutral standard for traces, metrics, and logs |
| **Alerting** | Alert on symptoms, include runbooks, avoid fatigue |

### When to Invest in Observability

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  INVEST IN OBSERVABILITY WHEN:                           │
  │  ✓ Multiple services (microservices architecture)        │
  │  ✓ Production incidents are hard to diagnose             │
  │  ✓ You need to understand user behavior                  │
  │  ✓ SLOs and SLAs are being defined                       │
  │                                                          │
  │  START WITH:                                             │
  │  1. Structured logging with correlation IDs              │
  │  2. Golden signal metrics (latency, errors, traffic)     │
  │  3. Basic distributed tracing on critical paths          │
  │  4. Alerting on symptoms, not causes                     │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 13 — Distributed Transactions](chapter-13-distributed-transactions.md) → Keeping data consistent across services.*
