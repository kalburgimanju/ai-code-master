# Chapter 5: Data Structures

## 5.1 Lists

Lists are **ordered, mutable sequences** that can hold any type of object.

### Creating Lists

```python
# Empty list
empty = []
empty = list()

# List with values
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True, None]
nested = [[1, 2], [3, 4], [5, 6]]

# List from iterable
chars = list("hello")         # ['h', 'e', 'l', 'l', 'o']
nums = list(range(10))        # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
nums_from_tuple = list((1, 2, 3))  # [1, 2, 3]

# List repetition
zeros = [0] * 5               # [0, 0, 0, 0, 0]
pattern = [1, 2] * 3          # [1, 2, 1, 2, 1, 2]
```

### List Operations

```python
# Indexing and slicing
fruits = ["apple", "banana", "cherry", "date", "elderberry"]

print(fruits[0])        # "apple"
print(fruits[-1])       # "elderberry"
print(fruits[1:3])      # ["banana", "cherry"]
print(fruits[::2])      # ["apple", "cherry", "elderberry"]
print(fruits[::-1])     # ["elderberry", "date", "cherry", "banana", "apple"]

# Concatenation
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list1 + list2    # [1, 2, 3, 4, 5, 6]

# Membership
print("apple" in fruits)    # True
print("fig" in fruits)      # False

# Length
print(len(fruits))          # 5

# Min, max, sum
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
print(min(numbers))         # 1
print(max(numbers))         # 9
print(sum(numbers))         # 31
print(sum(numbers, 100))    # 131 (start with 100)

# Count and index
print(numbers.count(1))     # 2
print(numbers.index(5))     # 4
```

### List Methods

```python
# Modifying lists
fruits = ["apple", "banana", "cherry"]

# append — add single element to end
fruits.append("date")
print(fruits)  # ["apple", "banana", "cherry", "date"]

# extend — add multiple elements from iterable
fruits.extend(["elderberry", "fig"])
print(fruits)  # ["apple", "banana", "cherry", "date", "elderberry", "fig"]

# insert — add element at specific index
fruits.insert(1, "avocado")
print(fruits)  # ["apple", "avocado", "banana", "cherry", "date", "elderberry", "fig"]

# remove — remove first occurrence
fruits.remove("banana")
print(fruits)  # ["apple", "avocado", "cherry", "date", "elderberry", "fig"]

# pop — remove and return element at index
last = fruits.pop()
print(last)    # "fig"
print(fruits)  # ["apple", "avocado", "cherry", "date", "elderberry"]

first = fruits.pop(0)
print(first)   # "apple"

# clear — remove all elements
fruits.clear()
print(fruits)  # []

# Sorting
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

# sort — in-place (modifies original)
numbers.sort()
print(numbers)  # [1, 1, 2, 3, 4, 5, 6, 9]

numbers.sort(reverse=True)
print(numbers)  # [9, 6, 5, 4, 3, 2, 1, 1]

# sorted — returns new sorted list (original unchanged)
original = [3, 1, 4, 1, 5, 9, 2, 6]
new_sorted = sorted(original)
print(original)   # [3, 1, 4, 1, 5, 9, 2, 6] (unchanged)
print(new_sorted) # [1, 1, 2, 3, 4, 5, 6, 9]

# Custom sort key
words = ["banana", "apple", "cherry", "date"]
words.sort(key=len)
print(words)  # ['date', 'apple', 'banana', 'cherry']

# Multi-key sort
students = [
    {"name": "Alice", "grade": 88, "age": 22},
    {"name": "Bob", "grade": 95, "age": 20},
    {"name": "Charlie", "grade": 88, "age": 21},
]
students.sort(key=lambda s: (-s["grade"], s["age"]))
for s in students:
    print(f"{s['name']}: grade={s['grade']}, age={s['age']}")
# Bob: grade=95, age=20
# Alice: grade=88, age=22
# Charlie: grade=88, age=21

# reverse — in-place reversal
numbers = [1, 2, 3, 4, 5]
numbers.reverse()
print(numbers)  # [5, 4, 3, 2, 1]

# copy — shallow copy
original = [1, 2, [3, 4]]
copy = original.copy()
copy[0] = 99
copy[2][0] = 99
print(original)  # [1, 2, [99, 4]]  ← nested list affected!
print(copy)      # [99, 2, [99, 4]]

# Deep copy for nested structures
import copy
original = [1, 2, [3, 4]]
deep = copy.deepcopy(original)
deep[2][0] = 99
print(original)  # [1, 2, [3, 4]]  ← unchanged!
print(deep)      # [1, 2, [99, 4]]
```

### List Performance

```
┌─────────────────────────────────────────────────────┐
│           List Operation Complexity                  │
├──────────────────────────┬──────────┬───────────────┤
│ Operation                │ Time     │ Description   │
├──────────────────────────┼──────────┼───────────────┤
│ Index access [i]         │ O(1)     │ Random access │
│ Append                   │ O(1)*    │ Amortized     │
│ Insert at beginning      │ O(n)     │ Shift all     │
│ Insert at middle         │ O(n)     │ Shift elements│
│ Delete by value          │ O(n)     │ Find & shift  │
│ Pop from end             │ O(1)     │ Remove last   │
│ Pop from beginning       │ O(n)     │ Shift all     │
│ Search (in)              │ O(n)     │ Linear search │
│ Sort                     │ O(n log n)│ Timsort       │
│ Reverse                  │ O(n)     │ In-place      │
│ Copy (shallow)           │ O(n)     │ New list      │
└──────────────────────────┴──────────┴───────────────┘
* Amortized: occasional resize is O(n), but average is O(1)
```

---

## 5.2 Tuples

Tuples are **ordered, immutable sequences**. They're faster than lists and can be used as dictionary keys.

### Creating Tuples

```python
# Empty tuple
empty = ()
empty = tuple()

# Single element (note the comma!)
single = (42,)    # This is a tuple
not_tuple = (42)  # This is just an integer!
print(type(single))   # <class 'tuple'>
print(type(not_tuple)) # <class 'int'>

# Tuple with values
point = (3, 4)
rgb = (255, 128, 0)
mixed = (1, "hello", 3.14)

# Tuple from iterable
from_list = tuple([1, 2, 3])
from_string = tuple("hello")
print(from_list)    # (1, 2, 3)
print(from_string)  # ('h', 'e', 'l', 'l', 'o')

# Tuple packing
x, y, z = 1, 2, 3
print(x, y, z)  # 1 2 3

# Star unpacking
first, *rest = (1, 2, 3, 4, 5)
print(first)  # 1
print(rest)   # [2, 3, 4, 5]

first, *middle, last = (1, 2, 3, 4, 5)
print(first)   # 1
print(middle)  # [2, 3, 4]
print(last)    # 5
```

### Tuple Operations

```python
# Immutability
point = (3, 4)
# point[0] = 5  # ❌ TypeError: 'tuple' object does not support item assignment

# But you can modify mutable elements inside a tuple
nested = ([1, 2], [3, 4])
nested[0].append(3)  # ✅ Works!
print(nested)  # ([1, 2, 3], [3, 4])

# Tuple methods (only two!)
colors = (1, 2, 3, 2, 2, 4)
print(colors.count(2))  # 3
print(colors.index(3))  # 2

# Concatenation and repetition
t1 = (1, 2, 3)
t2 = (4, 5, 6)
print(t1 + t2)     # (1, 2, 3, 4, 5, 6)
print(t1 * 3)      # (1, 2, 3, 1, 2, 3, 1, 2, 3)

# Tuple as dictionary keys (lists can't be!)
locations = {
    (40.7128, -74.0060): "New York",
    (34.0522, -118.2437): "Los Angeles",
    (41.8781, -87.6298): "Chicago",
}
print(locations[(40.7128, -74.0060)])  # "New York"
```

### Named Tuples

```python
from collections import namedtuple

# Create a named tuple class
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
print(p.x, p.y)    # 3 4
print(p[0], p[1])   # 3 4 (still indexable!)
print(p)             # Point(x=3, y=4)

# Alternative syntax
Point = namedtuple('Point', 'x y')
p = Point(3, 4)
print(p)

# Named tuple with defaults
Employee = namedtuple('Employee', ['name', 'age', 'department'], defaults=['Unknown'])
emp = Employee("Alice", 30)
print(emp)  # Employee(name='Alice', age=30, department='Unknown')

# Convert to dict
d = p._asdict()
print(d)  # {'x': 3, 'y': 4}

# Replace fields (returns new tuple!)
new_p = p._replace(x=10)
print(new_p)  # Point(x=10, y=4)
print(p)      # Point(x=3, y=4) — unchanged!

# Practical: CSV row processing
from collections import namedtuple

Student = namedtuple('Student', 'name grade age')

def process_students(data):
    """Process student data as named tuples."""
    students = []
    for name, grade, age in data:
        student = Student(name, grade, age)
        students.append(student)
    return students

data = [("Alice", 95, 20), ("Bob", 87, 22), ("Charlie", 92, 21)]
students = process_students(data)

for s in sorted(students, key=lambda s: s.grade, reverse=True):
    print(f"{s.name}: {s.grade} (age {s.age})")
```

### Tuples vs Lists

```
┌──────────────────────────────────────────────────┐
│              Tuples vs Lists                     │
├─────────────┬──────────────┬─────────────────────┤
│ Feature     │ Tuple        │ List                │
├─────────────┼──────────────┼─────────────────────┤
│ Syntax      │ (1, 2, 3)   │ [1, 2, 3]           │
│ Mutability  │ Immutable    │ Mutable             │
│ Speed       │ Faster       │ Slower              │
│ Dict keys   │ ✅ Yes       │ ❌ No               │
│ Memory      │ Less         │ More                │
│ Methods     │ count, index │ Many more           │
│ Use case    │ Fixed data   │ Dynamic collections │
│ Hashable    │ Yes (if all  │ No                  │
│             │ elements are)│                     │
└─────────────┴──────────────┴─────────────────────┘
```

---

## 5.3 Dictionaries

Dictionaries are **key-value pairs** — mappings from hashable keys to values.

### Creating Dictionaries

```python
# Empty dict
empty = {}
empty = dict()

# Dict literal
person = {"name": "Alice", "age": 30, "city": "NYC"}

# dict() constructor
person = dict(name="Alice", age=30, city="NYC")

# From list of tuples
items = [("a", 1), ("b", 2), ("c", 3)]
d = dict(items)
print(d)  # {'a': 1, 'b': 2, 'c': 3}

# From zip
keys = ["name", "age", "city"]
values = ["Alice", 30, "NYC"]
d = dict(zip(keys, values))
print(d)  # {'name': 'Alice', 'age': 30, 'city': 'NYC'}

# Dict comprehension
squares = {x: x**2 for x in range(1, 6)}
print(squares)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# From two lists
names = ["Alice", "Bob", "Charlie"]
scores = [85, 92, 78]
grade_book = {name: score for name, score in zip(names, scores)}

# dict.fromkeys (same value for all keys)
keys = ["a", "b", "c"]
d = dict.fromkeys(keys, 0)
print(d)  # {'a': 0, 'b': 0, 'c': 0}
```

### Dictionary Operations

```python
# Accessing values
person = {"name": "Alice", "age": 30}

# Direct access (raises KeyError if missing)
print(person["name"])     # "Alice"
# print(person["email"])  # ❌ KeyError

# get() with default (returns default if missing)
print(person.get("name"))          # "Alice"
print(person.get("email"))         # None
print(person.get("email", "N/A"))  # "N/A"

# Membership testing (O(1) average)
print("name" in person)     # True
print("email" in person)    # False

# Keys, values, items
print(person.keys())    # dict_keys(['name', 'age'])
print(person.values())  # dict_values(['Alice', 30])
print(person.items())   # dict_items([('name', 'Alice'), ('age', 30)])

# Iteration
for key in person:
    print(f"{key}: {person[key]}")

for key, value in person.items():
    print(f"{key}: {value}")
```

### Dictionary Methods

```python
# Updating dictionaries
d = {"a": 1, "b": 2}

# update — merge key-value pairs
d.update({"c": 3, "d": 4})
print(d)  # {'a': 1, 'b': 2, 'c': 3, 'd': 4}

d.update([("e", 5), ("f", 6)])
print(d)  # {'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6}

# | operator (Python 3.9+)
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}
merged = d1 | d2
print(merged)  # {'a': 1, 'b': 3, 'c': 4}

# |= operator (in-place merge, Python 3.9+)
d1 |= d2
print(d1)  # {'a': 1, 'b': 3, 'c': 4}

# setdefault — get or set default value
d = {"a": 1}
d.setdefault("b", 2)    # Sets b=2 since it doesn't exist
d.setdefault("a", 99)   # Doesn't change a since it exists
print(d)  # {'a': 1, 'b': 2}

# pop — remove and return
value = d.pop("b")
print(value)  # 2
print(d)      # {'a': 1}

# pop with default
value = d.pop("z", None)  # Returns None if key doesn't exist

# popitem — remove last inserted item (Python 3.7+)
d = {"a": 1, "b": 2, "c": 3}
item = d.popitem()
print(item)  # ('c', 3)
print(d)     # {'a': 1, 'b': 2}

# copy — shallow copy
original = {"a": 1, "b": [2, 3]}
copy = original.copy()
copy["a"] = 99
copy["b"].append(4)
print(original)  # {'a': 1, 'b': [2, 3, 4]}  ← nested list affected!
print(copy)      # {'a': 99, 'b': [2, 3, 4]}

# Deep copy
import copy
original = {"a": 1, "b": [2, 3]}
deep = copy.deepcopy(original)
deep["b"].append(4)
print(original)  # {'a': 1, 'b': [2, 3]}  ← unchanged!
```

### Dictionary Performance

```
┌──────────────────────────────────────────────────┐
│          Dictionary Operation Complexity          │
├──────────────────────────┬──────────┬────────────┤
│ Operation                │ Time     │ Notes      │
├──────────────────────────┼──────────┼────────────┤
│ Get item [key]           │ O(1)*    │ Hash table │
│ Set item [key] = value   │ O(1)*    │ Hash table │
│ Delete item              │ O(1)*    │ Hash table │
│ Key membership (in)      │ O(1)*    │ Hash table │
│ Iteration                │ O(n)     │ All keys   │
│ Copy                     │ O(n)     │ All items  │
│ Merge (update)           │ O(k)     │ k = items  │
└──────────────────────────┴──────────┴────────────┘
* Average case; worst case O(n) with hash collisions
```

### Advanced Dictionary Patterns

```python
# Defaultdict
from collections import defaultdict

# Count word frequencies
text = "hello world hello python world hello"
word_count = defaultdict(int)
for word in text.split():
    word_count[word] += 1
print(dict(word_count))  # {'hello': 3, 'world': 2, 'python': 1}

# Group items
students = [
    ("Alice", "Math"), ("Bob", "Science"), ("Charlie", "Math"),
    ("Diana", "Science"), ("Eve", "Math"),
]
groups = defaultdict(list)
for name, subject in students:
    groups[subject].append(name)
print(dict(groups))
# {'Math': ['Alice', 'Charlie', 'Eve'], 'Science': ['Bob', 'Diana']}

# Counter
from collections import Counter

text = "the quick brown fox jumps over the lazy dog"
word_freq = Counter(text.split())
print(word_freq.most_common(3))  # [('the', 2), ('quick', 1), ('brown', 1)]

# ChainMap — combine multiple dicts
from collections import ChainMap

defaults = {"color": "red", "size": "medium"}
user_settings = {"color": "blue"}
config = ChainMap(user_settings, defaults)
print(config["color"])  # "blue" (user setting)
print(config["size"])   # "medium" (default)
```

---

## 5.4 Sets

Sets are **unordered collections of unique elements** — ideal for membership testing, deduplication, and set operations.

### Creating Sets

```python
# Empty set (NOT {} — that's an empty dict!)
empty = set()
not_set = {}  # This is a dict!

# Set with values
fruits = {"apple", "banana", "cherry"}

# From iterable
numbers = set([1, 2, 2, 3, 3, 3])  # Duplicates removed
print(numbers)  # {1, 2, 3}

# Set comprehension
evens = {x for x in range(20) if x % 2 == 0}
print(evens)  # {0, 2, 4, 6, 8, 10, 12, 14, 16, 18}

# Frozenset (immutable set)
frozen = frozenset([1, 2, 3, 4, 5])
# frozen.add(6)  # ❌ AttributeError
```

### Set Operations

```python
# Adding and removing
s = {1, 2, 3}
s.add(4)
print(s)  # {1, 2, 3, 4}

s.update([5, 6, 7])  # Add multiple
print(s)  # {1, 2, 3, 4, 5, 6, 7}

s.remove(3)     # Raises KeyError if missing
s.discard(10)   # Doesn't raise error if missing
s.pop()         # Remove and return arbitrary element

# Membership testing (O(1) average)
print(3 in s)    # True
print(10 in s)   # False

# Length
print(len(s))    # 5
```

### Set Algebra

```python
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

# Union (all elements from both)
print(a | b)           # {1, 2, 3, 4, 5, 6, 7, 8}
print(a.union(b))      # Same

# Intersection (common elements)
print(a & b)           # {4, 5}
print(a.intersection(b))  # Same

# Difference (elements in a but not b)
print(a - b)           # {1, 2, 3}
print(a.difference(b)) # Same

# Symmetric difference (elements in either, but not both)
print(a ^ b)                        # {1, 2, 3, 6, 7, 8}
print(a.symmetric_difference(b))    # Same

# Subset and superset
c = {1, 2, 3}
print(c <= a)         # True (c is subset of a)
print(c.issubset(a))  # True
print(a >= c)         # True (a is superset of c)
print(a.issuperset(c))  # True

# Disjoint sets (no common elements)
d = {10, 11, 12}
print(a.isdisjoint(d))  # True
print(a.isdisjoint(b))  # False

# In-place operations
s = {1, 2, 3}
s |= {4, 5}       # Union in-place
s &= {2, 3, 4}    # Intersection in-place
s -= {3}           # Difference in-place
print(s)           # {2, 4}
```

### Set Performance

```
┌──────────────────────────────────────────────────┐
│            Set Operation Complexity               │
├──────────────────────────┬──────────┬────────────┤
│ Operation                │ Time     │ Notes      │
├──────────────────────────┼──────────┼────────────┤
│ Add element              │ O(1)*    │ Hash table │
│ Remove element           │ O(1)*    │ Hash table │
│ Membership (in)          │ O(1)*    │ Hash table │
│ Union (a | b)            │ O(n+m)   │ n,m sizes  │
│ Intersection (a & b)     │ O(min(n,m))│ Faster   │
│ Difference (a - b)       │ O(n)     │            │
│ Symmetric diff (a ^ b)   │ O(n+m)   │            │
└──────────────────────────┴──────────┴────────────┘
* Average case; worst case O(n) with hash collisions
```

### Practical Set Usage

```python
# Remove duplicates while preserving order
def unique_ordered(sequence):
    """Remove duplicates while preserving order."""
    seen = set()
    result = []
    for item in sequence:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

print(unique_ordered([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]))
# [3, 1, 4, 5, 9, 2, 6]

# Find common elements across multiple lists
list1 = [1, 2, 3, 4, 5]
list2 = [3, 4, 5, 6, 7]
list3 = [5, 6, 7, 8, 9]

common = set(list1) & set(list2) & set(list3)
print(common)  # {5}

# Find differences between versions
old_permissions = {"read", "write", "execute"}
new_permissions = {"read", "execute", "admin"}

added = new_permissions - old_permissions
removed = old_permissions - new_permissions
print(f"Added: {added}")     # Added: {'admin'}
print(f"Removed: {removed}")  # Removed: {'write'}
```

---

## 5.5 The `collections` Module

### deque — Double-Ended Queue

```python
from collections import deque

# Create deque
dq = deque([1, 2, 3, 4, 5])

# Add/remove from both ends
dq.append(6)        # Right end
dq.appendleft(0)    # Left end
print(dq)           # deque([0, 1, 2, 3, 4, 5, 6])

dq.pop()            # Remove from right
dq.popleft()        # Remove from left
print(dq)           # deque([1, 2, 3, 4, 5])

# Rotate
dq.rotate(2)        # Rotate right by 2
print(dq)           # deque([4, 5, 1, 2, 3])

dq.rotate(-2)       # Rotate left by 2
print(dq)           # deque([1, 2, 3, 4, 5])

# Fixed-size deque (useful for sliding windows)
window = deque(maxlen=3)
for i in range(5):
    window.append(i)
    print(f"Window: {list(window)}")
# Window: [0]
# Window: [0, 1]
# Window: [0, 1, 2]
# Window: [1, 2, 3]  ← oldest removed
# Window: [2, 3, 4]

# Extend
dq.extend([6, 7, 8])
dq.extendleft([0, -1, -2])  # Note: added in reverse!
print(dq)  # deque([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8])
```

### OrderedDict (Python 3.7+: dict is ordered)

```python
from collections import OrderedDict

# In Python 3.7+, regular dicts maintain insertion order
# OrderedDict is still useful for:
# 1. move_to_end()
# 2. Equality checks (order-sensitive)

od = OrderedDict()
od["first"] = 1
od["second"] = 2
od["third"] = 3

od.move_to_end("first")     # Move to end
print(list(od.keys()))      # ['second', 'third', 'first']

od.move_to_end("first", last=False)  # Move to beginning
print(list(od.keys()))      # ['first', 'second', 'third']

# popitem (LIFO or FIFO)
od.popitem(last=True)       # Remove last (LIFO)
od.popitem(last=False)      # Remove first (FIFO)
```

### defaultdict

```python
from collections import defaultdict

# Group by category
data = [
    {"type": "fruit", "name": "apple"},
    {"type": "vegetable", "name": "carrot"},
    {"type": "fruit", "name": "banana"},
    {"type": "vegetable", "name": "broccoli"},
    {"type": "fruit", "name": "cherry"},
]

grouped = defaultdict(list)
for item in data:
    grouped[item["type"]].append(item["name"])

print(dict(grouped))
# {'fruit': ['apple', 'banana', 'cherry'], 'vegetable': ['carrot', 'broccoli']}

# Count with defaultdict(int)
from collections import Counter

sentence = "the cat sat on the mat the cat"
word_counts = Counter(sentence.split())
print(word_counts)  # Counter({'the': 3, 'cat': 2, 'sat': 1, 'on': 1, 'mat': 1})
print(word_counts.most_common(2))  # [('the', 3), ('cat', 2)]
```

### deque vs list

```
┌──────────────────────────────────────────────────┐
│              deque vs list                        │
├──────────────────────────┬──────────┬────────────┤
│ Operation                │ deque    │ list       │
├──────────────────────────┼──────────┼────────────┤
│ Append right             │ O(1)     │ O(1)*      │
│ Append left              │ O(1)     │ O(n)       │
│ Pop right                │ O(1)     │ O(1)       │
│ Pop left                 │ O(1)     │ O(n)       │
│ Index access [i]         │ O(n)     │ O(1)       │
│ Search                   │ O(n)     │ O(n)       │
│ Memory                   │ More     │ Less       │
│ Best for                 │ Queue/   │ Random     │
│                          │ Stack    │ access     │
└──────────────────────────┴──────────┴────────────┘
* Amortized
```

---

## 5.6 Practical Data Structure Patterns

### Stack Implementation

```python
# Using list as stack (LIFO)
class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Pop from empty stack")
        return self._items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Peek at empty stack")
        return self._items[-1]

    def is_empty(self):
        return len(self._items) == 0

    def __len__(self):
        return len(self._items)

# Usage
stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)
print(stack.pop())   # 3
print(stack.peek())  # 2
print(len(stack))    # 2
```

### Queue Implementation

```python
from collections import deque

class Queue:
    def __init__(self):
        self._items = deque()

    def enqueue(self, item):
        self._items.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Dequeue from empty queue")
        return self._items.popleft()

    def peek(self):
        if self.is_empty():
            raise IndexError("Peek at empty queue")
        return self._items[0]

    def is_empty(self):
        return len(self._items) == 0

    def __len__(self):
        return len(self._items)

# Usage
queue = Queue()
queue.enqueue("Alice")
queue.enqueue("Bob")
queue.enqueue("Charlie")
print(queue.dequeue())  # "Alice"
print(queue.peek())     # "Bob"
```

### LRU Cache

```python
from collections import OrderedDict

class LRUCache:
    """Least Recently Used cache."""

    def __init__(self, capacity):
        self.capacity = capacity
        self._cache = OrderedDict()

    def get(self, key):
        if key not in self._cache:
            return -1
        self._cache.move_to_end(key)
        return self._cache[key]

    def put(self, key, value):
        if key in self._cache:
            self._cache.move_to_end(key)
        self._cache[key] = value
        if len(self._cache) > self.capacity:
            self._cache.popitem(last=False)

# Usage
cache = LRUCache(3)
cache.put("a", 1)
cache.put("b", 2)
cache.put("c", 3)
print(cache.get("a"))   # 1 (moves "a" to end)
cache.put("d", 4)       # Evicts "b" (least recently used)
print(cache.get("b"))   # -1 (not found)
```

### Nested Data Structures

```python
# Working with deeply nested data
company = {
    "engineering": {
        "backend": [
            {"name": "Alice", "skills": ["Python", "Go"]},
            {"name": "Bob", "skills": ["Java", "Python"]},
        ],
        "frontend": [
            {"name": "Charlie", "skills": ["JavaScript", "React"]},
        ],
    },
    "marketing": {
        "content": [
            {"name": "Diana", "skills": ["Writing", "SEO"]},
        ],
    },
}

# Find all Python developers
python_devs = []
for dept, teams in company.items():
    for team, members in teams.items():
        for member in members:
            if "Python" in member["skills"]:
                python_devs.append(member["name"])

print(f"Python developers: {python_devs}")
# Python developers: ['Alice', 'Bob']

# Using nested comprehension
python_devs = [
    member["name"]
    for dept in company.values()
    for team in dept.values()
    for member in team
    if "Python" in member["skills"]
]
print(python_devs)  # ['Alice', 'Bob']
```

---

## Key Takeaways

1. **Lists** — Mutable, ordered sequences. Use for dynamic collections that need modification.
2. **Tuples** — Immutable, ordered sequences. Use for fixed data, dictionary keys, and function returns.
3. **Named tuples** — Lightweight classes with named fields. Better than plain tuples for readability.
4. **Dicts** — Key-value mappings with O(1) lookup. Use for structured data and fast lookups.
5. **Sets** — Unique element collections with O(1) membership testing. Use for deduplication and set algebra.
6. **deque** — Double-ended queue with O(1) append/pop from both ends. Use for queues and sliding windows.
7. **defaultdict** — Dictionaries with default values. Avoid KeyError and simplify grouping.
8. **Counter** — Count hashable objects. Perfect for frequency analysis.
9. **Choose the right structure** — Lists for sequences, dicts for mappings, sets for uniqueness, tuples for fixed data.
10. **Performance matters** — Understand O(n) complexity to choose the right tool.

---

## Practice Exercises

### Exercise 1: Anagram Checker
```python
def are_anagrams(s1, s2):
    """Check if two strings are anagrams."""
    # Your implementation using collections
    pass
```

### Exercise 2: Word Frequency Analyzer
```python
def analyze_text(text):
    """Return word frequency, unique words, and average word length."""
    # Your implementation using Counter
    pass
```

### Exercise 3: Merge Sorted Lists
```python
def merge_sorted(*lists):
    """Merge multiple sorted lists into one sorted list."""
    # Use heapq.merge or implement your own
    pass
```

### Exercise 4: Shopping Cart
Implement a shopping cart using dictionaries:
- Add items (name, price, quantity)
- Remove items
- Update quantity
- Calculate total
- Apply discount codes
- Display receipt

### Challenge: Social Network Analyzer
Given a dictionary of users and their friends:
```python
network = {
    "Alice": ["Bob", "Charlie"],
    "Bob": ["Alice", "Charlie", "Diana"],
    "Charlie": ["Alice", "Bob"],
    "Diana": ["Bob", "Eve"],
    "Eve": ["Diana"],
}
```
Implement:
1. Find all friends of a user
2. Find mutual friends between two users
3. Find friends of friends (2nd degree connections)
4. Find the most connected user
5. Find isolated users (no connections)

---

*In the next chapter, we'll explore Object-Oriented Programming — classes, inheritance, and polymorphism.*
