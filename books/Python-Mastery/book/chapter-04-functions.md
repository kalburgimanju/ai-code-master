# Chapter 4: Functions & Modules

## 4.1 Defining Functions

```python
# Basic function
def greet(name):
    """Greet a person by name."""
    return f"Hello, {name}!"

# Function with multiple parameters
def calculate_area(length, width):
    """Calculate the area of a rectangle."""
    return length * width

# Function with no return (returns None implicitly)
def print_header(title):
    print("=" * 50)
    print(f"  {title}")
    print("=" * 50)

# Function with default values
def power(base, exponent=2):
    """Calculate base raised to exponent (default: square)."""
    return base ** exponent

>>> power(3)       # 9
>>> power(3, 3)    # 27
```

## 4.2 Parameters and Arguments

### Positional vs Keyword Arguments

```python
def create_user(name, age, email, active=True):
    return {"name": name, "age": age, "email": email, "active": active}

# Positional (order matters)
user1 = create_user("Alice", 30, "alice@example.com")

# Keyword (order doesn't matter)
user2 = create_user(age=25, name="Bob", email="bob@example.com", active=False)

# Mixed (positional must come before keyword)
user3 = create_user("Charlie", 35, email="charlie@example.com")
```

### *args and **kwargs

```python
# *args — variable positional arguments (tuple)
def sum_all(*args):
    """Sum any number of arguments."""
    print(f"args type: {type(args)}")  # <class 'tuple'>
    return sum(args)

>>> sum_all(1, 2, 3)           # 6
>>> sum_all(1, 2, 3, 4, 5)    # 15

# **kwargs — variable keyword arguments (dict)
def print_info(**kwargs):
    """Print any keyword arguments."""
    print(f"kwargs type: {type(kwargs)}")  # <class 'dict'>
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

>>> print_info(name="Alice", age=30)
# name: Alice
# age: 30

# Combining all parameter types
def full_signature(positional, keyword="default", *args, **kwargs):
    print(f"positional: {positional}")
    print(f"keyword: {keyword}")
    print(f"args: {args}")
    print(f"kwargs: {kwargs}")

>>> full_signature(1, 2, 3, 4, key1="a", key2="b")
# positional: 1
# keyword: 2
# args: (3, 4)
# kwargs: {'key1': 'a', 'key2': 'b'}

# Keyword-only arguments (after *)
def create_profile(name, *, email, age):
    return {"name": name, "email": email, "age": age}

>>> create_profile("Alice", email="a@b.com", age=30)  # OK
>>> create_profile("Alice", "a@b.com", 30)            # TypeError!

# Positional-only arguments (before /, Python 3.8+)
def calculate(a, b, /, operation="add"):
    match operation:
        case "add": return a + b
        case "mul": return a * b

>>> calculate(3, 4)                    # 7
>>> calculate(3, 4, operation="mul")   # 12
>>> calculate(a=3, b=4)                # TypeError!
```

### Unpacking Arguments

```python
def add(a, b, c):
    return a + b + c

# Unpack list/tuple with *
args = [1, 2, 3]
>>> add(*args)   # 6

# Unpack dict with **
kwargs = {"a": 1, "b": 2, "c": 3}
>>> add(**kwargs)  # 6

# Combining
extra = [3, 4]
>>> add(1, *extra)  # 8 (1 + 3 + 4)
```

## 4.3 Lambda Functions

```python
# Lambda — anonymous one-line functions
square = lambda x: x ** 2
>>> square(5)   # 25

add = lambda a, b: a + b
>>> add(3, 4)   # 7

# Commonly used with higher-order functions
numbers = [5, 2, 8, 1, 9, 3]

# sorted with key
sorted_by_name = sorted(names, key=lambda name: name.lower())
sorted_by_last = sorted(people, key=lambda p: p["last"])

# map — apply function to every element
squares = list(map(lambda x: x**2, numbers))
# [25, 4, 64, 1, 81, 9]

# filter — keep elements where function returns True
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 8]

# reduce — accumulate (from functools)
from functools import reduce
product = reduce(lambda a, b: a * b, numbers)
# 2160

# Sorting complex data
students = [
    {"name": "Alice", "grade": 92},
    {"name": "Bob", "grade": 85},
    {"name": "Charlie", "grade": 92},
]
by_grade = sorted(students, key=lambda s: (-s["grade"], s["name"]))
```

## 4.4 Scope (LEGB Rule)

```python
# L — Local: inside the function
# E — Enclosing: in the enclosing function (closures)
# G — Global: at module level
# B — Built-in: Python's built-in names

x = "global"

def outer():
    x = "enclosing"
    
    def inner():
        x = "local"
        print(x)       # local
    
    inner()
    print(x)           # enclosing

outer()
print(x)               # global

# Use global and nonlocal carefully (usually avoid)
counter = 0

def increment():
    global counter
    counter += 1

def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment
```

## 4.5 Closures

```python
# A closure is a function that remembers variables from its enclosing scope

def multiplier(factor):
    def multiply(number):
        return number * factor
    return multiply

double = multiplier(2)
triple = multiplier(3)

>>> double(5)    # 10
>>> triple(5)    # 15

# Closure for state
def make_accumulator(initial=0):
    total = initial
    def add(value):
        nonlocal total
        total += value
        return total
    return add

acc = make_accumulator()
>>> acc(10)    # 10
>>> acc(20)    # 30
>>> acc(5)     # 35

# Closure as configuration
def create_validator(min_len, max_len):
    def validate(value):
        return min_len <= len(value) <= max_len
    return validate

username_validator = create_validator(3, 20)
password_validator = create_validator(8, 128)

>>> username_validator("ab")       # False
>>> username_validator("alice")    # True
>>> password_validator("short")    # False
```

## 4.6 Decorators

### Basic Decorator

```python
import time

def timer(func):
    """Measure execution time of a function."""
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"

>>> slow_function()
# slow_function took 1.0012s
# 'done'
```

### Parameterized Decorator

```python
def retry(max_attempts=3, delay=1):
    """Retry a function on failure."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    print(f"Attempt {attempt} failed: {e}. Retrying...")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=5, delay=2)
def unreliable_api_call():
    import random
    if random.random() < 0.7:
        raise ConnectionError("API timeout")
    return {"status": "ok"}
```

### Decorator with functools.wraps

```python
from functools import wraps

def log_calls(func):
    """Log function calls with arguments and return values."""
    @wraps(func)  # Preserves func's __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        args_repr = [repr(a) for a in args]
        kwargs_repr = [f"{k}={v!r}" for k, v in kwargs.items()]
        signature = ", ".join(args_repr + kwargs_repr)
        print(f"Calling {func.__name__}({signature})")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result
    return wrapper

@log_calls
def add(a, b):
    """Add two numbers."""
    return a + b

>>> add(3, 4)
# Calling add(3, 4)
# add returned 7
# 7

>>> add.__name__  # 'add' (not 'wrapper')
>>> add.__doc__   # 'Add two numbers.'
```

### Stacking Decorators

```python
@timer
@log_calls
def process_data(data):
    return [x * 2 for x in data]

# Equivalent to: process_data = timer(log_calls(process_data))
```

### Class-Based Decorator

```python
class CountCalls:
    """Count how many times a function is called."""
    def __init__(self, func):
        self.func = func
        self.count = 0
    
    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} called {self.count} times")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello(name):
    print(f"Hello, {name}!")

>>> say_hello("Alice")
# say_hello called 1 times
# Hello, Alice!
>>> say_hello("Bob")
# say_hello called 2 times
# Hello, Bob!
>>> say_hello.count  # 2
```

## 4.7 Modules and Packages

```python
# Importing modules
import math
from math import sqrt, pi
from math import *                    # Don't do this!
from collections import defaultdict

# Aliases
import numpy as np
import pandas as pd
from datetime import datetime as dt

# Module attributes
>>> dir(math)       # List all attributes
>>> math.__name__   # 'math'
>>> math.__file__   # '/usr/lib/python3.14/math.py'

# __name__ guard
def main():
    # Application code here
    print("Running as main script")

if __name__ == "__main__":
    main()
```

### Creating Packages

```
mypackage/
    __init__.py          # Makes it a package (can be empty)
    module_a.py
    module_b.py
    subpackage/
        __init__.py
        module_c.py
```

```python
# mypackage/__init__.py
from .module_a import MyClass
from .module_b import helper_function

# Usage
from mypackage import MyClass
from mypackage.subpackage import module_c
```

### Standard Library Highlights

| Module | Purpose |
|--------|---------|
| `os`, `pathlib` | File system operations |
| `sys` | System parameters |
| `math`, `statistics` | Math functions |
| `datetime`, `time` | Date/time operations |
| `json`, `csv` | Data serialization |
| `re` | Regular expressions |
| `collections` | Specialized containers |
| `itertools` | Iterator utilities |
| `functools` | Function utilities |
| `typing` | Type hints |
| `logging` | Logging framework |
| `argparse` | CLI argument parsing |
| `pathlib` | Object-oriented paths |
| `dataclasses` | Data classes |
| `abc` | Abstract base classes |

```python
# itertools examples
from itertools import chain, groupby, islice, product, combinations

# Chain iterables
combined = list(chain([1, 2], [3, 4], [5, 6]))
# [1, 2, 3, 4, 5, 6]

# Group consecutive elements
data = [("a", 1), ("a", 2), ("b", 3), ("b", 4)]
for key, group in groupby(data, key=lambda x: x[0]):
    print(key, list(group))

# Cartesian product
colors = ["red", "blue"]
sizes = ["S", "M", "L"]
combos = list(product(colors, sizes))
# [('red','S'), ('red','M'), ('red','L'), ('blue','S'), ...]

# Combinations
cards = list(combinations(range(1, 14), 2))  # 2-card hands from A-K
```

```python
# functools examples
from functools import lru_cache, partial, reduce

# LRU Cache — memoization
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

>>> fibonacci(100)  # Instant!

# Partial — fix some arguments
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube = partial(power, exponent=3)

>>> square(5)  # 25
>>> cube(5)    # 125

# Reduce — cumulative function
product = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])
# 120
```

---

## Key Takeaways

- Functions use `def`, can have default values, `*args`, `**kwargs`, keyword-only (`*`), and positional-only (`/`) params
- **Lambda** functions are anonymous, single-expression functions
- **Closures** remember variables from their enclosing scope
- **Decorators** wrap functions to add behavior; use `@wraps` to preserve metadata
- Use the **LEGB rule** to understand variable scope
- **Modules** are `.py` files; **packages** are directories with `__init__.py`
- `if __name__ == "__main__"` guards script-level code
- The standard library is vast: `itertools`, `functools`, `collections`, `pathlib` are essential

---

## Practice Exercises

1. **Decorator Factory:** Create a `@repeat(n)` decorator that calls a function `n` times and collects results in a list.

2. **Caching Decorator:** Implement your own `@lru_cache`-like decorator from scratch (without using functools).

3. **Module System:** Create a package called `calculator` with modules for `basic.py` (add, subtract), `advanced.py` (power, sqrt), and an `__init__.py` that exports everything.

4. **Pipeline Builder:** Write a `pipe(*functions)` function that chains functions together: `pipe(add_one, double, str)(3)` → `"8"`.

5. **Context Manager Decorator:** Create a `@timer` decorator that uses `time.perf_counter()` and formats output nicely with color using ANSI codes.
