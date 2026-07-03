# Chapter 5: Data Structures

## 5.1 Lists

Lists are Python's most versatile data structure — ordered, mutable sequences.

```python
# Creating lists
empty = []
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, None]
nested = [[1, 2], [3, 4], [5, 6]]
from_range = list(range(10))
from_string = list("Python")  # ['P', 'y', 't', 'h', 'o', 'n']

# Indexing and slicing
fruits = ["apple", "banana", "cherry", "date", "elderberry"]

>>> fruits[0]         # 'apple'
>>> fruits[-1]        # 'elderberry'
>>> fruits[1:3]       # ['banana', 'cherry']
>>> fruits[::2]       # ['apple', 'cherry', 'elderberry']
>>> fruits[::-1]      # ['elderberry', ..., 'apple']

# List methods
fruits = ["apple", "banana"]
fruits.append("cherry")       # Add to end
fruits.insert(1, "blueberry") # Insert at index
fruits.extend(["date", "fig"]) # Add multiple
fruits += ["grape"]            # Same as extend

fruits.remove("banana")       # Remove first occurrence
popped = fruits.pop()         # Remove and return last
popped = fruits.pop(0)        # Remove and return at index
fruits.clear()                 # Remove all

# Searching
>>> "apple" in fruits         # True
>>> fruits.index("cherry")    # Index of item
>>> fruits.count("apple")     # Count occurrences

# Sorting
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()                 # In-place sort
numbers.sort(reverse=True)     # Descending
sorted_copy = sorted(numbers)  # Returns new list

# Sort with key
words = ["banana", "Apple", "cherry"]
words.sort(key=str.lower)      # Case-insensitive sort
words.sort(key=len)            # Sort by length

# Advanced
numbers = [3, 1, 4, 1, 5, 9]
numbers.reverse()              # In-place reverse
numbers.copy()                 # Shallow copy
numbers.index(4, 2, 5)        # Find 4 between indices 2-5
```

### List Performance

| Operation | Time Complexity |
|-----------|----------------|
| `append` | O(1) amortized |
| `insert(0, x)` | O(n) |
| `pop()` | O(1) |
| `pop(0)` | O(n) |
| `x in list` | O(n) |
| `list[i]` | O(1) |
| `len(list)` | O(1) |
| `sort()` | O(n log n) |

## 5.2 Tuples

Tuples are **immutable** ordered sequences.

```python
# Creating tuples
empty = ()
single = (42,)                 # Trailing comma required!
point = (3, 4)
person = ("Alice", 30, "NYC")
from_list = tuple([1, 2, 3])
from_string = tuple("hello")  # ('h', 'e', 'l', 'l', 'o')

# Unpacking
x, y = (3, 4)
name, age, city = ("Alice", 30, "NYC")

# Swap with tuple unpacking
a, b = 1, 2
a, b = b, a  # a=2, b=1

# Starred unpacking
first, *rest = (1, 2, 3, 4, 5)
# first=1, rest=[2, 3, 4, 5]

first, *middle, last = (1, 2, 3, 4, 5)
# first=1, middle=[2, 3, 4], last=5

# Tuple methods (very few — they're immutable!)
>>> (1, 2, 3, 2, 1).count(2)  # 2
>>> (1, 2, 3).index(3)         # 2

# Named tuples (more readable than plain tuples)
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
>>> p.x       # 3
>>> p.y       # 4
>>> p[0]      # 3 (still indexable)
>>> p._asdict()  # {'x': 3, 'y': 4}

# When to use tuples:
# - Fixed-size records (coordinates, RGB values)
# - Dictionary keys (lists can't be keys)
# - Function return values (multiple values)
# - Data that shouldn't change
```

## 5.3 Sets

Unordered collections of **unique** elements.

```python
# Creating sets
empty = set()                  # NOT {} (that's a dict!)
numbers = {1, 2, 3, 4, 5}
from_list = set([1, 2, 2, 3])  # {1, 2, 3}
from_string = set("hello")     # {'h', 'e', 'l', 'o'}

# Adding and removing
s = {1, 2, 3}
s.add(4)          # {1, 2, 3, 4}
s.update([5, 6])  # {1, 2, 3, 4, 5, 6}
s.discard(3)      # Remove if exists (no error)
s.remove(2)       # Remove (raises KeyError if missing)
s.pop()           # Remove and return arbitrary element

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

>>> a | b          # Union: {1, 2, 3, 4, 5, 6}
>>> a & b          # Intersection: {3, 4}
>>> a - b          # Difference: {1, 2}
>>> b - a          # Difference: {5, 6}
>>> a ^ b          # Symmetric difference: {1, 2, 5, 6}

# Subset and superset
>>> {1, 2}.issubset({1, 2, 3})      # True
>>> {1, 2, 3}.issuperset({1, 2})    # True
>>> {1, 2} <= {1, 2, 3}             # True
>>> {1, 2, 3} >= {1, 2}             # True

# Frozen sets (immutable sets — can be dict keys)
fs = frozenset([1, 2, 3])

# Practical uses
# Remove duplicates
words = ["hello", "HELLO", "world", "Hello"]
unique = set(w.lower() for w in words)  # {'hello', 'world'}

# Fast membership testing
valid_ids = set(range(1, 1000001))
if user_id in valid_ids:  # O(1) vs O(n) for lists
    process(user_id)

# Find common elements
friends_alice = {"Bob", "Charlie", "Diana"}
friends_bob = {"Alice", "Charlie", "Eve"}
mutual = friends_alice & friends_bob  # {'Charlie'}
```

## 5.4 Dictionaries

Key-value pairs — Python's most used data structure.

```python
# Creating dictionaries
empty = {}
person = {"name": "Alice", "age": 30, "city": "NYC"}
from_pairs = dict([("a", 1), ("b", 2)])
from_kwargs = dict(name="Alice", age=30)
from_keys = dict.fromkeys(["a", "b", "c"], 0)  # {'a': 0, 'b': 0, 'c': 0}

# Accessing
>>> person["name"]           # 'Alice'
>>> person["phone"]          # KeyError!
>>> person.get("phone")      # None
>>> person.get("phone", "N/A")  # 'N/A'

# Modifying
person["age"] = 31
person["email"] = "alice@example.com"
person.update({"age": 32, "city": "LA"})
person |= {"phone": "555-0123"}  # Merge operator (3.9+)

# Removing
del person["phone"]
email = person.pop("email")        # Remove and return
email = person.pop("email", None)  # Safe pop
last = person.popitem()            # Remove last inserted

# Iterating
for key in person:                  # Keys
    print(key)

for key in person.keys():          # Keys (explicit)
    print(key)

for value in person.values():      # Values
    print(value)

for key, value in person.items():  # Key-value pairs
    print(f"{key}: {value}")

# Dictionary comprehensions
squares = {x: x**2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Invert dictionary
inverted = {v: k for k, v in person.items()}

# Merge dictionaries (Python 3.9+)
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
merged = dict1 | dict2  # {'a': 1, 'b': 3, 'c': 4}

# Nested access with setdefault
data = {}
data.setdefault("users", []).append("Alice")
data.setdefault("users", []).append("Bob")
# {'users': ['Alice', 'Bob']}

# defaultdict (from collections)
from collections import defaultdict

word_count = defaultdict(int)
for word in "hello world hello python".split():
    word_count[word] += 1
# defaultdict(int, {'hello': 2, 'world': 1, 'python': 1})

grouped = defaultdict(list)
for name, dept in employees:
    grouped[dept].append(name)
```

### Dictionary Performance

| Operation | Time Complexity |
|-----------|----------------|
| `d[key]` | O(1) average |
| `d.get(key)` | O(1) average |
| `key in d` | O(1) average |
| `d[key] = val` | O(1) average |
| `del d[key]` | O(1) average |
| `len(d)` | O(1) |
| `d.keys()` | O(1) |

## 5.5 collections Module

```python
from collections import Counter, defaultdict, deque, OrderedDict, ChainMap

# Counter — count hashable objects
words = "the cat sat on the mat the cat".split()
counter = Counter(words)
>>> counter.most_common(2)  # [('the', 3), ('cat', 2)]

# Counter from string
>>> Counter("mississippi")
# Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})

# Counter arithmetic
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
>>> c1 + c2   # Counter({'a': 4, 'b': 3})
>>> c1 - c2   # Counter({'a': 2})

# deque — double-ended queue
dq = deque([1, 2, 3])
dq.append(4)          # Add to right
dq.appendleft(0)      # Add to left
dq.pop()              # Remove from right
dq.popleft()          # Remove from left
dq.rotate(1)          # Rotate right
dq.rotate(-1)         # Rotate left

# deque is O(1) for append/pop from both ends
# Use instead of list when you need fast prepend/pop(0)

# ChainMap — combine dicts
defaults = {"color": "red", "user": "guest"}
environment = {"user": "alice"}
config = ChainMap(environment, defaults)
>>> config["color"]  # 'red' (from defaults)
>>> config["user"]   # 'alice' (from environment, first match)

# OrderedDict (mostly unnecessary in 3.7+ since dicts maintain insertion order)
od = OrderedDict()
od["first"] = 1
od["second"] = 2
od.move_to_end("first")
```

## 5.6 Choosing the Right Data Structure

| Need | Use |
|------|-----|
| Ordered, mutable collection | `list` |
| Ordered, immutable record | `tuple` or `namedtuple` |
| Unique elements, fast lookup | `set` |
| Key-value mapping | `dict` |
| Fast append/pop from both ends | `deque` |
| Count occurrences | `Counter` |
| Default values for missing keys | `defaultdict` |
| Priority queue | `heapq` (module) |
| Immutable set | `frozenset` |

---

## Key Takeaways

- **Lists** are mutable, ordered, and versatile; use for dynamic collections
- **Tuples** are immutable and hashable; use for fixed records and dict keys
- **Sets** provide O(1) membership testing and set operations (union, intersection)
- **Dictionaries** map keys to values with O(1) average lookup
- Use `collections` module: `Counter`, `defaultdict`, `deque` for specialized needs
- Dict comprehensions and set comprehensions are powerful tools
- Prefer `in` on sets/dicts (O(1)) over lists (O(n)) for membership testing

---

## Practice Exercises

1. **Word Frequency:** Read a text file and use `Counter` to find the 10 most common words (case-insensitive, ignoring punctuation).

2. **Group By:** Given a list of `(name, department)` tuples, use `defaultdict` to group employees by department, then sort each group alphabetically.

3. **Two Lists to Dict:** Write a function that takes two lists (keys and values) and creates a dictionary. Handle mismatched lengths.

4. **Sparse Matrix:** Represent a sparse matrix (mostly zeros) using a dictionary of dictionaries. Implement `get`, `set`, and `to_dense` methods.

5. **LRU Cache:** Implement a simple LRU cache using an `OrderedDict` with `maxsize` parameter.
