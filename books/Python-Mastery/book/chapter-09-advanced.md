# Chapter 9: Advanced Python

Welcome to Chapter 9, where we leave introductory territory behind and explore the deeper mechanisms that make Python a remarkably expressive and powerful language. The features in this chapter — iterators, generators, descriptors, closures, and more — are the building blocks behind Python's standard library and countless production systems. Understanding them will elevate your code from "works" to "elegant and maintainable."

---

## 9.1 Iterators and the Iterator Protocol

At the heart of Python's `for` loop is a protocol so elegant that it shapes how virtually every collection in the language behaves. When you write `for item in sequence`, Python calls `iter(sequence)` to obtain an iterator, then repeatedly calls `next()` until a `StopIteration` exception signals the end.

### The Protocol

An **iterator** is any object that implements two methods:

| Method | Purpose |
|--------|---------|
| `__iter__()` | Returns the iterator object itself. Must return an object with a `__next__` method. |
| `__next__()` | Returns the next value. Raises `StopIteration` when exhausted. |

```python
class CountDown:
    """A countdown iterator from n down to 1."""

    def __init__(self, start: int) -> None:
        self.current = start

    def __iter__(self):
        """Return the iterator object itself."""
        return self

    def __next__(self) -> int:
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value


for n in CountDown(5):
    print(n, end=" ")
# Output: 5 4 3 2 1
```

### ASCII Diagram: Iterator Protocol Flow

```
┌───────────────────────────────────────────────────────┐
│                  FOR LOOP DRIVER                       │
│                                                       │
│   for item in iterable:                               │
│                                                       │
│   Step 1:  iterator = iter(iterable)                  │
│            ┌────────────────────┐                     │
│            │  iter(obj) calls   │                     │
│            │  obj.__iter__()    │                     │
│            │  returns iterator  │                     │
│            └────────┬───────────┘                     │
│                     ▼                                 │
│   Step 2:  next(iterator)  ◄────── loop repeats ───┐ │
│            ┌────────────────────┐                   │ │
│            │  calls             │                   │ │
│            │  iterator.__next__ │                   │ │
│            │  returns value     │                   │ │
│            └────────┬───────────┘                   │ │
│                     ▼                               │ │
│              ┌──────────────┐     Yes               │ │
│              │ StopIteration├──────────► EXIT LOOP  │ │
│              │ raised?      │                       │ │
│              └──────┬───────┘                       │ │
│                     │ No                            │ │
│                     ▼                               │ │
│              item = returned_value                  │ │
│              execute loop body ─────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### `iter()` and `next()` Built-ins

Python provides built-in functions that interact directly with the iterator protocol:

```python
nums = [10, 20, 30]
it = iter(nums)       # Calls nums.__iter__()

print(next(it))       # 10  — calls it.__next__()
print(next(it))       # 20
print(next(it))       # 30
# next(it)            # Raises StopIteration
```

### Sentinel Values

The two-argument form of `iter()` creates an iterator that calls a callable repeatedly until a sentinel value is returned:

```python
import random

def generate_random_ints(limit: int):
    """Generate random integers until the sentinel value (0) appears."""
    return iter(lambda: random.randint(0, limit), 0)

# Usage
for n in generate_random_ints(10):
    print(n, end=" ")
# Output: random integers between 1 and 10, stopping when 0 is drawn
```

This pattern is cleaner than writing a full iterator class when you just need repeated calls to a function.

### Iterable vs. Iterator

A common point of confusion: **every iterator is iterable, but not every iterable is an iterator.**

```python
# A list is iterable but NOT an iterator
nums = [1, 2, 3]
# next(nums)          # TypeError: 'list' object is not an iterator

it = iter(nums)       # This IS an iterator
print(next(it))       # 1

# An iterator IS iterable (it returns itself from __iter__)
print(iter(it) is it)  # True
```

---

## 9.2 Generators

Generators are the most Pythonic way to produce sequences of values lazily. Instead of building an entire list in memory, a generator **yields** one value at a time, pausing execution until the next value is requested.

### The `yield` Keyword

A **generator function** is any function containing `yield`. Calling it doesn't execute the body — it returns a generator object.

```python
def count_up_to(n: int):
    """Yield numbers from 1 to n."""
    i = 1
    while i <= n:
        yield i        # Pauses here, sends i to the caller
        i += 1


gen = count_up_to(3)
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
# next(gen)       # StopIteration
```

Under the hood, every `yield` suspends the function and saves its entire local state — variables, instruction pointer, exception context — onto the generator's internal frame.

### Generator Expressions

A concise syntax for simple generators, analogous to list comprehensions:

```python
# List comprehension — builds entire list in memory
squares_list = [x ** 2 for x in range(1_000_000)]

# Generator expression — yields one value at a time
squares_gen = (x ** 2 for x in range(1_000_000))

import sys
print(sys.getsizeof(squares_list))  # ~8,448,728 bytes
print(sys.getsizeof(squares_gen))   # ~248 bytes  (the object itself)
```

| Feature | List Comprehension | Generator Expression |
|---------|-------------------|---------------------|
| Memory | All elements at once | One element at a time |
| Reusability | Can iterate multiple times | Single-use (recreate to re-iterate) |
| Indexing | `seq[i]` works | No indexing |
| Best for | Small results, random access | Large streams, pipelines |

### `send()` and `throw()`

Generators can **receive** values and **handle** exceptions from the caller:

```python
def accumulator():
    """Receive values and yield running sums."""
    total = 0
    while True:
        value = yield total      # yield current total, receive next value
        if value is None:
            break
        total += value


acc = accumulator()
next(acc)            # Prime the generator (advance to first yield)
print(acc.send(10))  # 10
print(acc.send(20))  # 30
print(acc.send(5))   # 35
```

The `throw()` method injects an exception at the `yield` point:

```python
def careful_divider():
    """Divide values, but handle ZeroDivisionError gracefully."""
    while True:
        try:
            x = yield
            result = 100 / x
            print(f"100 / {x} = {result}")
        except ZeroDivisionError:
            print("Cannot divide by zero — skipping.")


cd = careful_divider()
next(cd)
cd.send(4)           # 100 / 4 = 25.0
cd.throw(ZeroDivisionError)  # Cannot divide by zero — skipping.
```

### `yield from` — Delegation

`yield from` delegates iteration to a sub-generator, enabling clean composition:

```python
def flatten(nested_list):
    """Recursively flatten arbitrarily nested lists."""
    for item in nested_list:
        if isinstance(item, list):
            yield from flatten(item)     # Delegate to recursive call
        else:
            yield item


data = [1, [2, 3], [4, [5, 6]], 7]
print(list(flatten(data)))
# [1, 2, 3, 4, 5, 6, 7]
```

### Practical Example: Fibonacci Generator

```python
def fibonacci(limit=None):
    """Generate Fibonacci numbers up to an optional limit."""
    a, b = 0, 1
    count = 0
    while limit is None or count < limit:
        yield a
        a, b = b, a + b
        count += 1


# First 10 Fibonacci numbers
print(list(fibonacci(10)))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Sum of Fibonacci numbers under 1000
print(sum(f for f in fibonacci() if f < 1000))
# 1596
```

### Practical Example: Reading Large Files Line by Line

```python
def read_large_file(path: str, chunk_size: int = 8192):
    """Read a file in chunks without loading it all into memory."""
    with open(path, "r") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk


def count_words_in_large_file(path: str) -> int:
    """Count words in a file of any size."""
    word_count = 0
    for chunk in read_large_file(path):
        word_count += chunk.count(" ")
    return word_count
```

### Generator Pipelines

Generators compose beautifully into data processing pipelines:

```python
def read_lines(path: str):
    with open(path) as f:
        for line in f:
            yield line.strip()

def filter_comments(lines):
    for line in lines:
        if line and not line.startswith("#"):
            yield line

def parse_csv(lines):
    for line in lines:
        yield line.split(",")

def extract_columns(rows, *indices):
    for row in rows:
        yield tuple(row[i] for i in indices)


# Compose the pipeline
pipeline = extract_columns(
    parse_csv(
        filter_comments(
            read_lines("data.csv")
        )
    ),
    0, 2, 4
)

for record in pipeline:
    print(record)
```

Each stage processes values one at a time. A million-row file flows through with constant memory usage.

---

## 9.3 Context Managers

Context managers ensure that setup and cleanup happen reliably, even in the presence of exceptions. The `with` statement is the most common application, but the protocol is general-purpose.

### The `__enter__` / `__exit__` Protocol

```python
class Timer:
    """Measure the elapsed time of a block."""

    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f}s")
        # Return False to propagate exceptions; True to suppress
        return False


with Timer() as t:
    total = sum(range(10_000_000))
print(f"Result: {total}, Time: {t.elapsed:.4f}s")
```

**`__exit__` parameters:**

| Parameter | Description |
|-----------|-------------|
| `exc_type` | Exception class (e.g., `ValueError`), or `None` if no exception |
| `exc_val` | Exception instance, or `None` |
| `exc_tb` | Traceback object, or `None` |

### `contextlib.contextmanager` Decorator

Writing a full class is often overkill. The `@contextmanager` decorator lets you write context managers as generator functions:

```python
from contextlib import contextmanager

@contextmanager
def managed_file(path: str, mode: str = "r"):
    """Open a file, yield it, and guarantee closure."""
    f = open(path, mode)
    try:
        yield f
    finally:
        f.close()


with managed_file("output.txt", "w") as f:
    f.write("Hello, context manager!\n")
# File is guaranteed to be closed, even if an exception occurs
```

### Handling Exceptions Inside Generators

The critical rule: **do not yield after an exception**. Wrap the yield in try/finally:

```python
@contextmanager
def database_transaction(connection):
    """Begin a transaction, yield the cursor, commit or rollback."""
    cursor = connection.cursor()
    try:
        yield cursor
        connection.commit()         # No exception — commit
    except Exception:
        connection.rollback()       # Exception — rollback
        raise                       # Re-raise after cleanup
    finally:
        cursor.close()
```

### `ExitStack` for Managing Multiple Resources

`ExitStack` manages a dynamic number of context managers:

```python
from contextlib import ExitStack

def process_multiple_files(filenames: list[str]):
    """Open and process multiple files with a single with-statement."""
    with ExitStack() as stack:
        files = [
            stack.enter_context(open(fn))
            for fn in filenames
        ]
        # All files are open and will be closed when exiting the block
        for f in files:
            print(f.read())
```

---

## 9.4 Decorators

Decorators are functions that modify other functions or classes. They are one of Python's most distinctive features, enabling clean separation of cross-cutting concerns like logging, caching, and access control.

### Function Decorators (Review)

```python
import functools

def my_decorator(func):
    @functools.wraps(func)      # Preserves __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper


@my_decorator
def greet(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}!"


print(greet("Alice"))
# Calling greet
# Finished greet
# Hello, Alice!
print(greet.__name__)  # greet (thanks to @wraps)
print(greet.__doc__)   # Greet someone by name.
```

### Class-Based Decorators

Classes can serve as decorators when you need state or more complex logic:

```python
import functools
import time

class Retry:
    """Retry a function on exception up to `max_attempts` times."""

    def __init__(self, max_attempts: int = 3, delay: float = 1.0):
        self.max_attempts = max_attempts
        self.delay = delay

    def __call__(self, func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, self.max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"Attempt {attempt} failed: {e}")
                    if attempt < self.max_attempts:
                        time.sleep(self.delay)
            raise last_exception
        return wrapper


@Retry(max_attempts=3, delay=0.5)
def unstable_function():
    import random
    if random.random() < 0.7:
        raise ConnectionError("Network timeout")
    return "Success!"


result = unstable_function()  # May retry up to 3 times
```

### Parameterized Decorators

Decorators that accept arguments require an extra layer of nesting:

```python
import functools

def repeat(n: int):
    """Decorator that runs a function n times."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(n):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator


@repeat(3)
def say_hello():
    return "Hello!"


print(say_hello())  # ['Hello!', 'Hello!', 'Hello!']
```

### `functools.lru_cache` and `functools.cache`

The standard library provides memoization decorators out of the box:

```python
from functools import lru_cache, cache

# lru_cache with a size limit
@lru_cache(maxsize=128)
def fib_memoized(n: int) -> int:
    if n < 2:
        return n
    return fib_memoized(n - 1) + fib_memoized(n - 2)


# cache (Python 3.9+) — unlimited size, faster (no LRU eviction overhead)
@cache
def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)


print(fib_memoized(100))   # 354224848179261915075
print(factorial(20))        # 2432902008176640000

# Inspect cache statistics
print(fib_memoized.cache_info())
# CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)
```

### Stacking Decorators

Decorator order matters — they are applied bottom-up (innermost first):

```python
import functools
import time

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"  → Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

def measure_time(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"  ⏱ {func.__name__} took {elapsed:.6f}s")
        return result
    return wrapper


# Equivalent to: log_calls(measure_time(slow_function))
@log_calls
@measure_time
def slow_function():
    time.sleep(0.1)
    return "done"


slow_function()
# → Calling slow_function
# ⏱ slow_function took 0.100123s
```

### Practical Example: Timing Decorator

```python
import functools
import time
import logging

logger = logging.getLogger(__name__)

def timed(func):
    """Log the execution time of a function."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info("%s executed in %.4fs", func.__qualname__, elapsed)
        return result
    return wrapper
```

---

## 9.5 Type Hints and Annotations

Python's type hint system, introduced in PEP 484, provides optional static typing that improves readability, enables better tooling, and catches entire categories of bugs before runtime.

### Basic Type Hints

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"

age: int = 30
temperature: float = 98.6
is_active: bool = True
nothing: None = None
```

### Complex Types

```python
from typing import Optional, Union

# Collections (Python 3.9+ allows built-in generics)
names: list[str] = ["Alice", "Bob"]
scores: dict[str, int] = {"Alice": 95, "Bob": 87}
coordinates: tuple[float, float] = (37.7749, -122.4194)
unique_ids: set[int] = {101, 102, 103}

# Optional and Union
def find_user(user_id: int) -> Optional[str]:      # str | None
    ...

def process(value: Union[int, str]) -> str:        # int | str
    return str(value)

# Python 3.10+ syntax
def modern_union(value: int | str) -> str:          # Same as Union[int, str]
    return str(value)
```

### `TypeAlias`, `TypeVar`, and `Generic`

```python
from typing import TypeVar, Generic, TypeAlias

# TypeAlias gives a readable name for complex types
Vector: TypeAlias = list[float]
Matrix: TypeAlias = list[Vector]

# TypeVar for generic functions
T = TypeVar("T")

def first(items: list[T]) -> T:
    return items[0]

# Generic classes
T_co = TypeVar("T_co", covariant=True)

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def peek(self) -> T:
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)


int_stack: Stack[int] = Stack()
int_stack.push(1)
int_stack.push(2)
print(int_stack.pop())  # 2
```

### `Protocol` — Structural Subtyping

`Protocol` defines interfaces without inheritance — any object with matching methods is accepted:

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> str: ...


class Circle:
    def draw(self) -> str:
        return "Drawing a circle ◯"


class Square:
    def draw(self) -> str:
        return "Drawing a square □"


def render(shape: Drawable) -> None:
    print(shape.draw())


render(Circle())  # Works — Circle has draw()
render(Square())  # Works — Square has draw()
```

### Callable Types

```python
from collections.abc import Callable

def apply_twice(func: Callable[[int], int], value: int) -> int:
    return func(func(value))

result = apply_twice(lambda x: x + 3, 7)
print(result)  # 13
```

### Type Checking with mypy / pyright

```bash
# Install and run mypy
uv run pip install mypy
uv run mypy src/ --strict

# Or use pyright (faster, used by Pylance in VS Code)
uv run pip install pyright
uv run pyright src/
```

### typing Module Overview

| Type | Purpose | Example |
|------|---------|---------|
| `list[T]` | Homogeneous list | `list[int]` |
| `dict[K, V]` | Key-value mapping | `dict[str, int]` |
| `tuple[T, ...]` | Fixed-length tuple | `tuple[int, str]` |
| `Optional[T]` | `T \| None` | `Optional[str]` |
| `Union[T, U]` | `T \| U` | `Union[int, str]` |
| `TypeVar` | Generic type variable | `T = TypeVar("T")` |
| `Generic` | Generic class base | `class Box(Generic[T])` |
| `Protocol` | Structural typing | `class Drawable(Protocol)` |
| `Callable[[A], R]` | Function signature | `Callable[[int], str]` |
| `TypeAlias` | Type alias | `Vec: TypeAlias = list[float]` |
| `Literal` | Exact values | `Literal["r", "w"]` |
| `Final` | Immutable reference | `MAX: Final = 100` |
| `TypedDict` | Dict with fixed keys | `class User(TypedDict)` |
| `Annotated` | Metadata on types | `Annotated[int, "positive"]` |

---

## 9.6 The Global Interpreter Lock (GIL)

The Global Interpreter Lock is one of the most discussed and misunderstood aspects of CPython. It is not a language feature — it is an implementation detail of CPython that ensures thread safety for Python objects.

### What Is the GIL?

The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously. This means:

- **Only one thread** runs Python bytecode at a time (per process)
- The GIL is released during **I/O operations** and **C extension computations**
- It simplifies memory management (reference counting) and C extension integration

### ASCII Diagram: GIL and Threads

```
┌─────────────────────────────────────────────────────────┐
│                    CPython Process                       │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ Thread 1 │  │ Thread 2 │  │ Thread 3 │            │
│   │ (CPU)    │  │ (CPU)    │  │ (I/O)    │            │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│        │              │             │                    │
│        ▼              │             ▼                    │
│   ┌─────────┐         │        ┌─────────┐             │
│   │ WAITS   │         │        │ GIL     │             │
│   │ for GIL │         │        │ released│             │
│   └─────────┘         │        │ (I/O)   │             │
│                       ▼        └─────────┘             │
│              ┌───────────┐                              │
│              │ HOLDS GIL │                              │
│              │ executing │                              │
│              │ bytecode  │                              │
│              └───────────┘                              │
│                                                         │
│   Only ONE thread runs Python bytecode at any time.     │
│   I/O-bound threads release the GIL while waiting.      │
└─────────────────────────────────────────────────────────┘
```

### CPU-Bound vs I/O-Bound Tasks

```python
import threading
import multiprocessing
import time

# ── CPU-bound: threading does NOT help ───────────────
def cpu_work(n: int) -> int:
    total = 0
    for i in range(n):
        total += i * i
    return total

# Threading (limited by GIL)
start = time.perf_counter()
t1 = threading.Thread(target=cpu_work, args=(50_000_000,))
t2 = threading.Thread(target=cpu_work, args=(50_000_000,))
t1.start(); t2.start()
t1.join(); t2.join()
thread_time = time.perf_counter() - start

# Multiprocessing (true parallelism)
start = time.perf_counter()
p1 = multiprocessing.Process(target=cpu_work, args=(50_000_000,))
p2 = multiprocessing.Process(target=cpu_work, args=(50_000_000,))
p1.start(); p2.start()
p1.join(); p2.join()
proc_time = time.perf_counter() - start

print(f"Threading: {thread_time:.2f}s")   # Slower (GIL)
print(f"Multiprocessing: {proc_time:.2f}s")  # Faster (parallel)
```

| Task Type | Threading | Multiprocessing | `asyncio` |
|-----------|-----------|-----------------|-----------|
| CPU-bound | ✗ GIL-bound | ✓ True parallelism | ✗ Single-threaded |
| I/O-bound | ✓ Good | ✓ Overkill | ✓ Best |
| Mixed | ✓/✗ Depends | ✓ Best | ✓ For I/O portion |

### PEP 703: Free-threaded Python (3.13+)

Python 3.13 introduced an experimental **free-threaded** build (PEP 703) that removes the GIL entirely:

```bash
# Build or install free-threaded CPython 3.13+
# The GIL is disabled; threads achieve true parallelism
python3.13t --disable-gil script.py
```

This is opt-in and experimental. The GIL remains the default in CPython 3.13 and 3.14. For production code today, use `multiprocessing` for CPU-bound parallelism.

---

## 9.7 Descriptors

Descriptors are objects that define `__get__`, `__set__`, or `__delete__` — they are the mechanism behind properties, class methods, static methods, and `__slots__`.

### The Descriptor Protocol

```python
class Descriptor:
    def __set_name__(self, owner, name):
        """Called when the descriptor is assigned to a class attribute."""
        self.name = name

    def __get__(self, obj, objtype=None):
        """Called when the attribute is accessed."""
        print(f"  __get__ called for {self.name}")
        if obj is None:
            return self          # Access via class, not instance
        return obj.__dict__.get(f"_validated_{self.name}")

    def __set__(self, obj, value):
        """Called when the attribute is assigned."""
        print(f"  __set__ called for {self.name} = {value!r}")
        obj.__dict__[f"_validated_{self.name}"] = value

    def __delete__(self, obj):
        """Called when the attribute is deleted."""
        print(f"  __delete__ called for {self.name}")
        del obj.__dict__[f"_validated_{self.name}"]
```

### Data Descriptors vs. Non-Data Descriptors

| Type | Defines | Precedence |
|------|---------|-----------|
| **Data descriptor** | `__get__` AND `__set__` (and/or `__delete__`) | Wins over instance `__dict__` |
| **Non-data descriptor** | Only `__get__` | Loses to instance `__dict__` |

```python
class PositiveInt:
    """A data descriptor that only allows positive integers."""

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, f"_{self.name}", None)

    def __set__(self, obj, value):
        if not isinstance(value, int):
            raise TypeError(f"{self.name} must be an int")
        if value < 0:
            raise ValueError(f"{self.name} must be positive")
        setattr(obj, f"_{self.name}", value)


class Account:
    balance = PositiveInt()

    def __init__(self, balance: int):
        self.balance = balance

    def __repr__(self):
        return f"Account(balance={self.balance})"


acc = Account(1000)
print(acc)             # Account(balance=1000)
acc.balance = 500
print(acc)             # Account(balance=500)

try:
    acc.balance = -100
except ValueError as e:
    print(e)           # balance must be positive
```

### `property` as a Descriptor

`property` is itself a data descriptor:

```python
class Temperature:
    def __init__(self, celsius: float = 0.0):
        self._celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("Temperature below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32


temp = Temperature(100)
print(temp.fahrenheit)  # 212.0
temp.celsius = 0
print(temp.fahrenheit)  # 32.0
```

### ASCII Diagram: Descriptor Lookup Order

```
┌─────────────────────────────────────────────────────────────┐
│              ATTRIBUTE LOOKUP: obj.attr                      │
│                                                             │
│   Step 1: Check type(obj).__mro__ for a data descriptor    │
│           ┌──────────────────────────────────────┐          │
│           │ Found data descriptor?               │          │
│           │ Yes → Call descriptor.__get__()       │──► DONE │
│           │ No  → Continue                        │          │
│           └──────────────────────────────────────┘          │
│                          │                                   │
│                          ▼                                   │
│   Step 2: Check instance __dict__                           │
│           ┌──────────────────────────────────────┐          │
│           │ Found in obj.__dict__?               │          │
│           │ Yes → Return value                    │──► DONE │
│           │ No  → Continue                        │          │
│           └──────────────────────────────────────┘          │
│                          │                                   │
│                          ▼                                   │
│   Step 3: Check type(obj).__mro__ for a non-data descriptor │
│           ┌──────────────────────────────────────┐          │
│           │ Found non-data descriptor?           │          │
│           │ Yes → Call descriptor.__get__()       │──► DONE │
│           │ No  → Continue                        │          │
│           └──────────────────────────────────────┘          │
│                          │                                   │
│                          ▼                                   │
│   Step 4: Check class attributes directly                   │
│           ┌──────────────────────────────────────┐          │
│           │ Found in type(obj).__dict__?         │          │
│           │ Yes → Return value                    │──► DONE │
│           │ No  → Raise AttributeError            │          │
│           └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 9.8 `__slots__`

By default, Python stores instance attributes in a `__dict__` dictionary. `__slots__` replaces this with a fixed-size array of references, saving significant memory for classes with many instances.

### How `__slots__` Works

```python
class PointWithDict:
    """Standard class — uses __dict__."""
    def __init__(self, x, y):
        self.x = x
        self.y = y


class PointWithSlots:
    """Slotted class — uses __slots__."""
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y


p1 = PointWithDict(1, 2)
p2 = PointWithSlots(1, 2)

print(hasattr(p1, "__dict__"))   # True
print(hasattr(p2, "__dict__"))   # False
print(p1.__dict__)               # {'x': 1, 'y': 2}
# print(p2.__dict__)             # AttributeError: 'PointWithSlots' has no attribute '__dict__'
```

### `__slots__` vs `__dict__`

| Feature | `__dict__` (default) | `__slots__` |
|---------|---------------------|-------------|
| Memory per instance | ~200+ bytes overhead | Minimal (fixed-size) |
| Attribute access speed | Slightly slower (dict lookup) | Slightly faster (offset lookup) |
| Dynamic attributes | Allowed (`obj.new_attr = 5`) | Not allowed |
| `__weakref__` support | Automatic | Must be explicitly listed |
| `__dict__` present | Yes | No |
| Inheritance compatibility | Always works | Complicated (see below) |

### Memory Comparison

```python
import sys

class Regular:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

class Slotted:
    __slots__ = ("x", "y", "z")
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

r = Regular(1, 2, 3)
s = Slotted(1, 2, 3)

print(sys.getsizeof(r))       # 48 (just the object header)
print(sys.getsizeof(r.__dict__))  # 64+ (the dict overhead)
# Total Regular: ~112+ bytes

print(sys.getsizeof(s))       # 56 (includes slot references)
# Total Slotted: ~56 bytes
```

### Limitations and Inheritance

```python
# Slots and inheritance require careful handling

class Parent:
    __slots__ = ("x",)

class Child(Parent):
    __slots__ = ("y",)        # Fine — adds 'y' alongside 'x'

class BadChild(Parent):
    pass                       # Has __dict__ (inherits no __slots__ from Parent's perspective)

# Cannot add attributes not in __slots__
p = Parent()
p.x = 10
try:
    p.w = 20
except AttributeError as e:
    print(e)  # 'Parent' object has no attribute 'w'
```

### When to Use `__slots__`

**Use `__slots__` when:**
- Creating millions of instances (e.g., data points, records)
- Memory is a constraint
- You want to enforce a fixed attribute set
- Building a library where attribute names should be predictable

**Avoid `__slots__` when:**
- You need dynamic attributes
- Complex inheritance hierarchies are involved
- The class has few instances
- You need `__dict__` for metaprogramming

---

## 9.9 Modules and Packages

Understanding Python's import system is essential for organizing larger projects and diagnosing import errors.

### The Import System

When Python encounters `import foo.bar`, it:

1. Checks `sys.modules` for a cached version
2. Uses a **finder** (e.g., `importlib.machinery.PathFinder`) to locate the module
3. Uses a **loader** (e.g., `importlib.machinery.SourceFileLoader`) to load it
4. Executes the module code and stores it in `sys.modules`

```python
import sys
import importlib

# Inspect the module cache
print("math" in sys.modules)        # False (not imported yet)
import math
print("math" in sys.modules)        # True

# Reload a module
importlib.reload(math)              # Re-executes math module code

# Find a module's location
spec = importlib.util.find_spec("json")
print(spec.origin)  # /usr/lib/python3.14/json/__init__.py
```

### `__init__.py` Purpose

- Marks a directory as a Python package (regular packages)
- Can initialize package-level state
- Controls what `from package import *` exposes

```python
# mypackage/__init__.py
"""My awesome package."""

__version__ = "1.2.3"

# Import key names for convenient access
from .core import MyClass
from .utils import helper_function

__all__ = ["MyClass", "helper_function", "__version__"]
```

### `__all__` for Public API

```python
# utils.py
"""Utility functions."""

internal_helper = "not exported"
public_helper = "exported"

__all__ = ["public_helper"]   # Controls `from utils import *`
```

### Relative vs. Absolute Imports

```python
# Absolute imports (recommended)
from mypackage.subpackage import MyClass
import mypackage.utils

# Relative imports (relative to current module's package)
from . import utils                  # Same package
from ..other_subpackage import foo   # Parent package
from .submodule import bar           # Submodule in same package
```

| Import Style | Pros | Cons |
|-------------|------|------|
| Absolute | Clear, explicit, refactor-safe | Verbose |
| Relative | Shorter, shows package relationship | Fragile during restructuring |

### Circular Imports

Circular imports happen when module A imports module B and module B imports module A. Strategies to resolve them:

```python
# Problem: circular_imports/
#   a.py imports b
#   b.py imports a

# Solution 1: Import inside function (lazy import)
# a.py
def get_something():
    from b import helper    # Deferred until called
    return helper()

# Solution 2: Restructure into a third module
# common.py  ← both a.py and b.py import from here

# Solution 3: Use late binding / dependency injection
```

### Namespace Packages

Regular packages require `__init__.py`. **Namespace packages** (PEP 420) allow a package to span multiple directories without `__init__.py`:

```python
# Directory structure:
#   site-packages/
#     mypackage/
#       module_a.py
#   another-location/
#     mypackage/
#       module_b.py

# Both directories contribute to the mypackage namespace
import mypackage.module_a  # From site-packages
import mypackage.module_b  # From another-location
```

---

## 9.10 Introspection and Reflection

Python provides powerful built-in tools for examining objects, classes, and code at runtime.

### Core Built-in Functions

```python
x = [1, 2, 3]

print(type(x))       # <class 'list'>
print(id(x))         # 140234866534464 (unique object identity)
print(dir(x))        # ['__add__', '__class__', ..., 'append', 'count', ...]
print(len(x))        # 3

# Checking attributes and types
print(isinstance(x, list))     # True
print(issubclass(list, object))  # True
```

### `getattr`, `setattr`, `delattr`

These operate on objects dynamically, using strings to specify attribute names:

```python
class Config:
    DEBUG = True
    DATABASE_URL = "sqlite:///db.sqlite3"


config = Config()

# getattr — like config.ATTR but with a string
print(getattr(config, "DEBUG"))               # True
print(getattr(config, "MISSING", "default"))  # "default" (fallback)

# setattr — like config.ATTR = value but dynamic
setattr(config, "API_KEY", "secret-key")
print(config.API_KEY)   # secret-key

# delattr — del config.ATTR but dynamic
delattr(config, "API_KEY")
# print(config.API_KEY)  # AttributeError
```

### The `inspect` Module

```python
import inspect

def example_function(a: int, b: str = "hello", *, verbose: bool = False) -> str:
    """A sample function for introspection."""
    if verbose:
        print(f"Processing {a} and {b}")
    return f"{a}-{b}"


# Get function signature
sig = inspect.signature(example_function)
print(sig)  # (a: int, b: str = 'hello', *, verbose: bool = False) -> str

for name, param in sig.parameters.items():
    print(f"  {name}: kind={param.kind.name}, default={param.default}")

# Get source code
print(inspect.getsource(example_function))

# Get the call signature for documentation
print(inspect.getdoc(example_function))
# A sample function for introspection.

# Inspect class members
class Example:
    class_var = 42

    def method(self):
        pass


members = inspect.getmembers(Example)
for name, value in members:
    if not name.startswith("_"):
        print(f"  {name}: {value}")
```

### `__dict__`, `__class__`, `__bases__`

```python
class Animal:
    pass

class Dog(Animal):
    species = "Canis familiaris"

    def __init__(self, name):
        self.name = name


rex = Dog("Rex")

print(rex.__class__)        # <class '__main__.Dog'>
print(rex.__class__.__name__)  # Dog
print(Dog.__bases__)        # (<class '__main__.Animal'>,)

# Instance vs class attributes
print(Dog.__dict__.keys())  # dict_keys(['__module__', 'species', '__init__', ...])
print(rex.__dict__)         # {'name': 'Rex'}
```

### `eval()` and `exec()` — Use Sparingly

```python
# eval — evaluate a single expression
result = eval("2 + 3 * 4")
print(result)  # 14

# exec — execute a code string (statements, blocks)
namespace = {}
exec("x = 10\ny = x * 2", namespace)
print(namespace["y"])  # 20

# ⚠️ DANGER: Never use eval/exec on untrusted input
# eval("__import__('os').system('rm -rf /')")  # Catastrophic
```

| Function | Scope | Use Case |
|----------|-------|----------|
| `getattr(obj, name)` | Safe | Dynamic attribute access |
| `eval(expr)` | Potentially dangerous | Trusted expressions only |
| `exec(code)` | Potentially dangerous | Dynamic code generation (rare) |
| `importlib.import_module(name)` | Safe | Dynamic imports |

---

## 9.11 Closures and Free Variables

A **closure** is a function that captures variables from its enclosing scope, retaining access even after the outer function has returned.

### Closure Concept

```python
def make_multiplier(factor: int):
    """Return a function that multiplies by `factor`."""
    def multiplier(x: int) -> int:
        return x * factor     # `factor` is a free variable
    return multiplier


double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))    # 10
print(triple(5))    # 15

# Inspect the closure
print(double.__closure__)                # (<cell at 0x...>,)
print(double.__closure__[0].cell_contents)  # 2
```

### Common Closure Patterns

**Counter:**

```python
def make_counter(start: int = 0):
    """Return a counter with increment and get methods."""
    count = [start]    # List to allow mutation from nested scope

    def increment(step: int = 1) -> int:
        count[0] += step
        return count[0]

    def get() -> int:
        return count[0]

    return increment, get


inc, get_count = make_counter(0)
inc()              # 1
inc()              # 2
inc(5)             # 7
print(get_count()) # 7
```

**Rate Limiter:**

```python
import time

def make_rate_limiter(max_calls: int, period: float):
    """Return a rate limiter that allows max_calls per period (seconds)."""
    timestamps: list[float] = []

    def rate_limited_call(func):
        def wrapper(*args, **kwargs):
            now = time.monotonic()
            # Remove timestamps outside the window
            timestamps[:] = [t for t in timestamps if now - t < period]
            if len(timestamps) >= max_calls:
                wait = period - (now - timestamps[0])
                raise RuntimeError(f"Rate limit exceeded. Wait {wait:.2f}s")
            timestamps.append(now)
            return func(*args, **kwargs)
        return wrapper

    return rate_limited_call


@make_rate_limiter(max_calls=3, period=1.0)
def api_call(endpoint: str):
    print(f"Calling {endpoint}")
    return {"status": "ok"}
```

### Closures vs. Classes for State

Both can encapsulate state, but they serve different purposes:

```python
# Using a closure
def make_bank_account(initial: float):
    balance = [initial]

    def deposit(amount):
        balance[0] += amount
        return balance[0]

    def withdraw(amount):
        if amount > balance[0]:
            raise ValueError("Insufficient funds")
        balance[0] -= amount
        return balance[0]

    def get_balance():
        return balance[0]

    return deposit, withdraw, get_balance


# Using a class (generally preferred for complex state)
class BankAccount:
    def __init__(self, initial: float):
        self._balance = initial

    def deposit(self, amount: float) -> float:
        self._balance += amount
        return self._balance

    def withdraw(self, amount: float) -> float:
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        self._balance -= amount
        return self._balance

    @property
    def balance(self) -> float:
        return self._balance

    def __repr__(self):
        return f"BankAccount(balance={self._balance})"
```

| Aspect | Closure | Class |
|--------|---------|-------|
| State storage | Free variables (hidden) | Attributes (explicit) |
| Methods | Nested functions | Bound methods |
| Extensibility | Limited (add functions manually) | Inheritance, mixins |
| Best for | Simple, focused state | Complex objects, multiple behaviors |
| Debuggability | Harder (no named attributes) | Easier (`obj.__dict__`) |
| Memory | Small overhead | Slightly more (class dict) |

---

## Key Takeaways

1. **The Iterator Protocol** (`__iter__` + `__next__`) underlies every `for` loop in Python. Understanding it allows you to create custom iterable objects that integrate seamlessly with the language.

2. **Generators** provide a concise, memory-efficient way to produce sequences lazily. The `yield` keyword pauses execution and saves state, making generators ideal for streaming data, pipelines, and infinite sequences.

3. **`yield from`** enables delegation to sub-generators, simplifying recursive flattening and coroutine composition.

4. **`send()` and `throw()`** allow two-way communication with generators, turning them into lightweight coroutines that can receive values and handle exceptions.

5. **Context managers** guarantee resource cleanup via `__enter__`/`__exit__`. The `@contextmanager` decorator makes them trivial to write, and `ExitStack` handles dynamic sets of resources.

6. **Decorators** are higher-order functions that modify behavior without changing function bodies. Class-based decorators enable stateful decoration, and `functools.wraps` preserves metadata.

7. **Type hints** improve code clarity and enable static analysis with mypy or pyright. Use `TypeVar` and `Generic` for reusable type-parameterized components, and `Protocol` for structural subtyping.

8. **The GIL** serializes Python bytecode execution in CPython. Use `multiprocessing` for CPU-bound parallelism and `asyncio` for I/O-bound concurrency. Free-threaded Python (3.13+) is experimental.

9. **Descriptors** (`__get__`, `__set__`, `__delete__`) power properties, methods, and slots. Understanding descriptor lookup order explains many of Python's "magic" attribute behaviors.

10. **`__slots__`** trades flexibility for memory savings. Use them when creating millions of instances where the `__dict__` overhead is significant.

11. **The import system** uses finders and loaders, caches modules in `sys.modules`, and supports both regular and namespace packages. Avoid circular imports by restructuring or using lazy imports.

12. **Introspection tools** (`dir`, `type`, `getattr`, `inspect`) let you examine and manipulate objects at runtime, enabling metaprogramming, debugging, and dynamic dispatch.

13. **Closures** capture free variables from enclosing scopes. They are the foundation of decorators, factory functions, and lightweight state management — a functional complement to class-based encapsulation.

---

## Practice Exercises

### Exercise 1: Custom Range Iterator

Implement a `FancyRange` class that supports `start`, `stop`, `step`, and a `reverse()` method that returns a reversed iterator.

```python
class FancyRange:
    def __init__(self, start, stop=None, step=1):
        if stop is None:
            start, stop = 0, start
        self.start = start
        self.stop = stop
        self.step = step

    def __iter__(self):
        # Your code here
        ...

    def __len__(self):
        # Your code here
        ...

    def reverse(self):
        # Your code here — return a new FancyRange with negative step
        ...


# Tests
assert list(FancyRange(5)) == [0, 1, 2, 3, 4]
assert list(FancyRange(1, 10, 2)) == [1, 3, 5, 7, 9]
assert list(FancyRange(5).reverse()) == [4, 3, 2, 1, 0]
assert list(FancyRange(1, 10, -1)) == []
```

### Exercise 2: Generator Pipeline

Create a generator pipeline that reads a CSV string, filters rows by a predicate, and transforms selected columns.

```python
def csv_rows(csv_text: str):
    """Yield each non-empty line as a list of fields."""
    # Your code here
    ...

def filter_rows(rows, predicate):
    """Yield only rows where predicate(row) is True."""
    # Your code here
    ...

def select_columns(rows, *indices):
    """Yield tuples of only the specified column indices."""
    # Your code here
    ...


# Usage
data = """name,age,city
Alice,30,NYC
Bob,25,LA
Charlie,35,NYC
Diana,28,LA"""

pipeline = select_columns(
    filter_rows(
        csv_rows(data),
        lambda row: row[2] == "NYC"
    ),
    0, 1
)

assert list(pipeline) == [("Alice", "30"), ("Charlie", "35")]
```

### Exercise 3: Parameterized Decorator with Retry and Logging

Build a `@retry_with_log` decorator that retries a function on specified exceptions, logs each attempt, and respects a maximum retry count.

```python
import functools
import logging

logger = logging.getLogger(__name__)

def retry_with_log(max_attempts: int = 3, exceptions=(Exception,)):
    """Decorator that retries on failure with logging."""
    def decorator(func):
        # Your code here
        ...
    return decorator


# Test
attempt_counter = {"n": 0}

@retry_with_log(max_attempts=3, exceptions=(ValueError,))
def flaky():
    attempt_counter["n"] += 1
    if attempt_counter["n"] < 3:
        raise ValueError(f"Attempt {attempt_counter['n']}")
    return "success"

result = flaky()
assert result == "success"
assert attempt_counter["n"] == 3
```

### Exercise 4: Descriptor-Based Validation

Create a set of descriptors (`MinLength`, `MaxLength`, `InRange`) that validate string and numeric fields on a class.

```python
class MinLength:
    """Descriptor that enforces a minimum string length."""
    def __init__(self, min_len):
        # Your code here
        ...

    def __set_name__(self, owner, name):
        # Your code here
        ...

    def __get__(self, obj, objtype=None):
        # Your code here
        ...

    def __set__(self, obj, value):
        # Your code here
        ...

class InRange:
    """Descriptor that enforces a numeric range [low, high]."""
    # Your code here
    ...


class User:
    username = MinLength(3)
    age = InRange(0, 150)

    def __init__(self, username, age):
        self.username = username
        self.age = age


# Tests
u = User("alice", 30)
assert u.username == "alice"
assert u.age == 30

try:
    User("ab", 30)
except ValueError as e:
    assert "minimum" in str(e).lower() or "3" in str(e)

try:
    User("alice", -5)
except ValueError as e:
    assert "range" in str(e).lower() or "0" in str(e)
```

### Exercise 5: Closure-Based Memoizer

Implement a `memoize` function using closures (no `functools.lru_cache`) that tracks hit/miss statistics and supports a cache-size limit.

```python
def memoize(func=None, *, maxsize: int = 128):
    """Memoize a function with LRU eviction using only closures."""
    cache = {}
    order = []

    def wrapper(*args):
        # Your code here
        # 1. Check cache — if hit, return cached value
        # 2. If miss, compute, store, update order
        # 3. If len(cache) > maxsize, evict oldest
        ...

    wrapper.cache_info = lambda: {"hits": hits[0], "misses": misses[0], "size": len(cache)}
    wrapper.cache_clear = lambda: (cache.clear(), order.clear(), hits.__setitem__(0, 0), misses.__setitem__(0, 0))

    return wrapper(func) if func else wrapper


# Test
@memoize
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

assert fib(10) == 55
info = fib.cache_info()
assert info["hits"] > 0
assert info["misses"] == 11  # fib(0) through fib(10)
```

---

**Next:** In [Chapter 10: Concurrency and Parallelism](chapter-10-concurrency.md), we'll dive deep into threading, multiprocessing, and asyncio — the tools Python provides for harnessing multiple cores and handling thousands of simultaneous I/O operations.
