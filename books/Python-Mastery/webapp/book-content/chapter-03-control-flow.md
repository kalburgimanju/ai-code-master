# Chapter 3: Control Flow & Logic

## 3.1 Conditional Statements

### if / elif / else

```python
# Basic structure
age = 25

if age < 13:
    category = "Child"
elif age < 18:
    category = "Teenager"
elif age < 65:
    category = "Adult"
else:
    category = "Senior"

print(f"You are a {category}")  # You are a Adult
```

### Nested Conditions

```python
# Nested if statements
temperature = 28
humidity = 70

if temperature > 25:
    if humidity > 60:
        print("Hot and humid — stay hydrated!")
    else:
        print("Hot but comfortable.")
elif temperature > 15:
    print("Nice weather!")
else:
    print("Wear a jacket.")

# Ternary (conditional) expression
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # adult

# Nested ternary (use sparingly!)
score = 85
grade = "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "F"
print(grade)  # B

# match/case (Python 3.10+)
command = "quit"

match command:
    case "start":
        print("Starting program...")
    case "stop":
        print("Stopping program...")
    case "quit":
        print("Goodbye!")
    case _:
        print(f"Unknown command: {command}")
```

### match/case — Structural Pattern Matching (Python 3.10+)

```python
# Basic value matching
def http_status(status):
    match status:
        case 200:
            return "OK"
        case 301:
            return "Moved Permanently"
        case 404:
            return "Not Found"
        case 500:
            return "Internal Server Error"
        case _:
            return "Unknown status"

print(http_status(404))  # Not Found

# Pattern matching with OR
def day_type(day):
    match day.lower():
        case "monday" | "tuesday" | "wednesday" | "thursday" | "friday":
            return "Weekday"
        case "saturday" | "sunday":
            return "Weekend"
        case _:
            return "Invalid day"

print(day_type("Monday"))  # Weekday

# Pattern matching with conditions (guards)
def classify_number(n):
    match n:
        case n if n > 0:
            return "Positive"
        case n if n < 0:
            return "Negative"
        case 0:
            return "Zero"

print(classify_number(42))   # Positive
print(classify_number(-5))   # Negative
print(classify_number(0))    # Zero

# Destructuring with match/case
def process_point(point):
    match point:
        case (0, 0):
            print("Origin")
        case (x, 0):
            print(f"On x-axis at {x}")
        case (0, y):
            print(f"On y-axis at {y}")
        case (x, y):
            print(f"Point at ({x}, {y})")
        case _:
            print("Not a point")

process_point((0, 0))    # Origin
process_point((5, 0))    # On x-axis at 5
process_point((3, 4))    # Point at (3, 4)

# Matching with classes
class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

def describe(animal):
    match animal:
        case Animal(name="Cat", sound=sound):
            print(f"Cat says {sound}")
        case Animal(name="Dog", sound=sound):
            print(f"Dog says {sound}")
        case Animal(name=name, sound=sound):
            print(f"{name} says {sound}")
        case _:
            print("Not an animal")

describe(Animal("Cat", "Meow"))   # Cat says Meow
describe(Animal("Dog", "Woof"))   # Dog says Woof
describe(Animal("Cow", "Moo"))    # Cow says Moo

# Complex patterns with mapping
def parse_command(command):
    match command.split():
        case ["quit"]:
            return "Exiting..."
        case ["hello", name]:
            return f"Hello, {name}!"
        case ["add", *numbers]:
            return f"Adding {len(numbers)} numbers"
        case ["delete", target]:
            return f"Deleting {target}"
        case _:
            return "Unknown command"

print(parse_command("quit"))           # Exiting...
print(parse_command("hello Alice"))    # Hello, Alice!
print(parse_command("add 1 2 3 4"))    # Adding 4 numbers
```

---

## 3.2 For Loops

### Basic For Loops

```python
# Iterating over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Iterating over a string
for char in "Python":
    print(char, end=" ")
# P y t h o n

# Iterating over a dictionary
person = {"name": "Alice", "age": 30, "city": "NYC"}
for key, value in person.items():
    print(f"{key}: {value}")

# Iterating over a range
for i in range(5):
    print(i, end=" ")
# 0 1 2 3 4

for i in range(2, 10):
    print(i, end=" ")
# 2 3 4 5 6 7 8 9

for i in range(0, 20, 3):
    print(i, end=" ")
# 0 3 6 9 12 15 18

for i in range(10, 0, -1):  # Countdown
    print(i, end=" ")
# 10 9 8 7 6 5 4 3 2 1
```

### enumerate() — Accessing Index and Value

```python
fruits = ["apple", "banana", "cherry"]

# ❌ Non-Pythonic
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")

# ✅ Pythonic with enumerate
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")

# Custom start index
for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")

# Output:
# 1. apple
# 2. banana
# 3. cherry
```

### zip() — Iterating Multiple Sequences

```python
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
cities = ["NYC", "SF", "LA"]

# Parallel iteration
for name, age, city in zip(names, ages, cities):
    print(f"{name} is {age} years old and lives in {city}")

# With dictionary
person = dict(zip(names, ages))
print(person)  # {'Alice': 25, 'Bob': 30, 'Charlie': 35}

# zip stops at shortest sequence
a = [1, 2, 3, 4, 5]
b = ["a", "b", "c"]
print(list(zip(a, b)))  # [(1, 'a'), (2, 'b'), (3, 'c')]

# itertools.zip_longest fills with fillvalue
from itertools import zip_longest
print(list(zip_longest(a, b, fillvalue="-")))
# [(1, 'a'), (2, 'b'), (3, 'c'), (4, '-'), (5, '-')]
```

### Iterating with else

```python
# For-else: else runs if loop completes without break
def find_prime(n):
    """Check if n is prime."""
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            print(f"{n} is not prime (divisible by {i})")
            break
    else:
        # This runs only if the loop completed without break
        print(f"{n} is prime!")

find_prime(17)   # 17 is prime!
find_prime(15)   # 15 is not prime (divisible by 3)
```

### Nested Loops

```python
# Multiplication table
print("Multiplication Table (1-5):")
print("  |", end="")
for i in range(1, 6):
    print(f"{i:4}", end="")
print("\n" + "-" * 25)

for i in range(1, 6):
    print(f"{i:2} |", end="")
    for j in range(1, 6):
        print(f"{i*j:4}", end="")
    print()

# Output:
#   |   1   2   3   4   5
# -------------------------
#  1 |   1   2   3   4   5
#  2 |   2   4   6   8  10
#  3 |   3   6   9  12  15
#  4 |   4   8  12  16  20
#  5 |   5  10  15  20  25

# Flatten a 2D list
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]

flat = []
for row in matrix:
    for item in row:
        flat.append(item)
print(flat)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Using break and continue in nested loops
for i in range(5):
    for j in range(5):
        if j == 3:
            break  # Only breaks the inner loop!
        print(f"({i},{j})", end=" ")
    print()
# (0,0) (0,1) (0,2)
# (1,0) (1,1) (1,2)
# ...
```

### break, continue, pass

```python
# break — exits the loop entirely
for i in range(10):
    if i == 5:
        break
    print(i, end=" ")
# 0 1 2 3 4

# continue — skips to next iteration
for i in range(10):
    if i % 2 == 0:
        continue  # Skip even numbers
    print(i, end=" ")
# 1 3 5 7 9

# pass — does nothing (placeholder)
for i in range(10):
    if i % 2 == 0:
        pass  # TODO: handle even numbers later
    else:
        print(i, end=" ")
# 1 3 5 7 9

# Practical: Search with early exit
def find_first(words, target):
    """Find first occurrence of target in words."""
    for i, word in enumerate(words):
        if word == target:
            return i
    return -1  # Not found

# Practical: Skip invalid data
data = [1, 2, -3, 4, "five", 6, None, 8]
clean_data = []
for item in data:
    if not isinstance(item, (int, float)):
        continue
    if item < 0:
        continue
    clean_data.append(item)
print(clean_data)  # [1, 2, 4, 6, 8]
```

---

## 3.3 While Loops

### Basic While Loops

```python
# Simple countdown
count = 5
while count > 0:
    print(count, end=" ")
    count -= 1
print("Liftoff!")
# 5 4 3 2 1 Liftoff!

# Sum until threshold
total = 0
number = 1
while total < 100:
    total += number
    number += 1
print(f"Sum {total} reached with {number - 1} numbers")

# User input loop
while True:
    user_input = input("Enter 'quit' to exit: ")
    if user_input.lower() == 'quit':
        break
    print(f"You entered: {user_input}")
```

### While-Else

```python
# while-else: else runs when condition becomes False
n = 10
while n > 0:
    n -= 3
    print(n, end=" ")
else:
    print("\nLoop completed normally!")
# 7 4 1 -2
# Loop completed normally!

# Without break
n = 10
while n > 0:
    if n == 5:
        print("\nFound 5!")
        break
    n -= 1
else:
    print("Loop completed without finding 5")
```

### Infinite Loops with Purpose

```python
# Menu system
def main_menu():
    """Interactive menu using while loop."""
    while True:
        print("\n" + "=" * 40)
        print("       MAIN MENU")
        print("=" * 40)
        print("1. View profile")
        print("2. Edit settings")
        print("3. View history")
        print("4. Exit")
        print("=" * 40)

        choice = input("Enter your choice (1-4): ")

        match choice:
            case "1":
                print("Loading profile...")
            case "2":
                print("Opening settings...")
            case "3":
                print("Loading history...")
            case "4":
                print("Goodbye!")
                break
            case _:
                print("Invalid choice. Try again.")

# main_menu()
```

---

## 3.4 Comprehensions

Comprehensions are concise ways to create lists, dictionaries, and sets.

### List Comprehensions

```python
# Basic syntax: [expression for item in iterable]

# Traditional for loop
squares = []
for x in range(10):
    squares.append(x ** 2)

# List comprehension (Pythonic!)
squares = [x ** 2 for x in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition: [expression for item in iterable if condition]
evens = [x for x in range(20) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# With if-else (ternary): [expr1 if condition else expr2 for item in iterable]
labels = ["even" if x % 2 == 0 else "odd" for x in range(6)]
print(labels)  # ['even', 'odd', 'even', 'odd', 'even', 'odd']

# Nested loops
pairs = [(x, y) for x in range(3) for y in range(3)]
print(pairs)
# [(0,0), (0,1), (0,2), (1,0), (1,1), (1,2), (2,0), (2,1), (2,2)]

# Flattening 2D list
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
print(flat)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# String manipulation
words = ["hello", "world", "python"]
upper_words = [word.upper() for word in words]
print(upper_words)  # ['HELLO', 'WORLD', 'PYTHON']

# Filter and transform
numbers = range(-5, 6)
positive_squares = [x**2 for x in numbers if x > 0]
print(positive_squares)  # [1, 4, 9, 16, 25]
```

### Dictionary Comprehensions

```python
# Basic: {key_expr: value_expr for item in iterable}

# Create dict from two lists
names = ["Alice", "Bob", "Charlie"]
scores = [85, 92, 78]
grade_book = {name: score for name, score in zip(names, scores)}
print(grade_book)  # {'Alice': 85, 'Bob': 92, 'Charlie': 78}

# Squares dict
squares = {x: x**2 for x in range(1, 6)}
print(squares)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Invert a dictionary
original = {"a": 1, "b": 2, "c": 3}
inverted = {v: k for k, v in original.items()}
print(inverted)  # {1: 'a', 2: 'b', 3: 'c'}

# Filter dictionary
scores = {"Alice": 85, "Bob": 42, "Charlie": 91, "Diana": 67}
passing = {name: score for name, score in scores.items() if score >= 70}
print(passing)  # {'Alice': 85, 'Charlie': 91}

# Character frequency
text = "hello world"
freq = {char: text.count(char) for char in set(text)}
print(freq)  # {'h': 1, 'e': 1, 'l': 3, 'o': 2, ' ': 1, 'w': 1, 'r': 1, 'd': 1}

# Conditional values
data = {"a": 1, "b": -2, "c": 3, "d": -4}
absolute = {k: abs(v) for k, v in data.items()}
print(absolute)  # {'a': 1, 'b': 2, 'c': 3, 'd': 4}
```

### Set Comprehensions

```python
# Basic: {expr for item in iterable}

# Unique characters
text = "hello world"
unique_chars = {char.upper() for char in text if char.isalpha()}
print(unique_chars)  # {'H', 'E', 'L', 'O', 'W', 'R', 'D'}

# Unique squares
numbers = [1, -1, 2, -2, 3, -3]
unique_squares = {x**2 for x in numbers}
print(unique_squares)  # {1, 4, 9}

# Set operations with comprehensions
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}
common = {x for x in a if x in b}
print(common)  # {4, 5}
```

### Generator Expressions

```python
# Like list comprehensions but lazy (returns iterator)
# Syntax: (expr for item in iterable)

# Generator expression
gen = (x**2 for x in range(10))
print(type(gen))    # <class 'generator'>
print(next(gen))    # 0
print(next(gen))    # 1
print(list(gen))    # [4, 9, 16, 25, 36, 49, 64, 81]

# Memory efficient for large datasets
import sys

# List comprehension (stores all in memory)
list_comp = [x**2 for x in range(1000000)]
print(f"List size: {sys.getsizeof(list_comp):,} bytes")
# ~8 MB

# Generator expression (lazy evaluation)
gen_expr = (x**2 for x in range(1000000))
print(f"Generator size: {sys.getsizeof(gen_expr)} bytes")
# ~200 bytes!

# Practical use: sum without creating list
total = sum(x**2 for x in range(1000000))  # No intermediate list!
print(f"Sum of squares: {total:,}")

# Check membership efficiently
large_set = set(range(1000000))
has_999999 = any(x == 999999 for x in large_set)
```

### Nested Comprehensions

```python
# 3x3 identity matrix
identity = [[1 if i == j else 0 for j in range(3)] for i in range(3)]
for row in identity:
    print(row)
# [1, 0, 0]
# [0, 1, 0]
# [0, 0, 1]

# Transpose a matrix
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
transposed = [[row[i] for row in matrix] for i in range(3)]
for row in transposed:
    print(row)
# [1, 4, 7]
# [2, 5, 8]
# [3, 6, 9]

# Using zip for transpose (cleaner)
transposed = [list(row) for row in zip(*matrix)]

# Flatten deeply nested lists
def deep_flatten(lst):
    return [item for sublist in lst for item in (deep_flatten(sublist) if isinstance(sublist, list) else [sublist])]

nested = [[1, 2], [3, [4, 5]], [6, [7, [8]]]]
print(deep_flatten(nested))  # [1, 2, 3, 4, 5, 6, 7, 8]
```

---

## 3.5 Itertools — Power Tools for Iteration

```python
import itertools

# chain — combine iterables
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list(itertools.chain(list1, list2))
print(combined)  # [1, 2, 3, 4, 5, 6]

# count — infinite counter
counter = itertools.count(start=1, step=2)
print([next(counter) for _ in range(5)])  # [1, 3, 5, 7, 9]

# cycle — infinite cycling
cycler = itertools.cycle([1, 2, 3])
print([next(cycler) for _ in range(7)])  # [1, 2, 3, 1, 2, 3, 1]

# repeat — repeat a value
repeater = itertools.repeat("hello", 3)
print(list(repeater))  # ['hello', 'hello', 'hello']

# accumulate — running totals
data = [1, 2, 3, 4, 5]
totals = list(itertools.accumulate(data))
print(totals)  # [1, 3, 6, 10, 15]

# product — Cartesian product
colors = ["red", "blue"]
sizes = ["S", "M", "L"]
combos = list(itertools.product(colors, sizes))
print(combos)
# [('red', 'S'), ('red', 'M'), ('red', 'L'), ('blue', 'S'), ('blue', 'M'), ('blue', 'L')]

# combinations — choose k from n (order doesn't matter)
items = ["A", "B", "C", "D"]
combos = list(itertools.combinations(items, 2))
print(combos)
# [('A', 'B'), ('A', 'C'), ('A', 'D'), ('B', 'C'), ('B', 'D'), ('C', 'D')]

# permutations — ordered arrangements
perms = list(itertools.permutations(items, 2))
print(len(perms))  # 12

# groupby — group consecutive elements
data = [("A", 1), ("A", 2), ("B", 3), ("B", 4), ("A", 5)]
data.sort(key=lambda x: x[0])  # Must sort first!
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(f"{key}: {list(group)}")
# A: [('A', 1), ('A', 2)]
# B: [('B', 3), ('B', 4)]
# A: [('A', 5)]  ← Note: new group because not consecutive

# compress — filter with selectors
data = ["a", "b", "c", "d", "e"]
selectors = [1, 0, 1, 0, 1]
filtered = list(itertools.compress(data, selectors))
print(filtered)  # ['a', 'c', 'e']

# islice — slice an iterator
gen = (x**2 for x in range(100))
first_five = list(itertools.islice(gen, 5))
print(first_five)  # [0, 1, 4, 9, 16]
```

---

## 3.6 Practical Control Flow Patterns

### Sentinel Value Pattern

```python
# Read until sentinel value
def read_until_sentinel(sentinel="quit"):
    """Read input until sentinel value is entered."""
    lines = []
    while True:
        line = input(f"Enter text (or '{sentinel}' to stop): ")
        if line == sentinel:
            break
        lines.append(line)
    return lines
```

### Guard Clause Pattern

```python
# ❌ Deeply nested (hard to read)
def process_order(order):
    if order is not None:
        if order.items:
            if order.payment_valid:
                if order.shipping_address:
                    # Actually process the order
                    return "Order processed!"
                else:
                    return "No shipping address"
            else:
                return "Invalid payment"
        else:
            return "Empty order"
    else:
        return "No order"

# ✅ Guard clauses (flat and readable)
def process_order(order):
    if order is None:
        return "No order"
    if not order.items:
        return "Empty order"
    if not order.payment_valid:
        return "Invalid payment"
    if not order.shipping_address:
        return "No shipping address"

    # Process the order (no nesting!)
    return "Order processed!"
```

### Early Return Pattern

```python
# ✅ Clean error handling with early returns
def calculate_discount(price, quantity, membership):
    """Calculate discount based on quantity and membership."""
    # Guard clauses
    if price <= 0:
        return 0
    if quantity <= 0:
        return 0

    # Calculate base discount
    discount = 0

    # Quantity discount
    if quantity >= 100:
        discount += 0.20
    elif quantity >= 50:
        discount += 0.15
    elif quantity >= 20:
        discount += 0.10
    elif quantity >= 10:
        discount += 0.05

    # Membership discount
    membership_discounts = {
        "bronze": 0.02,
        "silver": 0.05,
        "gold": 0.10,
        "platinum": 0.15,
    }
    discount += membership_discounts.get(membership, 0)

    # Cap at 50%
    discount = min(discount, 0.50)

    return price * quantity * discount
```

### Dictionary Dispatch Pattern

```python
# ❌ Long if/elif chain
def operation_old(op, a, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        return a / b
    elif op == "**":
        return a ** b

# ✅ Dictionary dispatch (cleaner and faster)
def add(a, b): return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b): return a / b
def power(a, b): return a ** b

operations = {
    "+": add,
    "-": subtract,
    "*": multiply,
    "/": divide,
    "**": power,
}

def calculate(op, a, b):
    func = operations.get(op)
    if func is None:
        raise ValueError(f"Unknown operation: {op}")
    return func(a, b)

print(calculate("+", 5, 3))    # 8
print(calculate("**", 2, 10))  # 1024
```

### Accumulator Pattern

```python
# Building results incrementally
def categorize_numbers(numbers):
    """Categorize numbers into groups."""
    result = {
        "positive": [],
        "negative": [],
        "zero": [],
        "even": [],
        "odd": [],
        "prime": [],
    }

    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                return False
        return True

    for num in numbers:
        if num > 0:
            result["positive"].append(num)
        elif num < 0:
            result["negative"].append(num)
        else:
            result["zero"].append(num)

        if num % 2 == 0:
            result["even"].append(num)
        else:
            result["odd"].append(num)

        if is_prime(num):
            result["prime"].append(num)

    return result

numbers = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
categories = categorize_numbers(numbers)
print(f"Primes: {categories['prime']}")
print(f"Even: {categories['even']}")
```

---

## Key Takeaways

1. **if/elif/else** — Handle branching logic; use `match/case` (3.10+) for pattern matching.
2. **for loops** — Iterate over sequences; use `enumerate()`, `zip()`, and `itertools`.
3. **while loops** — Loop until a condition changes; use `break` to exit early.
4. **break/continue/pass** — Control loop behavior: exit, skip, or placeholder.
5. **Comprehensions** — Concise way to create lists, dicts, sets, and generators.
6. **Generator expressions** — Memory-efficient lazy evaluation with `(expr for item in iterable)`.
7. **for-else / while-else** — The `else` block runs when the loop completes without `break`.
8. **Guard clauses** — Flatten nested conditions with early returns.
9. **Dictionary dispatch** — Replace long if/elif chains with dict lookups.
10. **itertools** — Power tools for iteration: `chain`, `product`, `combinations`, `groupby`.

---

## Practice Exercises

### Exercise 1: FizzBuzz
Print numbers 1 to 100. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz".

```python
# Your solution here
for i in range(1, 101):
    # Your code
    pass
```

### Exercise 2: Pattern Printer
Print these patterns:
```
Pattern A:       Pattern B:       Pattern C:
*                *****            *****
**               ****             ****
***              ***              ***
****             **               **
*****            *                *
```

### Exercise 3: Collatz Sequence
Implement the Collatz conjecture:
1. Start with any positive integer n
2. If n is even, divide by 2
3. If n is odd, multiply by 3 and add 1
4. Repeat until you reach 1
5. Count the steps and find which number under 100,000 has the longest sequence

### Exercise 4: Matrix Operations Using Comprehensions
```python
matrix_a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
matrix_b = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]

# Implement using comprehensions:
# 1. Matrix addition
# 2. Matrix transpose
# 3. Matrix multiplication (3x3)
# 4. Scalar multiplication
```

### Exercise 5: Prime Number Sieve
Implement the Sieve of Eratosthenes to find all primes up to N:
```python
def sieve_of_eratosthenes(n):
    """Find all primes up to n using the Sieve of Eratosthenes."""
    # Your implementation here
    pass

print(sieve_of_eratosthenes(50))
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
```

### Challenge: Conway's Game of Life
Implement Conway's Game of Life with a 20x20 grid:
1. Random initial state
2. Apply rules:
   - Alive with 2-3 neighbors → survives
   - Dead with exactly 3 neighbors → becomes alive
   - All others → die/stay dead
3. Print each generation
4. Run for 50 generations

```python
import random
import os
import time

def create_grid(rows, cols):
    """Create a random grid."""
    return [[random.choice([0, 1]) for _ in range(cols)] for _ in range(rows)]

def print_grid(grid):
    """Print the grid visually."""
    for row in grid:
        print("".join("█" if cell else " " for cell in row))

def count_neighbors(grid, row, col):
    """Count alive neighbors."""
    rows, cols = len(grid), len(grid[0])
    count = 0
    for dr in [-1, 0, 1]:
        for dc in [-1, 0, 1]:
            if dr == 0 and dc == 0:
                continue
            r, c = (row + dr) % rows, (col + dc) % cols
            count += grid[r][c]
    return count

def next_generation(grid):
    """Compute next generation."""
    rows, cols = len(grid), len(grid[0])
    new_grid = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            neighbors = count_neighbors(grid, r, c)
            if grid[r][c] == 1:
                new_grid[r][c] = 1 if neighbors in (2, 3) else 0
            else:
                new_grid[r][c] = 1 if neighbors == 3 else 0
    return new_grid

# Run the simulation
grid = create_grid(20, 40)
for gen in range(50):
    os.system('clear' if os.name == 'posix' else 'cls')
    print(f"Generation {gen}")
    print_grid(grid)
    time.sleep(0.2)
    grid = next_generation(grid)
```

### Challenge: Data Pipeline
Build a data processing pipeline using comprehensions and itertools:
```python
# Given a list of sales records, compute:
# 1. Total sales per product (dict comprehension)
# 2. Top 3 selling products (sorted + slicing)
# 3. Monthly sales grouped (itertools.groupby)
# 4. Average order value (statistics module)

sales = [
    {"product": "Widget", "amount": 29.99, "month": "Jan"},
    {"product": "Gadget", "amount": 49.99, "month": "Jan"},
    {"product": "Widget", "amount": 29.99, "month": "Feb"},
    # ... add more data
]
```

---

*In the next chapter, we'll master functions — the building blocks of modular, reusable code.*
