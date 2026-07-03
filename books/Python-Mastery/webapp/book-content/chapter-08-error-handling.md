# Chapter 8: Error Handling & Testing

Robust software doesn't just work when things go right — it handles failure gracefully. Python's exception system gives you fine-grained control over error recovery, while its built-in testing tools ensure your code stays correct as it evolves. This chapter covers both: how to handle errors elegantly and how to test your code thoroughly.

---

## 8.1 Exception Basics

### What Happens When Something Goes Wrong?

When Python encounters a problem during execution, it creates an **exception object** and raises it. If nothing catches the exception, the program crashes with a traceback:

```python
# This raises a ZeroDivisionError
result = 10 / 0
# Traceback (most recent call last):
#   File "<stdin>", line 1, in <module>
# ZeroDivisionError: division by zero
```

### The try/except Statement

The `try`/`except` block lets you **catch** exceptions and handle them gracefully:

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
# Output: Cannot divide by zero!
```

### Catching Specific Exceptions

Always catch the **most specific** exception you expect. This prevents accidentally swallowing unrelated errors:

```python
# Good: catch what you expect
try:
    value = int(user_input)
    result = 100 / value
except ValueError:
    print("Please enter a valid number.")
except ZeroDivisionError:
    print("Number cannot be zero.")

# Bad: catching everything hides bugs
try:
    value = int(user_input)
    result = 100 / value
except Exception:           # Don't do this!
    print("Something went wrong.")
```

### Multiple Except Blocks

Each `except` clause can handle a different exception type:

```python
def process_data(data, index):
    """Access a specific element and perform division."""
    try:
        element = data[index]
        result = 100 / element
        return result
    except IndexError:
        print(f"Index {index} is out of range for data of length {len(data)}")
        return None
    except ZeroDivisionError:
        print(f"Cannot divide by zero; element at index {index} is 0")
        return None
    except TypeError:
        print("Data must contain numeric values")
        return None

print(process_data([10, 20, 30], 1))     # 10.0
print(process_data([10, 20, 30], 5))     # Index 5 is out of range... None
print(process_data([10, 0, 30], 1))      # Cannot divide by zero... None
print(process_data(["a", "b"], 0))       # Data must contain numeric... None
```

### Catching Multiple Exceptions in One Block

When different exceptions require the same handling, group them in a tuple:

```python
try:
    value = int(user_input)
except (ValueError, TypeError) as e:
    print(f"Invalid input: {e}")
```

### The Bare Except Anti-Pattern

Using `except:` without specifying an exception type is a **serious anti-pattern**. It catches everything, including `SystemExit` and `KeyboardInterrupt`, making it impossible to stop your program:

```python
# NEVER DO THIS
try:
    do_something()
except:
    print("Something went wrong")

# Also avoid catching bare Exception when you mean specific errors:
try:
    do_something()
except Exception:  # Better than bare except, but still too broad
    print("Something went wrong")
```

---

## 8.2 Exception Handling Patterns

### The try/except/else/finally Complete Structure

Python's exception handling supports four clauses that work together:

```python
try:
    # Code that might raise an exception
    file = open("data.txt", "r")
    content = file.read()
except FileNotFoundError:
    # Handles the specific error
    print("File not found. Creating a new one.")
except PermissionError:
    print("No permission to read this file.")
else:
    # Runs ONLY if no exception was raised in try
    print(f"File read successfully. Length: {len(content)}")
finally:
    # ALWAYS runs, whether or not an exception occurred
    print("Cleanup complete.")
```

**Rule of thumb:** If you only need `try`/`except`/`finally`, the `else` clause is unnecessary — put the remaining logic inside the `try` block. Use `else` when you want to narrow the scope of code that could raise the exception you're catching.

### The finally Clause for Cleanup

The `finally` block is guaranteed to run, even if the `try` block raises an unhandled exception or contains a `return` statement:

```python
def read_config(path):
    """Read a configuration file with guaranteed cleanup."""
    file = None
    try:
        file = open(path)
        config = parse_config(file.read())
        return config
    except FileNotFoundError:
        print(f"Config file {path} not found, using defaults")
        return {"debug": False, "verbose": False}
    finally:
        # This ALWAYS runs — even after return
        if file is not None:
            file.close()
            print(f"Closed {path}")

# Context manager is the modern alternative (see below)
```

### Context Managers: The Pythonic Approach

The `with` statement provides cleaner resource management than `try`/`finally`:

```python
# Modern Pythonic approach
def read_config(path):
    """Read a configuration file using a context manager."""
    try:
        with open(path) as file:
            return parse_config(file.read())
    except FileNotFoundError:
        return {"debug": False, "verbose": False}
```

### Exception Chaining with `raise from`

When re-raising an exception in a handler, use `raise from` to preserve the original traceback:

```python
class DatabaseError(Exception):
    """Base exception for database operations."""
    pass

class ConnectionError(DatabaseError):
    """Raised when a database connection fails."""
    pass

def connect_to_database(host, port):
    """Connect to a database with chained exceptions."""
    import socket
    try:
        sock = socket.create_connection((host, port), timeout=5)
        return sock
    except socket.timeout as exc:
        raise ConnectionError(
            f"Failed to connect to {host}:{port}"
        ) from exc   # Chains the original socket.timeout

# The traceback shows both exceptions:
# Traceback (most recent call last):
#   ... socket.timeout ...
#
# The above exception was the direct cause of the following exception:
#
# Traceback (most recent call last):
#   ... ConnectionError: Failed to connect to ...
```

You can also suppress the chain with `raise ... from None`:

```python
try:
    open("secret.txt")
except FileNotFoundError:
    raise PermissionError("Access denied") from None
    # The original FileNotFoundError is hidden
```

### Exception Groups (Python 3.11+)

Exception groups let you raise and handle **multiple exceptions at once**, which is especially useful in concurrent code:

```python
# Raising multiple exceptions
raise ExceptionGroup("validation failed", [
    ValueError("name too short"),
    ValueError("age must be positive"),
    TypeError("email must be a string"),
])

# Handling them with except*
def validate_user(data):
    """Validate user data, collecting all errors."""
    errors = []
    if len(data.get("name", "")) < 2:
        errors.append(ValueError("name must be at least 2 characters"))
    if not isinstance(data.get("age"), int) or data["age"] < 0:
        errors.append(ValueError("age must be a non-negative integer"))
    if not isinstance(data.get("email"), str):
        errors.append(TypeError("email must be a string"))

    if errors:
        raise ExceptionGroup("user validation failed", errors)

# except* handles each exception type independently
try:
    validate_user({"name": "", "age": -1, "email": 42})
except* ValueError as eg:
    print(f"Value errors: {eg.exceptions}")
except* TypeError as eg:
    print(f"Type errors: {eg.exceptions}")

# Output:
# Value errors: (<ValueError: 'name must be at least 2 characters'>, ValueError('age must be a non-negative integer'))
# Type errors: (<TypeError: 'email must be a string'>,)
```

---

## 8.3 Custom Exceptions

### Why Create Custom Exceptions?

Custom exceptions communicate **intent** and create a structured hierarchy that callers can catch at the right granularity:

```python
# Application-level exception hierarchy
class AppError(Exception):
    """Base exception for all application errors."""
    pass

class ValidationError(AppError):
    """Raised when input validation fails."""
    def __init__(self, field, message, value=None):
        self.field = field
        self.message = message
        self.value = value
        super().__init__(f"Validation error on '{field}': {message}")

class NotFoundError(AppError):
    """Raised when a requested resource is not found."""
    def __init__(self, resource_type, resource_id):
        self.resource_type = resource_type
        self.resource_id = resource_id
        super().__init__(f"{resource_type} with id '{resource_id}' not found")

class AuthenticationError(AppError):
    """Raised when authentication fails."""
    pass

class AuthorizationError(AppError):
    """Raised when the user lacks permissions for an action."""
    def __init__(self, action, resource=None):
        self.action = action
        self.resource = resource
        msg = f"Not authorized to perform '{action}'"
        if resource:
            msg += f" on '{resource}'"
        super().__init__(msg)

class RateLimitError(AppError):
    """Raised when an API rate limit is exceeded."""
    def __init__(self, retry_after_seconds):
        self.retry_after = retry_after_seconds
        super().__init__(f"Rate limit exceeded. Retry after {retry_after_seconds}s")
```

### Using Custom Exceptions

```python
def create_user(username, email, age):
    """Create a new user with validation."""
    if len(username) < 3:
        raise ValidationError("username", "must be at least 3 characters", username)
    if "@" not in email:
        raise ValidationError("email", "must be a valid email address", email)
    if age < 0 or age > 150:
        raise ValidationError("age", "must be between 0 and 150", age)

    # ... create user ...
    return {"username": username, "email": email, "age": age}

# Callers can handle at the right level
try:
    user = create_user("ab", "not-email", 200)
except ValidationError as e:
    print(f"Invalid input — field: {e.field}, problem: {e.message}")
    # Output: Invalid input — field: username, problem: must be at least 3 characters

# Or catch the entire hierarchy
try:
    user = create_user("ab", "not-email", 200)
except AppError as e:
    print(f"Application error: {e}")
```

### Exception Best Practices

| Practice | Description |
|---|---|
| **Inherit from `Exception`** | Never inherit from `BaseException`; use `Exception` as the root |
| **Name clearly** | Use `Error`, `Exception`, or `Warning` suffix conventionally |
| **Store context** | Attach relevant data as attributes (e.g., `field`, `code`) |
| **Include a message** | Always pass a helpful string to `super().__init__()` |
| **One purpose per class** | Each exception type should represent one kind of error |
| **Don't over-engineer** | Only create custom exceptions when built-ins don't fit |

---

## 8.4 Built-in Exceptions

Python's exception hierarchy provides a rich set of built-in exception types. Here are the most commonly encountered:

```
BaseException
 ├── SystemExit
 ├── KeyboardInterrupt
 ├── GeneratorExit
 └── Exception
      ├── ArithmeticError
      │    ├── FloatingPointError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── EOFError
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── NameError
      │    └── UnboundLocalError
      ├── OSError
      │    ├── FileNotFoundError
      │    ├── FileExistsError
      │    ├── PermissionError
      │    ├── IsADirectoryError
      │    ├── NotADirectoryError
      │    └── TimeoutError
      ├── RuntimeError
      │    ├── NotImplementedError
      │    └── RecursionError
      ├── StopIteration
      ├── SyntaxError
      │    └── IndentationError
      ├── TypeError
      └── ValueError
           └── UnicodeError
```

| Exception | When It's Raised | Example |
|---|---|---|
| `ValueError` | Wrong value, right type | `int("abc")`, `raise ValueError("bad")` |
| `TypeError` | Wrong type | `"2" + 2`, `len(42)` |
| `KeyError` | Dict key not found | `{"a": 1}["b"]` |
| `IndexError` | Sequence index out of range | `[1, 2, 3][5]` |
| `FileNotFoundError` | File or directory missing | `open("nope.txt")` |
| `FileExistsError` | Creating existing file/dir | `open("x.txt", "x")` |
| `PermissionError` | Insufficient OS permissions | `open("/root/file")` |
| `AttributeError` | Attribute not found on object | `"str".nonexistent()` |
| `StopIteration` | Iterator exhausted | `next(iter([]))` |
| `ImportError` | Module import fails | `import nonexistent_module` |
| `ModuleNotFoundError` | Module not found on path | `import xyz123` |
| `RuntimeError` | Generic runtime error | Asyncio errors, recursion |
| `RecursionError` | Max recursion depth exceeded | Infinite self-call |
| `NotImplementedError` | Abstract method not overridden | In abstract base classes |
| `AssertionError` | `assert` statement fails | `assert 1 == 2` |
| `NameError` | Name not found in scope | `print(unknown_var)` |
| `UnboundLocalError` | Local variable used before assignment | Use before assignment |
| `SyntaxError` | Invalid Python syntax | `def f(x):` (missing body) |
| `IndentationError` | Wrong indentation | Mixed tabs/spaces |
| `EOFError` | End of input (e.g., `input()`) | `input()` on closed stream |
| `ZeroDivisionError` | Division by zero | `1 / 0` |
| `OverflowError` | Numeric overflow | `math.exp(1000)` |
| `TimeoutError` | Operation timed out | Socket timeout |

### Raising Exceptions

```python
# Raise with a message
raise ValueError("Age cannot be negative")

# Raise an existing exception (preserves traceback)
try:
    open("data.txt")
except FileNotFoundError:
    raise  # Re-raises the current exception

# Raise with explicit cause
try:
    parse_json(text)
except json.JSONDecodeError as e:
    raise ValueError(f"Invalid configuration: {e}") from e
```

### Exception Hierarchy Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Exception Handling Flow                    │
│                                                                  │
│  ┌─────────┐    Exception     ┌──────────────┐                   │
│  │  try    │ ──── raised ────>│  except 1    │── matched? ──Yes──│──> handle ──┐
│  │  block  │                  │  (specific)  │                    │            │
│  └─────────┘                  └──────────────┘                    │            │
│       │                           │ No                            │            │
│       │                           ▼                               │            │
│       │                     ┌──────────────┐                      │            │
│       │                     │  except 2    │── matched? ──Yes────>│            │
│       │                     │  (specific)  │                      │            │
│       │                     └──────────────┘                      │            │
│       │                           │ No                            │            │
│       │                           ▼                               │            │
│       │                     ┌──────────────┐                      │            │
│       │                     │  else        │── runs only ────────>│            │
│       │                     │  (no error)  │   if no exception    │            │
│       │                     └──────────────┘                      │            │
│       │                           │                               │            │
│       │                           ▼                               │            │
│       │                     ┌──────────────┐                      │            │
│       │                     │  finally     │── always runs ──────>│            │
│       │                     │  (cleanup)   │                      │            │
│       │                     └──────────────┘                      │            │
│       │                                                           │            │
│       └────────────── No exception ──────────────────────────────>│            │
│                                                                    │            │
│  If no except matches ──> Unhandled exception + traceback         │<───────────┘
└──────────────────────────────────────────────────────────────────┘
```

---

## 8.5 The Warning System

Warnings signal conditions that aren't errors but deserve attention — often deprecation notices or suspicious code patterns.

### Basic Usage

```python
import warnings

# Issue a warning
warnings.warn("This function is deprecated, use new_function() instead",
              DeprecationWarning, stacklevel=2)

# Warning with a specific category
warnings.warn("Config value 'timeout' is deprecated, use 'request_timeout'",
              FutureWarning)
```

### Warning Categories

```python
import warnings

# DeprecationWarning — deprecated feature (silenced by default in production)
warnings.warn("old_func() is deprecated", DeprecationWarning)

# FutureWarning — behavior that will change (always shown by default)
warnings.warn("Result format will change in v3.0", FutureWarning)

# RuntimeWarning — unusual runtime behavior
warnings.warn("coroutine was never awaited", RuntimeWarning)

# UserWarning — generic user-defined warning
warnings.warn("Disk space is below 10%", UserWarning)

# ResourceWarning — resource not properly closed (enabled in debug mode)
warnings.warn("unclosed file handle", ResourceWarning)
```

### Controlling Warning Behavior

```python
import warnings

# Show all warnings (useful during development)
warnings.filterwarnings("default")

# Turn specific warnings into errors (strict mode)
warnings.filterwarnings("error", category=DeprecationWarning)

# Ignore specific warnings
warnings.filterwarnings("ignore", category=DeprecationWarning,
                         message=".*old_func.*")

# Ignore all warnings from a specific module
warnings.filterwarnings("ignore", module="third_party_lib")

# Show each warning only once per location
warnings.filterwarnings("once", category=UserWarning)

# Show each unique warning message once
warnings.filterwarnings("module", category=FutureWarning)

# Using the -W flag from the command line
# python -W error::DeprecationWarning my_script.py
# python -W default::FutureWarning my_script.py
```

### Catching Warnings in Code

```python
import warnings

# Catch warnings as a list
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    # Code that might warn
    deprecated_function()
    new_function()

    for w in caught:
        print(f"{w.category.__name__}: {w.message}")

# Turn warnings into errors for a block
with warnings.catch_warnings():
    warnings.simplefilter("error")
    try:
        deprecated_function()
    except DeprecationWarning as e:
        print(f"Caught as error: {e}")
```

---

## 8.6 Logging

The `logging` module is Python's standard way to produce diagnostic output. It's far more flexible than `print()` — supporting severity levels, multiple output targets, and runtime configuration.

### logging vs print

| Feature | `print()` | `logging` |
|---|---|---|
| Severity levels | None | DEBUG, INFO, WARNING, ERROR, CRITICAL |
| Output targets | stdout only | Files, streams, network, syslog, etc. |
| Format control | Manual (f-strings) | Configurable formatters |
| Enable/disable at runtime | No | Yes (per logger) |
| Timestamps | Manual | Built-in |
| Module identification | Manual | Automatic |
| Thread safety | Partial | Full |

### Basic Configuration

```python
import logging

# Simplest setup — logs to stderr
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure with options
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    filename="app.log",     # omit to log to stderr
    filemode="a",           # append (default)
)
```

### Log Levels

```
┌──────────────────────────────────────────────────────────┐
│                    Logging Levels                        │
│                                                          │
│   CRITICAL  ──>  Program cannot continue                 │
│   ERROR     ──>  Something failed                        │
│   WARNING   ──>  Unexpected but recoverable              │
│   INFO      ──>  Normal operational messages             │
│   DEBUG     ──>  Detailed diagnostic information         │
│                                                          │
│   ◄── MORE SEVERE          LESS SEVERE ──►              │
│                                                          │
│   By default, only WARNING and above are displayed.      │
│   Set level to INFO to see INFO + WARNING + ERROR + CRIT │
│   Set level to DEBUG to see everything.                  │
└──────────────────────────────────────────────────────────┘
```

### Logger Hierarchy and Usage

```python
import logging

# Create loggers — use __name__ for module-level loggers
logger = logging.getLogger(__name__)

# Parent logger
app_logger = logging.getLogger("myapp")

# Child loggers inherit parent settings
db_logger = logging.getLogger("myapp.database")
cache_logger = logging.getLogger("myapp.cache")

# Log messages at different levels
def process_order(order_id):
    """Demonstrate logging at multiple levels."""
    logger.debug(f"Processing order {order_id}")
    logger.info(f"Starting order {order_id} processing")

    try:
        validate_order(order_id)
    except ValueError as e:
        logger.warning(f"Order {order_id} validation warning: {e}")
        # Continue processing with fallback

    try:
        charge_payment(order_id)
    except PaymentError as e:
        logger.error(f"Payment failed for order {order_id}: {e}")
        raise

    logger.info(f"Order {order_id} processed successfully")
```

### Handlers, Formatters, and Configuration

```python
import logging
import sys

# Create a structured logger setup
def setup_logging():
    """Configure logging with multiple handlers."""
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    # Console handler — INFO and above, colored
    console = logging.StreamHandler(sys.stderr)
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter(
        "%(levelname)-8s %(name)s: %(message)s"
    ))

    # File handler — DEBUG and above, detailed
    file_handler = logging.FileHandler("app.log")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)-8s] %(name)s.%(funcName)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))

    root.addHandler(console)
    root.addHandler(file_handler)

    # Silence noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)

setup_logging()
```

### The `exception` Method for Tracebacks

```python
import logging

logger = logging.getLogger(__name__)

def divide(a, b):
    """Divide two numbers with proper error logging."""
    try:
        return a / b
    except ZeroDivisionError:
        logger.exception("Division by zero: a=%s, b=%s", a, b)
        # logger.exception() automatically includes the traceback
        # and logs at ERROR level
        return None

divide(10, 0)
# ERROR  __main__:divide: Division by zero: a=10, b=0
# Traceback (most recent call last):
#   File "example.py", line 10, in divide
#     return a / b
# ZeroDivisionError: division by zero
```

---

## 8.7 The unittest Module

Python's `unittest` module is a built-in test framework inspired by Java's JUnit. It provides a structured way to organize tests using classes and assertion methods.

### Basic TestCase

```python
import unittest

class TestCalculator(unittest.TestCase):
    """Tests for calculator functions."""

    def setUp(self):
        """Run before each test method."""
        self.calculator = Calculator()
        self.history = []

    def tearDown(self):
        """Run after each test method."""
        self.calculator.clear_history()

    def test_add(self):
        """Test addition of two numbers."""
        result = self.calculator.add(2, 3)
        self.assertEqual(result, 5)

    def test_divide(self):
        """Test division of two numbers."""
        result = self.calculator.divide(10, 2)
        self.assertAlmostEqual(result, 5.0)

    def test_divide_by_zero(self):
        """Test that dividing by zero raises ValueError."""
        with self.assertRaises(ZeroDivisionError):
            self.calculator.divide(10, 0)

    def test_negative_numbers(self):
        """Test with negative inputs."""
        result = self.calculator.add(-3, -7)
        self.assertEqual(result, -10)

if __name__ == "__main__":
    unittest.main()
```

### Complete Assert Methods Table

| Method | Checks That |
|---|---|
| `assertEqual(a, b)` | `a == b` |
| `assertNotEqual(a, b)` | `a != b` |
| `assertTrue(x)` | `bool(x) is True` |
| `assertFalse(x)` | `bool(x) is False` |
| `assertIs(a, b)` | `a is b` (identity) |
| `assertIsNot(a, b)` | `a is not b` |
| `assertIsNone(x)` | `x is None` |
| `assertIsNotNone(x)` | `x is not None` |
| `assertIn(a, b)` | `a in b` |
| `assertNotIn(a, b)` | `a not in b` |
| `assertIsInstance(a, t)` | `isinstance(a, t)` |
| `assertNotIsInstance(a, t)` | `not isinstance(a, t)` |
| `assertRaises(e)` | Code raises exception `e` |
| `assertRaisesRegex(e, r)` | Raises `e` matching regex `r` |
| `assertWarns(w)` | Code triggers warning `w` |
| `assertWarnsRegex(w, r)` | Warning `w` matching regex `r` |
| `assertAlmostEqual(a, b)` | `a ≈ b` (to 7 decimal places) |
| `assertNotAlmostEqual(a, b)` | `a ≉ b` |
| `assertGreater(a, b)` | `a > b` |
| `assertGreaterEqual(a, b)` | `a >= b` |
| `assertLess(a, b)` | `a < b` |
| `assertLessEqual(a, b)` | `a <= b` |
| `assertRegex(s, r)` | String `s` matches regex `r` |
| `assertNotRegex(s, r)` | String `s` doesn't match regex `r` |
| `assertCountEqual(a, b)` | Same elements (ignoring order and duplicates) |
| `assertListEqual(a, b)` | Lists are equal |
| `assertDictEqual(a, b)` | Dicts are equal |
| `assertSetEqual(a, b)` | Sets are equal |
| `assertTupleEqual(a, b)` | Tuples are equal |

### Fixtures and Test Organization

```python
import unittest

class TestDatabase(unittest.TestCase):
    """Tests requiring database setup/teardown."""

    @classmethod
    def setUpClass(cls):
        """Run once before ALL tests in this class."""
        cls.db = create_test_database()

    @classmethod
    def tearDownClass(cls):
        """Run once after ALL tests in this class."""
        cls.db.drop()

    def setUp(self):
        """Run before each test — insert fresh data."""
        self.db.execute("INSERT INTO users (name, email) VALUES (?, ?)",
                        ("Alice", "alice@example.com"))

    def tearDown(self):
        """Run after each test — clean up."""
        self.db.execute("DELETE FROM users")

    def test_find_user(self):
        user = self.db.find_user("alice@example.com")
        self.assertIsNotNone(user)
        self.assertEqual(user["name"], "Alice")

    def test_user_not_found(self):
        user = self.db.find_user("nobody@example.com")
        self.assertIsNone(user)
```

### Skipping Tests and Expected Failures

```python
import unittest
import sys

class TestPlatformSpecific(unittest.TestCase):
    """Demonstrate test skipping and expected failures."""

    @unittest.skip("Not implemented yet")
    def test_not_ready(self):
        pass

    @unittest.skipIf(sys.platform == "win32", "Bug on Windows")
    def test_unix_only(self):
        self.assertTrue(True)

    @unittest.skipUnless(sys.platform == "linux", "Linux-only test")
    def test_linux_feature(self):
        import os
        self.assertTrue(os.path.exists("/proc"))

    @unittest.expectedFailure
    def test_known_bug(self):
        """This test is expected to fail — marks as known issue."""
        self.assertEqual(2 + 2, 5)  # We know this is wrong

    def test_conditional_skip(self):
        """Skip at runtime based on a condition."""
        import shutil
        if shutil.which("ffmpeg") is None:
            self.skipTest("ffmpeg not installed")
        # ... test that requires ffmpeg ...
```

### Test Discovery

```bash
# Discover all test files (names matching test_*.py)
python -m unittest discover

# Specify a directory
python -m unittest discover -s tests

# Specify a pattern
python -m unittest discover -s tests -p "test_*.py"

# Run a specific test class or method
python -m unittest tests.test_calculator.TestCalculator
python -m unittest tests.test_calculator.TestCalculator.test_add

# Verbose output
python -m unittest -v
```

---

## 8.8 pytest

`pytest` is the most popular third-party testing framework for Python. It simplifies test writing with plain functions, powerful fixtures, and a rich plugin ecosystem.

### Installation

```bash
pip install pytest
```

### Test Functions (No Classes Needed)

```python
# test_math_operations.py

def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return a / b

# --- Tests (plain functions, no class needed) ---

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -1) == -2

def test_add_zero():
    assert add(0, 5) == 5

def test_divide_normal():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ZeroDivisionError, match="Cannot divide"):
        divide(10, 0)
```

### Fixtures

Fixtures provide test setup, teardown, and dependency injection:

```python
# conftest.py — fixtures are auto-discovered by pytest

import pytest

@pytest.fixture
def sample_list():
    """Provide a sample list for testing."""
    return [3, 1, 4, 1, 5, 9, 2, 6]

@pytest.fixture
def temp_file(tmp_path):
    """Create a temporary file with test content."""
    file = tmp_path / "test_data.txt"
    file.write_text("line1\nline2\nline3\n")
    return file

@pytest.fixture
def database():
    """Set up and tear down a test database."""
    db = create_test_db()
    db.seed_data()
    yield db          # <-- yield = setup up to here, teardown after
    db.drop()

# Tests receive fixtures as parameters
def test_list_length(sample_list):
    assert len(sample_list) == 8

def test_list_sorted(sample_list):
    assert sorted(sample_list) == [1, 1, 2, 3, 4, 5, 6, 9]

def test_file_content(temp_file):
    lines = temp_file.read_text().splitlines()
    assert len(lines) == 3

def test_database_query(database):
    results = database.query("SELECT * FROM users")
    assert len(results) > 0
```

### Parametrize: Run Tests with Multiple Inputs

```python
import pytest

def is_palindrome(s):
    """Check if a string is a palindrome."""
    cleaned = s.lower().replace(" ", "")
    return cleaned == cleaned[::-1]

@pytest.mark.parametrize("input_str,expected", [
    ("racecar", True),
    ("hello", False),
    ("A man a plan a canal Panama", True),
    ("", True),
    ("a", True),
    ("ab", False),
    ("Was it a car or a cat I saw", True),
])
def test_is_palindrome(input_str, expected):
    assert is_palindrome(input_str) == expected

# Parametrize with IDs for readable output
@pytest.mark.parametrize("x,y,expected", [
    pytest.param(2, 3, 5, id="positive"),
    pytest.param(-1, -1, -2, id="negative"),
    pytest.param(0, 0, 0, id="zeros"),
], ids=str)
def test_add(x, y, expected):
    assert x + y == expected
```

### Marks

```python
import pytest
import sys

@pytest.mark.slow
def test_large_dataset():
    """Mark as slow — run with: pytest -m slow"""
    huge_list = list(range(1_000_000))
    assert len(huge_list) == 1_000_000

@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.platform == "win32", reason="Unix-only")
def test_unix_feature():
    pass

@pytest.mark.xfail(reason="Known bug #42")
def test_known_bug():
    assert 1 / 0  # Expected to fail

# Custom marks — register in pyproject.toml:
# [tool.pytest.ini_options]
# markers = [
#     "slow: marks tests as slow",
#     "integration: marks integration tests",
# ]
```

### pytest vs unittest Comparison

| Feature | `unittest` | `pytest` |
|---|---|---|
| Test organization | Class-based | Functions or classes |
| Setup/teardown | `setUp()`/`tearDown()` | Fixtures (`@pytest.fixture`) |
| Assertion style | `self.assertEqual(a, b)` | `assert a == b` |
| Parametrize | `subTest` (limited) | `@pytest.mark.parametrize` |
| Plugins | Limited ecosystem | 1,000+ plugins |
| Discovery | `python -m unittest discover` | `pytest` (auto-discovers) |
| Output format | Basic / verbose | Rich output with tracebacks |
| Conditional skip | `@unittest.skipIf` | `@pytest.mark.skipif` |
| Fixtures scope | Per-method only | function/class/module/session |
| Conftest | Not available | `conftest.py` auto-loaded |
| Third-party | Built-in (stdlib) | `pip install pytest` |

### conftest.py: Shared Fixtures

```
project/
├── conftest.py          # Project-wide fixtures
├── tests/
│   ├── conftest.py      # Test-directory fixtures
│   ├── test_api.py
│   └── test_models.py
```

```python
# conftest.py at project root
import pytest

@pytest.fixture(scope="session")
def api_client():
    """Create a reusable API client for the entire test session."""
    from myapp.api import Client
    client = Client(base_url="http://localhost:8000")
    yield client
    client.close()

@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get an auth token (reused for all tests in a module)."""
    return api_client.login("testuser", "testpass")

@pytest.fixture(autouse=True)
def reset_state():
    """Automatically reset global state before every test."""
    yield
    # Teardown: runs after every test function
    clear_cache()
```

---

## 8.9 Mocking

Mocking replaces real objects with controlled stand-ins, isolating the code under test from external dependencies (networks, databases, file systems, APIs).

### unittest.mock Fundamentals

```python
from unittest.mock import MagicMock, Mock, patch

# MagicMock — auto-creates attributes and supports magic methods
mock = MagicMock()
mock.get_user("alice")            # Returns a MagicMock (no error)
mock.get_user.assert_called_once_with("alice")

# Mock — simpler, no automatic attribute creation
mock = Mock()
mock.process.return_value = 42
result = mock.process("data")
assert result == 42
assert mock.process.called
```

### The `patch` Decorator

Replace objects for the duration of a test:

```python
from unittest.mock import patch

class UserService:
    def __init__(self, db):
        self.db = db

    def get_user_email(self, user_id):
        user = self.db.query(f"SELECT email FROM users WHERE id={user_id}")
        return user["email"] if user else None

# Test without a real database
@patch("myapp.services.db_connection")
def test_get_user_email(mock_db):
    """Replace the database with a mock."""
    mock_db.query.return_value = {"email": "alice@example.com"}

    service = UserService(mock_db)
    email = service.get_user_email(42)

    assert email == "alice@example.com"
    mock_db.query.assert_called_once_with("SELECT email FROM users WHERE id=42")
```

### The `patch` Context Manager

```python
import time

def get_current_timestamp():
    return time.time()

def is_recent(timestamp, seconds=300):
    """Check if a timestamp is within the last `seconds`."""
    return (time.time() - timestamp) < seconds

def test_is_recent():
    """Control time for deterministic testing."""
    with patch("time.time") as mock_time:
        mock_time.return_value = 1000000.0

        # Exactly at the boundary — not recent
        assert not is_recent(999700.0)    # 300 seconds ago

        # Within the window — recent
        assert is_recent(999701.0)        # 299 seconds ago
        assert is_recent(1000000.0)       # right now
```

### Mock Side Effects and Exceptions

```python
from unittest.mock import MagicMock

def test_side_effect():
    """Use side_effect to simulate varying behavior."""
    mock_api = MagicMock()

    # side_effect with a list: returns each value in sequence
    mock_api.fetch_data.side_effect = [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"},
        ConnectionError("Network timeout"),
    ]

    assert mock_api.fetch_data() == {"id": 1, "name": "Alice"}
    assert mock_api.fetch_data() == {"id": 2, "name": "Bob"}

    with pytest.raises(ConnectionError, match="Network timeout"):
        mock_api.fetch_data()

    # side_effect with a function: called with same arguments
    def dynamic_response(query):
        if "admin" in query:
            return {"role": "admin"}
        return {"role": "user"}

    mock_api.query.side_effect = dynamic_response
    assert mock_api.query("SELECT * FROM users") == {"role": "user"}
    assert mock_api.query("SELECT * FROM admins") == {"role": "admin"}
```

### Mock with Spec (Preventing Typos)

```python
from unittest.mock import create_autospec

class UserService:
    def get_user(self, user_id):
        ...  # real implementation

    def delete_user(self, user_id):
        ...  # real implementation

# autospec creates a mock that only allows methods that exist on UserService
mock_service = create_autospec(UserService)
mock_service.get_user(1)          # Works
mock_service.nonexistent_method() # AttributeError!

# Without spec, typos silently pass:
mock_service = MagicMock()
mock_service.get_usre(1)  # No error! (typo "usre")
```

### Verifying Interactions

```python
from unittest.mock import MagicMock, call

def test_order_processing():
    mock_email = MagicMock()
    mock_inventory = MagicMock()

    process_order(order_id=42, email_service=mock_email, inventory=mock_inventory)

    # Verify exact calls
    mock_email.send.assert_called_once()
    mock_email.send.assert_called_once_with(
        to="customer@example.com",
        subject="Order Confirmation",
        body="Your order #42 is confirmed."
    )

    # Verify call count
    assert mock_inventory.reserve.call_count == 3

    # Verify call order
    expected_calls = [
        call.reserve("item_A"),
        call.reserve("item_B"),
        call.confirm("order_42"),
    ]
    mock_inventory.assert_has_calls(expected_calls, any_order=False)
```

---

## 8.10 Code Coverage

Coverage measures which lines of your code are executed by tests. High coverage doesn't guarantee bug-free code, but low coverage guarantees untested code.

### Basic Usage

```bash
# Install coverage
pip install coverage

# Run tests with coverage
coverage run -m pytest

# View report in terminal
coverage report

# Generate HTML report
coverage html
# Opens htmlcov/index.html in your browser
```

### Coverage Report Example

```
----------- coverage: platform linux, python 3.14.0 -----------
Name                      Stmts   Miss  Cover   Missing
--------------------------------------------------------
myapp/__init__.py             2      0   100%
myapp/services.py            45      3    93%   87-89
myapp/models.py              32      0   100%
myapp/api.py                 68     12    82%   45-50, 78-84
myapp/utils.py               15      1    93%   42
--------------------------------------------------------
TOTAL                       162     16    90%
```

### Configuration (pyproject.toml)

```toml
[tool.coverage.run]
source = ["myapp"]
omit = [
    "tests/*",
    "*/conftest.py",
    "setup.py",
]

[tool.coverage.report]
show_missing = true
fail_under = 85
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "if TYPE_CHECKING:",
    "raise NotImplementedError",
    "@abstractmethod",
]

[tool.coverage.html]
directory = "htmlcov"
```

### Combining Coverage with pytest

```bash
# Install the pytest plugin
pip install pytest-cov

# Run with coverage in one command
pytest --cov=myapp --cov-report=term-missing --cov-report=html

# Coverage with minimum threshold
pytest --cov=myapp --cov-fail-under=80

# Multiple source directories
pytest --cov=myapp --cov=mylib --cov-report=term-missing
```

### Coverage Marks and Practical Tips

```python
# pragma: no cover — exclude lines that can't be tested
if __name__ == "__main__":     # pragma: no cover
    main()

# Common patterns that aren't worth testing
def __repr__(self):            # pragma: no cover
    return f"<User(id={self.id})>"

# TYPE_CHECKING block — never executed at runtime
from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:              # pragma: no cover
    from myapp.models import User
```

---

## 8.11 Test-Driven Development (TDD)

TDD is a discipline where you write **tests before** implementation code. The cycle is simple, but the discipline transforms how you design software.

### The Red-Green-Refactor Cycle

```
┌──────────────────────────────────────────────────────────────┐
│                 Test-Driven Development Cycle                 │
│                                                              │
│                        ┌──────────┐                          │
│                   ┌───>│   RED    │─── Write a failing test  │
│                   │    │          │    that defines desired   │
│                   │    └──────────┘    behavior               │
│                   │         │                                │
│                   │         ▼                                │
│                   │    ┌──────────┐                          │
│                   │    │  GREEN   │─── Write minimal code    │
│    Revisit       │    │          │    to make the test pass  │
│    for new        │    └──────────┘                          │
│    requirements   │         │                                │
│                   │         ▼                                │
│                   │    ┌──────────┐                          │
│                   │    │ REFACTOR │─── Clean up the code     │
│                   │    │          │    while keeping tests    │
│                   └────│          │    green                  │
│                        └──────────┘                          │
│                                                              │
│   Each cycle is SHORT — typically 5-15 minutes.              │
│   A test should FAIL before it passes.                       │
│   If it passes immediately, the test isn't specific enough.  │
└──────────────────────────────────────────────────────────────┘
```

### TDD in Practice: FizzBuzz Example

```python
# STEP 1: RED — Write a failing test
def test_fizzbuzz_returns_number_as_string():
    assert fizzbuzz(1) == "1"

# Run: FAIL (fizzbuzz doesn't exist yet)

# STEP 2: GREEN — Write minimal code to pass
def fizzbuzz(n):
    return str(n)

# Run: PASS

# STEP 3: RED — Write next failing test
def test_fizzbuzz_multiples_of_3():
    assert fizzbuzz(3) == "Fizz"

# Run: FAIL

# STEP 4: GREEN — Make it pass
def fizzbuzz(n):
    if n % 3 == 0:
        return "Fizz"
    return str(n)

# Run: PASS

# STEP 5: RED — Add more cases
def test_fizzbuzz_multiples_of_5():
    assert fizzbuzz(5) == "Buzz"

def test_fizzbuzz_multiples_of_15():
    assert fizzbuzz(15) == "FizzBuzz"

# Run: FAIL on both

# STEP 6: GREEN — Complete implementation
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

# Run: ALL PASS

# STEP 7: REFACTOR — The code is already clean. Done!
```

### When TDD Is Most Valuable

| Scenario | TDD Value | Why |
|---|---|---|
| Bug fixes | **Very high** | Write a test that reproduces the bug first; fix to make it pass |
| Algorithm development | **Very high** | Edge cases become explicit; you think through inputs/outputs |
| API design | **High** | You design the interface before the implementation |
| Complex business logic | **High** | Forces you to understand requirements deeply |
| Refactoring existing code | **High** | Tests provide a safety net |
| Quick prototypes | **Low** | Speed matters more than correctness |
| Exploratory / UI code | **Medium** | Hard to unit test; integration tests help more |

### The TDD Workflow Diagram

```
    ┌─────────────────────────────────────────────────┐
    │            TDD Workflow — Real Project           │
    │                                                  │
    │  1. Write a failing test                         │
    │     └──> Test describes ONE behavior             │
    │                                                  │
    │  2. Run the test — confirm it FAILS (Red)        │
    │     └──> If it passes, the test isn't specific   │
    │                                                  │
    │  3. Write the simplest code to PASS (Green)      │
    │     └──> Don't over-engineer yet                 │
    │                                                  │
    │  4. Run the test — confirm it PASSES             │
    │                                                  │
    │  5. REFACTOR — improve code quality              │
    │     └──> Tests catch any regressions             │
    │                                                  │
    │  6. Repeat from step 1 with the next behavior   │
    │                                                  │
    │  ◄── commit after each green+refactor cycle ──► │
    └─────────────────────────────────────────────────┘
```

---

## 8.12 Property-Based Testing

Property-based testing generates **random inputs** to test invariants (properties) that should always hold true, no matter the input. The `Hypothesis` library is the standard tool for this in Python.

### Installation

```bash
pip install hypothesis
```

### Basic Example

```python
from hypothesis import given, strategies as st

# Property: sorting a list always produces a valid sorted list
@given(st.lists(st.integers()))
def test_sort_returns_sorted_list(xs):
    result = sorted(xs)
    assert result == sorted(result)  # Idempotent
    assert len(result) == len(xs)    # Same length
    # Every element in result came from xs
    for item in result:
        assert item in xs

# Property: reversing twice gives the original
@given(st.lists(st.integers()))
def test_reverse_twice(xs):
    assert list(reversed(list(reversed(xs)))) == xs

# Property: addition is commutative
@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert a + b == b + a
```

### Strategies: Controlling Input Generation

```python
from hypothesis import given, strategies as st, settings

# Basic strategies
st.integers()                              # Any integer
st.integers(min_value=0, max_value=100)    # Bounded integer
st.floats(allow_nan=False, allow_infinity=False)  # Safe floats
st.text()                                  # Any string
st.text(min_size=1, max_size=50)           # Bounded string
st.booleans()                              # True or False
st.none()                                  # None

# Composite strategies
st.tuples(st.integers(), st.text())        # Tuple of (int, str)
st.one_of(st.integers(), st.text())        # Either int or text
st.lists(st.integers(), min_size=1)        # Non-empty list of ints
st.dictionaries(st.text(), st.integers())  # Dict with str keys, int values

# Email-like strings
st.emails()

# JSON-like structures
st.recursive(
    st.one_of(st.none(), st.booleans(), st.integers(), st.text()),
    lambda children: st.one_of(
        st.lists(children),
        st.dictionaries(st.text(), children),
    ),
    max_leaves=5,
)

# Complex strategies with custom validators
@st.composite
def valid_age(draw):
    return draw(st.integers(min_value=0, max_value=150))
```

### Using Hypothesis with pytest

```python
from hypothesis import given, strategies as st, assume, settings

@given(st.lists(st.integers(), min_size=1))
def test_median_is_middle_element(xs):
    """Median of a sorted list should be a valid middle element."""
    sorted_xs = sorted(xs)
    mid = len(sorted_xs) // 2
    median = sorted_xs[mid]
    assert median in sorted_xs  # Median is always an element of the list

@given(st.text(min_size=1), st.text(min_size=1))
def test_string_concatenation_length(a, b):
    """Length of concatenated strings equals sum of lengths."""
    assert len(a + b) == len(a) + len(b)

@given(st.dictionaries(st.text(), st.integers()))
def test_dict_lookup_roundtrip(d):
    """Looking up a key in a dict returns the value we stored."""
    for key, value in d.items():
        assert d[key] == value

# Filter inputs that don't make sense
@given(st.integers(), st.integers())
def test_division_roundtrip(a, b):
    assume(b != 0)  # Skip cases where b is zero
    quotient = a / b
    assert isinstance(quotient, float)

# Control the number of examples
@settings(max_examples=500)
@given(st.lists(st.integers()))
def test_sorting_properties(xs):
    result = sorted(xs)
    for i in range(len(result) - 1):
        assert result[i] <= result[i + 1]
```

---

## 8.13 Debugging Techniques

When tests fail and the cause isn't obvious, you need debugging tools. Python provides several levels of debugging support.

### The `breakpoint()` Built-in (Python 3.7+)

```python
def calculate_discount(price, discount_percent):
    """Calculate discounted price."""
    breakpoint()  # Drops into pdb here
    discount = price * (discount_percent / 100)
    final_price = price - discount
    return final_price

calculate_discount(100, 20)
# (Pdb) price
# 100
# (Pdb) discount_percent
# 20
# (Pdb) discount
# 20.0
# (Pdb) c  # Continue
```

### pdb Debugger Commands

| Command | Short | Description |
|---|---|---|
| `continue` | `c` | Continue execution |
| `step` | `s` | Step into a function call |
| `next` | `n` | Step over a function call |
| `return` | `r` | Run until current function returns |
| `print expr` | `p expr` | Evaluate and print an expression |
| `pp expr` | — | Pretty-print an expression |
| `list` | `l` | Show source code around current line |
| `where` | `w` | Show the call stack (traceback) |
| `up` | `u` | Move up one frame in the call stack |
| `down` | `d` | Move down one frame in the call stack |
| `break line` | `b line` | Set a breakpoint at line number |
| `tbreak line` | — | Set a temporary breakpoint (removed after first hit) |
| `clear` | `cl` | Remove breakpoints |
| `run` | `r` | Restart the program |
| `quit` | `q` | Exit the debugger |
| `help` | `h` | Show available commands |
| `interact` | `inter` | Open an interactive Python console at current frame |

### Using pdb Programmatically

```python
# Import and set a trace manually
import pdb

def problematic_function(data):
    for item in data:
        result = complex_calculation(item)
        if result is None:
            pdb.set_trace()  # Stop here if result is None
        process(result)
```

### The `assert` Statement for In-Code Checks

```python
def calculate_average(numbers):
    """Calculate the arithmetic mean of a list of numbers."""
    assert len(numbers) > 0, "Cannot calculate average of empty list"
    assert all(isinstance(n, (int, float)) for n in numbers), \
        "All elements must be numeric"
    return sum(numbers) / len(numbers)

# These assertions are removed when running with python -O
# Use them for development-time invariants, not user input validation
```

### The `traceback` Module

```python
import traceback
import sys

def risky_operation():
    """Demonstrate traceback inspection."""
    try:
        result = 10 / 0
    except ZeroDivisionError:
        # Get the full traceback as a string
        tb_string = traceback.format_exc()
        print("Full traceback:")
        print(tb_string)

        # Access traceback frames programmatically
        exc_type, exc_value, exc_tb = sys.exc_info()
        print(f"Exception type: {exc_type.__name__}")
        print(f"Exception value: {exc_value}")
        print(f"Traceback object: {exc_tb}")
        print(f"File: {exc_tb.tb_frame.f_code.co_filename}")
        print(f"Line: {exc_tb.tb_lineno}")

risky_operation()
```

### The `faulthandler` Module

The `faulthandler` module helps debug crashes (segfaults, deadlocks) that don't produce Python tracebacks:

```python
import faulthandler
import sys

# Enable fault handler — prints tracebacks to stderr on crashes
faulthandler.enable()

# Or write to a specific file (useful for long-running processes)
faulthandler.enable(file=open("faults.log", "w"))

# Dump tracebacks of all threads (useful for deadlock debugging)
faulthandler.dump_traceback()          # All threads
faulthandler.dump_traceback_later(30)  # After 30 seconds

# Enable via environment variable (no code changes needed):
# PYTHONFAULTHANDLER=1 python my_script.py

# Enable via command line:
# python -Xfaulthandler my_script.py
```

### Debugging Decision Tree

```
┌──────────────────────────────────────────────────────────────┐
│                   How to Debug Your Code                      │
│                                                              │
│  ┌────────────────────┐                                      │
│  │  Something is wrong │                                     │
│  └─────────┬──────────┘                                      │
│            │                                                 │
│            ▼                                                 │
│  ┌────────────────────┐     Yes    ┌──────────────────────┐  │
│  │  Test fails?       │───────────>│ Read the assertion    │  │
│  └─────────┬──────────┘            │ error and traceback   │  │
│            │ No                    └──────────────────────┘  │
│            ▼                                                 │
│  ┌────────────────────┐     Yes    ┌──────────────────────┐  │
│  │  Crash / traceback?│───────────>│ Add print() or use   │  │
│  └─────────┬──────────┘            │ breakpoint() at the   │  │
│            │ No                    │ indicated line        │  │
│            ▼                       └──────────────────────┘  │
│  ┌────────────────────┐                                      │
│  │  Wrong output?     │                                      │
│  └─────────┬──────────┘                                      │
│            │                                                 │
│            ▼                                                 │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  1. Add print() / breakpoint() before the problem   │    │
│  │  2. Inspect variables interactively in pdb           │    │
│  │  3. Use logging for production debugging             │    │
│  │  4. Use faulthandler for segfaults/deadlocks         │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Chapter Summary

### Error Handling

- **`try`/`except`** catches exceptions and prevents crashes. Always catch the **most specific** exception type.
- **`else`** runs only when no exception occurs — use it to narrow the scope of code inside `try`.
- **`finally`** always runs — ideal for cleanup, though **context managers** (`with` statements) are the modern alternative.
- **Exception chaining** (`raise X from Y`) preserves the original traceback when re-raising. Use `from None` to suppress it.
- **Exception groups** (`ExceptionGroup` + `except*`) handle multiple simultaneous errors, useful in concurrent code.
- **Custom exceptions** should inherit from `Exception`, store context as attributes, and follow a clear hierarchy.
- **Bare `except:`** is an anti-pattern — it catches `KeyboardInterrupt` and `SystemExit`, making your program unkillable.

### Warnings and Logging

- The **`warnings`** module signals non-fatal issues (deprecations, suspicious code). Use `filterwarnings` to control behavior.
- **`logging`** is the production replacement for `print()`. It provides severity levels, multiple output targets, thread safety, and runtime configurability.
- Use `logger.exception()` inside `except` blocks to automatically capture tracebacks.

### Testing with unittest and pytest

- **`unittest`** is the built-in, class-based framework — good for simple cases and teams already familiar with xUnit patterns.
- **`pytest`** is the modern standard: plain functions, powerful fixtures, parametrize, and a massive plugin ecosystem.
- **Fixtures** (`@pytest.fixture`) provide reusable setup/teardown with dependency injection and configurable scope.
- **`@pytest.mark.parametrize`** runs the same test with multiple input sets — eliminates repetitive test methods.
- **`conftest.py`** provides shared fixtures automatically to all tests in its directory and subdirectories.

### Mocking

- **`unittest.mock`** replaces real objects with controllable stand-ins for isolated testing.
- **`@patch`** and `with patch(...)` replace objects for the duration of a test.
- **`create_autospec`** creates mocks that enforce the original object's interface, catching typos.
- **`side_effect`** simulates dynamic behavior (sequences, exceptions, custom logic).

### Coverage

- **`coverage`** measures which lines your tests execute. Aim for high coverage but don't chase 100% blindly.
- Use `pytest-cov` for seamless integration: `pytest --cov=myapp --cov-report=term-missing`.
- Configure `fail_under` in `pyproject.toml` to enforce a minimum coverage threshold in CI.

### TDD and Property-Based Testing

- **TDD** (Red → Green → Refactor) produces well-designed, well-tested code in short cycles.
- Write the failing test first to clarify requirements, then write minimal code to pass.
- **Property-based testing** (Hypothesis) generates random inputs to test invariants — finds edge cases you'd never think to test.
- Use `@given` with strategies like `st.integers()`, `st.text()`, `st.lists()`, and composite strategies.

### Debugging

- **`breakpoint()`** drops into `pdb` for interactive exploration.
- **`pdb`** commands: `n` (next), `s` (step in), `c` (continue), `p` (print), `w` (where).
- **`traceback.format_exc()`** and `sys.exc_info()` let you inspect exceptions programmatically.
- **`faulthandler`** prints tracebacks on segfaults and deadlocks — essential for C-extension debugging.
- Use `python -Xfaulthandler` or `PYTHONFAULTHANDLER=1` to enable without code changes.

### Key Takeaways

| Concept | Recommendation |
|---|---|
| Exception specificity | Catch the narrowest type you expect |
| Resource cleanup | Use `with` statements, not `try`/`finally` |
| Re-raising exceptions | Use `raise ... from exc` to chain |
| Warning categories | Use `DeprecationWarning` for API removals |
| Test framework | Use `pytest` for new projects |
| Fixtures | Use `conftest.py` for shared test setup |
| Mocking | Use `create_autospec` to prevent interface drift |
| Coverage | Target 80%+ for core logic, 100% for critical paths |
| TDD | Apply for bug fixes, algorithms, and API design |
| Debugging | `breakpoint()` first; `pdb` for deeper investigation |
