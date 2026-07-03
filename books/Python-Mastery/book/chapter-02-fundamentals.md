# Chapter 2: Python Fundamentals

## 2.1 Variables and Naming

Variables in Python are **labels** bound to objects — not typed containers.

```python
# Variable assignment
name = "Alice"        # str
age = 30              # int
height = 5.7          # float
is_student = True     # bool
grades = [90, 85, 92] # list

# Multiple assignment
x, y, z = 1, 2, 3

# Same value to multiple variables
a = b = c = 0

# Swapping values (no temp variable needed!)
a, b = b, a

# Unpacking
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2, 3, 4], last=5
```

### Naming Conventions (PEP 8)

| Style | Example | Used For |
|-------|---------|----------|
| `snake_case` | `my_variable` | Variables, functions, methods |
| `PascalCase` | `MyClass` | Classes |
| `UPPER_SNAKE` | `MAX_SIZE` | Constants |
| `_private` | `_internal` | Private (convention only) |
| `__mangled` | `__private` | Name mangling |
| `dunder` | `__init__` | Special methods |

```python
# Good naming
user_name = "alice"          # snake_case
MAX_RETRIES = 3              # UPPER_SNAKE for constants
class UserProfile:           # PascalCase for classes
    pass

# Bad naming (don't do this)
username = "alice"           # ambiguous
UserName = "alice"           # looks like a class
MAXSIZE = 3                  # hard to read
```

## 2.2 Data Types

### Numeric Types

```python
# int — arbitrary precision integers
x = 42
big = 10**100  # No overflow!
negative = -17
hex_val = 0xFF    # 255
oct_val = 0o77    # 63
bin_val = 0b1010  # 10
with_underscores = 1_000_000  # 1000000

# float — double precision (64-bit)
pi = 3.14159
sci = 2.5e10     # 25000000000.0
tiny = 1.5e-4    # 0.00015

# Important: float precision
>>> 0.1 + 0.2
0.30000000000000004

# Use decimal for precision
from decimal import Decimal
Decimal("0.1") + Decimal("0.2")
# Decimal("0.3")

# complex numbers
z = 3 + 4j
print(z.real)    # 3.0
print(z.imag)    # 4.0
print(abs(z))    # 5.0 (magnitude)
```

### Boolean Type

```python
is_active = True
is_deleted = False

# bool is a subclass of int
>>> True + True
2
>>> True * 10
10
>>> False + 1
1

# Truthy and Falsy values
# Falsy: False, None, 0, 0.0, "", [], {}, set(), tuple(), range(0)
# Everything else is Truthy

>>> bool(0)
False
>>> bool("")
False
>>> bool([])
False
>>> bool(42)
True
>>> bool("hello")
True
>>> bool([1, 2])
True
```

### String Type

```python
# Creating strings
single = 'hello'
double = "hello"
triple = """Multi-line
string that spans
multiple lines"""
raw = r"C:\new\folder"    # Raw string — no escape processing
byte_str = b"bytes"       # Byte string

# String operations
s = "Hello, World!"

# Indexing and slicing
>>> s[0]          # 'H'
>>> s[-1]         # '!'
>>> s[0:5]        # 'Hello'
>>> s[7:12]       # 'World'
>>> s[::-1]       # '!dlroW ,olleH' (reverse)
>>> s[::2]        # 'Hlo ol!' (every other)

# String methods
>>> "hello world".upper()       # 'HELLO WORLD'
>>> "HELLO WORLD".lower()       # 'hello world'
>>> "  hello  ".strip()         # 'hello'
>>> "hello world".split()       # ['hello', 'world']
>>> ",".join(["a", "b", "c"])   # 'a,b,c'
>>> "hello world".replace("world", "Python")  # 'hello Python'
>>> "hello".startswith("hel")   # True
>>> "hello".endswith("llo")     # True
>>> "hello world".find("world") # 6
>>> "hello".count("l")          # 2
>>> "hello".center(20, "-")     # '-------hello--------'
>>> "hello".zfill(10)           # '00000hello'
```

### String Formatting

```python
name = "Alice"
age = 30
pi = 3.14159

# f-strings (Python 3.6+) — PREFERRED
>>> f"Name: {name}, Age: {age}"
'Name: Alice, Age: 30'

>>> f"Pi: {pi:.2f}"
'Pi: 3.14'

>>> f"Binary: {42:b}, Hex: {42:x}, Oct: {42:o}"
'Binary: 101010, Hex: 2a, Oct: 52'

>>> f"Padding: {42:05d}"
'Padding: 00042'

>>> f"Percent: {0.856:.1%}"
'Percent: 85.6%'

>>> f"Left align: {'hi':>10}"
'Left align:         hi'

>>> f"{'center':^20}"
'       center       '

# Expression inside f-string
>>> f"10 + 20 = {10 + 20}"
'10 + 20 = 30'

# Debugging with = sign (Python 3.8+)
>>> x = 42
>>> f"{x = }"
'x = 42'

# format() method
>>> "Hello, {}! You are {}.".format("Alice", 30)
'Hello, Alice! You are 30.'

>>> "{name} is {age} years old.".format(name="Bob", age=25)
'Bob is 25 years old.'

# %-formatting (old style)
>>> "Hello, %s! Age: %d" % ("Alice", 30)
'Hello, Alice! Age: 30'
```

## 2.3 Operators

### Arithmetic Operators

```python
>>> 10 + 3     # 13      Addition
>>> 10 - 3     # 7       Subtraction
>>> 10 * 3     # 30      Multiplication
>>> 10 / 3     # 3.3333  True division (always float)
>>> 10 // 3    # 3       Floor division
>>> 10 % 3     # 1       Modulo (remainder)
>>> 10 ** 3    # 1000    Exponentiation
```

### Comparison Operators

```python
>>> 5 == 5     # True
>>> 5 != 3     # True
>>> 5 > 3      # True
>>> 5 < 3      # False
>>> 5 >= 5     # True
>>> 5 <= 3     # False

# Chaining comparisons (Pythonic!)
>>> x = 5
>>> 1 < x < 10     # True
>>> 1 < x < 3      # False
```

### Logical Operators

```python
>>> True and False    # False
>>> True or False     # True
>>> not True          # False

# Short-circuit evaluation
>>> 0 and print("never")  # prints nothing, returns 0
>>> 1 or print("never")   # prints nothing, returns 1

# Boolean algebra
>>> True + True + False   # 2
>>> True and 5            # 5 (returns last evaluated value)
>>> "" or "default"       # 'default'
>>> "hello" or "default"  # 'hello'
```

### Bitwise Operators

```python
>>> 0b1100 & 0b1010   # 0b1000 = 8    (AND)
>>> 0b1100 | 0b1010   # 0b1110 = 14   (OR)
>>> 0b1100 ^ 0b1010   # 0b0110 = 6    (XOR)
>>> ~0b1100           # -13            (NOT)
>>> 0b1100 << 2       # 0b110000 = 48  (Left shift)
>>> 0b1100 >> 2       # 0b11 = 3       (Right shift)
```

### Assignment Operators

```python
x = 10
x += 5     # x = 15
x -= 3     # x = 12
x *= 2     # x = 24
x /= 4     # x = 6.0
x //= 2    # x = 3.0
x **= 3    # x = 27.0
x %= 5     # x = 2.0
x &= 3     # x = 2
x |= 1     # x = 3
```

### Identity and Membership

```python
# Identity operators (compare object identity, NOT value)
a = [1, 2, 3]
b = [1, 2, 3]
c = a

>>> a == b       # True  (same value)
>>> a is b       # False (different objects)
>>> a is c       # True  (same object)

# Use `is` for None/True/False comparisons
>>> x = None
>>> x is None    # True (preferred)
>>> x == None    # True (works but not idiomatic)

# Membership operators
>>> 3 in [1, 2, 3]        # True
>>> "lo" in "hello"       # True
>>> "a" not in "hello"    # True
>>> "key" in {"key": 1}   # True
```

## 2.4 Type Casting

```python
# Implicit casting
>>> result = 3 + 0.5     # int + float = float (3.5)

# Explicit casting
>>> int("42")            # 42
>>> int(3.9)             # 3 (truncates, does NOT round)
>>> int("0xFF", 16)      # 255

>>> float("3.14")        # 3.14
>>> float(42)            # 42.0
>>> float("inf")         # inf
>>> float("-inf")        # -inf

>>> str(42)              # "42"
>>> str(3.14)            # "3.14"
>>> str(True)            # "True"
>>> str([1, 2])          # "[1, 2]"

>>> bool(0)              # False
>>> bool(1)              # True
>>> bool(-1)             # True
>>> bool("")             # False
>>> bool("hello")        # True
>>> bool([])             # False
>>> bool([0])            # True

>>> list("hello")        # ['h', 'e', 'l', 'l', 'o']
>>> list(range(5))       # [0, 1, 2, 3, 4]
>>> tuple([1, 2, 3])     # (1, 2, 3)
>>> set([1, 1, 2, 3])    # {1, 2, 3}
>>> dict([("a", 1), ("b", 2)])  # {'a': 1, 'b': 2}
```

## 2.5 Input/Output

```python
# print() — various forms
print("Hello, World!")
print("a", "b", "c")           # a b c (space-separated)
print("a", "b", sep=", ")      # a, b
print("hello", end="")          # no newline
print(" world")                 # continues on same line
print(f"{'centered':^20}")     #       centered
print("line1\nline2")          # multi-line

# print to file
with open("output.txt", "w") as f:
    print("Hello, file!", file=f)

# input() — always returns a string
name = input("Enter your name: ")
age = int(input("Enter your age: "))  # Convert to int

# Multi-line input
lines = []
print("Enter text (empty line to finish):")
while True:
    line = input()
    if not line:
        break
    lines.append(line)
```

## 2.6 The None Type

```python
# None represents absence of a value
x = None

>>> x is None          # True
>>> type(x)            # <class 'NoneType'>
>>> print(x)           # None

# Functions return None by default
def greet():
    print("hello")

result = greet()
>>> print(result)      # None

# Common pattern: check for None
def find_item(items, target):
    for item in items:
        if item == target:
            return item
    return None

result = find_item([1, 2, 3], 5)
if result is None:
    print("Not found")
```

## 2.7 Mutable vs Immutable Types

```
┌─────────────────────┬────────────────────────┐
│     Immutable        │       Mutable           │
├─────────────────────┼────────────────────────┤
│ int                  │ list                    │
│ float                │ dict                    │
│ bool                 │ set                     │
│ str                  │ bytearray               │
│ bytes                │ (custom objects)        │
│ tuple                │                         │
│ frozenset            │                         │
│ NoneType             │                         │
└─────────────────────┴────────────────────────┘
```

```python
# Immutable: changing creates a new object
s = "hello"
>>> id(s)
140234866038192
s = s + " world"
>>> id(s)  # Different ID — new object!
140234866039248

# Mutable: changing modifies in place
lst = [1, 2, 3]
>>> id(lst)
140234865999808
lst.append(4)
>>> id(lst)  # Same ID — same object!
140234865999808

# The default mutable argument gotcha
def append_to(item, lst=[]):  # BAD!
    lst.append(item)
    return lst

>>> append_to(1)
[1]
>>> append_to(2)  # Expected [2] but got [1, 2]!
[1, 2]

# Correct version
def append_to(item, lst=None):  # GOOD!
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

---

## Key Takeaways

- Python uses **dynamic typing** — variables don't declare types
- Follow **PEP 8** naming conventions: `snake_case` for variables/functions, `PascalCase` for classes
- `str`, `int`, `float`, `bool`, `None` are the core scalar types
- **f-strings** are the preferred way to format strings (`f"Hello, {name}!"`)
- `is` compares identity (use for `None`); `==` compares value
- `and`/`or` use **short-circuit evaluation** and return the last evaluated value
- Immutable types (str, int, tuple) create new objects when modified
- Mutable types (list, dict, set) modify in place — watch out for shared references
- `None` is the default return value and the sentinel for "no value"

---

## Practice Exercises

1. **Type Explorer:** Write a program that takes user input and prints its type, truthiness, and repr:
   ```
   Enter a value: 42
   Type: <class 'int'>
   Truthy: True
   Repr: 42
   ```

2. **Temperature Converter:** Convert between Celsius, Fahrenheit, and Kelvin. Take input like `100C` or `212F` and output the other two.

3. **Word Statistics:** Take a sentence as input and print:
   - Number of characters (with and without spaces)
   - Number of words
   - Number of vowels
   - The sentence reversed
   - The sentence in Title Case

4. **F-string Practice:** Given variables `name`, `age`, `gpa`, format output using f-strings with:
   - Right-alignment, padding, decimal formatting
   - Percentage formatting
   - Debug format (`=`)
   - Binary/hex/octal conversion

5. **Mutable Default Fix:** Write three functions that demonstrate the mutable default argument gotcha and its fix. Explain why it happens.
