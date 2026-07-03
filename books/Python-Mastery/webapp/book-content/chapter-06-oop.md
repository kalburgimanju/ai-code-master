# Chapter 6: Object-Oriented Programming

Object-oriented programming (OOP) is one of Python's most powerful paradigms. It allows you to model real-world entities as objects, bundle data and behavior together, and build complex systems from reusable, composable components. Python's OOP model is elegant and flexible—it supports classical inheritance while embracing duck typing, and its dataclasses and metaclass systems offer tools that range from pragmatic to deeply reflective.

In this chapter, you will learn how to define classes, work with inheritance hierarchies, overload operators, use properties and descriptors, create abstract base classes, leverage dataclasses, and even peek behind the curtain at metaclasses. We will close by grounding everything in the SOLID design principles and a thorough comparison of composition versus inheritance.

---

## 6.1 Classes and Objects

A **class** is a blueprint for creating objects. An **object** (or **instance**) is a concrete realization of that blueprint, with its own state (attributes) and behavior (methods).

### 6.1.1 Class Syntax

```python
class Dog:
    """A simple class representing a dog."""

    # Class attribute — shared by ALL instances
    species = "Canis familiaris"

    def __init__(self, name: str, age: int) -> None:
        """Initialize a new Dog instance."""
        # Instance attributes — unique to each instance
        self.name = name
        self.age = age
```

- `class Dog:` starts the class definition block.
- `__init__` is the **constructor** (initializer). It runs automatically when you create a new instance.
- `self` refers to the **specific instance** being created or operated on. Python passes it implicitly.
- **Class attributes** (like `species`) are defined directly in the class body and shared by all instances.
- **Instance attributes** (like `name` and `age`) are defined on `self` inside `__init__` and are unique to each instance.

### 6.1.2 Creating Instances and Attribute Access

```python
# Creating instances
buddy = Dog("Buddy", 5)
milo = Dog("Milo", 3)

# Attribute access
print(buddy.name)      # "Buddy"
print(milo.species)    # "Canis familialis" (from class attribute)
print(Dog.species)     # "Canis familiaris" (accessed directly on the class)
```

Each instance maintains its own namespace. Instance attributes shadow class attributes of the same name:

```python
buddy.species = "Labrador Retriever"
print(buddy.species)   # "Labrador Retriever" — instance attribute
print(milo.species)    # "Canis familiaris" — still the class attribute
print(Dog.species)     # "Canis familiaris" — unchanged
```

### 6.1.3 Docstrings

Both classes and instances can carry documentation:

```python
class Cat:
    """A class representing a domestic cat."""

    def __init__(self, name: str) -> None:
        """Initialize the cat with a name."""
        self.name = name

whiskers = Cat("Whiskers")

print(Cat.__doc__)      # "A class representing a domestic cat."
print(whiskers.__doc__) # "Initialize the cat with a name."  (inherited from __init__)
```

### 6.1.4 Class vs Object Relationship

```
┌─────────────────────────────────────────────┐
│              CLASS (Blueprint)              │
│                                             │
│   class Dog:                                │
│       species = "Canis familiaris"          │
│                                             │
│       def __init__(self, name, age):        │
│           ...                               │
│                                             │
│       def bark(self):                       │
│           ...                               │
└──────────┬──────────┬──────────┬────────────┘
           │          │          │
    ┌──────▼──┐ ┌─────▼───┐ ┌───▼─────┐
    │ Object  │ │ Object  │ │ Object  │
    │ ──────  │ │ ──────  │ │ ──────  │
    │ Buddy   │ │ Milo    │ │ Rex     │
    │ age=5   │ │ age=3   │ │ age=7   │
    └─────────┘ └─────────┘ └─────────┘
```

The class defines the structure; each object holds its own data.

---

## 6.2 Instance Methods

Instance methods are functions defined inside a class that operate on a specific instance. They always receive `self` as their first parameter.

### 6.2.1 Methods That Modify State

```python
class BankAccount:
    """A simple bank account."""

    def __init__(self, owner: str, balance: float = 0.0) -> None:
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float) -> None:
        """Add funds to the account."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.balance += amount

    def withdraw(self, amount: float) -> None:
        """Remove funds from the account."""
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount

    def get_balance(self) -> float:
        """Return the current balance."""
        return self.balance
```

```python
account = BankAccount("Alice", 1000)
account.deposit(500)
account.withdraw(200)
print(account.get_balance())  # 1300.0
```

### 6.2.2 Method Chaining

When a method returns `self`, you can chain multiple calls in a fluent style:

```python
class QueryBuilder:
    """A fluent query builder for demonstration."""

    def __init__(self) -> None:
        self._table = ""
        self._conditions: list[str] = []
        self._order_by = ""
        self._limit: int | None = None

    def from_table(self, table: str) -> "QueryBuilder":
        self._table = table
        return self

    def where(self, condition: str) -> "QueryBuilder":
        self._conditions.append(condition)
        return self

    def order(self, column: str) -> "QueryBuilder":
        self._order_by = column
        return self

    def limit(self, n: int) -> "QueryBuilder":
        self._limit = n
        return self

    def build(self) -> str:
        parts = [f"SELECT * FROM {self._table}"]
        if self._conditions:
            parts.append("WHERE " + " AND ".join(self._conditions))
        if self._order_by:
            parts.append(f"ORDER BY {self._order_by}")
        if self._limit is not None:
            parts.append(f"LIMIT {self._limit}")
        return " ".join(parts)
```

```python
query = (
    QueryBuilder()
    .from_table("users")
    .where("age > 18")
    .where("active = true")
    .order("name")
    .limit(10)
    .build()
)
print(query)
# SELECT * FROM users WHERE age > 18 AND active = true ORDER BY name LIMIT 10
```

---

## 6.3 Class Methods and Static Methods

Python provides three kinds of methods inside a class: **instance methods** (discussed above), **class methods**, and **static methods**.

### 6.3.1 Class Methods with `@classmethod`

A class method receives the **class itself** as the first argument (conventionally named `cls`). They are most commonly used as **factory methods**—alternative constructors that create instances in different ways.

```python
from datetime import date

class Employee:
    """An employee with factory methods for different creation patterns."""

    def __init__(self, name: str, salary: float, hire_date: date) -> None:
        self.name = name
        self.salary = salary
        self.hire_date = hire_date

    @classmethod
    def from_string(cls, data: str) -> "Employee":
        """Create an employee from a pipe-delimited string.

        Format: 'name|salary|YYYY-MM-DD'
        """
        name, salary_str, date_str = data.split("|")
        return cls(name, float(salary_str), date.fromisoformat(date_str))

    @classmethod
    def from_birth_year(cls, name: str, salary: float, year: int) -> "Employee":
        """Create an employee assuming a birth-year-based default hire date."""
        return cls(name, salary, date(year, 1, 1))

    def __repr__(self) -> str:
        return f"Employee({self.name!r}, salary={self.salary}, hired={self.hire_date})"
```

```python
emp1 = Employee.from_string("Alice|95000|2022-03-15")
emp2 = Employee.from_birth_year("Bob", 85000, 2023)

print(emp1)  # Employee('Alice', salary=95000, hired=2022-03-15)
print(emp2)  # Employee('Bob', salary=85000, hired=2023-01-01)
```

### 6.3.2 Static Methods with `@staticmethod`

A static method receives **neither** `self` nor `cls`. It is essentially a regular function that lives inside the class for namespace or organizational purposes.

```python
class MathUtils:
    """Utility functions related to mathematics."""

    @staticmethod
    def is_even(n: int) -> bool:
        return n % 2 == 0

    @staticmethod
    def factorial(n: int) -> int:
        if n < 0:
            raise ValueError("Negative numbers have no factorial")
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result
```

```python
print(MathUtils.is_even(4))     # True
print(MathUtils.factorial(5))   # 120
```

### 6.3.3 When to Use Each Type

| Method Type | First Arg | Access To | Typical Use Case |
|---|---|---|---|
| **Instance method** | `self` (instance) | Instance + class state | Mutate or read instance data |
| **Class method** | `cls` (class) | Class state only | Factory methods, alternative constructors |
| **Static method** | None | Nothing implicit | Utility/helper functions that belong logically to the class |

**Rule of thumb:** If the method needs to access or modify instance-specific data, use an instance method. If it only needs the class itself (e.g., to create a new instance), use a class method. If it needs neither `self` nor `cls` but logically belongs in the class namespace, use a static method.

---

## 6.4 Inheritance

Inheritance lets you create a new class (**child** or **derived class**) from an existing class (**parent** or **base class**). The child inherits attributes and methods from the parent, and can add new ones or override existing ones.

### 6.4.1 Single Inheritance

```python
class Animal:
    """Base class for all animals."""

    def __init__(self, name: str) -> None:
        self.name = name

    def speak(self) -> str:
        return "..."

    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.name!r})"


class Cat(Animal):
    """A cat that inherits from Animal."""

    def __init__(self, name: str, indoor: bool = True) -> None:
        super().__init__(name)  # Call the parent's __init__
        self.indoor = indoor

    def speak(self) -> str:  # Override parent method
        return "Meow!"


class Dog(Animal):
    """A dog that inherits from Animal."""

    def __init__(self, name: str, breed: str) -> None:
        super().__init__(name)
        self.breed = breed

    def speak(self) -> str:
        return "Woof!"

    def fetch(self, item: str) -> str:  # New method only on Dog
        return f"{self.name} fetches the {item}"
```

```python
cat = Cat("Whiskers")
dog = Dog("Rex", "Labrador")

print(cat.speak())          # "Meow!"
print(dog.speak())          # "Woof!"
print(dog.fetch("ball"))    # "Rex fetches the ball"
print(isinstance(cat, Cat))  # True
print(isinstance(cat, Animal))  # True (inheritance chain)
print(issubclass(Dog, Animal))  # True
```

### 6.4.2 Method Resolution Order (MRO)

When you call a method on an instance, Python searches for it in a specific order defined by the **Method Resolution Order (MRO)**. You can inspect it:

```python
print(Dog.__mro__)
# (<class 'Dog'>, <class 'Animal'>, <class 'object'>)
```

The MRO always ends with `object`, and Python uses the **C3 linearization** algorithm to compute it.

### 6.4.3 The Diamond Problem

The diamond problem arises when a class inherits from two classes that share a common ancestor:

```
          ┌─────────┐
          │  Base   │
          └────┬────┘
           ┌───┴───┐
     ┌─────▼──┐ ┌──▼─────┐
     │ Left   │ │ Right  │
     └────┬───┘ └───┬────┘
          └────┬────┘
         ┌─────▼─────┐
         │  Diamond  │
         └───────────┘
```

```python
class Base:
    def greet(self) -> str:
        return "Hello from Base"


class Left(Base):
    def greet(self) -> str:
        return "Hello from Left"


class Right(Base):
    def greet(self) -> str:
        return "Hello from Right"


class Diamond(Left, Right):
    pass


d = Diamond()
print(d.greet())           # "Hello from Left"
print(Diamond.__mro__)
# (<class 'Diamond'>, <class 'Left'>, <class 'Right'>, <class 'Base'>, <class 'object'>)
```

Python resolves the diamond by linearizing the MRO: `Diamond → Left → Right → Base → object`. `Left` wins because it appears first in the class declaration `class Diamond(Left, Right)`.

### 6.4.4 Using `super()` Correctly

`super()` does not simply call "the parent method." It follows the MRO. In cooperative multiple inheritance, this is essential:

```python
class A:
    def process(self) -> str:
        return "A"


class B(A):
    def process(self) -> str:
        return "B -> " + super().process()


class C(A):
    def process(self) -> str:
        return "C -> " + super().process()


class D(B, C):
    def process(self) -> str:
        return "D -> " + super().process()


d = D()
print(d.process())  # "D -> B -> C -> A"
print(D.__mro__)    # D → B → C → A → object
```

Each `super()` call delegates to the **next class in the MRO**, forming a cooperative chain.

---

## 6.5 Polymorphism and Duck Typing

**Polymorphism** means "many forms"—the same interface or operation can work with different types. Python achieves this both through class-based overriding and through **duck typing**.

### 6.5.1 Duck Typing

> *"If it walks like a duck and quacks like a duck, it's a duck."*

In Python, what matters is whether an object has the required attributes and methods—not its actual type:

```python
class鸭子:  # "Duck" in Chinese (demonstrating even non-English names work)
    def quack(self) -> str:
        return "Quack!"


class Person:
    def quack(self) -> str:
        return "I'm quacking like a duck!"


class FakeDuck:
    def quack(self) -> str:
        return "Fake quack!"
```

```python
def make_it_quack(thing) -> None:
    """Works with ANY object that has a quack() method."""
    print(thing.quack())

# This works — no inheritance needed, no interface declared
make_it_quack(鸭子())
make_it_quack(Person())
make_it_quack(FakeDuck())
```

### 6.5.2 Operator Overloading

You can make custom objects respond to built-in operators by implementing special dunder methods:

```python
class Vector:
    """A 2D vector that supports arithmetic operators."""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __repr__(self) -> str:
        return f"Vector({self.x}, {self.y})"
```

```python
v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2
print(v3)       # Vector(4, 6)
print(v1 == v2) # False
```

### 6.5.3 Runtime Dispatch

Python resolves method calls at **runtime** based on the actual object type, not the declared variable type:

```python
class Formatter:
    def format(self, value: object) -> str:
        raise NotImplementedError


class CurrencyFormatter(Formatter):
    def format(self, value: object) -> str:
        return f"${value:,.2f}"


class PercentFormatter(Formatter):
    def format(self, value: object) -> str:
        return f"{value:.1%}"


def display(formatter: Formatter, value: float) -> None:
    print(formatter.format(value))


display(CurrencyFormatter(), 1234.56)  # "$1,234.56"
display(PercentFormatter(), 0.857)     # "85.7%"
```

---

## 6.6 Dunder / Magic Methods

Dunder (double underscore) methods are special methods recognized by Python's built-in operations. They let you define how instances of your classes behave with built-in functions and operators.

### 6.6.1 Comprehensive Reference Table

| Dunder Method | Triggered By | Purpose |
|---|---|---|
| `__init__(self, ...)` | `MyClass(...)` | Initialize a new instance |
| `__new__(cls, ...)` | `MyClass(...)` (before `__init__`) | Create the instance (rarely overridden) |
| `__repr__(self)` | `repr(obj)`, REPL display | Unambiguous string representation |
| `__str__(self)` | `str(obj)`, `print(obj)` | User-friendly string representation |
| `__len__(self)` | `len(obj)` | Return the length/size |
| `__eq__(self, other)` | `obj1 == obj2` | Equality comparison |
| `__ne__(self, other)` | `obj1 != obj2` | Inequality comparison |
| `__lt__(self, other)` | `obj1 < obj2` | Less-than comparison |
| `__le__(self, other)` | `obj1 <= obj2` | Less-than-or-equal comparison |
| `__gt__(self, other)` | `obj1 > obj2` | Greater-than comparison |
| `__ge__(self, other)` | `obj1 >= obj2` | Greater-than-or-equal comparison |
| `__hash__(self)` | `hash(obj)` | Hash value (required if `__eq__` is defined) |
| `__bool__(self)` | `bool(obj)`, `if obj:` | Truth value testing |
| `__add__(self, other)` | `obj1 + obj2` | Addition |
| `__sub__(self, other)` | `obj1 - obj2` | Subtraction |
| `__mul__(self, other)` | `obj1 * obj2` | Multiplication |
| `__truediv__(self, other)` | `obj1 / obj2` | Division |
| `__floordiv__(self, other)` | `obj1 // obj2` | Floor division |
| `__mod__(self, other)` | `obj1 % obj2` | Modulo |
| `__pow__(self, other)` | `obj1 ** obj2` | Exponentiation |
| `__contains__(self, item)` | `item in obj` | Membership testing |
| `__getitem__(self, key)` | `obj[key]` | Indexing / subscription |
| `__setitem__(self, key, val)` | `obj[key] = val` | Item assignment |
| `__delitem__(self, key)` | `del obj[key]` | Item deletion |
| `__iter__(self)` | `for x in obj:` | Return an iterator |
| `__next__(self)` | `next(obj)` | Get the next item from an iterator |
| `__enter__(self)` | `with obj as x:` | Enter a context manager |
| `__exit__(self, *exc)` | End of `with` block | Exit a context manager |
| `__call__(self, ...)` | `obj(...)` | Make the instance callable |
| `__copy__(self)` | `copy.copy(obj)` | Shallow copy |
| `__deepcopy__(self, memo)` | `copy.deepcopy(obj)` | Deep copy |

### 6.6.2 `__str__` vs `__repr__`

```python
class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        """Unambiguous: should look like valid Python to recreate the object."""
        return f"Point({self.x}, {self.y})"

    def __str__(self) -> str:
        """Human-friendly: readable output for end users."""
        return f"({self.x}, {self.y})"

p = Point(3, 4)
print(repr(p))  # Point(3, 4)   — for developers / debugging
print(str(p))   # (3, 4)        — for users
```

### 6.6.3 Comparison and Hashing

```python
from functools import total_ordering

@total_ordering
class Temperature:
    """A temperature value in Celsius with full comparison support."""

    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Temperature):
            return NotImplemented
        return self.celsius == other.celsius

    def __lt__(self, other: "Temperature") -> bool:
        return self.celsius < other.celsius

    def __hash__(self) -> int:
        return hash(self.celsius)

    def __repr__(self) -> str:
        return f"Temperature({self.celsius}°C)"
```

Using `@total_ordering` from `functools` auto-generates `__le__`, `__gt__`, `__ge__` from `__eq__` and `__lt__`.

### 6.6.4 Context Manager Protocol (`__enter__` / `__exit__`)

```python
import time


class Timer:
    """A context manager that measures execution time."""

    def __enter__(self) -> "Timer":
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f} seconds")
```

```python
with Timer() as t:
    total = sum(range(1_000_000))
print(f"Result: {total}")
# Elapsed: 0.0xxx seconds
```

### 6.6.5 Callable Objects with `__call__`

```python
class Multiplier:
    """A callable that multiplies by a fixed factor."""

    def __init__(self, factor: float) -> None:
        self.factor = factor

    def __call__(self, value: float) -> float:
        return value * self.factor

double = Multiplier(2)
triple = Multiplier(3)

print(double(5))   # 10
print(triple(5))   # 15
print(callable(double))  # True
```

### 6.6.6 Complete Vector Class Example

```python
import math
from typing import Iterator


class Vector:
    """A 2D vector with a rich set of dunder methods."""

    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

    # ── String representations ──────────────────────────────
    def __repr__(self) -> str:
        return f"Vector({self.x!r}, {self.y!r})"

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"

    # ── Arithmetic ──────────────────────────────────────────
    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other: "Vector") -> "Vector":
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> "Vector":
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> "Vector":
        return self.__mul__(scalar)

    def __neg__(self) -> "Vector":
        return Vector(-self.x, -self.y)

    def __abs__(self) -> float:
        return math.hypot(self.x, self.y)

    # ── Equality and hashing ────────────────────────────────
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self) -> int:
        return hash((self.x, self.y))

    # ── Iteration and length ────────────────────────────────
    def __iter__(self) -> Iterator[float]:
        yield self.x
        yield self.y

    def __len__(self) -> int:
        return 2

    # ── Indexing ────────────────────────────────────────────
    def __getitem__(self, index: int) -> float:
        if index == 0:
            return self.x
        if index == 1:
            return self.y
        raise IndexError("Vector index out of range")

    # ── Bool ────────────────────────────────────────────────
    def __bool__(self) -> bool:
        return self.x != 0.0 or self.y != 0.0

    # ── Utility ─────────────────────────────────────────────
    def dot(self, other: "Vector") -> float:
        return self.x * other.x + self.y * other.y

    def normalize(self) -> "Vector":
        magnitude = abs(self)
        if magnitude == 0:
            raise ValueError("Cannot normalize a zero vector")
        return self * (1.0 / magnitude)
```

```python
v1 = Vector(3, 4)
v2 = Vector(1, 2)

print(v1 + v2)        # (4, 6)
print(v1 - v2)        # (2, 2)
print(v1 * 3)         # (9, 12)
print(3 * v1)         # (9, 12)
print(abs(v1))         # 5.0
print(v1.dot(v2))     # 11
print(list(v1))        # [3, 4]
print(v1[0], v1[1])   # 3 4
print(bool(Vector(0, 0)))  # False

# Unpacking works because of __iter__
x, y = v1
print(f"x={x}, y={y}")  # x=3, y=4

# Comparisons and hashing
print(v1 == Vector(3, 4))   # True
print(hash(v1) == hash(Vector(3, 4)))  # True
vectors = {v1, v2}
print(Vector(3, 4) in vectors)  # True
```

---

## 6.7 Properties and Descriptors

Properties let you control attribute access with getter, setter, and deleter methods—while keeping the public API looking like simple attribute access.

### 6.7.1 The `@property` Decorator

```python
class Circle:
    """A circle with radius validation."""

    def __init__(self, radius: float) -> None:
        self._radius = radius  # Set via the property setter

    @property
    def radius(self) -> float:
        """Get the radius."""
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        """Set the radius with validation."""
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value

    @radius.deleter
    def radius(self) -> None:
        """Delete the radius."""
        print("Deleting radius")
        del self._radius

    @property
    def area(self) -> float:
        """Computed read-only property."""
        return math.pi * self._radius ** 2

    @property
    def circumference(self) -> float:
        return 2 * math.pi * self._radius
```

```python
c = Circle(5)
print(c.radius)          # 5
print(c.area)            # 78.53981633974483
c.radius = 10
print(c.circumference)   # 62.83185307179586

try:
    c.radius = -1
except ValueError as e:
    print(e)  # "Radius must be positive"
```

### 6.7.2 Property vs Direct Attribute Access

| Aspect | Direct Attribute | Property |
|---|---|---|
| Validation | None | Full control in getter/setter |
| Computed values | Not possible | Lazily computed on access |
| Backward compatibility | Breaking if internal format changes | Smooth migration path |
| Performance | O(1) attribute lookup | Slight overhead (method call) |
| Read-only attributes | Not enforceable | Define only `@property` (no setter) |
| Side effects | None | Can trigger events, logging, etc. |

### 6.7.3 The Descriptor Protocol

Properties are built on the **descriptor protocol**. Any object implementing `__get__`, `__set__`, or `__delete__` is a descriptor:

```python
class Validated:
    """A descriptor that validates values on assignment."""

    def __init__(self, min_value: float = 0, max_value: float = 100) -> None:
        self.min_value = min_value
        self.max_value = max_value
        self.name = ""  # Set by the owning class

    def __set_name__(self, owner: type, name: str) -> None:
        """Called when the descriptor is assigned to a class attribute."""
        self.name = name

    def __get__(self, obj: object, objtype: type | None = None) -> float:
        if obj is None:
            return self
        return getattr(obj, f"_{self.name}", 0.0)

    def __set__(self, obj: object, value: float) -> None:
        if not self.min_value <= value <= self.max_value:
            raise ValueError(
                f"{self.name} must be between {self.min_value} and {self.max_value}"
            )
        setattr(obj, f"_{self.name}", value)


class ExamScore:
    """A class using validated descriptors."""
    score = Validated(min_value=0, max_value=100)
    bonus = Validated(min_value=0, max_value=50)

    def __init__(self, score: float, bonus: float = 0) -> None:
        self.score = score
        self.bonus = bonus
```

```python
exam = ExamScore(85, 10)
print(exam.score)   # 85
exam.score = 150    # ValueError: score must be between 0 and 100
```

---

## 6.8 Abstract Base Classes

An **Abstract Base Class** (ABC) defines an interface that subclasses **must** implement. It cannot be instantiated directly and enforces contracts at the class level.

### 6.8.1 Using `abc.ABC` and `@abstractmethod`

```python
from abc import ABC, abstractmethod


class Shape(ABC):
    """Abstract base class for all shapes."""

    @abstractmethod
    def area(self) -> float:
        """Calculate the area of the shape."""
        ...

    @abstractmethod
    def perimeter(self) -> float:
        """Calculate the perimeter of the shape."""
        ...

    def describe(self) -> str:
        """Concrete method — available to all subclasses."""
        return f"{type(self).__name__}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"


class Circle(Shape):
    def __init__(self, radius: float) -> None:
        self.radius = radius

    def area(self) -> float:
        return math.pi * self.radius ** 2

    def perimeter(self) -> float:
        return 2 * math.pi * self.radius


class Rectangle(Shape):
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)


class Triangle(Shape):
    def __init__(self, a: float, b: float, c: float) -> None:
        self.a = a
        self.b = b
        self.c = c

    def area(self) -> float:
        s = (self.a + self.b + self.c) / 2
        return math.sqrt(s * (s - self.a) * (s - self.b) * (s - self.c))

    def perimeter(self) -> float:
        return self.a + self.b + self.c
```

```python
# This would raise TypeError: Can't instantiate abstract class Shape
# shape = Shape()

circle = Circle(5)
rect = Rectangle(4, 6)
tri = Triangle(3, 4, 5)

for shape in [circle, rect, tri]:
    print(shape.describe())
# Circle: area=78.54, perimeter=31.42
# Rectangle: area=24.00, perimeter=20.00
# Triangle: area=6.00, perimeter=12.00
```

### 6.8.2 Registering Virtual Subclasses

You can mark a class as a subclass of an ABC **without** requiring inheritance. This is useful for duck-typed or third-party classes:

```python
from abc import ABC, abstractmethod


class Jsonifiable(ABC):
    @abstractmethod
    def to_json(self) -> str: ...


class ApiResult:
    """A third-party class we cannot modify."""
    def __init__(self, data: dict) -> None:
        self.data = data

    def to_json(self) -> str:
        import json
        return json.dumps(self.data)


# Register without inheritance
Jsonifiable.register(ApiResult)

result = ApiResult({"status": "ok"})
print(isinstance(result, Jsonifiable))  # True
```

---

## 6.9 Dataclasses

`dataclasses` (introduced in Python 3.7) reduce boilerplate for classes that primarily store data. The decorator auto-generates `__init__`, `__repr__`, `__eq__`, and more.

### 6.9.1 Basic Usage

```python
from dataclasses import dataclass, field


@dataclass
class Point:
    """A 2D point."""
    x: float
    y: float


@dataclass
class User:
    """A user with a default role and a dynamic membership list."""
    name: str
    email: str
    role: str = "viewer"                                  # default value
    tags: list[str] = field(default_factory=list)         # mutable default
```

```python
p1 = Point(3, 4)
p2 = Point(3, 4)
print(p1)                    # Point(x=3, y=4)  — auto __repr__
print(p1 == p2)              # True              — auto __eq__

user = User("Alice", "alice@example.com")
print(user)                  # User(name='Alice', email='alice@example.com', role='viewer', tags=[])
user.tags.append("admin")
print(user.tags)             # ['admin']
```

### 6.9.2 Common Field Options

```python
from dataclasses import dataclass, field


@dataclass
class Config:
    # Simple default
    host: str = "localhost"
    port: int = 8080

    # default_factory for mutable objects
    headers: dict[str, str] = field(default_factory=dict)

    # Exclude from __repr__
    password: str = field(repr=False)

    # Exclude from __eq__
    request_id: int = field(compare=False)

    # Immutable field
    version: str = field(default="1.0", init=False)
```

### 6.9.3 Frozen Dataclasses

A frozen dataclass is **immutable**—you cannot assign to its fields after creation:

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Coordinate:
    lat: float
    lon: float


c = Coordinate(40.7128, -74.0060)
print(c)  # Coordinate(lat=40.7128, lon=-74.006)

try:
    c.lat = 0.0
except AttributeError as e:
    print(e)  # "cannot assign to field 'lat'"
```

### 6.9.4 `__post_init__`

Sometimes you need to compute derived fields or validate after `__init__`:

```python
from dataclasses import dataclass


@dataclass
class Rectangle:
    width: float
    height: float

    def __post_init__(self) -> None:
        if self.width <= 0 or self.height <= 0:
            raise ValueError("Dimensions must be positive")
        self.area = self.width * self.height  # derived field
```

```python
r = Rectangle(5, 3)
print(r.area)  # 15
```

### 6.9.5 Inheritance with Dataclasses

Dataclasses support inheritance, but be cautious with field ordering (parent fields must have defaults only if child fields do):

```python
from dataclasses import dataclass, field


@dataclass
class Animal:
    name: str
    sound: str


@dataclass
class Dog(Animal):
    breed: str
    tricks: list[str] = field(default_factory=list)


dog = Dog("Rex", "Woof", "Labrador", ["sit", "shake"])
print(dog)  # Dog(name='Rex', sound='Woof', breed='Labrador', tricks=['sit', 'shake'])
```

### 6.9.6 Comparison: Dataclass vs Regular Class vs NamedTuple

| Feature | `@dataclass` | Regular Class | `NamedTuple` |
|---|---|---|---|
| `__init__` | Auto-generated | Manual | Auto-generated |
| `__repr__` | Auto-generated | Manual | Auto-generated |
| `__eq__` | Auto-generated (field-by-field) | Identity (unless overridden) | Auto-generated (field-by-field) |
| Mutability | Mutable by default | Configurable | Immutable |
| Inheritance | Supported | Supported | Limited (no default after non-default) |
| Type hints | Required (drive behavior) | Optional | Required (drive behavior) |
| `__slots__` | Supported via `slots=True` | Manual | Always (named tuples are tuples) |
| Memory | Standard | Standard | More efficient |
| Boilerplate | Minimal | High | Minimal |
| Best for | Data-holding classes | Behavior-heavy classes | Lightweight immutable records |

---

## 6.10 Metaclasses

A **metaclass** is the "class of a class." Just as a class defines how instances behave, a metaclass defines how classes behave. By default, Python's metaclass is `type`.

### 6.10.1 `type()` as a Metaclass

You can create classes dynamically using `type()`:

```python
# type(name, bases, namespace) → class
Greeting = type("Greeting", (), {"greet": lambda self: "Hello!"})
g = Greeting()
print(g.greet())  # "Hello!"
print(type(Greeting))  # <class 'type'>
```

### 6.10.2 `__new__` vs `__init__` on a Metaclass

| Method | Called On | Purpose |
|---|---|---|
| `metaclass.__new__(mcs, name, bases, namespace)` | Creates the **class** object | Modify or validate the class before it's created |
| `metaclass.__init__(cls, name, bases, namespace)` | Initializes the **class** object | Post-creation adjustments |
| `class.__new__(cls, ...)` | Creates an **instance** of the class | Object creation (rarely overridden) |
| `class.__init__(self, ...)` | Initializes an **instance** of the class | Object initialization (most common) |

### 6.10.3 Custom Metaclass Example

A metaclass that enforces that all classes have a `version` attribute:

```python
class VersionedMeta(type):
    """A metaclass that requires a 'version' class attribute."""

    def __new__(
        mcs, name: str, bases: tuple[type, ...], namespace: dict
    ) -> "VersionedMeta":
        # Skip check for the base class itself
        if bases:
            if "version" not in namespace:
                raise TypeError(
                    f"Class {name!r} must define a 'version' class attribute"
                )
        return super().__new__(mcs, name, bases, namespace)


class Versioned(metaclass=VersionedMeta):
    pass


class MyService(Versioned):
    version = "1.0.0"
    # This works fine


try:
    class BadService(Versioned):
        pass  # Missing 'version' — raises TypeError
except TypeError as e:
    print(e)  # "Class 'BadService' must define a 'version' class attribute"
```

### 6.10.4 Class Decorator as Alternative

For many use cases, a **class decorator** achieves the same result with less complexity:

```python
def add_repr(cls: type) -> type:
    """A class decorator that adds a __repr__ method."""
    def __repr__(self) -> str:
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls


@add_repr
class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


print(Point(1, 2))  # Point(x=1, y=2)
```

### 6.10.5 Metaclass Creation Flow

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                     CLASS CREATION FLOW                         │
  │                                                                  │
  │  1. Python reads: class MyClass(Base): ...                       │
  │                              │                                   │
  │  2. Python calls metaclass.__new__(mcs, name, bases, ns)        │
  │     └── Creates the class object                                 │
  │                              │                                   │
  │  3. Python calls metaclass.__init__(cls, name, bases, ns)       │
  │     └── Initializes the class object                             │
  │                              │                                   │
  │  4. Python calls class.__init_subclass__(**kwargs)              │
  │     └── Notifies parent classes of subclassing                  │
  │                              │                                   │
  │  5. The class is ready for use                                   │
  │                                                                  │
  │  When you then call: obj = MyClass()                             │
  │  6. Python calls MyClass.__new__(MyClass) → creates instance     │
  │  7. Python calls MyClass.__init__(obj) → initializes instance    │
  └──────────────────────────────────────────────────────────────────┘
```

---

## 6.11 SOLID Principles in Python

The SOLID principles are five design guidelines that help you write maintainable, flexible, and robust object-oriented code.

### 6.11.1 Single Responsibility Principle (SRP)

> *A class should have only one reason to change.*

**Bad — two responsibilities tangled together:**

```python
class Employee:
    def __init__(self, name: str, salary: float) -> None:
        self.name = name
        self.salary = salary

    def calculate_pay(self) -> float:
        return self.salary / 12

    def generate_report(self) -> str:
        return f"Report for {self.name}: ${self.calculate_pay():,.2f}"

    def save_to_database(self) -> None:
        print(f"Saving {self.name} to database...")
```

**Good — each class has one reason to change:**

```python
class Employee:
    def __init__(self, name: str, salary: float) -> None:
        self.name = name
        self.salary = salary

    def calculate_pay(self) -> float:
        return self.salary / 12


class ReportGenerator:
    def generate(self, employee: Employee) -> str:
        return f"Report for {employee.name}: ${employee.calculate_pay():,.2f}"


class EmployeeRepository:
    def save(self, employee: Employee) -> None:
        print(f"Saving {employee.name} to database...")
```

### 6.11.2 Open/Closed Principle (OCP)

> *Software entities should be open for extension but closed for modification.*

**Bad — must modify existing code to add new shape types:**

```python
def area(shape) -> float:
    if shape["type"] == "circle":
        return 3.14159 * shape["radius"] ** 2
    elif shape["type"] == "rectangle":
        return shape["width"] * shape["height"]
    # Must add more elif branches for each new shape — violates OCP
```

**Good — extend via new classes, never modify existing code:**

```python
from abc import ABC, abstractmethod


class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...


class Circle(Shape):
    def __init__(self, radius: float) -> None:
        self.radius = radius

    def area(self) -> float:
        return math.pi * self.radius ** 2


class Rectangle(Shape):
    def __init__(self, width: float, height: float) -> None:
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height


class Triangle(Shape):
    def __init__(self, base: float, height: float) -> None:
        self.base = base
        self.height = height

    def area(self) -> float:
        return 0.5 * self.base * self.height


def total_area(shapes: list[Shape]) -> float:
    return sum(s.area() for s in shapes)  # Works for any future Shape
```

### 6.11.3 Liskov Substitution Principle (LSP)

> *Subtypes must be substitutable for their base types without altering the correctness of the program.*

**Bad — `Sparrow` breaks the contract of `Bird`:**

```python
class Bird:
    def fly(self) -> str:
        return "Flying"


class Sparrow(Bird):
    def fly(self) -> str:
        return "Swooping through the air"


class Penguin(Bird):
    def fly(self) -> str:
        raise NotImplementedError("Penguins cannot fly!")  # ← BREAKS substitution
```

**Good — design the hierarchy so all subtypes honor the contract:**

```python
class Bird(ABC):
    @abstractmethod
    def move(self) -> str: ...


class Sparrow(Bird):
    def move(self) -> str:
        return "Flying through the air"


class Penguin(Bird):
    def move(self) -> str:
        return "Swimming in the water"


def describe_movement(bird: Bird) -> None:
    print(bird.move())  # Always works, regardless of subclass
```

### 6.11.4 Interface Segregation Principle (ISP)

> *Clients should not be forced to depend on interfaces they do not use.*

**Bad — a fat interface forces implementations to carry dead weight:**

```python
class Worker(ABC):
    @abstractmethod
    def work(self) -> str: ...

    @abstractmethod
    def eat(self) -> str: ...

    @abstractmethod
    def sleep(self) -> str: ...


class Robot(Worker):
    def work(self) -> str:
        return "Building widgets"

    def eat(self) -> str:
        raise NotImplementedError("Robots don't eat!")  # ← Forced to implement

    def sleep(self) -> str:
        raise NotImplementedError("Robots don't sleep!")  # ← Forced to implement
```

**Good — split into focused interfaces:**

```python
class Workable(ABC):
    @abstractmethod
    def work(self) -> str: ...


class Feedable(ABC):
    @abstractmethod
    def eat(self) -> str: ...


class Sleepable(ABC):
    @abstractmethod
    def sleep(self) -> str: ...


class Human(Workable, Feedable, Sleepable):
    def work(self) -> str:
        return "Writing code"

    def eat(self) -> str:
        return "Eating lunch"

    def sleep(self) -> str:
        return "Sleeping 8 hours"


class Robot(Workable):  # Only implements what it needs
    def work(self) -> str:
        return "Building widgets"
```

### 6.11.5 Dependency Inversion Principle (DIP)

> *High-level modules should not depend on low-level modules. Both should depend on abstractions.*

**Bad — high-level class depends directly on a concrete low-level class:**

```python
class MySQLDatabase:
    def query(self, sql: str) -> list[dict]:
        print(f"MySQL executing: {sql}")
        return [{"id": 1}]


class UserService:
    def __init__(self) -> None:
        self.db = MySQLDatabase()  # ← tightly coupled

    def get_users(self) -> list[dict]:
        return self.db.query("SELECT * FROM users")
```

**Good — both depend on an abstraction:**

```python
class Database(ABC):
    @abstractmethod
    def query(self, sql: str) -> list[dict]: ...


class MySQLDatabase(Database):
    def query(self, sql: str) -> list[dict]:
        print(f"MySQL executing: {sql}")
        return [{"id": 1}]


class PostgresDatabase(Database):
    def query(self, sql: str) -> list[dict]:
        print(f"PostgreSQL executing: {sql}")
        return [{"id": 1}, {"id": 2}]


class UserService:
    def __init__(self, db: Database) -> None:
        self.db = db  # ← depends on abstraction, not implementation

    def get_users(self) -> list[dict]:
        return self.db.query("SELECT * FROM users")


# Easy to swap implementations
service = UserService(PostgresDatabase())
```

---

## 6.12 Composition vs Inheritance

Inheritance creates an **is-a** relationship. Composition creates a **has-a** relationship. Choosing between them is one of the most important design decisions in OOP.

### 6.12.1 When to Prefer Composition

| Use Inheritance When | Use Composition When |
|---|---|
| The subclass truly **is a** kind of the parent | The class **has a** component that provides functionality |
| You need to reuse code from the parent class | You want to swap implementations at runtime |
| The hierarchy is shallow (1–2 levels) deep | The hierarchy would be deep or wide |
| Subclasses share the same interface contract | Components have different lifecycles |
| You control both the base and derived classes | You're wrapping a third-party or external component |

### 6.12.2 Has-a vs Is-a Relationship

```python
# ── IS-A (Inheritance) ──────────────────────────────────────
class Animal:
    def speak(self) -> str:
        raise NotImplementedError

class Dog(Animal):       # Dog IS-A Animal
    def speak(self) -> str:
        return "Woof!"

# ── HAS-A (Composition) ─────────────────────────────────────
class Engine:
    def start(self) -> str:
        return "Engine started"

class Wheels:
    def roll(self) -> str:
        return "Wheels rolling"

class Car:               # Car HAS-A Engine, HAS-A Wheels
    def __init__(self) -> None:
        self.engine = Engine()
        self.wheels = Wheels()

    def drive(self) -> str:
        return f"{self.engine.start()} and {self.wheels.roll()}"
```

### 6.12.3 Practical Comparison

Let's build the same feature both ways and compare.

**Approach 1: Inheritance**

```python
class JSONLogger:
    def log(self, message: str) -> None:
        print(f'{{"message": "{message}"}}')


class FileJSONLogger(JSONLogger):
    """Inherits logging AND file handling — two responsibilities."""
    def __init__(self, path: str) -> None:
        self.path = path

    def log(self, message: str) -> None:
        import json
        with open(self.path, "a") as f:
            f.write(json.dumps({"message": message}) + "\n")
```

This works, but the logger is tightly bound to JSON format. Want CSV logging? Another subclass. Want both file and console? Multiple inheritance or a third class.

**Approach 2: Composition**

```python
from abc import ABC, abstractmethod


class Formatter(ABC):
    @abstractmethod
    def format(self, message: str) -> str: ...


class JsonFormatter(Formatter):
    def format(self, message: str) -> str:
        import json
        return json.dumps({"message": message})


class CsvFormatter(Formatter):
    def format(self, message: str) -> str:
        return f'"{message}"'


class TextFormatter(Formatter):
    def format(self, message: str) -> str:
        return message


class Destination(ABC):
    @abstractmethod
    def write(self, data: str) -> None: ...


class ConsoleDestination(Destination):
    def write(self, data: str) -> None:
        print(data)


class FileDestination(Destination):
    def __init__(self, path: str) -> None:
        self.path = path

    def write(self, data: str) -> None:
        with open(self.path, "a") as f:
            f.write(data + "\n")


class Logger:
    """A composable logger that mixes and matches formatters + destinations."""
    def __init__(self, formatter: Formatter, destination: Destination) -> None:
        self.formatter = formatter
        self.destination = destination

    def log(self, message: str) -> None:
        formatted = self.formatter.format(message)
        self.destination.write(formatted)
```

```python
# Mix and match freely:
json_console = Logger(JsonFormatter(), ConsoleDestination())
csv_file = Logger(CsvFormatter(), FileDestination("log.csv"))
json_file = Logger(JsonFormatter(), FileDestination("log.json"))

json_console.log("User logged in")   # {"message": "User logged in"}
csv_file.log("Order placed")         # writes to log.csv
```

Composition is more flexible: adding new formatters or destinations requires **zero changes** to the `Logger` class. This adheres to the Open/Closed Principle.

### 6.12.4 Decision Flowchart

```
  ┌─────────────────────────────────────────────────────┐
  │         Should I use inheritance or composition?     │
  └──────────────────────┬──────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │ Is it a clear        │
              │ IS-A relationship?   │
              └──────┬───────┬──────┘
                 Yes │       │ No
                     │       │
              ┌──────▼──┐ ┌──▼───────────┐
              │ Use     │ │ Use          │
              │Inherit. │ │ Composition  │
              └─────────┘ └──────────────┘
                     │
              ┌──────▼──────────────┐
              │ Will subclasses need │
              │ to change behavior   │
              │ of the parent?       │
              └──────┬───────┬──────┘
                 Yes │       │ No
                     │       │
              ┌──────▼───────▼──┐
              │ Consider both;  │
              │ prefer compo-   │
              │ sition if depth │
              │ > 2 levels      │
              └─────────────────┘
```

---

## Key Takeaways

1. **Classes are blueprints; objects are instances.** Each object holds its own state (instance attributes) while sharing class-level data (class attributes).

2. **`self` is not a keyword**—it's a convention. It refers to the instance on which a method was called and is passed automatically by Python.

3. **Class methods** (`@classmethod`) operate on the class itself and are ideal for factory methods. **Static methods** (`@staticmethod`) are namespace-bound functions with no implicit arguments.

4. **`super()` follows the MRO**, not just the direct parent. In cooperative multiple inheritance, always design `super()` calls to chain correctly.

5. **Duck typing** is Python's primary polymorphism mechanism. If an object has the right methods, it works—no inheritance required.

6. **Dunder methods** let your objects integrate with Python's built-in operators, functions, and protocols. Implement `__repr__` and `__eq__` as a baseline for every custom class.

7. **Properties** provide controlled attribute access with validation, computed values, and backward compatibility—without changing the public API.

8. **Abstract base classes** (`abc.ABC` + `@abstractmethod`) enforce contracts on subclasses. Use them when you need guaranteed interface compliance.

9. **Dataclasses** eliminate boilerplate for data-holding classes. Use `field(default_factory=...)` for mutable defaults and `frozen=True` for immutability.

10. **Metaclasses** control class creation itself. In practice, class decorators achieve most of the same goals with far less complexity. Reach for metaclasses only when you need deep class-level customization.

11. **The SOLID principles** guide you toward maintainable code: single responsibilities, open for extension, substitutable subtypes, segregated interfaces, and inverted dependencies.

12. **Prefer composition over inheritance** when the relationship isn't a clear IS-A, when you need runtime flexibility, or when the class hierarchy would grow beyond two levels.

---

## Practice Exercises

### Exercise 1: Bank Account with Properties

Create a `BankAccount` class with a `balance` property that validates deposits and withdrawals. Include a transaction history list.

```python
from dataclasses import dataclass, field


class BankAccount:
    """Implement this class with:
    - A validated balance property (cannot go negative)
    - A transaction_history list
    - deposit(amount) and withdraw(amount) methods
    - A balance property that returns the current balance
    - A @classmethod from_dict(cls, data) factory method
    """

    pass  # Your implementation here


# Test your implementation:
# account = BankAccount("Alice", 1000)
# account.deposit(500)
# account.withdraw(200)
# assert account.balance == 1300
# assert len(account.transaction_history) == 2
# account2 = BankAccount.from_dict({"name": "Bob", "balance": 500})
# assert account2.owner == "Bob"
```

### Exercise 2: Shape Hierarchy with ABC

Build a `Shape` abstract base class and three concrete implementations: `Circle`, `Rectangle`, and `RightTriangle`. Each must implement `area()` and `perimeter()`.

```python
from abc import ABC, abstractmethod
import math


class Shape(ABC):
    """Abstract base class. Do not instantiate directly."""

    @abstractmethod
    def area(self) -> float:
        ...

    @abstractmethod
    def perimeter(self) -> float:
        ...

    def __repr__(self) -> str:
        # Return a descriptive string like "Circle(r=5)" or "Rectangle(w=4, h=6)"
        pass  # Your implementation here


class Circle(Shape):
    """Implement with a radius attribute."""
    pass


class Rectangle(Shape):
    """Implement with width and height attributes."""
    pass


class RightTriangle(Shape):
    """Implement with base and height attributes. Hypotenuse = sqrt(a^2 + b^2)."""
    pass


# Test your implementation:
# shapes = [Circle(5), Rectangle(4, 6), RightTriangle(3, 4)]
# for s in shapes:
#     print(f"{s}: area={s.area():.2f}, perimeter={s.perimeter():.2f}")
```

### Exercise 3: Vector Class with Dunders

Extend the `Vector` class from Section 6.6 to support 3D vectors. Add `__matmul__` for cross product and `__neg__` for negation.

```python
class Vector3D:
    """A 3D vector. Implement:
    - __init__(self, x, y, z)
    - __repr__ and __str__
    - __add__, __sub__, __mul__ (scalar), __rmul__
    - __eq__ and __hash__
    - __abs__ (magnitude)
    - __neg__ (component-wise negation)
    - __matmul__ (cross product, using @)
    - dot(self, other) regular method
    - normalize(self) regular method
    - __iter__ (yield x, y, z)
    """

    pass  # Your implementation here


# Test your implementation:
# v1 = Vector3D(1, 2, 3)
# v2 = Vector3D(4, 5, 6)
# print(v1 @ v2)       # cross product → Vector3D(-3, 6, -3)
# print(abs(v1))        # magnitude → 3.7416573867739413
# x, y, z = v1
# print(f"({x}, {y}, {z})")  # (1, 2, 3)
```

### Exercise 4: Composition-Based Logger

Build a `Logger` class using composition that accepts a `Formatter` and `Destination` strategy. Implement two formatters and two destinations.

```python
from abc import ABC, abstractmethod


class Formatter(ABC):
    """Implement two subclasses: JsonFormatter and TimestampFormatter."""
    @abstractmethod
    def format(self, message: str) -> str:
        ...


class Destination(ABC):
    """Implement two subclasses: ConsoleDestination and ListDestination."""
    @abstractmethod
    def write(self, data: str) -> None:
        ...


class Logger:
    """A composable logger. Implement __init__ and log(self, message)."""
    pass  # Your implementation here


# Test your implementation:
# logger = Logger(JsonFormatter(), ConsoleDestination())
# logger.log("Server started")
# # Output: {"message": "Server started"}
#
# collector = ListDestination()
# logger2 = Logger(TimestampFormatter(), collector)
# logger2.log("Event occurred")
# assert len(collector.messages) == 1
```

### Exercise 5: Dataclass Model with Validation

Create a `Product` dataclass with `__post_init__` validation and an `Inventory` dataclass that tracks products.

```python
from dataclasses import dataclass, field


@dataclass
class Product:
    """Implement with:
    - name: str
    - price: float (must be > 0)
    - quantity: int (must be >= 0, default 0)
    - A __post_init__ that validates price and quantity
    - A property `in_stock` that returns True if quantity > 0
    - frozen=False so products can be modified
    """
    pass  # Your implementation here


@dataclass
class Inventory:
    """Implement with:
    - products: dict[str, Product] (default_factory=dict)
    - add_product(self, product: Product) method
    - remove_product(self, name: str) method
    - total_value property (sum of price * quantity for all products)
    - low_stock(self, threshold=5) method returning list of low-stock product names
    """
    pass  # Your implementation here


# Test your implementation:
# inv = Inventory()
# inv.add_product(Product("Widget", 9.99, 50))
# inv.add_product(Product("Gadget", 24.99, 3))
# inv.add_product(Product("Doohickey", 4.99, 0))
# assert inv.total_value == 574.47  # (9.99*50) + (24.99*3) + (4.99*0)
# assert inv.low_stock(10) == ["Gadget", "Doohickey"]
# assert inv.products["Widget"].in_stock is True
```

---

**Up next:** In [Chapter 7: Functional Programming](chapter-07-functional.md), we dive into first-class functions, closures, decorators, and functional patterns that complement OOP beautifully.
