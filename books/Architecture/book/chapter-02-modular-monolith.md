# Chapter 2: Modular Monolith

> *"Start with a well-structured monolith. Only split into microservices when you have a good reason."*

## What Is a Modular Monolith?

A modular monolith is a single deployable application that is internally structured as a set of well-defined, loosely-coupled modules. Each module encapsulates its own domain logic, data access, and potentially its own database schema, but everything ships and runs as one process.

```
┌─────────────────────────────────────────────────────┐
│                 Single Deployment Unit               │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Module A │ │ Module B │ │ Module C │            │
│  │  Users   │ │  Orders  │ │ Products │            │
│  │          │ │          │ │          │            │
│  │ • Domain │ │ • Domain │ │ • Domain │            │
│  │ • API    │ │ • API    │ │ • API    │            │
│  │ • DB     │ │ • DB     │ │ • DB     │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │            │            │                   │
│  ┌────┴────────────┴────────────┴─────┐             │
│  │      Shared Infrastructure         │             │
│  │  (Logging, Auth, Config, Cache)    │             │
│  └────────────────────────────────────┘             │
│                                                     │
│              Single Database                        │
│  ┌──────────────────────────────────────┐           │
│  │  schema_users │ schema_orders │ ...  │           │
│  └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

## Modular Monolith vs Microservices

| Aspect | Modular Monolith | Microservices |
|--------|-----------------|---------------|
| Deployment | Single unit | Independent services |
| Communication | In-process function calls | Network calls (HTTP/gRPC/messaging) |
| Data | Shared database (schema isolation) | Separate databases per service |
| Team structure | Teams work on modules | Teams own entire services |
| Complexity | Low operational overhead | High operational overhead |
| Scaling | Scale the entire app | Scale individual services |
| Technology | Single tech stack | Polyglot possible |
| Latency | Microseconds (in-process) | Milliseconds (network) |
| Transaction | Simple ACID transactions | Distributed transactions required |
| Debugging | Single stack trace | Distributed tracing needed |
| When to use | Start here, default choice | When monolith limits are reached |

## Module Design Principles

### 1. High Cohesion Within Modules

Each module groups related functionality:

```
┌─────────────────────────────────┐
│         Order Module            │
│                                 │
│  domain/                        │
│    ├── order.py                 │  (Domain entity)
│    ├── order_item.py            │  (Value object)
│    └── order_service.py         │  (Business logic)
│                                 │
│  api/                           │
│    └── order_routes.py          │  (HTTP handlers)
│                                 │
│  repository/                    │
│    └── order_repository.py      │  (Data access)
│                                 │
│  events/                        │
│    ├── order_created.py         │  (Domain events)
│    └── order_completed.py       │
│                                 │
│  __init__.py                    │  (Public interface)
└─────────────────────────────────┘
```

### 2. Low Coupling Between Modules

Modules communicate through well-defined public interfaces (APIs), not internal implementation details:

```
┌──────────────┐    Public API     ┌──────────────┐
│  User Module │ ─────────────────►│ Order Module │
│              │                   │              │
│  internal/   │                   │  internal/   │
│  (private)   │                   │  (private)   │
└──────────────┘                   └──────────────┘

     ✅ Use module's public API
     ❌ Never import from module's internal packages
```

### 3. Explicit Public Interface

Each module exposes exactly what other modules can use:

```python
# order/__init__.py — Public interface only
from .api.order_routes import router as order_router
from .domain.order_service import OrderService
from .events.order_events import OrderCreatedEvent

__all__ = ["order_router", "OrderService", "OrderCreatedEvent"]
```

## Complete Python Example

### Project Structure

```
myapp/
├── pyproject.toml
├── main.py
├── core/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── events.py
│   └── auth.py
├── modules/
│   ├── __init__.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── domain.py
│   │   ├── repository.py
│   │   ├── service.py
│   │   └── routes.py
│   ├── orders/
│   │   ├── __init__.py
│   │   ├── domain.py
│   │   ├── repository.py
│   │   ├── service.py
│   │   └── routes.py
│   └── products/
│       ├── __init__.py
│       ├── domain.py
│       ├── repository.py
│       ├── service.py
│       └── routes.py
└── tests/
    ├── test_users.py
    └── test_orders.py
```

### Core Infrastructure

```python
# core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://user:pass@localhost:5432/myapp"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "change-me-in-production"

    class Config:
        env_file = ".env"


settings = Settings()
```

```python
# core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from core.config import settings

engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

```python
# core/events.py
"""In-process event bus for module communication."""
import logging
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable

logger = logging.getLogger(__name__)


@dataclass
class Event:
    name: str
    data: dict[str, Any] = field(default_factory=dict)


# Type for event handlers
EventHandler = Callable[[Event], Awaitable[None]]

# Global event registry
_handlers: dict[str, list[EventHandler]] = defaultdict(list)


def on(event_name: str):
    """Decorator to register an event handler."""
    def decorator(func: EventHandler):
        _handlers[event_name].append(func)
        return func
    return decorator


async def publish(event: Event):
    """Publish an event to all registered handlers."""
    logger.info(f"Publishing event: {event.name}")
    for handler in _handlers.get(event.name, []):
        try:
            await handler(event)
        except Exception:
            logger.exception(f"Handler {handler.__name__} failed for event {event.name}")


def reset_handlers():
    """Reset all handlers (used in tests)."""
    _handlers.clear()
```

### Users Module

```python
# modules/users/domain.py
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4


@dataclass
class User:
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    email: str = ""
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def deactivate(self):
        if not self.is_active:
            raise ValueError(f"User {self.id} is already inactive")
        self.is_active = False

    def activate(self):
        if self.is_active:
            raise ValueError(f"User {self.id} is already active")
        self.is_active = True
```

```python
# modules/users/repository.py
from sqlalchemy import select, Column, String, Boolean, DateTime
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Base
from .domain import User


class UserRecord(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True))


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(
            select(UserRecord).where(UserRecord.id == user_id)
        )
        record = result.scalar_one_or_none()
        if record is None:
            return None
        return User(
            id=record.id,
            name=record.name,
            email=record.email,
            is_active=record.is_active,
            created_at=record.created_at,
        )

    async def find_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(UserRecord).where(UserRecord.email == email)
        )
        record = result.scalar_one_or_none()
        if record is None:
            return None
        return User(
            id=record.id,
            name=record.name,
            email=record.email,
            is_active=record.is_active,
            created_at=record.created_at,
        )

    async def save(self, user: User) -> User:
        record = UserRecord(
            id=user.id,
            name=user.name,
            email=user.email,
            is_active=user.is_active,
            created_at=user.created_at,
        )
        self.db.add(record)
        await self.db.commit()
        return user

    async def list_users(self, limit: int = 50, offset: int = 0) -> list[User]:
        result = await self.db.execute(
            select(UserRecord).order_by(UserRecord.created_at.desc()).limit(limit).offset(offset)
        )
        records = result.scalars().all()
        return [
            User(
                id=r.id, name=r.name, email=r.email,
                is_active=r.is_active, created_at=r.created_at,
            )
            for r in records
        ]
```

```python
# modules/users/service.py
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from .repository import UserRepository
from .domain import User
from core.events import Event, publish


@dataclass
class CreateUserRequest:
    name: str
    email: str


class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def create_user(self, request: CreateUserRequest) -> User:
        existing = await self.repo.find_by_email(request.email)
        if existing:
            raise ValueError(f"Email {request.email} is already taken")

        user = User(name=request.name, email=request.email)
        await self.repo.save(user)

        # Publish domain event
        await publish(Event(
            name="user.created",
            data={"user_id": user.id, "email": user.email, "name": user.name},
        ))

        return user

    async def get_user(self, user_id: str) -> User:
        user = await self.repo.find_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        return user

    async def deactivate_user(self, user_id: str) -> User:
        user = await self.get_user(user_id)
        user.deactivate()
        await self.repo.save(user)

        await publish(Event(
            name="user.deactivated",
            data={"user_id": user.id},
        ))

        return user

    async def list_users(self, limit: int = 50, offset: int = 0) -> list[User]:
        return await self.repo.list_users(limit, offset)
```

```python
# modules/users/routes.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from .service import UserService, CreateUserRequest

router = APIRouter(prefix="/users", tags=["users"])


class UserCreateSchema(BaseModel):
    name: str
    email: str


class UserResponseSchema(BaseModel):
    id: str
    name: str
    email: str
    is_active: bool


@router.post("", response_model=UserResponseSchema, status_code=201)
async def create_user(body: UserCreateSchema, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    try:
        user = await service.create_user(CreateUserRequest(name=body.name, email=body.email))
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return UserResponseSchema(id=user.id, name=user.name, email=user.email, is_active=user.is_active)


@router.get("/{user_id}", response_model=UserResponseSchema)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    try:
        user = await service.get_user(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return UserResponseSchema(id=user.id, name=user.name, email=user.email, is_active=user.is_active)


@router.get("", response_model=list[UserResponseSchema])
async def list_users(
    limit: int = 50, offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    users = await service.list_users(limit, offset)
    return [UserResponseSchema(id=u.id, name=u.name, email=u.email, is_active=u.is_active) for u in users]
```

### Orders Module (with inter-module dependency via events)

```python
# modules/orders/domain.py
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


@dataclass
class OrderItem:
    product_id: str
    product_name: str
    quantity: int
    unit_price: float

    @property
    def subtotal(self) -> float:
        return self.quantity * self.unit_price


@dataclass
class Order:
    id: str = field(default_factory=lambda: str(uuid4()))
    user_id: str = ""
    items: list[OrderItem] = field(default_factory=list)
    status: OrderStatus = OrderStatus.PENDING
    total: float = 0.0
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def add_item(self, item: OrderItem):
        self.items.append(item)
        self._recalculate_total()

    def confirm(self):
        if self.status != OrderStatus.PENDING:
            raise ValueError(f"Cannot confirm order in status {self.status.value}")
        if not self.items:
            raise ValueError("Cannot confirm empty order")
        self.status = OrderStatus.CONFIRMED

    def cancel(self):
        if self.status in (OrderStatus.SHIPPED, OrderStatus.DELIVERED):
            raise ValueError(f"Cannot cancel order in status {self.status.value}")
        self.status = OrderStatus.CANCELLED

    def _recalculate_total(self):
        self.total = sum(item.subtotal for item in self.items)
```

```python
# modules/orders/service.py
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from .domain import Order, OrderItem, OrderStatus
from .repository import OrderRepository
from core.events import Event, publish


@dataclass
class CreateOrderRequest:
    user_id: str
    items: list[dict]


class OrderService:
    def __init__(self, db: AsyncSession):
        self.repo = OrderRepository(db)

    async def create_order(self, request: CreateOrderRequest) -> Order:
        order = Order(user_id=request.user_id)
        for item_data in request.items:
            item = OrderItem(
                product_id=item_data["product_id"],
                product_name=item_data.get("product_name", "Unknown"),
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
            )
            order.add_item(item)

        await self.repo.save(order)

        await publish(Event(
            name="order.created",
            data={"order_id": order.id, "user_id": order.user_id, "total": order.total},
        ))

        return order

    async def get_order(self, order_id: str) -> Order:
        order = await self.repo.find_by_id(order_id)
        if not order:
            raise ValueError(f"Order {order_id} not found")
        return order

    async def confirm_order(self, order_id: str) -> Order:
        order = await self.get_order(order_id)
        order.confirm()
        await self.repo.save(order)

        await publish(Event(
            name="order.confirmed",
            data={"order_id": order.id, "user_id": order.user_id, "total": order.total},
        ))

        return order

    async def cancel_order(self, order_id: str) -> Order:
        order = await self.get_order(order_id)
        order.cancel()
        await self.repo.save(order)

        await publish(Event(
            name="order.cancelled",
            data={"order_id": order.id, "user_id": order.user_id},
        ))

        return order

    async def list_user_orders(self, user_id: str) -> list[Order]:
        return await self.repo.find_by_user_id(user_id)
```

### Wiring It Together

```python
# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.database import init_db
from modules.users.routes import router as users_router
from modules.orders.routes import router as orders_router

# Register module-level event handlers
import modules.orders.listeners  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Modular Monolith",
    version="1.0.0",
    lifespan=lifespan,
)

# Register module routers
app.include_router(users_router)
app.include_router(orders_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Node.js Example

```typescript
// src/modules/users/user.service.ts
import { EventEmitter } from "events";

const bus = new EventEmitter();

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

export class UserService {
  static async create(data: { name: string; email: string }): Promise<User> {
    // Check uniqueness
    for (const u of users.values()) {
      if (u.email === data.email) {
        throw new Error(`Email ${data.email} already exists`);
      }
    }

    const user: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      isActive: true,
      createdAt: new Date(),
    };

    users.set(user.id, user);
    bus.emit("user.created", { userId: user.id, email: user.email });
    return user;
  }

  static async findById(id: string): Promise<User | undefined> {
    return users.get(id);
  }

  static async list(limit = 50): Promise<User[]> {
    return Array.from(users.values()).slice(0, limit);
  }

  static on(event: string, handler: (data: any) => void) {
    bus.on(event, handler);
  }
}
```

```typescript
// src/modules/users/user.routes.ts
import { Router } from "express";
import { UserService } from "./user.service";

export const userRouter = Router();

userRouter.post("/", async (req, res) => {
  try {
    const user = await UserService.create(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

userRouter.get("/", async (_req, res) => {
  const users = await UserService.list();
  res.json(users);
});

userRouter.get("/:id", async (req, res) => {
  const user = await UserService.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});
```

```typescript
// src/main.ts
import express from "express";
import { userRouter } from "./modules/users/user.routes";
import { orderRouter } from "./modules/orders/order.routes";

const app = express();
app.use(express.json());

// Mount module routes
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Modular monolith running on port ${PORT}`);
});
```

## When to Choose Modular Monolith

### Start Here By Default

```
Decision Tree:

  Is your team < 30 developers?
    └── YES → Use a modular monolith
    └── NO
        └── Are you having deployment conflicts?
            └── NO → Stay with modular monolith
            └── YES
                └── Do specific modules need independent scaling?
                    └── NO → Stay with modular monolith
                    └── YES → Extract those modules as microservices
```

### Signs You Need Microservices

| Signal | Description |
|--------|-------------|
| Deployment bottleneck | Teams block each other waiting for releases |
| Scaling mismatch | One module needs 10x the resources of others |
| Technology lock-in | A module needs a different tech stack |
| Team size | More than 30-50 developers in a single codebase |
| Blast radius | Changes in one module frequently break others |

### Migration Path: Modular Monolith → Microservices

```
Step 1: Modular Monolith (today)
┌──────────────────────────────┐
│ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │Users │ │Orders│ │Pay   │  │
│ └──┬───┘ └──┬───┘ └──┬───┘  │
│    └────────┴────────┘       │
│         Shared DB            │
└──────────────────────────────┘

Step 2: Extract most-changed module (Orders)
┌──────────────────────────┐   ┌──────────────┐
│ ┌──────┐ ┌──────┐       │   │ ┌──────────┐ │
│ │Users │ │Pay   │       │◄─►│ │ Orders   │ │
│ └──────┘ └──────┘       │   │ │(Service) │ │
│     Shared DB           │   │ └──────────┘ │
└──────────────────────────┘   │  Orders DB   │
                               └──────────────┘

Step 3: Continue extracting as needed
┌──────────┐   ┌──────────────┐   ┌──────────────┐
│ Users    │◄─►│   Orders     │◄─►│  Payment     │
│ Service  │   │   Service    │   │  Service     │
└──────────┘   └──────────────┘   └──────────────┘
    DB               DB                 DB
```

## Case Study: Shopify

Shopify runs one of the largest Rails monoliths in the world, handling millions of merchants and billions in transactions. Key insights:

- **30,000+ route entries** in a single Rails application
- **Modular structure** using Packwerk (packaging framework)
- **Selective extraction**: Only critical-path services (checkout, billing) extracted to separate services
- **Performance**: The monolith serves most requests in under 50ms

Shopify's approach proves that a well-structured monolith can scale to enormous workloads.

## Pros and Cons

### Pros

| Advantage | Impact |
|-----------|--------|
| Simple deployment | One process to deploy, monitor, debug |
| Low latency | In-process function calls are microseconds |
| ACID transactions | Easy data consistency across modules |
| Simple testing | Integration tests without service orchestration |
| Lower operational cost | No service mesh, fewer infrastructure components |
| Easier refactoring | Move code between modules with IDE refactoring tools |

### Cons

| Disadvantage | Mitigation |
|-------------|------------|
| Scaling is all-or-nothing | Plan modules with different resource needs in mind |
| Technology lock-in | Use the modular boundaries to isolate tech-specific code |
| Deployment coupling | Feature flags to decouple deployments |
| Team coupling | Enforce module boundaries with linting rules |
| Single point of failure | Process-level redundancy, graceful shutdown |

## Summary

A modular monolith is the recommended starting point for most applications. It provides the organizational benefits of clean module boundaries without the operational complexity of distributed systems. Use well-defined module interfaces, separate database schemas per module, and an in-process event bus for communication. Extract to microservices only when you have concrete evidence that the monolith is a bottleneck.

**Key Takeaways:**
- Start with a modular monolith — you can always extract services later
- Module boundaries are more important than the deployment model
- Use an event bus for loose coupling between modules
- Separate database schemas per module for easy future extraction
- A well-structured monolith can scale to handle enormous workloads
