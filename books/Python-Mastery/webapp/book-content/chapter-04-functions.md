# Chapter 4: Functions & Modules

## 4.1 Defining Functions

### Basic Function Syntax

```python
# Simple function
def greet():
    """Print a greeting message."""
    print("Hello, World!")

greet()  # Hello, World!

# Function with parameters
def greet_person(name):
    """Greet a specific person."""
    print(f"Hello, {name}!")

greet_person("Alice")  # Hello, Alice!

# Function with return value
def add(a, b):
    """Return the sum of two numbers."""
    return a + b

result = add(3, 5)
print(result)  # 8

# Multiple return values (returns a tuple)
def get_stats(numbers):
    """Calculate statistics for a list of numbers."""
    total = sum(numbers)
    average = total / len(numbers)
    minimum = min(numbers)
    maximum = max(numbers)
    return total, average, minimum, maximum

total, avg, min_val, max_val = get_stats([1, 2, 3, 4, 5])
print(f"Total: {total}, Avg: {avg}, Min: {min_val}, Max: {max_val}")
# Total: 15, Avg: 3.0, Min: 1, Max: 5

# Return multiple values as a tuple
stats = get_stats([1, 2, 3, 4, 5])
print(stats)  # (15, 3.0, 1, 5)
```

### Docstrings and Type Hints

```python
def calculate_bmi(weight_kg: float, height_m: float) -> float:
    """Calculate Body Mass Index (BMI).

    Args:
        weight_kg: Weight in kilograms.
        height_m: Height in meters.

    Returns:
        BMI value as a float.

    Raises:
        ValueError: If height is zero or negative.

    Examples:
        >>> calculate_bmi(70, 1.75)
        22.857142857142858
    """
    if height_m <= 0:
        raise ValueError("Height must be positive")
    return weight_kg / (height_m ** 2)

# Using the function
bmi = calculate_bmi(70, 1.75)
print(f"BMI: {bmi:.1f}")  # BMI: 22.9
```

---

## 4.2 Parameters and Arguments

### Positional Arguments

```python
def power(base, exponent):
    """Raise base to the power of exponent."""
    return base ** exponent

print(power(2, 10))    # 1024 (positional)
print(power(10, 2))    # 100 (order matters!)
```

### Keyword Arguments

```python
def create_profile(name, age, city, occupation="Student"):
    """Create a user profile."""
    return {
        "name": name,
        "age": age,
        "city": city,
        "occupation": occupation,
    }

# Keyword arguments (order doesn't matter)
profile = create_profile(
    city="NYC",
    name="Alice",
    age=30,
    occupation="Engineer"
)
print(profile)
# {'name': 'Alice', 'age': 30, 'city': 'NYC', 'occupation': 'Engineer'}
```

### Default Arguments

```python
# ✅ Good: Immutable default
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))              # Hello, Alice!
print(greet("Alice", "Hi"))        # Hi, Alice!

# ❌ Bad: Mutable default (common pitfall!)
def append_to_list(item, target=[]):
    target.append(item)
    return target

print(append_to_list(1))    # [1]
print(append_to_list(2))    # [1, 2]  ← Bug! Shared list

# ✅ Fixed: Use None as default
def append_to_list_fixed(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```

### *args — Variable Positional Arguments

```python
def total(*args):
    """Sum any number of arguments."""
    print(f"Arguments: {args}")     # Tuple
    print(f"Type: {type(args)}")    # <class 'tuple'>
    return sum(args)

print(total(1, 2, 3))          # 6
print(total(1, 2, 3, 4, 5))   # 15

# Practical example
def log_message(level, *args):
    """Log a message with any number of details."""
    message = f"[{level.upper()}] " + " | ".join(str(a) for a in args)
    print(message)

log_message("info", "User", "logged in", "from", "192.168.1.1")
# [INFO] User | logged in | from | 192.168.1.1
```

### **kwargs — Variable Keyword Arguments

```python
def print_info(**kwargs):
    """Print any keyword arguments."""
    print(f"Keyword arguments: {kwargs}")  # Dict
    print(f"Type: {type(kwargs)}")          # <class 'dict'>
    for key, value in kwargs.items():
        print(f"  {key}: {value}")

print_info(name="Alice", age=30, city="NYC")
# Keyword arguments: {'name': 'Alice', 'age': 30, 'city': 'NYC'}
# Type: <class 'dict'>
#   name: Alice
#   age: 30
#   city: NYC

# Practical: flexible configuration
def create_config(debug=False, log_level="INFO", **settings):
    """Create a configuration with flexible settings."""
    config = {
        "debug": debug,
        "log_level": log_level,
        **settings,
    }
    return config

config = create_config(
    debug=True,
    log_level="DEBUG",
    database="postgresql",
    cache="redis",
    workers=4
)
print(config)
# {'debug': True, 'log_level': 'DEBUG', 'database': 'postgresql', 'cache': 'redis', 'workers': 4}
```

### Combined Parameters

```python
# Order: positional, *args, keyword-only, **kwargs
def complex_function(pos1, pos2, *args, keyword_only=True, **kwargs):
    """Demonstrate all parameter types."""
    print(f"Positional: {pos1}, {pos2}")
    print(f"Variable args: {args}")
    print(f"Keyword only: {keyword_only}")
    print(f"Variable kwargs: {kwargs}")

complex_function(1, 2, 3, 4, keyword_only=False, extra="data")
# Positional: 1, 2
# Variable args: (3, 4)
# Keyword only: False
# Variable kwargs: {'extra': 'data'}
```

### Keyword-Only Arguments

```python
# Force parameters to be keyword-only with *
def create_user(name, age, *, email, phone=None):
    """Create a user — email must be keyword-only."""
    return {
        "name": name,
        "age": age,
        "email": email,
        "phone": phone,
    }

# ✅ Correct usage
user = create_user("Alice", 30, email="alice@example.com")
print(user)

# ❌ This would fail:
# create_user("Alice", 30, "alice@example.com")  # TypeError!
```

---

## 4.3 Lambda Functions

```python
# Lambda: anonymous, single-expression functions
# Syntax: lambda arguments: expression

# Basic lambda
square = lambda x: x ** 2
print(square(5))  # 25

# Multiple arguments
add = lambda a, b: a + b
print(add(3, 5))  # 8

# With default arguments
greet = lambda name, greeting="Hello": f"{greeting}, {name}!"
print(greet("Alice"))            # Hello, Alice!
print(greet("Alice", "Hi"))     # Hi, Alice!

# Practical uses

# 1. Sorting with custom key
students = [
    {"name": "Alice", "grade": 88},
    {"name": "Bob", "grade": 95},
    {"name": "Charlie", "grade": 72},
]
by_grade = sorted(students, key=lambda s: s["grade"], reverse=True)
print([s["name"] for s in by_grade])  # ['Bob', 'Alice', 'Charlie']

# 2. Filtering
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]

# 3. Mapping
squares = list(map(lambda x: x**2, numbers))
print(squares)  # [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# 4. With reduce
from functools import reduce
product = reduce(lambda a, b: a * b, numbers)
print(product)  # 3628800

# 5. In dictionary operations
operations = {
    "add": lambda a, b: a + b,
    "subtract": lambda a, b: a - b,
    "multiply": lambda a, b: a * b,
}
print(operations["add"](5, 3))       # 8
print(operations["multiply"](5, 3))  # 15
```

---

## 4.4 Scope and Closures

### LEGB Rule (Local, Enclosing, Global, Built-in)

```python
# Built-in scope
print(len([1, 2, 3]))  # Built-in function

# Global scope
global_var = "I'm global"

def outer():
    # Enclosing scope
    enclosing_var = "I'm enclosing"

    def inner():
        # Local scope
        local_var = "I'm local"
        print(global_var)      # ✅ Access global
        print(enclosing_var)   # ✅ Access enclosing
        print(local_var)       # ✅ Access local

    inner()

outer()

# Name resolution order: Local → Enclosing → Global → Built-in
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(x)  # "local" (finds local first)

    inner()
    print(x)  # "enclosing"

outer()
print(x)  # "global"
```

### Closures

```python
# A closure is a function that remembers its enclosing scope

def make_multiplier(factor):
    """Create a multiplier function."""
    def multiplier(x):
        return x * factor  # 'factor' is remembered from enclosing scope
    return multiplier

double = make_multiplier(2)
triple = make_multiplier(3)

print(double(5))   # 10
print(triple(5))   # 15

# Practical: logging decorator factory
def make_logger(prefix):
    def logger(message):
        print(f"[{prefix}] {message}")
    return logger

info_logger = make_logger("INFO")
error_logger = make_logger("ERROR")

info_logger("Server started")    # [INFO] Server started
error_logger("Connection failed")  # [ERROR] Connection failed

# Practical: counter
def make_counter(start=0):
    """Create a counter with increment and reset."""
    count = [start]  # List to allow modification in closure

    def increment():
        count[0] += 1
        return count[0]

    def reset():
        count[0] = start
        return count[0]

    def get():
        return count[0]

    # Return as namespace
    return type('Counter', (), {
        'increment': increment,
        'reset': reset,
        'get': get,
    })()

counter = make_counter(10)
print(counter.increment())  # 11
print(counter.increment())  # 12
print(counter.reset())      # 10
print(counter.get())        # 10
```

### nonlocal Keyword

```python
# Use nonlocal to modify enclosing scope variables
def make_account(balance=0):
    """Create a bank account with deposit and withdraw."""
    def deposit(amount):
        nonlocal balance
        balance += amount
        return balance

    def withdraw(amount):
        nonlocal balance
        if amount > balance:
            raise ValueError("Insufficient funds")
        balance -= amount
        return balance

    def get_balance():
        return balance

    return deposit, withdraw, get_balance

deposit, withdraw, get_balance = make_account(100)
print(deposit(50))       # 150
print(withdraw(30))      # 120
print(get_balance())     # 120
```

---

## 4.5 Decorators

Decorators are functions that modify other functions. They're one of Python's most powerful features.

### Basic Decorator

```python
import functools
import time

# Simple decorator
def timer(func):
    """Measure function execution time."""
    @functools.wraps(func)  # Preserves metadata
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@timer
def slow_function():
    """A function that takes some time."""
    time.sleep(1)
    return "Done!"

result = slow_function()
# slow_function took 1.0012 seconds
```

### Decorator with Arguments

```python
import functools

def retry(max_attempts=3, delay=1):
    """Retry a function on failure."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    print(f"Attempt {attempt} failed: {e}. Retrying in {delay}s...")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def unreliable_function():
    """A function that might fail."""
    import random
    if random.random() < 0.7:
        raise ValueError("Random failure!")
    return "Success!"
```

### Class-Based Decorator

```python
import functools

class CountCalls:
    """Decorator that counts function calls."""
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        self.call_count = 0

    def __call__(self, *args, **kwargs):
        self.call_count += 1
        print(f"Call {self.call_count} to {self.func.__name__}")
        return self.func(*args, **kwargs)

    def reset(self):
        self.call_count = 0

@CountCalls
def say_hello(name):
    return f"Hello, {name}!"

say_hello("Alice")   # Call 1 to say_hello
say_hello("Bob")     # Call 2 to say_hello
print(say_hello.call_count)  # 2
```

### Multiple Decorators

```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.4f}s")
        return result
    return wrapper

def log_calls(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with {args}, {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

# Decorators apply bottom-up (log_calls first, then timer)
@timer
@log_calls
def add(a, b):
    return a + b

add(3, 5)
# Calling add with (3, 5), {}
# add returned 8
# add took 0.0001s

# Equivalent to: add = timer(log_calls(add))
```

### Built-in Decorators

```python
# @property — controlled attribute access
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        """Get the radius."""
        return self._radius

    @radius.setter
    def radius(self, value):
        """Set the radius with validation."""
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        """Calculate area (read-only)."""
        return 3.14159 * self._radius ** 2

c = Circle(5)
print(c.radius)    # 5
print(c.area)      # 78.53975
c.radius = 10      # ✅ Uses setter
print(c.area)      # 314.159
# c.area = 100     # ❌ AttributeError (read-only)

# @classmethod — methods that work with the class, not instances
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, date_string):
        """Create a Date from 'YYYY-MM-DD' string."""
        year, month, day = map(int, date_string.split("-"))
        return cls(year, month, day)

    @classmethod
    def today(cls):
        """Create a Date for today."""
        import datetime
        today = datetime.date.today()
        return cls(today.year, today.month, today.day)

    def __str__(self):
        return f"{self.year:04d}-{self.month:02d}-{self.day:02d}"

date1 = Date(2024, 1, 15)
date2 = Date.from_string("2024-06-20")
date3 = Date.today()
print(date1)  # 2024-01-15
print(date2)  # 2024-06-20
print(date3)  # 2025-07-02

# @staticmethod — methods that don't need class or instance
class MathUtils:
    @staticmethod
    def is_even(n):
        return n % 2 == 0

    @staticmethod
    def factorial(n):
        if n <= 1:
            return 1
        return n * MathUtils.factorial(n - 1)

print(MathUtils.is_even(4))     # True
print(MathUtils.factorial(5))   # 120
```

---

## 4.6 Recursion

```python
# Basic recursion
def factorial(n):
    """Calculate factorial recursively."""
    if n <= 1:  # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case

print(factorial(5))  # 120

# Fibonacci sequence
def fibonacci(n):
    """Return the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Slow for large n (exponential time)
print([fibonacci(i) for i in range(10)])
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Optimized with memoization
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci_fast(n):
    """Fibonacci with memoization."""
    if n <= 1:
        return n
    return fibonacci_fast(n - 1) + fibonacci_fast(n - 2)

print(fibonacci_fast(100))  # 354224848179261915075

# Tree recursion: directory traversal
import os

def find_files(directory, extension):
    """Recursively find files with given extension."""
    results = []
    for item in os.listdir(directory):
        path = os.path.join(directory, item)
        if os.path.isdir(path):
            results.extend(find_files(path, extension))
        elif item.endswith(extension):
            results.append(path)
    return results

# Tail recursion (Python doesn't optimize, but useful pattern)
def factorial_tail(n, accumulator=1):
    """Tail-recursive factorial."""
    if n <= 1:
        return accumulator
    return factorial_tail(n - 1, n * accumulator)

print(factorial_tail(5))  # 120
```

---

## 4.7 Modules and Packages

### Creating Modules

```python
# math_utils.py
"""A utility module for mathematical operations."""

PI = 3.141592653589793
E = 2.718281828459045

def add(a, b):
    """Add two numbers."""
    return a + b

def multiply(a, b):
    """Multiply two numbers."""
    return a * b

class Circle:
    """A circle class."""
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        return PI * self.radius ** 2

if __name__ == "__main__":
    # Test code (only runs when executed directly)
    print(add(2, 3))
    print(Circle(5).area)
```

### Importing Modules

```python
# Method 1: Import entire module
import math
print(math.sqrt(144))  # 12.0

# Method 2: Import with alias
import numpy as np
import pandas as pd

# Method 3: Import specific items
from math import sqrt, pi, e
print(sqrt(144))  # 12.0
print(pi)         # 3.141592653589793

# Method 4: Import all (avoid in production!)
from math import *
print(sqrt(144))  # 12.0

# Method 5: Import module attributes
from math import sqrt as square_root
print(square_root(144))  # 12.0

# Import your own modules
import math_utils
print(math_utils.add(2, 3))

from math_utils import Circle
c = Circle(5)
print(c.area)

# Reload a module (useful during development)
import importlib
importlib.reload(math_utils)
```

### Packages

```python
# Package structure:
# my_package/
# ├── __init__.py          ← Makes it a package
# ├── math_utils.py
# ├── string_utils.py
# └── sub_package/
#     ├── __init__.py
#     └── advanced.py

# __init__.py (can be empty or expose public API)
# my_package/__init__.py
from .math_utils import add, multiply
from .string_utils import capitalize_words

# Importing from packages
from my_package import add
from my_package.math_utils import add
from my_package.sub_package.advanced import complex_function

# Relative imports (within a package)
# In my_package/math_utils.py:
from . import string_utils  # Same package
from .. import other_package  # Parent package
```

### Module Search Path

```python
import sys

# Where Python looks for modules
print("Module search path:")
for path in sys.path:
    print(f"  {path}")

# Add a custom path
sys.path.append('/path/to/my/modules')

# Find where a module is located
import math
print(math.__file__)  # Shows where math module is located

# Check if a module is importable
import importlib.util
spec = importlib.util.find_spec("numpy")
if spec is None:
    print("numpy is not installed")
else:
    print(f"numpy found at: {spec.origin}")
```

---

## 4.8 Higher-Order Functions

```python
# Functions that take functions as arguments or return functions

# map — apply function to each element
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# Multiple iterables
names = ["alice", "bob", "charlie"]
lengths = list(map(len, names))
print(lengths)  # [5, 3, 7]

# filter — keep elements where function returns True
numbers = range(1, 21)
primes = list(filter(lambda n: all(n % i != 0 for i in range(2, int(n**0.5) + 1)) and n > 1, numbers))
print(primes)  # [2, 3, 5, 7, 11, 13, 17, 19]

# reduce — accumulate result
from functools import reduce
numbers = [1, 2, 3, 4, 5]
product = reduce(lambda a, b: a * b, numbers)
print(product)  # 120

# sorted with key
students = [
    {"name": "Alice", "grade": 88},
    {"name": "Bob", "grade": 95},
    {"name": "Charlie", "grade": 72},
]
sorted_students = sorted(students, key=lambda s: s["grade"], reverse=True)
print([s["name"] for s in sorted_students])  # ['Bob', 'Alice', 'Charlie']

# any and all
numbers = [2, 4, 6, 8, 10]
print(all(n % 2 == 0 for n in numbers))  # True (all even)
print(any(n > 8 for n in numbers))        # True (at least one > 8)
```

---

## Key Takeaways

1. **Functions are first-class objects** — They can be passed as arguments, returned, and assigned to variables.
2. **Use type hints** — Make your code self-documenting and enable better IDE support.
3. ***args and **kwargs** — Handle variable numbers of arguments flexibly.
4. **Closures remember scope** — Inner functions can access enclosing function variables.
5. **Decorators modify behavior** — Use `@functools.wraps` to preserve metadata.
6. **@property** — Create controlled attribute access with getters/setters.
7. **@classmethod** — Methods that work with the class, not instances.
8. **@staticmethod** — Utility methods that don't need class or instance access.
9. **Modules organize code** — Use `if __name__ == "__main__"` for test code.
10. **Packages group modules** — Use `__init__.py` to expose public API.

---

## Practice Exercises

### Exercise 1: Function Builder
Create a function that takes a list of numbers and returns a dictionary with:
- "sum": sum of all numbers
- "avg": average
- "min": minimum
- "max": maximum
- "count": number of elements

```python
def analyze_numbers(numbers):
    """Analyze a list of numbers."""
    # Your implementation
    pass

result = analyze_numbers([1, 2, 3, 4, 5])
print(result)
# {'sum': 15, 'avg': 3.0, 'min': 1, 'max': 5, 'count': 5}
```

### Exercise 2: Decorator Factory
Create a `@validate_types` decorator that checks function argument types:
```python
@validate_types(int, int)
def add(a, b):
    return a + b

add(1, 2)      # ✅ Works
add(1, "2")    # ❌ Raises TypeError
```

### Exercise 3: Memoization Decorator
Implement a memoization decorator that:
1. Caches function results
2. Has a max cache size
3. Can clear the cache
4. Tracks cache hits and misses

### Exercise 4: Module System
Create a package called `utils` with:
- `string_utils.py`: capitalize_words, truncate, slugify
- `math_utils.py`: fibonacci, is_prime, factorial
- `__init__.py`: expose public API
- Test it from a separate script

### Challenge: Function Registry
Build a function registry system:
```python
@register("math.add")
def add(a, b):
    return a + b

@register("math.multiply")
def multiply(a, b):
    return a * b

# Call by name
print(call("math.add", 2, 3))  # 5
print(list_functions())  # ['math.add', 'math.multiply']
```

---

*In the next chapter, we'll explore Python's powerful data structures — lists, tuples, sets, and dictionaries.*
