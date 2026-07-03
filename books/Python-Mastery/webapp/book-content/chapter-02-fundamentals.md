# Chapter 2: Python Fundamentals

## 2.1 Variables and Assignment

Variables in Python are **names that reference objects**. Unlike many languages, you don't declare types — Python infers them at runtime.

### Variable Assignment

```python
# Basic assignment
name = "Alice"          # str
age = 30                # int
height = 5.7            # float
is_student = True       # bool

# Multiple assignment
x, y, z = 10, 20, 30

# Same value to multiple variables
a = b = c = 0

# Swap variables (Pythonic way!)
x, y = y, x

# Unpacking
coordinates = (3, 4, 5)
x, y, z = coordinates

# Star unpacking
first, *middle, last = [1, 2, 3, 4, 5]
# first = 1, middle = [2, 3, 4], last = 5
```

### Variable Naming Rules

```python
# ✅ Valid variable names
my_variable = 1
_private = 2
myVar2 = 3
MAX_SIZE = 4        # Convention for constants
__double_underscore = 5
name2 = "Bob"

# ❌ Invalid variable names
# 2nd_place = "silver"   # Cannot start with a number
# my-var = 1              # No hyphens
# my var = 2              # No spaces
# class = "test"          # Cannot use reserved keywords
```

### Reserved Keywords

```python
import keyword
print(keyword.kwlist)
# ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
#  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
#  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
#  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
#  'try', 'while', 'with', 'yield']
```

### Identity vs Equality

```python
# '==' checks equality of value
# 'is' checks identity (same object in memory)

a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)    # True  — same value
print(a is b)    # False — different objects
print(a is c)    # True  — same object

# Small integers are cached by Python (-5 to 256)
x = 256
y = 256
print(x is y)    # True  — cached!

x = 257
y = 257
print(x is y)    # False (in interactive mode)
```

### Variable Scope and Lifetime

```python
# Global vs Local scope
global_var = "I'm global"

def my_function():
    local_var = "I'm local"
    print(global_var)   # ✅ Can read global
    print(local_var)    # ✅ Can read local

my_function()
# print(local_var)     # ❌ NameError — local_var doesn't exist here

# Modifying global variables
counter = 0

def increment():
    global counter
    counter += 1

increment()
print(counter)  # 1

# Using nonlocal (nested functions)
def outer():
    message = "Hello"

    def inner():
        nonlocal message
        message = "World"

    inner()
    print(message)  # "World"

outer()
```

---

## 2.2 Numeric Data Types

Python has three core numeric types: `int`, `float`, and `complex`.

### Integers (int)

```python
# Integers have unlimited precision in Python
large_number = 10 ** 100  # googol
print(large_number)
# 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

# Binary, octal, hex literals
binary  = 0b1010    # 10 in decimal
octal   = 0o17      # 15 in decimal
hex_num = 0xFF      # 255 in decimal

# Underscores for readability (Python 3.6+)
population = 8_000_000_000
national_debt = 31_400_000_000_000
one_million = 1_000_000

print(population)       # 8000000000
print(national_debt)    # 31400000000000
print(one_million)      # 1000000

# Type checking
x = 42
print(type(x))          # <class 'int'>
print(isinstance(x, int))  # True
```

### Floats

```python
# Floating-point numbers
pi = 3.14159
speed_of_light = 299792458.0
scientific = 1.5e10     # 15_000_000_000.0

# ⚠️ Floating-point precision issue!
print(0.1 + 0.2)        # 0.30000000000000004
print(0.1 + 0.2 == 0.3) # False!

# Solution: use the decimal module for precision
from decimal import Decimal

a = Decimal('0.1')
b = Decimal('0.2')
print(a + b)            # 0.3
print(a + b == Decimal('0.3'))  # True

# Or use math.isclose for comparisons
import math
print(math.isclose(0.1 + 0.2, 0.3))  # True

# Special float values
import math

print(math.inf)          # inf (infinity)
print(-math.inf)         # -inf
print(math.nan)          # nan (Not a Number)
print(math.nan == math.nan)  # False! (NaN != NaN by definition)
```

### Complex Numbers

```python
# Complex numbers
z1 = 3 + 4j
z2 = complex(3, 4)

print(z1.real)    # 3.0
print(z1.imag)    # 4.0
print(z1.conjugate())  # (3-4j)

# Magnitude
print(abs(z1))    # 5.0 (sqrt(3² + 4²))

# Operations
z3 = 1 + 2j
z4 = 3 + 4j
print(z3 + z4)    # (4+6j)
print(z3 * z4)    # (-5+10j)
```

### Numeric Type Conversions

```python
# int() — convert to integer
print(int(3.7))       # 3 (truncates, doesn't round)
print(int("42"))      # 42
print(int(True))      # 1
print(int(False))     # 0
print(int("0xFF", 16))  # 255 (hex to int)
print(int("1010", 2))   # 10 (binary to int)

# float() — convert to float
print(float(42))      # 42.0
print(float("3.14"))  # 3.14
print(float("inf"))   # inf

# complex() — create complex number
print(complex(1, 2))  # (1+2j)

# ⚠️ Conversion errors
try:
    int("hello")
except ValueError as e:
    print(f"Error: {e}")  # invalid literal for int()

try:
    float("3.14.15")
except ValueError as e:
    print(f"Error: {e}")  # could not convert string to float
```

### Math Module

```python
import math

# Common operations
print(math.sqrt(144))       # 12.0
print(math.pow(2, 10))      # 1024.0
print(math.ceil(3.2))       # 4
print(math.floor(3.8))      # 3
print(math.factorial(5))     # 120
print(math.gcd(12, 8))      # 4
print(math.log(100, 10))    # 2.0
print(math.log2(8))         # 3.0
print(math.log10(1000))     # 3.0
print(math.radians(180))    # π
print(math.degrees(math.pi))  # 180.0

# Constants
print(math.pi)         # 3.141592653589793
print(math.e)          # 2.718281828459045
print(math.tau)        # 6.283185307179586 (2π)
print(math.inf)        # inf
```

```python
# Random module
import random

print(random.random())           # Random float 0.0 <= x < 1.0
print(random.uniform(1, 10))    # Random float between 1 and 10
print(random.randint(1, 100))   # Random integer between 1 and 100
print(random.randrange(0, 10, 2))  # Random even number 0-8

mylist = [1, 2, 3, 4, 5]
print(random.choice(mylist))     # Random element
print(random.sample(mylist, 3))  # 3 unique random elements
random.shuffle(mylist)           # Shuffle in place
print(random.seed(42))          # For reproducibility
```

---

## 2.3 Strings

Strings are **immutable sequences of Unicode characters**. They're one of the most used data types in Python.

### String Creation

```python
# Single quotes
name = 'Alice'

# Double quotes
greeting = "Hello, World!"

# Triple quotes (multi-line)
poem = """
Roses are red,
Violets are blue,
Python is awesome,
And so are you.
"""

# Escape characters
tab_text = "Name\tAge\tCity"
newline_text = "Line 1\nLine 2"
quote_text = "She said, \"Hello!\""
backslash = "C:\\Users\\Alice"

# Raw strings (ignore escape characters)
raw_path = r"C:\Users\Alice\Documents"
print(raw_path)    # C:\Users\Alice\Documents (backslashes preserved)

# Byte strings
byte_str = b"Hello"   # bytes type
print(type(byte_str))  # <class 'bytes'>

# f-strings (Python 3.6+)
name = "World"
print(f"Hello, {name}!")
```

### String Operations

```python
# Concatenation
first = "Hello"
second = "World"
result = first + " " + second   # "Hello World"

# Repetition
line = "-" * 40   # "----------------------------------------"

# Membership
print("Py" in "Python")        # True
print("java" not in "Python")  # True

# Length
print(len("Hello"))            # 5

# Indexing (0-based)
s = "Python"
print(s[0])      # 'P'
print(s[-1])     # 'n' (last character)
print(s[-2])     # 'o' (second to last)

# Slicing [start:stop:step]
s = "Hello, World!"
print(s[0:5])    # 'Hello'
print(s[7:12])   # 'World'
print(s[:5])     # 'Hello' (from start)
print(s[7:])     # 'World!' (to end)
print(s[::2])    # 'Hlo ol!' (every other)
print(s[::-1])   # '!dlroW ,olleH' (reversed)

# Strings are IMMUTABLE
s = "Hello"
# s[0] = 'h'    # ❌ TypeError: 'str' object does not support item assignment
s = 'h' + s[1:]  # ✅ Create a new string: 'hello'
```

### String Methods

```python
text = "  Hello, World!  "

# Case methods
print(text.upper())          # "  HELLO, WORLD!  "
print(text.lower())          # "  hello, world!  "
print(text.title())          # "  Hello, World!  "
print(text.capitalize())     # "  hello, world!  "
print(text.swapcase())       # "  hELLO, wORLD!  "

# Whitespace methods
print(text.strip())          # "Hello, World!"
print(text.lstrip())         # "Hello, World!  "
print(text.rstrip())         # "  Hello, World!"
print(text.strip().center(30))  # "      Hello, World!       "
print(text.strip().ljust(30))   # "Hello, World!             "
print(text.strip().rjust(30))   # "             Hello, World!"

# Search methods
print(text.find("World"))    # 9
print(text.find("Python"))   # -1 (not found)
print(text.count("l"))       # 3
print(text.startswith("  H"))  # True
print(text.endswith("!  "))    # True

# Replace and split
print(text.strip().replace("World", "Python"))  # "Hello, Python!"
print("a,b,c,d".split(","))                      # ['a', 'b', 'c', 'd']
print("Hello World".split())                     # ['Hello', 'World']
print(" ".join(["Hello", "World"]))              # "Hello World"

# Validation methods
print("hello123".isalnum())    # True (alphanumeric)
print("hello".isalpha())       # True (alphabetic)
print("12345".isdigit())       # True (digits only)
print("123.45".isnumeric())    # False
print("  ".isspace())          # True (whitespace only)
print("Hello".istitle())       # True (title case)
print("HELLO".isupper())       # True
print("hello".islower())       # True
```

### String Formatting — Deep Dive

```python
name = "Alice"
age = 30
gpa = 3.857

# Method 1: f-strings (RECOMMENDED — Python 3.6+)
print(f"Name: {name}, Age: {age}")
print(f"Name: {name:>10}, Age: {age:>5}")     # Right-aligned
print(f"Name: {name:<10}, Age: {age:<5}")     # Left-aligned
print(f"Name: {name:^10}, Age: {age:^5}")     # Centered
print(f"GPA: {gpa:.2f}")                       # 2 decimal places
print(f"GPA: {gpa:.1%}")                       # Percentage: 385.7%
print(f"GPA: {gpa:>8.2f}")                     # Width 8, 2 decimals
print(f"Binary: {42:b}")                       # 101010
print(f"Hex: {255:x}")                         # ff
print(f"Oct: {64:o}")                          # 100
print(f"Scientific: {1234567:e}")              # 1.234567e+06

# Expressions in f-strings
print(f"2 + 3 = {2 + 3}")                     # 2 + 3 = 5
print(f"Name upper: {name.upper()}")           # Name upper: ALICE

# Debugging with = (Python 3.8+)
x = 42
print(f"{x = }")                               # x = 42
print(f"{x + 1 = }")                           # x + 1 = 43

# Method 2: .format() method
print("Name: {}, Age: {}".format(name, age))
print("Name: {0}, Age: {1}".format(name, age))
print("Name: {n}, Age: {a}".format(n=name, a=age))

# Method 3: % formatting (old-style, still used)
print("Name: %s, Age: %d, GPA: %.2f" % (name, age, gpa))
```

### String Encoding and Decoding

```python
# Encoding strings to bytes
text = "Hello, World!"
encoded = text.encode('utf-8')
print(type(encoded))    # <class 'bytes'>
print(encoded)          # b'Hello, World!'

# Decoding bytes to string
decoded = encoded.decode('utf-8')
print(decoded)          # "Hello, World!"

# Working with different encodings
japanese = "こんにちは"
utf8_encoded = japanese.encode('utf-8')
print(f"UTF-8 bytes: {utf8_encoded}")
print(f"Length in bytes: {len(utf8_encoded)}")    # 15
print(f"Length in chars: {len(japanese)}")         # 5
```

---

## 2.4 Boolean Type and Truthiness

### Boolean Basics

```python
# Boolean values
is_active = True
is_deleted = False

print(type(is_active))   # <class 'bool'>
print(isinstance(True, int))  # True (bool is a subclass of int!)

# Booleans are integers!
print(True + True)       # 2
print(True * 10)         # 10
print(False + 1)         # 1
print(isinstance(True, int))  # True
```

### Truthiness and Falsiness

```python
# Everything has a truth value in Python

# FALSY values:
print(bool(0))           # False
print(bool(0.0))         # False
print(bool(""))          # False (empty string)
print(bool([]))          # False (empty list)
print(bool(()))          # False (empty tuple)
print(bool({}))          # False (empty dict)
print(bool(set()))       # False (empty set)
print(bool(None))        # False
print(bool(False))       # False

# TRUTHY values (everything else):
print(bool(1))           # True
print(bool(-1))          # True (negative numbers too!)
print(bool("hello"))     # True
print(bool([1, 2, 3]))  # True
print(bool({"a": 1}))   # True
print(bool(42))          # True
print(bool(3.14))        # True

# Practical use
username = ""
if not username:
    print("Please enter a username")

items = [1, 2, 3]
if items:
    print(f"Found {len(items)} items")
```

### Logical Operators

```python
# and, or, not
print(True and True)     # True
print(True and False)    # False
print(False or True)     # True
print(not True)          # False

# Short-circuit evaluation
x = 10
# and returns the first falsy value, or the last value
print(0 and "hello")     # 0 (first falsy)
print("hello" and 42)    # 42 (both truthy, returns last)
print("" or "default")   # "default" (first truthy)
print("value" or "backup")  # "value"

# Practical examples
# Default value pattern
name = "" or "Anonymous"
print(name)  # "Anonymous"

# Guard clause
items = []
result = items and items[0]  # [] is falsy, short-circuits (no IndexError!)
print(result)  # []

# Chained comparisons (Pythonic!)
age = 25
if 18 <= age <= 65:
    print("Working age")
# Equivalent to: age >= 18 and age <= 65

x = 5
print(1 < x < 10)    # True
print(1 < x < 3)     # False
```

---

## 2.5 Type Casting and Type Checking

### Explicit Type Conversion

```python
# int conversions
print(int(3.7))       # 3 (truncates toward zero)
print(int(-3.7))      # -3 (truncates toward zero)
print(int("42"))      # 42
print(int(True))      # 1
print(int("0xFF", 16))  # 255

# float conversions
print(float(42))      # 42.0
print(float("3.14"))  # 3.14
print(float("inf"))   # inf

# str conversions
print(str(42))        # "42"
print(str(3.14))      # "3.14"
print(str(True))      # "True"
print(str([1, 2, 3])) # "[1, 2, 3]"

# list conversions
print(list("hello"))        # ['h', 'e', 'l', 'l', 'o']
print(list(range(5)))       # [0, 1, 2, 3, 4]
print(list((1, 2, 3)))      # [1, 2, 3]
print(list({1: 'a', 2: 'b'}))  # [1, 2] (dict keys!)

# tuple conversions
print(tuple([1, 2, 3]))     # (1, 2, 3)
print(tuple("hello"))       # ('h', 'e', 'l', 'l', 'o')

# set conversions
print(set([1, 1, 2, 2, 3]))  # {1, 2, 3}
print(set("hello"))          # {'h', 'e', 'l', 'o'} (unique chars)

# dict conversions
print(dict([("a", 1), ("b", 2)]))  # {'a': 1, 'b': 2}
print(dict(zip(["a", "b"], [1, 2])))  # {'a': 1, 'b': 2}

# bool conversions
print(bool(1))       # True
print(bool(0))       # False
print(bool(""))      # False
print(bool("hello")) # True
```

### Type Checking

```python
# type() — exact type
x = 42
print(type(x))              # <class 'int'>
print(type(x) is int)       # True

# isinstance() — checks class hierarchy (PREFERRED)
print(isinstance(x, int))   # True
print(isinstance(x, (int, float)))  # True — checks multiple types

# When to use which?
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()
print(type(dog) is Dog)        # True
print(type(dog) is Animal)     # ❌ False — type() doesn't check inheritance
print(isinstance(dog, Dog))    # ✅ True
print(isinstance(dog, Animal)) # ✅ True — handles inheritance!

# Type checking in functions
def process(value):
    if isinstance(value, int):
        return value * 2
    elif isinstance(value, str):
        return value.upper()
    elif isinstance(value, list):
        return sorted(value)
    else:
        raise TypeError(f"Unsupported type: {type(value)}")

print(process(5))           # 10
print(process("hello"))     # "HELLO"
print(process([3, 1, 2]))   # [1, 2, 3]
```

---

## 2.6 Input/Output

### Input

```python
# Basic input (always returns a string)
name = input("Enter your name: ")
print(f"Hello, {name}!")

# Converting input types
age = int(input("Enter your age: "))
height = float(input("Enter your height in meters: "))

# Input with validation
while True:
    try:
        age = int(input("Enter your age: "))
        if 0 < age < 150:
            break
        print("Please enter a valid age (0-150).")
    except ValueError:
        print("Please enter a number.")

# Multi-line input (until EOF)
print("Enter text (Ctrl+D to finish on Unix, Ctrl+Z on Windows):")
import sys
text = sys.stdin.read()
```

### Output — print() Deep Dive

```python
# Basic print
print("Hello, World!")

# Multiple values (separated by space by default)
print("Name:", "Alice", "Age:", 30)
# Output: Name: Alice Age: 30

# Custom separator
print("a", "b", "c", sep=", ")     # a, b, c
print("2024", "01", "15", sep="-")  # 2024-01-15
print("a", "b", "c", sep="")        # abc

# Custom end (default is \n)
print("Hello", end=" ")
print("World")
# Output: Hello World (on same line)

# Printing to a file
with open("output.txt", "w") as f:
    print("Hello, File!", file=f)
    print("Line 2", file=f)

# Using * to unpack
items = [1, 2, 3, 4, 5]
print(*items)                  # 1 2 3 4 5
print(*items, sep=", ")       # 1, 2, 3, 4, 5
print(*items, sep=" -> ")     # 1 -> 2 -> 3 -> 4 -> 5

# Print with flush (useful for progress)
import time
for i in range(10):
    print(".", end="", flush=True)
    time.sleep(0.1)
print()  # Newline at end
```

### Formatted Output with f-strings

```python
import datetime

name = "Alice"
age = 30
balance = 12345.678
items = ["apple", "banana", "cherry"]

# Basic formatting
print(f"{'Name':<15} {'Age':>5} {'Balance':>12}")
print(f"{'─' * 35}")
print(f"{name:<15} {age:>5} {balance:>12,.2f}")

# Table formatting
products = [
    ("Widget", 29.99, 150),
    ("Gadget", 49.99, 75),
    ("Doohickey", 9.99, 300),
]

print(f"\n{'Product':<12} {'Price':>8} {'Qty':>6} {'Total':>10}")
print(f"{'─' * 40}")
for name, price, qty in products:
    total = price * qty
    print(f"{name:<12} ${price:>7.2f} {qty:>6} ${total:>9,.2f}")

# Date formatting
now = datetime.datetime.now()
print(f"Today: {now:%Y-%m-%d}")
print(f"Time: {now:%H:%M:%S}")
print(f"Full: {now:%B %d, %Y at %I:%M %p}")
```

---

## 2.7 Operators

### Arithmetic Operators

```python
# Standard arithmetic
print(10 + 3)      # 13  (addition)
print(10 - 3)      # 7   (subtraction)
print(10 * 3)      # 30  (multiplication)
print(10 / 3)      # 3.3333... (true division)
print(10 // 3)     # 3   (floor division)
print(10 % 3)      # 1   (modulo / remainder)
print(10 ** 3)     # 1000 (exponentiation)

# Operator precedence (PEMDAS)
print(2 + 3 * 4)      # 14 (multiplication first)
print((2 + 3) * 4)    # 20 (parentheses first)
print(2 ** 3 ** 2)     # 512 (** is right-associative: 2^(3^2) = 2^9)
```

### Comparison Operators

```python
# All return booleans
print(5 == 5)      # True  (equal)
print(5 != 3)      # True  (not equal)
print(5 > 3)       # True  (greater than)
print(5 < 3)       # False (less than)
print(5 >= 5)      # True  (greater than or equal)
print(5 <= 4)      # False (less than or equal)

# Chained comparisons (Pythonic!)
x = 5
print(1 < x < 10)        # True
print(1 < x < 3)         # False
print(0 <= x <= 10)      # True

# Comparing different types
print(1 == 1.0)           # True (numeric comparison)
print(1 == True)          # True (bool is subclass of int)
print(0 == False)         # True
print("" == False)        # False (different types!)

# ⚠️ Be careful with type coercion
print(1 + True)           # 2 (True == 1)
print(1 + False)          # 1 (False == 0)
print("5" == 5)           # False (string vs int)
```

### Assignment Operators

```python
x = 10       # Basic assignment

x += 5       # x = x + 5  → 15
x -= 3       # x = x - 3  → 12
x *= 2       # x = x * 2  → 24
x /= 4       # x = x / 4  → 6.0
x //= 2      # x = x // 2 → 3.0
x **= 3      # x = x ** 3 → 27.0
x %= 5       # x = x % 5  → 2.0

# Walrus operator := (Python 3.8+)
# Assign and use in one expression
import re

text = "Hello World 123"
if match := re.search(r'\d+', text):
    print(f"Found: {match.group()}")  # "Found: 123"

# In list comprehensions
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares = [y for x in data if (y := x**2) > 20]
print(squares)  # [25, 36, 49, 64, 81, 100]
```

### Bitwise Operators

```python
# Bitwise operations (work on binary representations)
a = 0b1100   # 12
b = 0b1010   # 10

print(bin(a & b))   # 0b1000 (8)  — AND
print(bin(a | b))   # 0b1110 (14) — OR
print(bin(a ^ b))   # 0b0110 (6)  — XOR
print(bin(~a))      # -0b1101 (-13) — NOT
print(bin(a << 2))  # 0b110000 (48) — Left shift
print(bin(a >> 2))  # 0b11 (3) — Right shift

# Practical: Flags and bitmasks
READ = 0b001     # 1
WRITE = 0b010    # 2
EXECUTE = 0b100  # 4

permissions = READ | WRITE         # 0b011 (3)
print(permissions & READ != 0)     # True — has read
print(permissions & EXECUTE != 0)  # False — no execute

permissions |= EXECUTE             # Add execute
print(permissions & EXECUTE != 0)  # True — now has execute

permissions &= ~WRITE              # Remove write
print(permissions & WRITE != 0)    # False — write removed
```

### Membership and Identity Operators

```python
# Membership: in, not in
print("Py" in "Python")           # True
print("x" not in "Python")       # True
print(3 in [1, 2, 3])            # True
print(4 in [1, 2, 3])            # False
print("a" in {"a": 1, "b": 2})  # True (checks keys)

# Identity: is, is not
x = [1, 2, 3]
y = [1, 2, 3]
z = x

print(x is y)          # False (different objects)
print(x is z)          # True  (same object)
print(x == y)          # True  (same value)
print(x is not y)      # True

# Always use `is` with None, True, False
x = None
print(x is None)       # ✅ Preferred
print(x == None)       # ⚠️ Works but not Pythonic
```

---

## 2.8 Comments and Docstrings

### Comments

```python
# This is a single-line comment

x = 42  # Inline comment

"""
This is a multi-line string.
It's often used as a comment, but it's actually a string.
"""

# TODO: Fix this later
# FIXME: This is broken
# HACK: Temporary workaround
# NOTE: Important information
# XXX: Do not use in production

# Type comment (for older Python versions)
# x: int = 42  # type: ignore  (don't actually use type: ignore!)
```

### Docstrings

```python
# Module docstring (at top of file)
"""My Module.

This module provides utility functions for data processing.
"""

# Function docstring
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

# Class docstring
class Calculator:
    """A simple calculator class.

    Attributes:
        history: List of previous calculations.

    Example:
        >>> calc = Calculator()
        >>> calc.add(2, 3)
        5
    """

    def __init__(self):
        """Initialize the calculator."""
        self.history = []

# Different docstring formats
# Google style:
def func_google(a: int, b: str) -> bool:
    """Short summary.

    Longer description if needed.

    Args:
        a: Description of a.
        b: Description of b.

    Returns:
        Description of return value.

    Raises:
        ValueError: When something bad happens.
    """
    pass

# NumPy style:
def func_numpy(a: int, b: str) -> bool:
    """Short summary.

    Longer description if needed.

    Parameters
    ----------
    a : int
        Description of a.
    b : str
        Description of b.

    Returns
    -------
    bool
        Description of return value.

    Raises
    ------
    ValueError
        When something bad happens.
    """
    pass
```

---

## 2.9 The `None` Type

```python
# None represents the absence of a value
x = None
print(type(x))        # <class 'NoneType'>
print(x is None)      # True
print(x == None)      # True (but use `is` instead)

# Functions return None by default
def greet():
    print("Hello")

result = greet()
print(result)          # None

# None is falsy
if not None:
    print("None is falsy")

# Default mutable argument pattern (common mistake!)
def append_to(item, target=[]):
    target.append(item)
    return target

print(append_to(1))    # [1]
print(append_to(2))    # [1, 2]  ← Bug! Expected [2]

# Correct version:
def append_to_fixed(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target

print(append_to_fixed(1))    # [1]
print(append_to_fixed(2))    # [2]  ← Correct!
```

---

## Key Takeaways

1. **Variables are names for objects** — Python uses dynamic typing with name binding.
2. **Numeric types**: `int` (unlimited precision), `float` (IEEE 754), `complex`.
3. **Strings are immutable** — Operations create new strings, not modify existing ones.
4. **f-strings are the best** — Use them for string formatting (Python 3.6+).
5. **Truthiness matters** — Empty collections, `0`, `""`, and `None` are falsy.
6. **Use `is` for `None`** — Always `x is None`, never `x == None`.
7. **Type check with `isinstance()`** — Not `type()`, which doesn't handle inheritance.
8. **Operator precedence** — PEMDAS: Parentheses, Exponentiation, Multiplication/Division, Addition/Subtraction.
9. **Walrus operator `:=`** — Assign and use in one expression (Python 3.8+).
10. **Mutable default arguments are dangerous** — Use `None` instead of `[]` or `{}`.

---

## Practice Exercises

### Exercise 1: Variable Playground
```python
# Complete these tasks:
# 1. Create variables for your name, age, height, and whether you're a student
# 2. Print them all using f-strings
# 3. Swap two variables without a temporary variable
# 4. Calculate how many days old you are
# 5. Check if your age is between 18 and 65 using chained comparison
```

### Exercise 2: String Manipulation
Write a program that:
1. Takes a sentence as input
2. Prints it in uppercase
3. Prints it reversed
4. Counts the number of vowels
5. Replaces all spaces with hyphens
6. Prints each word on a new line with its length

### Exercise 3: Number Analyzer
Create a program that:
1. Takes an integer as input
2. Prints whether it's positive, negative, or zero
3. Prints whether it's odd or even
4. Prints its binary, octal, and hex representations
5. Prints all its factors
6. Checks if it's prime

### Exercise 4: Type Converter
Build a converter that handles:
```python
# Input: "42" → Output: int(42), float(42.0), bool(True), str("42")
# Input: "3.14" → Output: float(3.14), int(3), bool(True)
# Input: "" → Output: str(""), bool(False), int error
```

### Exercise 5: Truthiness Checker
```python
# Create a function that tests the truthiness of various values
# and prints a report. Include: 0, 1, -1, "", "hello", [], [1], {}, {"a": 1}, None, 0.0, 3.14
```

### Challenge Exercise: Magic Number Game
Create a game where:
1. The computer picks a random number 1-100
2. The player guesses with hints ("too high", "too low")
3. Track the number of attempts
4. After each game, ask to play again
5. Keep score across games
6. Validate all inputs

### Challenge Exercise: Caesar Cipher
Implement a Caesar cipher that:
1. Takes a message and shift value
2. Encrypts the message (shifts letters by N positions)
3. Can decrypt messages
4. Preserves case and non-alphabetic characters
5. Handles wrap-around (z → a)

```python
# Starter code
def caesar_cipher(text, shift, mode='encrypt'):
    """
    Encrypt or decrypt a message using Caesar cipher.

    Args:
        text: The message to process
        shift: Number of positions to shift
        mode: 'encrypt' or 'decrypt'

    Returns:
        The processed message
    """
    result = []
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            if mode == 'decrypt':
                shift = -shift
            new_char = chr((ord(char) - base + shift) % 26 + base)
            result.append(new_char)
        else:
            result.append(char)
    return ''.join(result)

# Test it
message = "Hello, World!"
encrypted = caesar_cipher(message, 3)
print(f"Encrypted: {encrypted}")
decrypted = caesar_cipher(encrypted, 3, mode='decrypt')
print(f"Decrypted: {decrypted}")
```

---

*In the next chapter, we'll master control flow — if/elif/else, for/while loops, and comprehensions.*
