# Chapter 3: Control Flow & Logic

## 3.1 Conditional Statements

### if / elif / else

```python
# Basic structure
temperature = 35

if temperature > 40:
    print("Extreme heat! Stay indoors.")
elif temperature > 30:
    print("It's hot outside.")
elif temperature > 20:
    print("Nice weather!")
elif temperature > 10:
    print("A bit chilly.")
else:
    print("Cold! Bundle up.")
```

### Ternary Expressions

```python
# One-line conditional
status = "adult" if age >= 18 else "minor"

# Nested ternary (avoid nesting too deep)
grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"

# Ternary in expressions
greeting = f"{'Welcome back' if returning_user else 'Hello, new user'}!"
```

### Truthy and Falsy

```python
# Everything is truthy EXCEPT:
# False, None, 0, 0.0, 0j, "", [], {}, set(), frozenset(), b""

# These are all valid conditions:
if users:              # Non-empty list
if not errors:         # Empty list
if filename:           # Non-empty string
if connection:         # Object exists
if count:              # Non-zero number

# Common patterns
value = data or default_value      # Use default if data is falsy
items = items or []                # Initialize empty list
name = name or "Anonymous"         # Fallback string
```

### match/case (Python 3.10+)

```python
# Pattern matching — like switch on steroids
def describe_point(point):
    match point:
        case (0, 0):
            return "Origin"
        case (x, 0):
            return f"On x-axis at {x}"
        case (0, y):
            return f"On y-axis at {y}"
        case (x, y) if x == y:
            return f"On diagonal at ({x}, {y})"
        case (x, y):
            return f"Point at ({x}, {y})"

# Matching types
def process(value):
    match value:
        case int() as n if n > 0:
            print(f"Positive integer: {n}")
        case int() as n if n < 0:
            print(f"Negative integer: {n}")
        case int():
            print("Zero")
        case str() as s:
            print(f"String of length {len(s)}")
        case list() as l:
            print(f"List with {len(l)} items")
        case _:
            print(f"Something else: {type(value)}")

# Matching with OR patterns
def http_status(code):
    match code:
        case 200 | 201 | 204:
            return "Success"
        case 301 | 302 | 304:
            return "Redirect"
        case 400 | 401 | 403:
            return "Client Error"
        case 500 | 502 | 503:
            return "Server Error"
        case _:
            return "Unknown"
```

## 3.2 Loops

### for Loops

```python
# Iterating over sequences
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Using range()
for i in range(5):          # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 8):      # 2, 3, 4, 5, 6, 7
    print(i)

for i in range(0, 10, 2):  # 0, 2, 4, 6, 8
    print(i)

for i in range(10, 0, -1): # 10, 9, 8, ..., 1
    print(i)

# enumerate() — index + value
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

for index, fruit in enumerate(fruits, start=1):
    print(f"{index}: {fruit}")

# zip() — iterate multiple sequences
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
cities = ["NYC", "LA", "Chicago"]

for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age}, {city}")

# Iterating over dictionaries
person = {"name": "Alice", "age": 30, "city": "NYC"}

for key, value in person.items():
    print(f"{key}: {value}")

for key in person:          # Same as person.keys()
    print(f"{key}: {person[key]}")

# Iterating over strings
for char in "Python":
    print(char, end=" ")
# P y t h o n
```

### while Loops

```python
# Basic while loop
count = 0
while count < 5:
    print(count)
    count += 1

# Input validation loop
while True:
    password = input("Enter password: ")
    if len(password) >= 8:
        break
    print("Password too short! Minimum 8 characters.")

# Reading input until sentinel
lines = []
while True:
    line = input("Enter text (quit to stop): ")
    if line == "quit":
        break
    lines.append(line)
```

### for...else and while...else

```python
# The else block runs if the loop completes WITHOUT break
# Search with for...else
def find_prime(numbers):
    for n in numbers:
        if n > 1 and all(n % i != 0 for i in range(2, int(n**0.5) + 1)):
            return n
    else:
        return None  # No prime found

# Pattern: find with break
target = 42
for item in range(100):
    if item == target:
        print(f"Found {target}!")
        break
else:
    print(f"{target} not found")  # Only runs if break wasn't hit

# Useful for "search then do" patterns
password_correct = False
attempts = 0
while attempts < 3:
    password = input("Password: ")
    if password == "secret":
        password_correct = True
        break
    attempts += 1
else:
    print("Account locked! Too many attempts.")
```

## 3.3 break, continue, and pass

```python
# break — exit the loop immediately
for i in range(100):
    if i == 5:
        break  # Stop at 5
    print(i)

# continue — skip to next iteration
for i in range(10):
    if i % 2 == 0:
        continue  # Skip even numbers
    print(i)  # Only prints odds

# pass — do nothing (placeholder)
def todo_function():
    pass  # Implement later

class EmptyClass:
    pass

if condition:
    pass  # Handle this case later
else:
    do_something()
```

## 3.4 Comprehensions

### List Comprehensions

```python
# Basic syntax: [expression for item in iterable]
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition: [expression for item in iterable if condition]
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# With if/else: [expr if cond else alt for item in iterable]
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
# ['even', 'odd', 'even', 'odd', 'even']

# Nested loops
pairs = [(x, y) for x in range(3) for y in range(3)]
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)]

# Flattening nested lists
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]

# String manipulation
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
# ['HELLO', 'WORLD', 'PYTHON']

# Chaining method calls
clean_words = [w.strip().lower() for w in ["  Hello ", " World ", " Python "]]
# ['hello', 'world', 'python']
```

### Dictionary Comprehensions

```python
# Basic: {key_expr: value_expr for item in iterable}
squares_dict = {x: x**2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Invert a dictionary
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
# {1: 'a', 2: 'b', 3: 'c'}

# Filter and transform
scores = {"Alice": 90, "Bob": 65, "Charlie": 85, "Diana": 45}
passing = {name: score for name, score in scores.items() if score >= 70}
# {'Alice': 90, 'Charlie': 85}

# Create from two lists
keys = ["name", "age", "city"]
values = ["Alice", 30, "NYC"]
person = {k: v for k, v in zip(keys, values)}
# {'name': 'Alice', 'age': 30, 'city': 'NYC'}
```

### Set Comprehensions

```python
# {expr for item in iterable}
unique_lengths = {len(word) for word in ["hello", "world", "hi", "python"]}
# {2, 5, 6}

# Remove duplicates while transforming
names = ["alice", "Alice", "ALICE", "bob"]
unique_lower = {name.lower() for name in names}
# {'alice', 'bob'}
```

### Generator Expressions

```python
# (expr for item in iterable) — lazy evaluation
# Parentheses instead of brackets
gen = (x**2 for x in range(10))

# Memory efficient for large datasets
total = sum(x**2 for x in range(1_000_000))  # No list in memory

# Works anywhere an iterable is expected
max_val = max(x**2 for x in range(100))
count = sum(1 for x in range(1000) if x % 7 == 0)
has_match = any(x > 90 for x in scores)
all_pass = all(score >= 60 for score in scores)
```

## 3.5 any() and all()

```python
# all() — True if ALL elements are truthy
>>> all([True, True, True])       # True
>>> all([True, False, True])      # False
>>> all([])                        # True (vacuous truth)
>>> all([1, 2, "hello"])           # True

# any() — True if ANY element is truthy
>>> any([False, False, False])    # False
>>> any([False, True, False])     # True
>>> any([])                        # False
>>> any([0, "", None, 42])        # True

# Practical uses
words = ["hello", "", "world", "  ", "python"]
if any(w.strip() for w in words):
    print("At least one non-empty word")

numbers = [2, 4, 6, 8, 10]
if all(n % 2 == 0 for n in numbers):
    print("All numbers are even")

# Check if all files exist
import os
files = ["config.json", "data.csv", "output.txt"]
if all(os.path.exists(f) for f in files):
    process_files(files)
```

---

## Key Takeaways

- `if/elif/else` for branching; `match/case` for pattern matching (3.10+)
- `for` loops iterate over iterables; `while` loops run until a condition is false
- `break` exits a loop; `continue` skips to the next iteration; `pass` is a no-op
- `for...else` / `while...else` — the `else` runs only if no `break` occurred
- **List comprehensions** replace simple for-loops: `[x*2 for x in range(10) if x > 3]`
- **Dict comprehensions** build dicts: `{k: v for k, v in items}`
- **Generator expressions** are lazy: `(x for x in range(1000000))`
- `all()` and `any()` for checking conditions across iterables
- Python treats `None`, `0`, `""`, `[]`, `{}` as falsy

---

## Practice Exercises

1. **FizzBuzz Classic:** Print numbers 1-100, but replace multiples of 3 with "Fizz", multiples of 5 with "Buzz", and multiples of both with "FizzBuzz". Solve using for, if/elif/else.

2. **Pattern Matcher:** Write a `match/case` function that takes a command string like "GET /users", "POST /items", "DELETE /users/123" and returns the HTTP method and path.

3. **Nested Comprehension:** Given a 4x4 matrix, use list comprehensions to extract:
   - The main diagonal
   - The anti-diagonal
   - All elements above the diagonal
   - The transpose of the matrix

4. **Prime Generator:** Generate all prime numbers up to 100 using a list comprehension with `all()`. Then find the sum and count.

5. **Flatten & Filter:** Given `[[1, 2, 0], [3, 0, 4], [], [5]]`, flatten to `[1, 2, 0, 3, 0, 4, 5]` then filter out zeros and duplicate consecutive elements.
