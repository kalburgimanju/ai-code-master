# Chapter 15: Clean Architecture — Separate Business Logic from Tools

> *"The center of your application is not the database. Nor is it one or more of the frameworks you may be using. The center of your application is the use cases of your application."*
> — Robert C. Martin, *Clean Architecture*

---

Every application reaches a moment when the tangled web of database queries, framework dependencies, and UI logic becomes a liability rather than an asset. Refactoring becomes painful. Testing requires the entire stack. Swapping a library means rewriting half the codebase. Clean Architecture is the answer to that moment — and ideally, you adopt it before the moment arrives.

This chapter distills the principles, patterns, and practical implementations that let you write software where business logic lives forever, immune to the churn of tools, frameworks, and infrastructure.

---

## 15.1 — What Is Clean Architecture?

Clean Architecture is a software design philosophy introduced by Robert C. Martin (Uncle Bob) that organizes code into **concentric layers**, where dependencies always point **inward** toward the core domain. The outer layers can change without disturbing the inner layers; the inner layers know nothing about the outer layers.

### The Concentric Circles

```
+------------------------------------------------------------------+
|                  Frameworks & Drivers                             |
|   +------------------------------------------------------------+ |
|   |              Interface Adapters                              | |
|   |   +------------------------------------------------------+ | |
|   |   |           Use Cases (Application)                      | | |
|   |   |   +------------------------------------------------+ | | |
|   |   |   |     Entities (Enterprise Business Rules)         | | | |
|   |   |   |                                                  | | | |
|   |   |   |   Dependencies point INWARD  <--                 | | | |
|   |   |   +------------------------------------------------+ | | |
|   |   +------------------------------------------------------+ | |
|   +------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### The Dependency Rule

The single most important rule in Clean Architecture:

> **Source code dependencies must point only inward.**

Nothing in an inner circle can know anything about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in an inner circle. This includes functions, classes, variables, or any other named software entity.

### Core Principles

| Principle | Description | Benefit |
|---|---|---|
| **Independence from Frameworks** | The architecture does not depend on the existence of some library of feature-laden software | Frameworks are tools, not ways of life |
| **Testable** | Business rules can be tested without the UI, Database, Web server, or any other external element | Fast, reliable test suites |
| **UI Independent** | The UI can change without changing the rest of the system | Swap CLI for Web, Web for Mobile |
| **Database Independent** | Business rules are not bound to the database | Switch from Postgres to MongoDB freely |
| **Independence from External Agencies** | Business rules simply do not know about the outside world | Core logic is pure and predictable |

### Why Clean Architecture Matters

When you conflate business logic with framework code, you get what Uncle Bob calls the **"architecture sink"** — the inevitable state where the cost of change exceeds the value of the software. Clean Architecture inverts this trajectory by making the most important code (your domain) the most protected and easiest to change.

---

## 15.2 — Hexagonal Architecture (Ports and Adapters)

Before Clean Architecture, Alistair Cockburn proposed **Hexagonal Architecture** in 2005, which established the same core philosophy: isolate your business logic from the outside world using **ports and adapters**.

### The Hexagonal Pattern

```
                    +-----------------------+
                    |      Application      |
                    |       Domain          |
                    |                       |
    +------+        |   +---+    +----+     |        +--------+
    |      |--------+-->| P |--->|Use |     +<-------|        |
    | Web  |  Inbound   | o |    |Case|  Inbound     | DB     |
    | UI   |  Adapter   | r |    +----+  Adapter     | Adapter|
    +------+            | t |      |                  +--------+
                        | s |      v                       |
    +------+            +---+  +--------+          +-------+-----+
    |      |--------+--------->|  Core  |<---------|             |
    | CLI  | Inbound           |Domain  |          | Message     |
    |      | Adapter           |        |          | Queue       |
    +------+                    +--------+          | Adapter     |
                                                    +-------------+
```

- **Ports**: Interfaces defined by the application that describe what it needs (inbound) or offers (outbound).
- **Adapters**: Concrete implementations that translate between the port and an external system.

### Inbound vs Outbound Ports

| Port Type | Direction | Purpose | Example |
|---|---|---|---|
| **Inbound (Driving)** | External → Application | Requests that the app handles | HTTP endpoint handler, CLI command |
| **Outbound (Driven)** | Application → External | Services the app needs to call | Database repository, email sender |

### Python Implementation

```python
"""
Ports and Adapters — a minimal e-commerce order system.

Ports are abstract interfaces. Adapters provide concrete implementations.
The domain never knows which adapter it is using.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


# ── Domain Entities ──────────────────────────────────────────────

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


@dataclass(frozen=True)
class Order:
    """An order placed by a customer."""
    order_id: str
    customer_id: str
    items: tuple[OrderItem, ...]
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)

    @property
    def total(self) -> float:
        return sum(item.subtotal for item in self.items)

    def confirm(self) -> Order:
        if self.status != OrderStatus.PENDING:
            raise ValueError(f"Cannot confirm order in status {self.status}")
        return Order(
            order_id=self.order_id,
            customer_id=self.customer_id,
            items=self.items,
            status=OrderStatus.CONFIRMED,
            created_at=self.created_at,
        )


@dataclass(frozen=True)
class OrderItem:
    product_id: str
    quantity: int
    unit_price: float

    @property
    def subtotal(self) -> float:
        return self.quantity * self.unit_price


# ── Inbound Port ─────────────────────────────────────────────────

class PlaceOrderUseCase(ABC):
    """Inbound port: the application exposes this interface to the outside world."""

    @abstractmethod
    def execute(self, command: PlaceOrderCommand) -> Order:
        ...


@dataclass(frozen=True)
class PlaceOrderCommand:
    customer_id: str
    items: list[OrderItem]


# ── Outbound Ports ───────────────────────────────────────────────

class OrderRepository(ABC):
    """Outbound port: the application needs persistence, but not the details."""

    @abstractmethod
    def save(self, order: Order) -> None: ...

    @abstractmethod
    def find_by_id(self, order_id: str) -> Order | None: ...


class PaymentGateway(ABC):
    """Outbound port: the application needs to charge a customer."""

    @abstractmethod
    def charge(self, customer_id: str, amount: float) -> str: ...


class NotificationService(ABC):
    """Outbound port: the application needs to send confirmations."""

    @abstractmethod
    def send_order_confirmation(self, order: Order) -> None: ...
```

---

## 15.3 — The Layers of Clean Architecture

Clean Architecture defines four concentric layers. Each has a specific responsibility and a clear boundary.

### Layer Descriptions

| Layer | Also Known As | Contains | Responsibility |
|---|---|---|---|
| **Entities** | Enterprise Business Rules | Domain models, value objects | Core business logic that is enterprise-wide |
| **Use Cases** | Application Business Rules | Interactors, input/output ports | Orchestrate entities to fulfill application-specific operations |
| **Interface Adapters** | Controllers / Presenters / Gateways | Controllers, presenters, repository impls | Convert data between layers and formats |
| **Frameworks & Drivers** | The Outer Shell | DB, Web framework, UI, external services | Glue code that connects the system to the outside world |

### Dependency Flow

```
Frameworks & Drivers
        |
        | depends on
        v
Interface Adapters
        |
        | depends on
        v
   Use Cases
        |
        | depends on
        v
    Entities
```

**Key insight**: The entities layer depends on *nothing*. The use cases layer depends only on entities. Adapters depend on use cases and entities. Frameworks depend on everything.

```python
"""
Layered structure demonstrating the dependency flow.

Note how each layer imports only from the layer(s) inward.
"""

# ── Layer 1: Entities (innermost) ───────────────────────────────
# No imports from any other layer. Pure domain.

# ── Layer 2: Use Cases ──────────────────────────────────────────
# Imports from entities only.

from entities import Order, OrderItem, OrderStatus

from dataclasses import dataclass


class CreateOrder:
    """Application service that orchestrates domain entities."""

    def __init__(self, order_repo: OrderRepository, payment: PaymentGateway):
        # Dependencies are injected — never created inside the use case
        self._order_repo = order_repo
        self._payment = payment

    def execute(self, command: CreateOrderCommand) -> Order:
        items = tuple(
            OrderItem(p.id, p.qty, p.price) for p in command.products
        )
        order = Order(
            order_id="ORD-001",
            customer_id=command.customer_id,
            items=items,
        )
        self._payment.charge(command.customer_id, order.total)
        confirmed = order.confirm()
        self._order_repo.save(confirmed)
        return confirmed


# ── Layer 3: Interface Adapters ─────────────────────────────────
# Converts between HTTP/CLI formats and use case commands.

# ── Layer 4: Frameworks & Drivers (outermost) ───────────────────
# Flask routes, Django views, CLI entry points.
```

---

## 15.4 — Domain Entities and Value Objects

The heart of Clean Architecture is the **domain model**. A well-crafted domain captures business rules directly in code, making them impossible to violate.

### Rich vs Anemic Domain Models

| Characteristic | Rich Domain Model | Anemic Domain Model |
|---|---|---|
| Behavior location | Inside the entity | In service classes outside the entity |
| Encapsulation | State + behavior together | Data bags with getters/setters |
| Testability | Test business rules directly | Must construct full service stack |
| Discoverability | Behavior visible on the entity | Must search through scattered services |
| Mutation safety | Invariants enforced at creation | Invariants enforced (if at all) far away |

### Value Objects vs Entities

| Aspect | Entity | Value Object |
|---|---|---|
| Identity | Has a unique identifier | Defined by its attributes |
| Equality | Two entities with same data are different | Two value objects with same data are equal |
| Mutability | Can change state over time | Typically immutable |
| Example | `Order(order_id="X")` | `Money(amount=10.00, currency="USD")` |

### Python Dataclass Examples

```python
"""
Domain entities and value objects for an e-commerce system.
Uses frozen dataclasses for immutability where appropriate.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Self


# ── Value Objects ────────────────────────────────────────────────

@dataclass(frozen=True)
class Money:
    """A monetary amount with a currency. Immutable value object."""
    amount: float
    currency: str = "USD"

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("Money amount cannot be negative")
        if len(self.currency) != 3:
            raise ValueError("Currency must be a 3-letter ISO code")

    def add(self, other: Money) -> Money:
        if self.currency != other.currency:
            raise ValueError(f"Cannot add {self.currency} to {other.currency}")
        return Money(self.amount + other.amount, self.currency)

    def multiply(self, factor: int) -> Money:
        return Money(self.amount * factor, self.currency)


@dataclass(frozen=True)
class EmailAddress:
    """An email address value object with validation."""
    value: str

    def __post_init__(self) -> None:
        if "@" not in self.value:
            raise ValueError(f"Invalid email address: {self.value}")

    def domain(self) -> str:
        return self.value.split("@")[1]


@dataclass(frozen=True)
class Address:
    """A physical address value object."""
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "US"


# ── Entities ─────────────────────────────────────────────────────

@dataclass
class Customer:
    """A customer entity with identity and mutable state."""
    customer_id: str
    name: str
    email: EmailAddress
    shipping_address: Address
    created_at: datetime = field(default_factory=datetime.now)
    _is_active: bool = field(default=True, repr=False)

    def deactivate(self) -> None:
        self._is_active = False

    def reactivate(self) -> None:
        self._is_active = True

    @property
    def is_active(self) -> bool:
        return self._is_active


@dataclass
class Product:
    """A product entity."""
    product_id: str
    name: str
    price: Money
    stock_quantity: int = 0

    def is_in_stock(self, quantity: int = 1) -> bool:
        return self.stock_quantity >= quantity

    def reduce_stock(self, quantity: int) -> None:
        if not self.is_in_stock(quantity):
            raise ValueError(
                f"Insufficient stock: requested {quantity}, "
                f"available {self.stock_quantity}"
            )
        self.stock_quantity -= quantity
```

### TypeScript Domain Models

```typescript
/**
 * Domain entities and value objects in TypeScript.
 * Uses branded types for type-safe value objects.
 */

// ── Value Objects ────────────────────────────────────────────────

/** Branded Money type for compile-time safety */
type Money = {
  readonly amount: number;
  readonly currency: string;
} & { readonly __brand: unique symbol };

function createMoney(amount: number, currency: string = "USD"): Money {
  if (amount < 0) throw new Error("Money amount cannot be negative");
  if (currency.length !== 3)
    throw new Error("Currency must be a 3-letter ISO code");
  return { amount, currency, __brand: "Money" as const };
}

function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency)
    throw new Error(`Cannot add ${a.currency} to ${b.currency}`);
  return createMoney(a.amount + b.amount, a.currency);
}

// ── Entities ─────────────────────────────────────────────────────

interface OrderItem {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: Money;
}

interface Order {
  readonly orderId: string;
  readonly customerId: string;
  readonly items: ReadonlyArray<OrderItem>;
  readonly status: "pending" | "confirmed" | "shipped" | "delivered";
  readonly createdAt: Date;
}

/** Pure function — no side effects, no persistence calls */
function orderTotal(order: Order): Money {
  return order.items.reduce(
    (sum, item) =>
      addMoney(sum, createMoney(item.unitPrice.amount * item.quantity, item.unitPrice.currency)),
    createMoney(0)
  );
}

function canShip(order: Order): boolean {
  return order.status === "confirmed";
}
```

---

## 15.5 — Use Cases / Interactors

Use cases (also called **interactors**) contain the application-specific business rules. They orchestrate domain entities to fulfill a single, well-defined operation. Each use case has an input (command) and an output (response).

### Input and Output Ports

```
Inbound Port (Use Case)        Outbound Port (Gateway/Repo)
    +---------+                      +----------+
    |         | -- calls ------------>|          |
    | execute |                      |   save   |
    |         | <-- returns ---------|          |
    +---------+                      +----------+
```

### Python Use Case Implementation

```python
"""
A complete use case: PlaceOrder.
Demonstrates the interaction between entities, repositories, and external services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Protocol


# ── Input / Output Ports ────────────────────────────────────────

@dataclass(frozen=True)
class PlaceOrderInput:
    """What the caller provides."""
    customer_id: str
    product_id: str
    quantity: int


@dataclass(frozen=True)
class PlaceOrderOutput:
    """What the use case returns."""
    order_id: str
    total: float
    status: str


# ── Outbound Port ───────────────────────────────────────────────

class OrderRepository(Protocol):
    """Defines what the use case needs from persistence."""
    def save(self, order: Order) -> None: ...


class ProductCatalog(Protocol):
    """Defines what the use case needs from the product catalog."""
    def get_product(self, product_id: str) -> Product | None: ...


# ── Interactor ──────────────────────────────────────────────────

class PlaceOrderInteractor:
    """Application business rule: orchestrates the PlaceOrder flow."""

    def __init__(
        self,
        order_repo: OrderRepository,
        product_catalog: ProductCatalog,
    ) -> None:
        self._order_repo = order_repo
        self._catalog = product_catalog

    def execute(self, input_data: PlaceOrderInput) -> PlaceOrderOutput:
        """
        Orchestrates the order placement:
        1. Fetch the product
        2. Validate stock
        3. Build the order
        4. Persist
        5. Return the result
        """
        product = self._catalog.get_product(input_data.product_id)
        if product is None:
            raise ValueError(f"Product not found: {input_data.product_id}")

        if not product.is_in_stock(input_data.quantity):
            raise ValueError(f"Product {product.name} is out of stock")

        product.reduce_stock(input_data.quantity)

        item = OrderItem(
            product_id=product.product_id,
            quantity=input_data.quantity,
            unit_price=product.price.amount,
        )
        order = Order(
            order_id="ORD-001",
            customer_id=input_data.customer_id,
            items=(item,),
        )
        confirmed = order.confirm()
        self._order_repo.save(confirmed)

        return PlaceOrderOutput(
            order_id=confirmed.order_id,
            total=confirmed.total,
            status=confirmed.status.value,
        )
```

### TypeScript Use Case Implementation

```typescript
/**
 * PlaceOrder use case in TypeScript.
 * Clean separation between application logic and infrastructure.
 */

// ── Input / Output ──────────────────────────────────────────────

interface PlaceOrderInput {
  customerId: string;
  productId: string;
  quantity: number;
}

interface PlaceOrderOutput {
  orderId: string;
  total: number;
  status: string;
}

// ── Ports (interfaces) ─────────────────────────────────────────

interface OrderRepository {
  save(order: Order): Promise<void>;
}

interface ProductCatalog {
  getProduct(productId: string): Promise<Product | null>;
}

// ── Interactor ─────────────────────────────────────────────────

class PlaceOrderInteractor {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly catalog: ProductCatalog
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const product = await this.catalog.getProduct(input.productId);
    if (!product) {
      throw new Error(`Product not found: ${input.productId}`);
    }

    if (product.stockQuantity < input.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    // Domain logic lives in the entity methods
    product.reduceStock(input.quantity);

    const order = Order.create({
      orderId: generateOrderId(),
      customerId: input.customerId,
      items: [
        {
          productId: product.productId,
          quantity: input.quantity,
          unitPrice: product.price,
        },
      ],
    });

    const confirmed = order.confirm();
    await this.orderRepo.save(confirmed);

    return {
      orderId: confirmed.orderId,
      total: orderTotal(confirmed),
      status: confirmed.status,
    };
  }
}
```

---

## 15.6 — Dependency Inversion Principle in Practice

The Dependency Inversion Principle (DIP) is the mechanical enabler of Clean Architecture. High-level modules (use cases) define interfaces. Low-level modules (database, APIs) implement them. The dependency arrow points inward.

### How DIP Enables Clean Architecture

```
Without DIP (tight coupling):          With DIP (inverted dependency):

Use Case -----> PostgresRepo          Use Case -----> Repository (interface)
    |                                       |                ^
    |                                       |                |
    v                                       v                |
PostgresDriver                     PostgresAdapter -----+
```

### Python Protocol-Based Example

```python
"""
Dependency Inversion in action: the use case defines what it needs,
and the outer layers provide concrete implementations.
"""

from typing import Protocol


# ── Inner layer: defines the port ───────────────────────────────

class NotificationPort(Protocol):
    """What the use case needs — not how it works."""

    def send(self, recipient: str, subject: str, body: str) -> None: ...


class PlaceOrderInteractor:
    """Use case depends on the port, not on any concrete implementation."""

    def __init__(self, notifier: NotificationPort, repo: OrderRepository) -> None:
        self._notifier = notifier
        self._repo = repo

    def execute(self, input_data: PlaceOrderInput) -> PlaceOrderOutput:
        # ... create and confirm order ...
        order = Order(
            order_id="ORD-001",
            customer_id=input_data.customer_id,
            items=(),
        )
        confirmed = order.confirm()
        self._repo.save(confirmed)

        # Notification: the use case calls the port, not a concrete class
        self._notifier.send(
            recipient=input_data.customer_id,
            subject="Order Confirmed",
            body=f"Your order {confirmed.order_id} has been placed.",
        )
        return PlaceOrderOutput(
            order_id=confirmed.order_id,
            total=confirmed.total,
            status=confirmed.status.value,
        )


# ── Outer layer: concrete adapters ──────────────────────────────

class EmailNotificationAdapter:
    """Real implementation using an email service."""

    def send(self, recipient: str, subject: str, body: str) -> None:
        print(f"Sending email to {recipient}: {subject}")
        # Actual email sending logic (SMTP, SendGrid, etc.)


class SlackNotificationAdapter:
    """Alternative implementation using Slack."""

    def send(self, recipient: str, subject: str, body: str) -> None:
        print(f"Posting Slack message to #{recipient}: {subject}")


class FakeNotificationAdapter:
    """Test double for unit tests."""

    def __init__(self) -> None:
        self.sent_messages: list[tuple[str, str, str]] = []

    def send(self, recipient: str, subject: str, body: str) -> None:
        self.sent_messages.append((recipient, subject, body))


# ── Wiring it all together (composition root) ────────────────────

def build_production_notifier() -> NotificationPort:
    """Factory that returns the production implementation."""
    return EmailNotificationAdapter()


def build_test_notifier() -> NotificationPort:
    """Factory that returns a test double."""
    return FakeNotificationAdapter()
```

### TypeScript Protocol Example

```typescript
/**
 * Dependency Inversion: use case defines interfaces, adapters implement them.
 */

interface NotificationPort {
  send(recipient: string, subject: string, body: string): Promise<void>;
}

class EmailAdapter implements NotificationPort {
  async send(recipient: string, subject: string, body: string): Promise<void> {
    console.log(`Sending email to ${recipient}: ${subject}`);
  }
}

class SlackAdapter implements NotificationPort {
  async send(recipient: string, subject: string, body: string): Promise<void> {
    console.log(`Posting to Slack #${recipient}: ${subject}`);
  }
}

// Use case depends only on the port
class NotifyCustomerOnOrderConfirm {
  constructor(private readonly notifier: NotificationPort) {}

  async execute(orderId: string, customerId: string): Promise<void> {
    await this.notifier.send(
      customerId,
      "Order Confirmed",
      `Your order ${orderId} has been placed.`
    );
  }
}
```

---

## 15.7 — Clean Architecture with Python

Let's assemble everything into a complete, working Python project.

### Project Structure

```
ecommerce/
  domain/
    __init__.py
    entities.py          # Order, OrderItem, Customer, Money
    value_objects.py     # EmailAddress, Address
    exceptions.py        # Domain-specific exceptions
  application/
    __init__.py
    use_cases/
      __init__.py
      place_order.py     # PlaceOrderInteractor
      cancel_order.py    # CancelOrderInteractor
    ports/
      __init__.py
      repositories.py    # OrderRepository, CustomerRepository
      services.py        # PaymentGateway, NotificationService
  infrastructure/
    __init__.py
    persistence/
      __init__.py
      sqlalchemy_order_repo.py
      in_memory_order_repo.py
    services/
      __init__.py
      stripe_payment.py
      smtp_notification.py
  interfaces/
    __init__.py
    web/
      __init__.py
      flask_app.py
      controllers.py
    cli/
      __init__.py
      main.py
  composition_root.py    # Wire everything together
```

### Domain Layer (Complete)

```python
"""
domain/entities.py — The core of the application.

No imports from application, infrastructure, or interfaces layers.
These entities encode the fundamental business rules.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    SHIPPED = "shipped"
    DELIVERED = "delivered"


@dataclass(frozen=True)
class Money:
    amount: float
    currency: str = "USD"

    def __post_init__(self) -> None:
        if self.amount < 0:
            raise ValueError("Money cannot be negative")

    def add(self, other: Money) -> Money:
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(round(self.amount + other.amount, 2), self.currency)


@dataclass(frozen=True)
class OrderItem:
    product_id: str
    product_name: str
    quantity: int
    unit_price: Money

    @property
    def subtotal(self) -> Money:
        return Money(
            round(self.unit_price.amount * self.quantity, 2),
            self.unit_price.currency,
        )


@dataclass
class Order:
    order_id: str
    customer_id: str
    items: list[OrderItem] = field(default_factory=list)
    status: OrderStatus = OrderStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)

    @property
    def total(self) -> Money:
        if not self.items:
            return Money(0.0)
        result = self.items[0].subtotal
        for item in self.items[1:]:
            result = result.add(item.subtotal)
        return result

    def confirm(self) -> None:
        """Business rule: only pending orders can be confirmed."""
        if self.status != OrderStatus.PENDING:
            raise InvalidOrderStateError(
                f"Cannot confirm order in state {self.status.value}"
            )
        self.status = OrderStatus.CONFIRMED

    def cancel(self) -> None:
        """Business rule: only pending or confirmed orders can be cancelled."""
        if self.status not in (OrderStatus.PENDING, OrderStatus.CONFIRMED):
            raise InvalidOrderStateError(
                f"Cannot cancel order in state {self.status.value}"
            )
        self.status = OrderStatus.CANCELLED


class InvalidOrderStateError(Exception):
    """Raised when an order state transition is invalid."""
```

### Application Layer (Use Cases)

```python
"""
application/use_cases/place_order.py — Application business rules.
Orchestrates domain entities and calls outbound ports.
"""

from __future__ import annotations

from dataclasses import dataclass

from domain.entities import Money, Order, OrderItem
from application.ports.repositories import OrderRepository
from application.ports.services import PaymentGateway, NotificationService


@dataclass(frozen=True)
class PlaceOrderCommand:
    customer_id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    currency: str = "USD"


@dataclass(frozen=True)
class PlaceOrderResult:
    order_id: str
    total: float
    status: str


class PlaceOrderUseCase:
    """
    Orchestrates the full order placement flow:
    1. Build the domain entities
    2. Validate business rules (via entity methods)
    3. Process payment
    4. Persist the order
    5. Send confirmation
    """

    def __init__(
        self,
        order_repo: OrderRepository,
        payment_gateway: PaymentGateway,
        notification_service: NotificationService,
    ) -> None:
        self._order_repo = order_repo
        self._payment = payment_gateway
        self._notifier = notification_service

    def execute(self, command: PlaceOrderCommand) -> PlaceOrderResult:
        item = OrderItem(
            product_id=command.product_id,
            product_name=command.product_name,
            quantity=command.quantity,
            unit_price=Money(command.unit_price, command.currency),
        )
        order = Order(
            order_id=self._generate_order_id(),
            customer_id=command.customer_id,
            items=[item],
        )

        # Business rules enforced by the domain entity
        order.confirm()

        # Outbound calls through ports (adapters do the real work)
        self._payment.charge(
            customer_id=command.customer_id,
            amount=order.total.amount,
            currency=order.total.currency,
        )
        self._order_repo.save(order)
        self._notifier.send_order_confirmation(
            order_id=order.order_id,
            customer_id=command.customer_id,
            total=order.total.amount,
        )

        return PlaceOrderResult(
            order_id=order.order_id,
            total=order.total.amount,
            status=order.status.value,
        )

    @staticmethod
    def _generate_order_id() -> str:
        import uuid
        return f"ORD-{uuid.uuid4().hex[:8].upper()}"
```

### Infrastructure Layer (Adapters)

```python
"""
infrastructure/persistence/in_memory_order_repo.py — Test adapter.
"""

from __future__ import annotations

from domain.entities import Order


class InMemoryOrderRepository:
    """In-memory implementation for testing and prototyping."""

    def __init__(self) -> None:
        self._orders: dict[str, Order] = {}

    def save(self, order: Order) -> None:
        self._orders[order.order_id] = order

    def find_by_id(self, order_id: str) -> Order | None:
        return self._orders.get(order_id)

    def find_by_customer(self, customer_id: str) -> list[Order]:
        return [o for o in self._orders.values() if o.customer_id == customer_id]


"""
infrastructure/services/fake_payment_gateway.py — Fake adapter for testing.
"""

from __future__ import annotations

from dataclasses import dataclass


class FakePaymentGateway:
    """Simulates a payment gateway for testing."""

    def __init__(self) -> None:
        self.charges: list[dict] = []

    def charge(self, customer_id: str, amount: float, currency: str = "USD") -> str:
        charge_id = f"CH-{len(self.charges) + 1:04d}"
        self.charges.append({
            "charge_id": charge_id,
            "customer_id": customer_id,
            "amount": amount,
            "currency": currency,
        })
        return charge_id
```

### Composition Root

```python
"""
composition_root.py — Where all the wiring happens.

This is the ONLY place that knows about concrete implementations.
Everything else works with abstractions (ports).
"""

from domain.entities import Order
from application.use_cases.place_order import PlaceOrderUseCase
from infrastructure.persistence.in_memory_order_repo import InMemoryOrderRepository
from infrastructure.services.fake_payment_gateway import FakePaymentGateway


class FakeNotificationService:
    def send_order_confirmation(self, order_id: str, customer_id: str, total: float) -> None:
        print(f"[NOTIFICATION] Order {order_id} confirmed for {customer_id}. Total: ${total:.2f}")


def build_place_order_use_case() -> PlaceOrderUseCase:
    """Factory that assembles a fully-wired use case."""
    order_repo = InMemoryOrderRepository()
    payment = FakePaymentGateway()
    notifier = FakeNotificationService()
    return PlaceOrderUseCase(order_repo, payment, notifier)


# ── Usage ────────────────────────────────────────────────────────

if __name__ == "__main__":
    use_case = build_place_order_use_case()

    result = use_case.execute(
        PlaceOrderCommand(
            customer_id="CUST-42",
            product_id="PROD-100",
            product_name="Wireless Keyboard",
            quantity=2,
            unit_price=49.99,
        )
    )
    print(f"Order placed: {result.order_id}, Total: ${result.total:.2f}, Status: {result.status}")
```

---

## 15.8 — Clean Architecture with TypeScript

### Project Structure

```
src/
  domain/
    entities.ts
    value-objects.ts
    errors.ts
  application/
    use-cases/
      place-order.ts
      cancel-order.ts
    ports/
      order-repository.ts
      payment-gateway.ts
      notification-service.ts
  infrastructure/
    persistence/
      postgres-order-repository.ts
      in-memory-order-repository.ts
    services/
      stripe-payment-gateway.ts
  interfaces/
    web/
      express-router.ts
      order-controller.ts
  composition-root.ts
```

### Full Implementation

```typescript
// ── Domain Layer ────────────────────────────────────────────────

// src/domain/entities.ts

export type OrderStatus = "pending" | "confirmed" | "cancelled" | "shipped" | "delivered";

export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly currency: string;
}

export interface Order {
  readonly orderId: string;
  readonly customerId: string;
  readonly items: ReadonlyArray<OrderItem>;
  readonly status: OrderStatus;
  readonly createdAt: Date;
}

/** Factory function — validates invariants at creation time */
export function createOrder(params: {
  orderId: string;
  customerId: string;
  items: OrderItem[];
}): Order {
  if (params.items.length === 0) {
    throw new Error("Order must have at least one item");
  }
  return {
    ...params,
    items: Object.freeze([...params.items]),
    status: "pending",
    createdAt: new Date(),
  };
}

export function confirmOrder(order: Order): Order {
  if (order.status !== "pending") {
    throw new Error(`Cannot confirm order in status: ${order.status}`);
  }
  return { ...order, status: "confirmed" };
}

export function cancelOrder(order: Order): Order {
  if (order.status !== "pending" && order.status !== "confirmed") {
    throw new Error(`Cannot cancel order in status: ${order.status}`);
  }
  return { ...order, status: "cancelled" };
}

export function orderTotal(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
}


// ── Application Layer (Ports) ───────────────────────────────────

// src/application/ports/order-repository.ts

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}


// ── Application Layer (Use Case) ────────────────────────────────

// src/application/use-cases/place-order.ts

import { createOrder, confirmOrder, orderTotal, type Order } from "../../domain/entities";
import type { OrderRepository } from "../ports/order-repository";
import type { PaymentGateway } from "../ports/payment-gateway";
import type { NotificationService } from "../ports/notification-service";

export interface PlaceOrderInput {
  customerId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PlaceOrderOutput {
  orderId: string;
  total: number;
  status: string;
}

export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly payment: PaymentGateway,
    private readonly notification: NotificationService
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    const order = createOrder({
      orderId: this.generateId(),
      customerId: input.customerId,
      items: [
        {
          productId: input.productId,
          productName: input.productName,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          currency: "USD",
        },
      ],
    });

    const confirmed = confirmOrder(order);
    const total = orderTotal(confirmed);

    await this.payment.charge(confirmed.customerId, total, "USD");
    await this.orderRepo.save(confirmed);
    await this.notification.sendOrderConfirmation(
      confirmed.orderId,
      confirmed.customerId,
      total
    );

    return {
      orderId: confirmed.orderId,
      total,
      status: confirmed.status,
    };
  }

  private generateId(): string {
    return `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
}


// ── Infrastructure Layer (Adapters) ─────────────────────────────

// src/infrastructure/persistence/in-memory-order-repository.ts

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.orderId, order);
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) ?? null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (o) => o.customerId === customerId
    );
  }
}


// ── Composition Root ────────────────────────────────────────────

// src/composition-root.ts

export function buildPlaceOrderUseCase(): PlaceOrderUseCase {
  const orderRepo = new InMemoryOrderRepository();
  const payment = new StripePaymentGateway();
  const notification = new ConsoleNotificationService();
  return new PlaceOrderUseCase(orderRepo, payment, notification);
}
```

---

## 15.9 — Comparison with Other Architectural Patterns

### Clean Architecture vs MVC vs MVVM vs DDD

| Aspect | Clean Architecture | MVC | MVVM | DDD |
|---|---|---|---|---|
| **Primary focus** | Layer isolation via dependency rule | Request handling | Data binding | Domain modeling |
| **Business logic location** | Use cases + entities | Controllers (often) | ViewModels | Domain model + services |
| **Dependency direction** | Always inward | Varies (often outward) | Data-driven | Domain-centric |
| **Testability** | Excellent — pure use cases | Moderate — controller tests | Good — ViewModel tests | Good — aggregates are testable |
| **Learning curve** | Moderate-High | Low | Moderate | High |
| **Best for** | Complex domains, long-lived systems | CRUD applications, web apps | Rich UIs with data binding | Complex business rules |
| **Framework coupling** | Minimal | Often high (Django, Rails) | High (Angular, WPF) | Low-Moderate |
| **Scalability of design** | Scales well with team growth | Degrades in large codebases | Degrades in complex domains | Scales well for domain complexity |

### When to Use Each

| Scenario | Recommended Pattern | Why |
|---|---|---|
| Internal admin dashboard with simple CRUD | MVC | Fast to build, low complexity |
| Mobile app with complex state management | MVVM | Data binding simplifies UI logic |
| E-commerce platform with complex business rules | Clean Architecture + DDD | Domain integrity and testability |
| Microservice with single responsibility | Clean Architecture | Isolation and testability at service level |
| Prototype / MVP with tight deadlines | MVC or flat structure | Speed of development matters most |
| Enterprise system with 10+ year lifecycle | Clean Architecture + DDD | Long-term maintainability |
| Real-time collaborative application | MVVM or Clean Architecture | Reactive data flow needed |

### The Relationship Between Patterns

Clean Architecture and DDD are **complementary**, not competing. You can (and should) use DDD tactical patterns (aggregates, value objects, domain events) *inside* the entities layer of Clean Architecture.

```
Clean Architecture provides the LAYER structure.
DDD provides the DOMAIN modeling techniques.
Together they form a robust, long-lasting architecture.
```

---

## 15.10 — Real-World Case Studies

### Netflix: Domain-Driven Microservices

Netflix operates one of the world's largest distributed systems. Their architecture embodies Clean Architecture principles at scale:

- **Domain services** handle specific business capabilities (recommendations, billing, content delivery)
- **Anti-corruption layers** prevent external API changes from leaking into the domain
- **Event-driven architecture** decouples services through asynchronous communication

**Key takeaway**: Netflix's domain boundaries are defined by business capabilities, not by technical layers. Each microservice encapsulates its own domain, use cases, and adapters.

### Spotify: Squad Model with Clean Boundaries

Spotify's famous squad model organizes teams around **features** (vertical slices), each squad owning their domain end-to-end:

- **Squads** operate like autonomous Clean Architecture systems
- **Tribes** coordinate squads with shared platforms
- **Service libraries** provide reusable adapters (authentication, logging)

**Key takeaway**: Spofity's organizational structure mirrors Clean Architecture's boundaries — each squad owns its domain, application logic, and infrastructure, preventing cross-cutting dependencies that cause architectural erosion.

### Shopify: Modular Monolith with Clean Architecture

Shopify runs one of the largest Ruby on Rails monoliths, but has adopted Clean Architecture principles to manage complexity:

- **Modules** with strict boundaries (similar to Clean Architecture layers)
- **Domain-driven service objects** that encapsulate business rules
- **Repository pattern** abstracting database access
- **Anti-corruption layers** for third-party integrations (payment gateways, shipping APIs)

**Key takeaway**: You don't need microservices to benefit from Clean Architecture. A well-structured monolith with clear layer boundaries and dependency inversion can be just as maintainable — and far simpler to operate.

### Common Patterns Across All Three

| Pattern | Netflix | Spotify | Shopify |
|---|---|---|---|
| Domain isolation | Per-microservice | Per-squad | Per-module |
| Anti-corruption layers | Yes | Yes | Yes |
| Dependency inversion | Yes (event-driven) | Yes (platform APIs) | Yes (repository pattern) |
| Testable business logic | Yes | Yes | Yes |
| Independent deployment | Yes | Per-squad | Per-module (future) |

---

## 15.11 — Anti-Patterns and Pitfalls

### 1. Over-Engineering

Applying full Clean Architecture to a simple CRUD application. Not every project needs four layers and twelve files.

**When to skip Clean Architecture**:
- Throwaway prototypes with < 3 months of expected life
- Simple CRUD with no complex business rules
- Small scripts or utilities

### 2. The Anemic Domain Model Anti-Pattern

Putting all business logic in "service" classes while entities are mere data containers. This is the most common violation of Clean Architecture's spirit.

```python
# BAD: Anemic domain model — all logic is in the service
class Order:
    def __init__(self, status: str):
        self.status = status

class OrderService:
    def confirm_order(self, order: Order) -> None:
        if order.status != "pending":
            raise ValueError("Invalid state")
        order.status = "confirmed"

# GOOD: Rich domain model — logic lives in the entity
class Order:
    def __init__(self, status: str):
        self._status = status

    @property
    def status(self) -> str:
        return self._status

    def confirm(self) -> None:
        if self._status != "pending":
            raise InvalidOrderStateError(f"Cannot confirm from {self._status}")
        self._status = "confirmed"
```

### 3. Leaking Infrastructure into Domain

Domain entities that import ORM models, framework decorators, or database drivers. This makes the domain untestable without infrastructure.

```python
# BAD: Domain entity depends on Django ORM
from django.db import models

class Order(models.Model):  # Now tied to Django forever
    status = models.CharField(max_length=20)

    def confirm(self):
        if self.status == "pending":
            self.status = "confirmed"
            self.save()  # Database call inside domain logic!

# GOOD: Domain entity is a plain Python class
@dataclass
class Order:
    status: str = "pending"

    def confirm(self):
        if self.status != "pending":
            raise InvalidOrderStateError(f"Cannot confirm from {self.status}")
        self.status = "confirmed"
        # No save() call — persistence is the adapter's job
```

### 4. Too Many Layers

Creating interfaces, implementations, factories, and DTOs for every simple function. The overhead exceeds the value.

**Rule of thumb**: Only introduce a new layer when the complexity justifies it. Start simple; add layers as the codebase grows.

### 5. Dependency Rule Violations

Domain entities that import from infrastructure modules. Use cases that depend on specific database drivers. Adapters that import other adapters.

**How to detect**: Run `import-linter` or similar tools. Any import pointing outward from an inner layer is a violation.

### 6. God Use Cases

Use cases that orchestrate 15+ services, span 300+ lines, and handle multiple unrelated concerns. Break them into smaller, focused use cases.

---

## 15.12 — Architecture Decision Matrix

Use this matrix to decide whether Clean Architecture is appropriate for your project.

| Factor | Score | Weight | Reasoning |
|---|---|---|---|
| Project expected lifespan > 2 years | Yes: 5 / No: 1 | 3x | Long-lived projects benefit most from clean boundaries |
| Domain complexity (1-5) | 1: Low / 5: High | 3x | Complex domains need rich entity models |
| Team size > 5 developers | Yes: 5 / No: 2 | 2x | More developers = more need for clear boundaries |
| Need for multiple UIs (web, mobile, CLI) | Yes: 5 / No: 1 | 2x | Multiple interfaces justify the adapter layer |
| High test coverage requirement | Yes: 5 / No: 2 | 2x | Clean Architecture makes testing trivial |
| CRUD-heavy with little business logic | Yes: 1 / No: 4 | 1x | Simple apps don't need complex layering |
| External API integrations | Many: 5 / None: 1 | 2x | Anti-corruption layers protect the domain |
| Speed to market is critical | Yes: 1 / No: 4 | 1x | Over-engineering slows initial delivery |

**Scoring guide**:
- **50-60 points**: Full Clean Architecture strongly recommended
- **35-49 points**: Light Clean Architecture (3 layers) recommended
- **20-34 points**: Simple layered architecture is sufficient
- **Below 20**: Flat structure or framework conventions are fine

---

## 15.13 — Practice Exercises

### Exercise 1: Refactor an Anemic Model

You are given a `TicketService` class that handles all the logic for a support ticketing system. Refactor it into a rich domain model where the `Ticket` entity encapsulates the business rules.

```python
# STARTING CODE (anemic model)
class Ticket:
    def __init__(self, subject, body, priority, assignee=None):
        self.subject = subject
        self.body = body
        self.priority = priority
        self.assignee = assignee
        self.status = "open"
        self.comments = []

class TicketService:
    def create_ticket(self, subject, body, priority):
        if priority not in ("low", "medium", "high", "critical"):
            raise ValueError("Invalid priority")
        ticket = Ticket(subject, body, priority)
        return ticket

    def assign_ticket(self, ticket, assignee):
        if ticket.status != "open":
            raise ValueError("Can only assign open tickets")
        ticket.assignee = assignee
        ticket.status = "in_progress"

    def close_ticket(self, ticket):
        if ticket.status == "closed":
            raise ValueError("Already closed")
        if ticket.status == "in_progress" and ticket.assignee is None:
            raise ValueError("Cannot close unassigned in-progress ticket")
        ticket.status = "closed"

    def escalate(self, ticket):
        priorities = ["low", "medium", "high", "critical"]
        idx = priorities.index(ticket.priority)
        if idx < len(priorities) - 1:
            ticket.priority = priorities[idx + 1]
```

**Tasks**:
1. Move business logic into the `Ticket` entity
2. Create value objects where appropriate (e.g., `TicketId`, `Priority`)
3. Write unit tests for the refactored model
4. Ensure that `TicketService` is now a thin orchestration layer

### Exercise 2: Build a Ports and Adapters Weather Service

Build a small weather notification system with Clean Architecture:

- **Domain**: `WeatherReport` entity with validation rules (temperature ranges, wind speed limits)
- **Use case**: `CheckWeatherAndNotify` — checks weather for a location and sends alerts if conditions are severe
- **Ports**: `WeatherDataProvider`, `AlertNotifier`
- **Adapters**: `FakeWeatherProvider` (for tests), `FakeNotifier` (captures messages)
- **Tests**: Unit tests for the use case with fake adapters

**Verify**: The use case test runs without any network calls, databases, or framework dependencies.

### Exercise 3: Architecture Audit

Choose an existing project (or a section of one) and perform an architecture audit:

1. Map the current dependency graph — which modules import from which?
2. Identify any violations where inner layers depend on outer layers
3. Identify anemic domain models (entities with no behavior)
4. Propose a refactoring plan that introduces Clean Architecture boundaries
5. Estimate the effort (in days) and the expected benefit (in terms of testability, maintainability, and flexibility)

**Deliverable**: A one-page architecture assessment with a dependency diagram and prioritized recommendations.

---

## 15.14 — Summary

### Key Takeaways

| Concept | Description |
|---|---|
| **Dependency Rule** | All source code dependencies point inward toward the domain |
| **Entities** | Core business objects with rich behavior and enforced invariants |
| **Use Cases** | Application-specific orchestration of entities and outbound ports |
| **Interface Adapters** | Convert data between layers (controllers, presenters, repositories) |
| **Frameworks & Drivers** | Glue code that connects the system to the outside world |
| **Hexagonal Architecture** | Ports define interfaces; adapters provide implementations |
| **DIP** | High-level modules define interfaces; low-level modules implement them |
| **Rich Domain Model** | Business logic lives inside entities, not in scattered service classes |
| **Composition Root** | The single place where concrete implementations are wired together |
| **Anti-Corruption Layer** | Protects the domain from external API changes and legacy systems |

### The Clean Architecture Checklist

- [ ] Domain entities have no imports from outer layers
- [ ] Use cases depend only on domain entities and outbound port interfaces
- [ ] Adapters implement port interfaces defined in inner layers
- [ ] The composition root wires everything together
- [ ] Business rules can be tested without any infrastructure
- [ ] Swapping a database or framework requires changes only in the infrastructure layer
- [ ] No framework-specific code leaks into domain or use case layers
- [ ] Entities enforce their own invariants (no anemic models)

---

## Congratulations — You've Completed the Book

You've traveled through fifteen chapters of architectural thinking — from the fundamentals of clean code to the layered elegance of Clean Architecture. You now have a mental toolkit for building systems that last.

Here is a recap of the journey:

| Chapter | Core Concept | One-Line Summary |
|---|---|---|
| 1-3 | Fundamentals | Code quality, naming, and simplicity are the foundation |
| 4-6 | Design Principles | SOLID principles guide every architectural decision |
| 7-9 | Structural Patterns | Composition, facades, and adapters shape large systems |
| 10-12 | Behavioral Patterns | Strategy, observer, and command decouple responsibilities |
| 13-14 | System Design | Event-driven and microservice architectures scale systems |
| **15** | **Clean Architecture** | **Separate business logic from tools to build software that endures** |

The real test of architecture is not how it looks on day one — it is how it **feels** on day one thousand. When you can change a database, swap a framework, or rewrite the UI without touching a single line of business logic, you have achieved Clean Architecture.

Build software that outlasts its tools. Keep the center clean. Everything else is just plumbing.

> *\"The best architectures are those that make the business rules easy to understand and easy to change.\"*
> — Robert C. Martin

**Happy architecting.**