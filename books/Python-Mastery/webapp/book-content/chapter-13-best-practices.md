# Chapter 13: Best Practices & Design Patterns

Writing code that *works* is the first step. Writing code that is **maintainable**, **readable**, **secure**, and **performant** is what separates professional developers from hobbyists. This chapter consolidates decades of software engineering wisdom into practical, Python-specific guidance you can apply immediately.

---

## 13.1 PEP 8 Style Guide

PEP 8 is Python's official style guide. Following it produces code that every Python developer can read without mental overhead. It is not merely a recommendation -- it is a shared contract.

### Naming Conventions

| Element            | Convention              | Example                    |
|--------------------|-------------------------|----------------------------|
| Module             | `snake_case`            | `data_loader.py`           |
| Package            | `lowercase`, no underscores | `mypackage`           |
| Class              | `PascalCase`            | `DataProcessor`            |
| Function/Method    | `snake_case`            | `load_data()`              |
| Variable           | `snake_case`            | `row_count`                |
| Constant           | `UPPER_SNAKE_CASE`      | `MAX_RETRY_COUNT`          |
| Private attribute  | `_leading_underscore`   | `_internal_cache`          |
| Name-mangled       | `__double_leading`      | `__private_var`            |
| Type variable      | `PascalCase` or `_T`    | `RequestT`                 |
| Exception          | `PascalCase` + `Error`  | `ValueNotFoundError`       |
| Global variable    | `snake_case`            | `_global_config`           |

### Indentation and Line Length

```python
# Use 4 spaces per indentation level. Never tabs.

# Good: max line length 79 characters (or 88 for black default)
def calculate_total_price(
    items: list[dict],
    tax_rate: float,
) -> float:
    return sum(item["price"] for item in items) * (1 + tax_rate)


# Bad: lines too long, hard to read
def calculate_total_price(items: list[dict], tax_rate: float, discount: float, shipping_cost: float, handling_fee: float) -> float:
    return sum(item["price"] for item in items) * (1 + tax_rate) - discount + shipping_cost + handling_fee
```

### Import Ordering

Imports should be grouped in this exact order, separated by a blank line:

```python
# 1. Standard library
import os
import sys
from pathlib import Path

# 2. Third-party packages
import numpy as np
import pandas as pd
from flask import Flask, jsonify

# 3. Local application/library imports
from myproject.config import settings
from myproject.models import User
from myproject.utils import helper
```

### Whitespace Rules

```python
# Good -- whitespace around operators and after commas
x = 1
y = x + 2
my_list = [1, 2, 3]
my_dict = {"key": "value"}

# Bad -- missing whitespace
x=1
y=x+2
my_list = [1,2,3]
my_dict = {"key":"value"}

# Good -- no whitespace in slices
my_list[1:3]
my_dict["key"]

# Bad -- whitespace in slices
my_list[ 1 : 3 ]
```

### Comment and Docstring Conventions

```python
# This is an inline comment -- note the space after the #.

def fetch_user(user_id: int) -> dict:
    """Fetch a user by ID from the database.

    Args:
        user_id: The unique identifier of the user.

    Returns:
        A dictionary containing user data.

    Raises:
        UserNotFoundError: If no user exists with the given ID.
    """
    # Block comments explain *why*, not *what*
    # We use a short timeout because the user table is heavily indexed
    result = db.query("SELECT * FROM users WHERE id = ?", user_id)
    if not result:
        raise UserNotFoundError(f"User {user_id} not found")
    return result
```

### Auto-Formatting Tools

| Tool       | Purpose                                  | Config Key          |
|------------|------------------------------------------|---------------------|
| **black**  | Opinionated code formatter (88 chars)   | `[tool.black]`      |
| **ruff**   | Fast linter + formatter (replaces flake8, isort, black) | `[tool.ruff]` |
| **autopep8** | Auto-fix PEP 8 violations             | `--max-line-length` |
| **isort**  | Sort and organize imports                | `[tool.isort]`      |

```bash
# Modern workflow: use ruff for everything
ruff format .          # Format all files
ruff check --fix .     # Lint and auto-fix issues

# Or use black + isort
black .
isort .
```

---

## 13.2 Writing Clean Code

Clean code is self-documenting. When someone reads it, they understand the *intent* without needing comments to explain every line.

### Single Responsibility Principle (Functions)

```python
# Bad -- one function does everything
def process_user_data(data: dict) -> None:
    # Validate
    if not data.get("email"):
        raise ValueError("Email required")
    if not data.get("name"):
        raise ValueError("Name required")
    # Transform
    data["email"] = data["email"].lower().strip()
    data["name"] = data["name"].title()
    # Save to database
    db.insert("users", data)
    # Send welcome email
    send_email(data["email"], "Welcome!", f"Hi {data['name']}")
    # Log
    logger.info(f"New user: {data['email']}")


# Good -- each function does one thing
def validate_user_data(data: dict) -> None:
    if not data.get("email"):
        raise ValueError("Email required")
    if not data.get("name"):
        raise ValueError("Name required")


def normalize_user_data(data: dict) -> dict:
    return {
        **data,
        "email": data["email"].lower().strip(),
        "name": data["name"].title(),
    }


def register_user(data: dict) -> None:
    validate_user_data(data)
    normalized = normalize_user_data(data)
    db.insert("users", normalized)
    send_email(normalized["email"], "Welcome!", f"Hi {normalized['name']}")
    logger.info(f"New user: {normalized['email']}")
```

### DRY -- Don't Repeat Yourself

```python
# Bad -- duplicated logic
def calculate_discount_price(price: float) -> float:
    tax = price * 0.08
    total = price + tax
    return round(total, 2)


def calculate_membership_price(price: float) -> float:
    tax = price * 0.08
    total = price + tax
    discount = total * 0.10
    return round(total - discount, 2)


# Good -- extract the shared logic
TAX_RATE = 0.08
MEMBERSHIP_DISCOUNT = 0.10


def apply_tax(price: float) -> float:
    return round(price * (1 + TAX_RATE), 2)


def calculate_discount_price(price: float) -> float:
    return apply_tax(price)


def calculate_membership_price(price: float) -> float:
    taxed = apply_tax(price)
    return round(taxed * (1 - MEMBERSHIP_DISCOUNT), 2)
```

### KISS -- Keep It Simple, Stupid

```python
# Bad -- over-engineered
class DataTransformerFactory:
    def __init__(self, strategy: str = "default"):
        self._strategy = strategy
        self._handlers = {
            "default": self._default_transform,
            "uppercase": self._uppercase_transform,
        }

    def _default_transform(self, data: str) -> str:
        return data.strip()

    def _uppercase_transform(self, data: str) -> str:
        return data.strip().upper()

    def transform(self, data: str) -> str:
        handler = self._handlers.get(self._strategy, self._default_transform)
        return handler(data)


# Good -- simple and clear
def transform_data(data: str, uppercase: bool = False) -> str:
    result = data.strip()
    return result.upper() if uppercase else result
```

### Guard Clauses

```python
# Bad -- deeply nested (arrow anti-pattern)
def process_order(order: dict) -> str:
    if order is not None:
        if order.get("items"):
            if len(order["items"]) > 0:
                if order.get("payment"):
                    # actual logic buried deep
                    return "Order processed"
                else:
                    return "No payment method"
            else:
                return "Empty order"
        else:
            return "No items"
    else:
        return "Invalid order"


# Good -- guard clauses flatten the logic
def process_order(order: dict) -> str:
    if order is None:
        return "Invalid order"
    if not order.get("items"):
        return "No items"
    if len(order["items"]) == 0:
        return "Empty order"
    if not order.get("payment"):
        return "No payment method"

    return "Order processed"
```

---

## 13.3 SOLID Principles

SOLID is a set of five design principles that make object-oriented systems easier to understand, extend, and maintain.

### S -- Single Responsibility Principle

A class should have only one reason to change.

```python
# Bad -- this class handles users AND reports AND email
class UserManager:
    def create_user(self, data: dict) -> None:
        db.insert("users", data)

    def generate_report(self) -> str:
        users = db.query("SELECT * FROM users")
        return "\n".join(f"{u['name']}: {u['email']}" for u in users)

    def send_welcome(self, user: dict) -> None:
        send_email(user["email"], "Welcome!")


# Good -- three classes, each with one responsibility
class UserCreator:
    def create(self, data: dict) -> None:
        db.insert("users", data)


class UserReportGenerator:
    def generate(self) -> str:
        users = db.query("SELECT * FROM users")
        return "\n".join(f"{u['name']}: {u['email']}" for u in users)


class WelcomeEmailSender:
    def send(self, user: dict) -> None:
        send_email(user["email"], "Welcome!")
```

### O -- Open/Closed Principle

Open for extension, closed for modification.

```python
# Bad -- must modify existing code to add a new discount type
def apply_discount(price: float, discount_type: str) -> float:
    if discount_type == "percentage":
        return price * 0.90
    elif discount_type == "fixed":
        return price - 10.0
    elif discount_type == "bogo":
        return price / 2
    # Every new discount type requires modifying this function
    raise ValueError(f"Unknown discount: {discount_type}")


# Good -- new discount types are added, existing code is never touched
from abc import ABC, abstractmethod


class DiscountStrategy(ABC):
    @abstractmethod
    def apply(self, price: float) -> float:
        ...


class PercentageDiscount(DiscountStrategy):
    def __init__(self, percent: float = 10.0):
        self.percent = percent

    def apply(self, price: float) -> float:
        return price * (1 - self.percent / 100)


class FixedDiscount(DiscountStrategy):
    def __init__(self, amount: float = 10.0):
        self.amount = amount

    def apply(self, price: float) -> float:
        return max(0, price - self.amount)


class BuyOneGetOne(DiscountStrategy):
    def apply(self, price: float) -> float:
        return price / 2


def apply_discount(price: float, strategy: DiscountStrategy) -> float:
    return strategy.apply(price)


# Adding a new discount requires ZERO changes to existing code:
class LoyaltyDiscount(DiscountStrategy):
    def __init__(self, tier: str = "gold"):
        self.multiplier = {"silver": 0.95, "gold": 0.90, "platinum": 0.85}[tier]

    def apply(self, price: float) -> float:
        return price * self.multiplier
```

### L -- Liskov Substitution Principle

Subtypes must be substitutable for their base types without altering correctness.

```python
# Bad -- Square violates Rectangle's contract
class Rectangle:
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def set_width(self, width: float) -> None:
        self.width = width

    def set_height(self, height: float) -> None:
        self.height = height

    def area(self) -> float:
        return self.width * self.height


class Square(Rectangle):
    def set_width(self, width: float) -> None:
        self.width = width
        self.height = width  # Surprise! Changing width changes height too

    def set_height(self, height: float) -> None:
        self.width = height
        self.height = height


def get_area(rect: Rectangle) -> float:
    rect.set_width(5)
    rect.set_height(4)
    return rect.area()  # Expects 20, but Square returns 16!


# Good -- use composition or immutable types
class Rectangle:
    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    @property
    def width(self) -> float:
        return self._width

    @property
    def height(self) -> float:
        return self._height

    def area(self) -> float:
        return self._width * self._height

    def with_width(self, width: float) -> "Rectangle":
        return Rectangle(width, self._height)

    def with_height(self, height: float) -> "Rectangle":
        return Rectangle(self._width, height)
```

### I -- Interface Segregation Principle

Clients should not be forced to depend on interfaces they do not use.

```python
# Bad -- one fat interface forces all implementers to provide everything
from abc import ABC, abstractmethod


class Worker(ABC):
    @abstractmethod
    def work(self) -> None: ...

    @abstractmethod
    def eat(self) -> None: ...

    @abstractmethod
    def sleep(self) -> None: ...


class Robot(Worker):
    def work(self) -> None:
        print("Robot working")

    def eat(self) -> None:
        raise NotImplementedError("Robots don't eat")  # Forced to implement!

    def sleep(self) -> None:
        raise NotImplementedError("Robots don't sleep")  # Forced to implement!


# Good -- small, focused interfaces
class Workable(ABC):
    @abstractmethod
    def work(self) -> None: ...


class Eatable(ABC):
    @abstractmethod
    def eat(self) -> None: ...


class Sleepable(ABC):
    @abstractmethod
    def sleep(self) -> None: ...


class Human(Workable, Eatable, Sleepable):
    def work(self) -> None:
        print("Human working")

    def eat(self) -> None:
        print("Human eating")

    def sleep(self) -> None:
        print("Human sleeping")


class Robot(Workable):
    def work(self) -> None:
        print("Robot working")
    # No eat() or sleep() needed -- perfectly valid
```

### D -- Dependency Inversion Principle

High-level modules should not depend on low-level modules. Both should depend on abstractions.

```python
# Bad -- high-level module depends directly on low-level module
class MySQLDatabase:
    def query(self, sql: str) -> list:
        # MySQL-specific code
        ...


class UserService:
    def __init__(self):
        self.db = MySQLDatabase()  # Hard-coded dependency

    def get_user(self, user_id: int) -> dict:
        return self.db.query(f"SELECT * FROM users WHERE id = {user_id}")


# Good -- both depend on an abstraction
from abc import ABC, abstractmethod


class Database(ABC):
    @abstractmethod
    def query(self, sql: str, params: tuple = ()) -> list: ...


class MySQLDatabase(Database):
    def query(self, sql: str, params: tuple = ()) -> list:
        # MySQL-specific implementation
        ...


class PostgreSQLDatabase(Database):
    def query(self, sql: str, params: tuple = ()) -> list:
        # PostgreSQL-specific implementation
        ...


class UserService:
    def __init__(self, db: Database):
        self.db = db  # Depends on abstraction, not implementation

    def get_user(self, user_id: int) -> dict:
        return self.db.query("SELECT * FROM users WHERE id = %s", (user_id,))


# Easily swap implementations:
service = UserService(PostgreSQLDatabase())
```

---

## 13.4 Design Patterns in Python

Design patterns are reusable solutions to common problems. Python's dynamic nature means many classic patterns are simpler -- or unnecessary -- compared to static languages.

### Singleton Pattern

**Problem:** Ensure a class has exactly one instance and provide a global access point.

```python
# The "Pythonic" way -- use a module-level instance
class _DatabaseConnection:
    def __init__(self):
        self._connection = None

    def connect(self):
        if self._connection is None:
            self._connection = create_connection()
        return self._connection


# Module-level singleton
database = _DatabaseConnection()
```

> **When to use:** Rarely. In Python, prefer module-level variables or dependency injection. Singletons make testing harder by introducing hidden global state.

### Factory Pattern

**Problem:** Create objects without specifying the exact class at call time.

```python
from abc import ABC, abstractmethod


class Notification(ABC):
    @abstractmethod
    def send(self, message: str) -> None: ...


class EmailNotification(Notification):
    def send(self, message: str) -> None:
        print(f"Email: {message}")


class SMSNotification(Notification):
    def send(self, message: str) -> None:
        print(f"SMS: {message}")


class PushNotification(Notification):
    def send(self, message: str) -> None:
        print(f"Push: {message}")


class NotificationFactory:
    _registry: dict[str, type[Notification]] = {
        "email": EmailNotification,
        "sms": SMSNotification,
        "push": PushNotification,
    }

    @classmethod
    def create(cls, channel: str) -> Notification:
        notification_class = cls._registry.get(channel)
        if notification_class is None:
            raise ValueError(f"Unknown channel: {channel}. Available: {list(cls._registry)}")
        return notification_class()

    @classmethod
    def register(cls, channel: str, klass: type[Notification]) -> None:
        cls._registry[channel] = klass


# Usage
notification = NotificationFactory.create("email")
notification.send("Hello!")
```

**When to use:** When you need to decouple object creation from the caller, or when the exact type depends on runtime configuration.

### Observer Pattern

**Problem:** Notify multiple objects when one object's state changes.

```python
from typing import Callable


class EventEmitter:
    def __init__(self):
        self._listeners: dict[str, list[Callable]] = {}

    def on(self, event: str, callback: Callable) -> None:
        self._listeners.setdefault(event, []).append(callback)

    def emit(self, event: str, *args, **kwargs) -> None:
        for callback in self._listeners.get(event, []):
            callback(*args, **kwargs)


class StockPrice:
    def __init__(self, symbol: str, price: float):
        self.symbol = symbol
        self._price = price
        self.events = EventEmitter()

    @property
    def price(self) -> float:
        return self._price

    @price.setter
    def price(self, new_price: float) -> None:
        old_price = self._price
        self._price = new_price
        self.events.emit("price_change", self.symbol, old_price, new_price)


# Usage
def log_change(symbol: str, old: float, new: float) -> None:
    print(f"[LOG] {symbol}: ${old:.2f} -> ${new:.2f}")


def alert_large_change(symbol: str, old: float, new: float) -> None:
    if abs(new - old) / old > 0.05:
        print(f"[ALERT] {symbol} moved {((new - old) / old) * 100:.1f}%")


stock = StockPrice("AAPL", 150.0)
stock.events.on("price_change", log_change)
stock.events.on("price_change", alert_large_change)

stock.price = 160.0  # Both listeners fire
stock.price = 145.0  # Alert triggers (large drop)
```

**When to use:** Event systems, UI frameworks, notification services, decoupled communication between components.

### Strategy Pattern

**Problem:** Define a family of algorithms and make them interchangeable at runtime.

```python
from typing import Protocol


class SortStrategy(Protocol):
    def sort(self, data: list) -> list: ...


class QuickSort:
    def sort(self, data: list) -> list:
        if len(data) <= 1:
            return data
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        middle = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + middle + self.sort(right)


class MergeSort:
    def sort(self, data: list) -> list:
        if len(data) <= 1:
            return data
        mid = len(data) // 2
        left = self.sort(data[:mid])
        right = self.sort(data[mid:])
        return self._merge(left, right)

    def _merge(self, left: list, right: list) -> list:
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        result.extend(left[i:])
        result.extend(right[j:])
        return result


class BubbleSort:
    def sort(self, data: list) -> list:
        arr = list(data)
        n = len(arr)
        for i in range(n):
            for j in range(0, n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr


class DataProcessor:
    def __init__(self, strategy: SortStrategy | None = None):
        self._strategy = strategy or QuickSort()

    @property
    def strategy(self) -> SortStrategy:
        return self._strategy

    @strategy.setter
    def strategy(self, strategy: SortStrategy) -> None:
        self._strategy = strategy

    def process(self, data: list) -> list:
        return self._strategy.sort(data)


# Usage -- swap algorithms at runtime
processor = DataProcessor(BubbleSort())
print(processor.process([3, 1, 4, 1, 5, 9]))

processor.strategy = MergeSort()
print(processor.process([3, 1, 4, 1, 5, 9]))
```

**When to use:** When you have multiple algorithms for the same task and want to select them dynamically (sorting, pricing, validation).

### Builder Pattern

**Problem:** Construct complex objects step by step.

```python
from dataclasses import dataclass, field


@dataclass
class HttpRequest:
    method: str = "GET"
    url: str = ""
    headers: dict[str, str] = field(default_factory=dict)
    body: str | None = None
    timeout: int = 30
    retries: int = 3


class HttpRequestBuilder:
    def __init__(self):
        self._request = HttpRequest()

    def method(self, method: str) -> "HttpRequestBuilder":
        self._request.method = method
        return self

    def url(self, url: str) -> "HttpRequestBuilder":
        self._request.url = url
        return self

    def header(self, key: str, value: str) -> "HttpRequestBuilder":
        self._request.headers[key] = value
        return self

    def body(self, body: str) -> "HttpRequestBuilder":
        self._request.body = body
        return self

    def timeout(self, seconds: int) -> "HttpRequestBuilder":
        self._request.timeout = seconds
        return self

    def retries(self, count: int) -> "HttpRequestBuilder":
        self._request.retries = count
        return self

    def build(self) -> HttpRequest:
        if not self._request.url:
            raise ValueError("URL is required")
        return self._request


# Usage -- fluent, readable construction
request = (
    HttpRequestBuilder()
    .method("POST")
    .url("https://api.example.com/users")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token123")
    .body('{"name": "Alice"}')
    .timeout(10)
    .retries(2)
    .build()
)
```

**When to use:** When object construction has many optional parameters or when construction steps need to vary.

### Adapter Pattern

**Problem:** Make incompatible interfaces work together.

```python
# Old system returns XML-like dicts
class LegacyPaymentGateway:
    def make_payment(self, xml_data: str) -> str:
        return f"<result><status>ok</status><ref>LEG-{hash(xml_data) % 10000}</ref></result>"


# New system expects a clean interface
class ModernPaymentProcessor:
    def charge(self, amount: float, currency: str, card_token: str) -> dict:
        raise NotImplementedError


# Adapter bridges the gap
class LegacyPaymentAdapter(ModernPaymentProcessor):
    def __init__(self, legacy: LegacyPaymentGateway):
        self._legacy = legacy

    def charge(self, amount: float, currency: str, card_token: str) -> dict:
        xml = f"<payment><amount>{amount}</amount><currency>{currency}</currency><card>{card_token}</card></payment>"
        result = self._legacy.make_payment(xml)
        # Parse the XML-like response into a clean dict
        return {"status": "ok", "ref": result.split("<ref>")[1].split("</ref>")[0]}


# Usage -- code works with the modern interface regardless of backend
def process_payment(processor: ModernPaymentProcessor, amount: float) -> None:
    result = processor.charge(amount, "USD", "tok_abc123")
    print(f"Payment {result['status']}: {result['ref']}")


legacy = LegacyPaymentGateway()
adapter = LegacyPaymentAdapter(legacy)
process_payment(adapter, 99.99)
```

**When to use:** Integrating third-party libraries with incompatible APIs, migrating between systems, wrapping legacy code.

---

## 13.5 Project Structure and Packaging

A well-structured project is easier to navigate, test, and distribute.

### Standard Project Layout

```
my_project/
├── pyproject.toml           # Project metadata and dependencies
├── README.md                # Project documentation
├── LICENSE                  # License file
├── .gitignore               # Git ignore rules
├── src/                     # Source code (src layout)
│   └── my_project/          # Package directory
│       ├── __init__.py      # Package initialization
│       ├── core.py          # Core logic
│       ├── models.py        # Data models
│       ├── utils.py         # Utility functions
│       └── cli.py           # Command-line interface
├── tests/                   # Test suite
│   ├── __init__.py
│   ├── test_core.py
│   └── test_models.py
├── docs/                    # Documentation
│   └── conf.py
├── scripts/                 # Build/CI scripts
│   └── build.py
└── examples/                # Usage examples
    └── basic_usage.py
```

> **src layout vs flat layout:** The `src/` layout prevents accidentally importing the local package during testing (you import `my_project`, not the uninstalled directory). The `src/` layout is now the recommended standard.

### pyproject.toml Explained

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-project"
version = "1.2.3"
description = "A short description of the project"
readme = "README.md"
license = "MIT"
requires-python = ">=3.11"
authors = [
    { name = "Your Name", email = "you@example.com" },
]
dependencies = [
    "requests>=2.28",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "ruff>=0.4",
    "mypy>=1.0",
]

[project.scripts]
my-tool = "my_project.cli:main"

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP"]

[tool.pytest.ini_options]
testpaths = ["tests"]
```

### __init__.py and __all__

```python
# my_project/__init__.py

from my_project.core import process, transform
from my_project.models import User, Order

# Control what `from my_project import *` exports
__all__ = ["process", "transform", "User", "Order"]

# Package metadata
__version__ = "1.2.3"
__author__ = "Your Name"
```

### Creating Distributable Packages

```bash
# Build the package
pip install build
python -m build

# This creates:
# dist/my_project-1.2.3.tar.gz    (source distribution)
# dist/my_project-1.2.3-py3-none-any.whl  (wheel)

# Upload to PyPI
pip install twine
twine upload dist/*
```

---

## 13.6 Dependency Management

Managing dependencies correctly ensures your project runs the same on every machine.

### Comparison of Tools

| Tool     | Lock File     | Virtual Env | Speed  | Script Runner | Config File        |
|----------|---------------|-------------|--------|---------------|--------------------|
| pip      | requirements  | Manual      | Slow   | No            | `requirements.txt` |
| Poetry   | poetry.lock   | Built-in    | Medium | Yes           | `pyproject.toml`   |
| uv       | uv.lock       | Built-in    | Fast   | Yes           | `pyproject.toml`   |
| Pipenv   | Pipfile.lock  | Built-in    | Slow   | Yes           | `Pipfile`          |

### pip and requirements.txt

```bash
# Install from requirements
pip install -r requirements.txt

# Generate requirements
pip freeze > requirements.txt

# Pin exact versions for reproducibility
# requirements.txt
requests==2.31.0
pydantic==2.5.0
flask==3.0.0
```

### Poetry

```bash
# Initialize
poetry init

# Add dependencies
poetry add requests
poetry add --group dev pytest ruff

# Install all dependencies
poetry install

# Run commands inside the virtual environment
poetry run python main.py
poetry run pytest
```

### uv (Modern Alternative)

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Initialize a project
uv init my-project
cd my-project

# Add dependencies
uv add requests
uv add --dev pytest ruff

# Run scripts
uv run python main.py
uv run pytest

# Sync dependencies from lock file
uv sync
```

### Lock Files and Reproducibility

A lock file pins the **exact version** of every dependency (and their transitive dependencies). This guarantees that `uv install` or `poetry install` produces the same environment everywhere.

```
# Without lock file:  pip install requests might get 2.31.0 today
#                     and 2.32.0 tomorrow -- breaking changes possible
#
# With lock file:     Every install produces the exact same dependency tree
```

---

## 13.7 Virtual Environments

### Why Virtual Environments Matter

Without virtual environments, all Python packages install globally. Project A might need `requests==2.28` while Project B needs `requests==2.32`. One will break.

```
┌─────────────────────────────────────────────────────────┐
│                    Global Python                         │
│                                                          │
│  Project A: requests 2.28 ──── CONFLICT ──── requests 2.32 :Project B  │
│                                                          │
│  With venv:                                              │
│  ┌──────────────────┐    ┌──────────────────┐            │
│  │  venv_a/          │    │  venv_b/          │            │
│  │  requests==2.28   │    │  requests==2.32   │            │
│  └──────────────────┘    └──────────────────┘            │
│      Isolated!                Isolated!                   │
└─────────────────────────────────────────────────────────┘
```

### Creating and Using Virtual Environments

```bash
# Create a virtual environment
python -m venv .venv

# Activate (Linux/macOS)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate

# Install packages inside the venv
pip install requests flask

# Export dependencies
pip freeze > requirements.txt

# Deactivate
deactivate
```

### .gitignore for Virtual Environments

```gitignore
# Virtual environments
.venv/
venv/
env/
.env

# Do NOT commit the virtual environment -- only commit requirements.txt
```

---

## 13.8 Documentation

### Docstring Formats

**Google Style:**

```python
def fetch_users(
    department: str,
    min_salary: float = 0.0,
    limit: int = 100,
) -> list[dict]:
    """Fetch users from a department with optional salary filter.

    Retrieves employee records from the database for the specified
    department. Results are ordered by salary descending.

    Args:
        department: The department name to filter by (e.g., "engineering").
        min_salary: Minimum salary threshold. Defaults to 0.0.
        limit: Maximum number of results. Defaults to 100.

    Returns:
        A list of dictionaries, each containing 'name', 'email',
        and 'salary' keys.

    Raises:
        ValueError: If department is empty or limit is negative.
        ConnectionError: If the database is unreachable.

    Example:
        >>> users = fetch_users("engineering", min_salary=80000)
        >>> print(len(users))
        42
    """
```

**NumPy Style:**

```python
def fetch_users(
    department: str,
    min_salary: float = 0.0,
    limit: int = 100,
) -> list[dict]:
    """Fetch users from a department with optional salary filter.

    Parameters
    ----------
    department : str
        The department name to filter by.
    min_salary : float, optional
        Minimum salary threshold. Default is 0.0.
    limit : int, optional
        Maximum number of results. Default is 100.

    Returns
    -------
    list of dict
        Each dict has keys: 'name', 'email', 'salary'.

    Raises
    ------
    ValueError
        If department is empty or limit is negative.
    ConnectionError
        If the database is unreachable.
    """
```

### Type Hints as Documentation

```python
# Type hints tell you what a function expects and returns -- no guessing
def merge_users(
    primary: dict[str, str | int],
    secondary: dict[str, str | int],
    overwrite: bool = True,
) -> dict[str, str | int]:
    """Merge two user dictionaries. When overwrite is True, primary wins."""
    result = dict(secondary) if overwrite else dict(primary)
    source = primary if overwrite else secondary
    result.update(source)
    return result
```

### README.md Best Practices

Every project README should include:

```
# Project Name

One-paragraph description of what this project does.

## Installation

Step-by-step install instructions.

## Usage

Basic usage examples with code.

## Configuration

Environment variables, config files, etc.

## Development

How to set up the dev environment, run tests, contribute.

## License

MIT / Apache 2.0 / etc.
```

---

## 13.9 Version Control Best Practices

### Branch Naming

```
main                    # Production-ready code
develop                 # Integration branch
feature/user-auth       # New feature
feature/add-pagination  # Another feature
fix/login-redirect      # Bug fix
hotfix/security-patch   # Urgent production fix
release/1.2.0           # Release preparation
```

### Conventional Commits

```
feat: add user authentication system
fix: resolve race condition in task scheduler
docs: update API reference for v2 endpoints
refactor: extract validation into separate module
test: add integration tests for payment flow
chore: update dependencies to latest versions
perf: optimize database query for dashboard
fix!: change auth token format (BREAKING CHANGE)
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff-format
      - id: ruff
        args: [--fix]
```

```bash
# Install and run
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

### Code Review Checklist

| Check                    | Why It Matters                          |
|--------------------------|-----------------------------------------|
| Tests pass?              | No regressions                          |
| Type hints present?      | Catches bugs early                      |
| Error handling?          | Graceful failure                        |
| No hardcoded secrets?    | Security                                |
| Documentation updated?   | Future developers (including you)       |
| No dead code?            | Maintainability                         |
| Follows project style?   | Consistency                             |
| Small, focused changes?  | Easier to review and revert             |

---

## 13.10 Performance Optimization

### Profiling Tools

```python
# cProfile -- built-in, function-level profiling
import cProfile


def slow_function():
    total = 0
    for i in range(1_000_000):
        total += i ** 2
    return total


cProfile.run("slow_function()")
```

```bash
# line_profiler -- line-by-line profiling
pip install line_profiler

# Add @profile decorator to the function, then:
kernprof -l -v my_script.py

# py-spy -- sampling profiler (no code changes needed)
pip install py-spy
py-spy top --pid 12345
py-spy record -o profile.svg --pid 12345
```

### Memory Profiling

```python
# tracemalloc -- built-in memory tracking
import tracemalloc

tracemalloc.start()

# ... code to profile ...
data = [i ** 2 for i in range(1_000_000)]

snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics("lineno")

for stat in top_stats[:10]:
    print(stat)
```

### Common Optimizations

```python
# 1. Generators -- avoid building large lists in memory
# Bad
def get_squares(n: int) -> list[int]:
    return [i ** 2 for i in range(n)]

# Good -- lazy evaluation, O(1) memory
def get_squares(n: int):
    for i in range(n):
        yield i ** 2


# 2. __slots__ -- reduce memory per instance
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
# Uses ~40% less memory than a class with __dict__


# 3. functools.lru_cache -- memoize expensive calls
from functools import lru_cache


@lru_cache(maxsize=256)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


# 4. Built-in operations over manual loops
# Bad
total = 0
for x in data:
    total += x

# Good
total = sum(data)
```

### Benchmarking with timeit

```python
import timeit

# Compare two approaches
time1 = timeit.timeit(
    "[i ** 2 for i in range(1000)]",
    number=10000,
)
print(f"List comprehension: {time1:.4f}s")

time2 = timeit.timeit(
    "list(map(lambda i: i ** 2, range(1000)))",
    number=10000,
)
print(f"Map + lambda: {time2:.4f}s")
```

### Optimization Tools Summary

| Tool             | Purpose                    | Overhead   | Best For                      |
|------------------|----------------------------|------------|-------------------------------|
| `cProfile`       | Function-level profiling   | Low        | Finding slow functions        |
| `line_profiler`  | Line-by-line profiling     | High       | Finding slow lines            |
| `py-spy`         | Sampling profiler          | Very Low   | Production profiling          |
| `tracemalloc`    | Memory allocation tracking | Medium     | Memory leaks                  |
| `memory_profiler`| Per-line memory usage      | High       | Memory optimization           |
| `timeit`         | Micro-benchmarking         | None       | Comparing small code snippets |

---

## 13.11 Security Best Practices

### Input Validation

```python
from pydantic import BaseModel, Field, EmailStr


class CreateUserRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)
    role: str = Field(..., pattern=r"^(admin|user|guest)$")


# Pydantic validates automatically -- invalid data raises ValidationError
try:
    user = CreateUserRequest(name="", email="not-an-email", age=-5, role="hacker")
except Exception as e:
    print(e)
    # 3 validation errors for CreateUserRequest ...
```

### SQL Injection Prevention

```python
# NEVER do this -- SQL injection vulnerability
def get_user_bad(username: str) -> list:
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return db.execute(query)  # Hacker can inject: ' OR '1'='1


# ALWAYS use parameterized queries
def get_user_safe(username: str) -> list:
    return db.execute(
        "SELECT * FROM users WHERE username = %s",
        (username,),
    )
```

### Password Hashing

```python
from hashlib import pbkdf2_hmac
from secrets import token_bytes


def hash_password(password: str) -> tuple[str, str]:
    """Hash a password with a random salt. Returns (hash_hex, salt_hex)."""
    salt = token_bytes(16)
    key = pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        iterations=480_000,
    )
    return key.hex(), salt.hex()


def verify_password(password: str, stored_hash: str, salt_hex: str) -> bool:
    """Verify a password against a stored hash."""
    salt = bytes.fromhex(salt_hex)
    key = pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        iterations=480_000,
    )
    return key.hex() == stored_hash
```

### Environment Variables for Secrets

```python
# .env file (never commit this!)
# DATABASE_URL=postgresql://user:pass@localhost/mydb
# SECRET_KEY=your-super-secret-key
# API_KEY=sk-live-xxxxxxxxxxxx

# Load with python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]  # Raises KeyError if missing
SECRET_KEY = os.environ.get("SECRET_KEY", "")  # Default if missing
```

```gitignore
# .gitignore -- never commit secrets
.env
.env.local
.env.production
*.pem
*.key
```

### Dependency Auditing

```bash
# Check for known vulnerabilities
pip install pip-audit
pip-audit

# Or use safety
pip install safety
safety check

# Fix: update vulnerable packages
pip install --upgrade requests
```

### Common Vulnerabilities Summary

| Vulnerability        | Prevention                                      |
|----------------------|-------------------------------------------------|
| SQL Injection        | Parameterized queries, ORM                       |
| XSS                  | Escape output, use templating engines            |
| Secrets in code      | Environment variables, secret managers           |
| Insecure dependencies| `pip-audit`, `safety check`                     |
| Weak passwords       | `hashlib.pbkdf2_hmac` or `bcrypt`               |
| Path traversal       | `pathlib.Path.resolve()`, validate paths         |
| Pickle deserialization| Never unpickle untrusted data                   |
| CORS misconfiguration| Explicit allowed origins, not `*`               |

---

## Key Takeaways

1. **PEP 8 is not optional** -- consistent style makes codebases readable across teams and over time.
2. **Use auto-formatters** -- `ruff` or `black` eliminate style debates entirely.
3. **Clean code follows SOLID** -- small, focused, testable components are easier to maintain than monolithic classes.
4. **Design patterns solve recurring problems** -- but don't force patterns where simpler Python idioms suffice.
5. **Always use virtual environments** -- one global Python environment is a recipe for dependency conflicts.
6. **Prefer `uv` for new projects** -- it is the fastest, most modern Python dependency manager.
7. **Write docstrings** -- Google or NumPy style, consistently. Future-you will thank present-you.
8. **Use type hints everywhere** -- they serve as living documentation and catch bugs at import time.
9. **Profile before optimizing** -- use `cProfile` and `timeit` to find actual bottlenecks, not imagined ones.
10. **Security is not optional** -- parameterized queries, password hashing, and environment variables are minimum requirements.
11. **Use pre-commit hooks** -- catch formatting, linting, and security issues before they reach your repository.
12. **Write conventional commits** -- structured commit messages make `git log` genuinely useful.

---

## Practice Exercises

### Exercise 1: Refactor to SOLID

The following code violates multiple SOLID principles. Refactor it into clean, well-structured code.

```python
# BEFORE: This class does too many things and is hard to test

class ReportManager:
    def __init__(self):
        self.data = []
        self.format = "text"

    def load_data(self, filepath: str) -> None:
        import csv
        with open(filepath) as f:
            reader = csv.DictReader(f)
            self.data = list(reader)

    def filter_data(self, column: str, value: str) -> None:
        self.data = [row for row in self.data if row.get(column) == value]

    def format_text(self) -> str:
        lines = []
        for row in self.data:
            lines.append(" | ".join(str(v) for v in row.values()))
        return "\n".join(lines)

    def format_csv(self) -> str:
        import io, csv
        output = io.StringIO()
        if self.data:
            writer = csv.DictWriter(output, fieldnames=self.data[0].keys())
            writer.writeheader()
            writer.writerows(self.data)
        return output.getvalue()

    def format_json(self) -> str:
        import json
        return json.dumps(self.data, indent=2)

    def save(self, filepath: str) -> None:
        content = self.format_text() if self.format == "text" else (
            self.format_csv() if self.format == "csv" else self.format_json()
        )
        with open(filepath, "w") as f:
            f.write(content)

    def email_report(self, recipient: str) -> None:
        content = self.format_text()
        send_email(recipient, "Report", content)
```

**Tasks:**
- Apply the Single Responsibility Principle
- Apply the Open/Closed Principle for formatters
- Apply Dependency Inversion for data loading and output

### Exercise 2: Implement a Factory + Strategy

Build a notification system that supports email, SMS, and push notifications, with different retry strategies (immediate, exponential backoff, fixed interval).

```python
# Starter code -- fill in the implementations

from abc import ABC, abstractmethod


class Notification(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str) -> bool:
        ...


class RetryStrategy(ABC):
    @abstractmethod
    def execute(self, func, *args, **kwargs):
        ...


class NotificationFactory:
    """Create notifications by channel name."""
    ...


class RetryManager:
    """Execute a function with a retry strategy."""
    def __init__(self, strategy: RetryStrategy):
        ...

    def run(self, func, *args, max_retries=3, **kwargs):
        ...
```

### Exercise 3: Profile and Optimize

Profile the following function and optimize it. Use `cProfile` to find the bottleneck, then apply appropriate optimization techniques.

```python
# Starter code -- optimize this

def find_common_elements(list_a: list[int], list_b: list[int]) -> list[int]:
    """Find elements that appear in both lists."""
    result = []
    for item_a in list_a:
        for item_b in list_b:  # O(n*m) -- can you do better?
            if item_a == item_b and item_a not in result:
                result.append(item_a)
    return result


# Test with large lists
import random
a = random.sample(range(1_000_000), 100_000)
b = random.sample(range(1_000_000), 100_000)

print(find_common_elements(a, b))
```

### Exercise 4: Security Hardening

Rewrite the following insecure code to follow security best practices.

```python
# BEFORE: Insecure -- fix all vulnerabilities

import sqlite3
import pickle


def get_user(username: str) -> dict:
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    result = cursor.fetchone()
    conn.close()
    return {"name": result[0], "email": result[1]} if result else {}


def load_user_data(data_bytes: bytes) -> dict:
    """Load user data from a serialized blob."""
    return pickle.loads(data_bytes)


def check_password(plain: str, stored: str) -> bool:
    """Simple password check."""
    return plain == stored  # Plain-text comparison!
```

### Exercise 5: Build a Complete Project

Using the project structure from Section 13.5, create a small command-line tool that:
- Uses `pyproject.toml` for configuration
- Has proper `__init__.py` and `__all__` exports
- Includes docstrings in Google style
- Has at least 3 unit tests
- Uses virtual environments and pins dependencies

---

In the next chapter, we will explore **Testing and Test-Driven Development** -- because the best code is code that proves it works.
