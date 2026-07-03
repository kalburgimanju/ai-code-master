# Chapter 6: Object-Oriented Programming

> *"Object-oriented programming is an exceptionally bad idea which could only have originated in California."* — Edsger Dijkstra

Despite Dijkstra's famous quip, Python's OOP model is one of its greatest strengths. It allows you to model real-world entities as objects, bundle data and behavior together, and build complex systems from reusable, composable components. Python's approach to OOP is unique: it supports classical inheritance while embracing duck typing, and its dataclass and metaclass systems offer tools that range from pragmatic to deeply reflective.

```
┌─────────────────────────────────────────────────────────────┐
│                PYTHON OOP CONCEPT MAP                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Classes ──→ Objects ──→ Attributes & Methods              │
│      │                      │                               │
│      │                      ├── Instance methods            │
│      │                      ├── Class methods               │
│      │                      ├── Static methods              │
│      │                      └── Properties                  │
│      │                                                      │
│      ├── Inheritance (single, multiple, MRO)                │
│      ├── Polymorphism (duck typing, protocols)              │
│      ├── Dunder methods (operator overloading)              │
│      ├── ABCs (abstract base classes)                       │
│      ├── Dataclasses (concise class definitions)            │
│      ├── Slots (memory-efficient attributes)                │
│      └── Metaclasses (class creation control)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6.1 Classes and Objects

A **class** is a blueprint for creating objects. An **object** (instance) is a concrete realization of that blueprint, with its own state (attributes) and behavior (methods).

### 6.1.1 Defining a Class

```python
class Dog:
    """A simple Dog class."""

    # Class variable — shared across ALL instances
    species = "Canis familiaris"

    # Initializer (constructor)
    def __init__(self, name: str, age: int, breed: str = "Mixed"):
        """Initialize a new Dog instance."""
        # Instance variables — unique to EACH instance
        self.name = name
        self.age = age
        self.breed = breed
        self._tricks: list[str] = []  # convention: _ = "internal"

    # Instance method
    def bark(self) -> str:
        return f"{self.name} says: Woof!"

    def learn_trick(self, trick: str) -> None:
        self._tricks.append(trick)

    def show_tricks(self) -> list[str]:
        return list(self._tricks)

    def __repr__(self) -> str:
        return f"Dog(name={self.name!r}, age={self.age}, breed={self.breed!r})"


# Creating instances
dog1 = Dog("Buddy", 3, "Golden Retriever")
dog2 = Dog("Max", 5)

# Accessing attributes
print(dog1.name)        # Buddy
print(dog2.species)     # Canis familiaris (class variable)
print(dog1.bark())      # Buddy says: Woof!

# Instance attributes shadow class attributes
dog2.species = "Mutt"
print(dog2.species)     # Mutt (instance attribute)
print(dog1.species)     # Canis familiaris (class attribute, unaffected)
print(Dog.species)      # Canis familiaris (class attribute)
```

### 6.1.2 Instance vs Class Variables

```python
class Employee:
    # Class variable — shared
    company = "Acme Corp"
    employee_count = 0

    def __init__(self, name: str, salary: float):
        # Instance variables — per-object
        self.name = name
        self.salary = salary
        Employee.employee_count += 1  # modify the class variable

    def __repr__(self) -> str:
        return f"Employee({self.name!r}, salary={self.salary})"


emp1 = Employee("Alice", 90000)
emp2 = Employee("Bob", 85000)

print(Employee.company)          # Acme Corp
print(emp1.company)              # Acme Corp (inherited from class)
print(Employee.employee_count)   # 2

# Modifying class variable affects ALL instances
Employee.company = "Globex Inc"
print(emp1.company)              # Globex Inc
print(emp2.company)              # Globex Inc

# But assigning to an instance creates a new instance attribute
emp1.company = "Initech"
print(emp1.company)              # Initech (instance attribute shadows class)
print(emp2.company)              # Globex Inc (still uses class attribute)
print(Employee.company)          # Globex Inc (class attribute unchanged)
```

**How attribute lookup works (the LEGB rule for attributes):**

```
Instance attribute lookup order:
1. Instance.__dict__        → instance attributes
2. Class.__dict__           → class attributes
3. Parent class.__dict__    → inherited attributes
4. AttributeError raised    → if not found anywhere

Note: Class attributes that are mutable (lists, dicts) are shared:
```

```python
class Config:
    settings = {"debug": False}  # Mutable class variable — DANGEROUS

a = Config()
b = Config()
a.settings["debug"] = True
print(b.settings["debug"])  # True — they share the same dict!

# SAFE: initialize mutable class attributes in __init__
class SafeConfig:
    def __init__(self):
        self.settings = {"debug": False}  # Each instance gets its own dict
```

---

## 6.2 Methods

Python has three types of methods in addition to instance methods: class methods, static methods, and properties.

### 6.2.1 Instance Methods

The first parameter of an instance method is always `self` — the instance on which the method is called.

```python
class Circle:
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        import math
        return math.pi * self.radius ** 2

    def circumference(self) -> float:
        import math
        return 2 * math.pi * self.radius

    def describe(self) -> str:
        return f"Circle(radius={self.radius}, area={self.area():.2f})"


c = Circle(5)
print(c.area())         # 78.5398...
print(c.circumference())  # 31.4159...
print(c.describe())     # Circle(radius=5, area=78.54)
```

### 6.2.2 Class Methods (`@classmethod`)

A class method receives the **class** as the first argument (conventionally named `cls`), not the instance. Commonly used as **factory methods** and to modify class-level state.

```python
class Date:
    def __init__(self, year: int, month: int, day: int):
        self.year = year
        self.month = month
        self.day = day

    def __repr__(self) -> str:
        return f"Date({self.year}, {self.month}, {self.day})"

    # Regular method (receives instance)
    def iso_format(self) -> str:
        return f"{self.year:04d}-{self.month:02d}-{self.day:02d}"

    # Class method — factory from string
    @classmethod
    def from_string(cls, date_str: str) -> "Date":
        year, month, day = map(int, date_str.split("-"))
        return cls(year, month, day)  # cls() calls the constructor

    # Class method — factory from timestamp
    @classmethod
    def from_timestamp(cls, timestamp: float) -> "Date":
        import datetime
        dt = datetime.datetime.fromtimestamp(timestamp)
        return cls(dt.year, dt.month, dt.day)


# Regular constructor
d1 = Date(2024, 6, 15)
print(d1)  # Date(2024, 6, 15)

# Class method factories
d2 = Date.from_string("2024-06-15")
print(d2)  # Date(2024, 6, 15)

d3 = Date.from_timestamp(1718438400)
print(d3)  # Date(2024, 6, 15)

print(d2.iso_format())  # 2024-06-15
```

```python
# Class method for class-level operations
class Student:
    total_enrolled = 0

    def __init__(self, name: str):
        self.name = name
        Student.total_enrolled += 1

    @classmethod
    def get_enrollment_count(cls) -> int:
        return cls.total_enrolled

    @classmethod
    def create_batch(cls, names: list[str]) -> list["Student"]:
        """Factory: create multiple students at once."""
        return [cls(name) for name in names]


students = Student.create_batch(["Alice", "Bob", "Charlie"])
print(Student.get_enrollment_count())  # 3
```

### 6.2.3 Static Methods (`@staticmethod`)

A static method receives **neither** `self` nor `cls`. It's essentially a regular function that lives inside the class for organizational purposes.

```python
class MathUtils:
    @staticmethod
    def is_even(n: int) -> bool:
        return n % 2 == 0

    @staticmethod
    def factorial(n: int) -> int:
        if n < 0:
            raise ValueError("n must be non-negative")
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

    @staticmethod
    def gcd(a: int, b: int) -> int:
        while b:
            a, b = b, a % b
        return a


# Call on the class
print(MathUtils.is_even(4))      # True
print(MathUtils.factorial(5))     # 120
print(MathUtils.gcd(48, 18))     # 6

# Or on an instance (but no reason to)
m = MathUtils()
print(m.is_even(3))  # False
```

### 6.2.4 Comparison: When to Use Which

```python
class MyClass:
    class_var = "shared"

    def __init__(self, value):
        self.value = value

    # Instance method: needs to access/modify instance state
    def get_value(self) -> str:
        return self.value  # uses self (instance)

    # Class method: needs to access/modify class state, or factory
    @classmethod
    def get_class_var(cls) -> str:
        return cls.class_var  # uses cls (class)

    # Static method: utility function that logically belongs to the class
    @staticmethod
    def validate(value: int) -> bool:
        return isinstance(value, int) and value > 0
        # no self or cls needed
```

| Method Type | First Arg | Access Instance? | Access Class? | Common Use |
|---|---|---|---|---|
| Instance | `self` | Yes | Via `self.__class__` | Read/write instance state |
| Class | `cls` | No | Yes | Factory methods, class state |
| Static | (none) | No | No | Utility/helper functions |

### 6.2.5 Properties (`@property`)

Properties provide a Pythonic way to use getter/setter logic without changing the public API.

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius  # private backing attribute

    @property
    def celsius(self) -> float:
        """Getter: called when you access temperature.celsius"""
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        """Setter: called when you assign to temperature.celsius"""
        if value < -273.15:
            raise ValueError("Temperature below absolute zero is impossible")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        """Computed property: read-only"""
        return self._celsius * 9 / 5 + 32

    @fahrenheit.setter
    def fahrenheit(self, value: float) -> None:
        """Allow setting via Fahrenheit too"""
        self._celsius = (value - 32) * 5 / 9

    @property
    def kelvin(self) -> float:
        return self._celsius + 273.15


temp = Temperature(100)
print(temp.celsius)      # 100
print(temp.fahrenheit)   # 212.0
print(temp.kelvin)       # 373.15

temp.fahrenheit = 32
print(temp.celsius)      # 0.0

# temp.celsius = -300  # ValueError: Temperature below absolute zero...
```

```python
# @property for computed attributes (no setter)
import math

class Rectangle:
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    @property
    def area(self) -> float:
        return self.width * self.height

    @property
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

    @property
    def diagonal(self) -> float:
        return math.sqrt(self.width**2 + self.height**2)

    def __repr__(self) -> str:
        return f"Rectangle({self.width}, {self.height})"


r = Rectangle(3, 4)
print(r.area)        # 12 (no parentheses — looks like an attribute!)
print(r.perimeter)   # 14
print(r.diagonal)    # 5.0
```

---

## 6.3 Inheritance

Inheritance allows a class to reuse, extend, and specialize the behavior of another class.

### 6.3.1 Single Inheritance

```python
class Animal:
    def __init__(self, name: str, sound: str):
        self.name = name
        self.sound = sound

    def speak(self) -> str:
        return f"{self.name} says {self.sound}!"

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.name!r})"


class Dog(Animal):
    def __init__(self, name: str, breed: str):
        super().__init__(name, sound="Woof")  # call parent constructor
        self.breed = breed

    def fetch(self, item: str) -> str:
        return f"{self.name} fetches the {item}!"


class Cat(Animal):
    def __init__(self, name: str, indoor: bool = True):
        super().__init__(name, sound="Meow")
        self.indoor = indoor

    def describe(self) -> str:
        location = "indoor" if self.indoor else "outdoor"
        return f"{self.name} is an {location} cat"


# Using inheritance
dog = Dog("Buddy", "Golden Retriever")
cat = Cat("Whiskers")

print(dog.speak())       # Buddy says Woof! (inherited method)
print(dog.fetch("ball")) # Buddy fetches the ball!
print(cat.speak())       # Whiskers says Meow! (inherited method)
print(cat.describe())    # Whiskers is an indoor cat

# isinstance checks
print(isinstance(dog, Dog))     # True
print(isinstance(dog, Animal))  # True (Dog IS-A Animal)
print(isinstance(cat, Dog))     # False
print(isinstance(cat, Animal))  # True

# issubclass checks
print(issubclass(Dog, Animal))  # True
print(issubclass(Cat, Animal))  # True
print(issubclass(Dog, Cat))     # False
```

### 6.3.2 Multiple Inheritance

```python
class Swimmable:
    def swim(self) -> str:
        return f"{self.name} swims!"

    def breathe_underwater(self) -> str:
        return f"{self.name} breathes underwater!"


class Flyable:
    def fly(self) -> str:
        return f"{self.name} flies!"

    def glide(self) -> str:
        return f"{self.name} glides!"


class Duck(Animal, Swimmable, Flyable):
    def __init__(self, name: str):
        super().__init__(name, sound="Quack")


duck = Duck("Donald")
print(duck.speak())          # Donald says Quack! (from Animal)
print(duck.swim())           # Donald swims! (from Swimmable)
print(duck.fly())            # Donald flies! (from Flyable)
print(duck.glide())          # Donald glides! (from Flyable)
```

### 6.3.3 Method Resolution Order (MRO)

When multiple inheritance is involved, Python uses the C3 linearization algorithm to determine the order in which methods are looked up.

```python
class A:
    def greet(self):
        return "A"

class B(A):
    def greet(self):
        return "B"

class C(A):
    def greet(self):
        return "C"

class D(B, C):
    pass


d = D()
print(d.greet())  # B — follows MRO: D → B → C → A
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)

# You can also use the mro() method
for cls in D.mro():
    print(cls.__name__, end=" → ")
# D → B → C → A → object
```

**MRO Rules (C3 Linearization):**
1. Children come before parents
2. If a class appears in multiple parent lists, it appears **once** in the order of the **first** parent
3. The order of parent classes in the class definition matters

```
     ┌───┐
     │ A │
     └─┬─┘
    ┌──┴──┐
   ┌┴┐   ┌┴┐
   │B │   │C │
   └┬┘   └┬┘
    │     │
   ┌┴─────┴┐
   │   D   │
   └───────┘

MRO: D → B → C → A → object
```

### 6.3.4 The `super()` Function

```python
class Base:
    def __init__(self, value: int):
        self.value = value
        print(f"Base.__init__(value={value})")

class Middle(Base):
    def __init__(self, value: int, label: str):
        super().__init__(value)  # calls Base.__init__
        self.label = label
        print(f"Middle.__init__(label={label!r})")

class Top(Middle):
    def __init__(self, value: int, label: str, extra: bool):
        super().__init__(value, label)  # calls Middle.__init__
        self.extra = extra
        print(f"Top.__init__(extra={extra})")

t = Top(42, "hello", True)
# Base.__init__(value=42)
# Middle.__init__(label='hello')
# Top.__init__(extra=True)

# super() calls follow the MRO, so it works correctly with multiple inheritance
class X:
    def __init__(self):
        print("X.__init__")

class Y(X):
    def __init__(self):
        super().__init__()
        print("Y.__init__")

class Z(X):
    def __init__(self):
        super().__init__()
        print("Z.__init__")

class W(Y, Z):
    def __init__(self):
        super().__init__()
        print("W.__init__")

W()  # Output: X.__init__ → Z.__init__ → Y.__init__ → W.__init__
```

---

## 6.4 Polymorphism

Polymorphism means "many forms" — the ability to use different types interchangeably through a common interface. In Python, this is achieved primarily through **duck typing**: if an object has the methods you need, it works.

### 6.4.1 Duck Typing

```python
# Python doesn't care about the TYPE — only about the BEHAVIOR

class Dog:
    def speak(self) -> str:
        return "Woof!"

class Cat:
    def speak(self) -> str:
        return "Meow!"

class Cow:
    def speak(self) -> str:
        return "Moo!"

def animal_concert(animals):
    """Any object with a speak() method works here."""
    for animal in animals:
        print(animal.speak())

# Works with ANY type that has speak()
animal_concert([Dog(), Cat(), Cow(), Dog()])
# Woof!
# Meow!
# Moo!
# Woof!

# Even a string works if it has the right method:
class FakeAnimal:
    pass
# animal_concert([FakeAnimal()])  # AttributeError: 'FakeAnimal' has no 'speak'
```

### 6.4.2 Operator Overloading with Dunder Methods

```python
class Vector:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    # String representations
    def __repr__(self) -> str:
        return f"Vector({self.x!r}, {self.y!r})"

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"

    # Arithmetic
    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __sub__(self, other: "Vector") -> "Vector":
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, scalar: float) -> "Vector":
        return Vector(self.x * scalar, self.y * scalar)

    def __rmul__(self, scalar: float) -> "Vector":
        return self.__mul__(scalar)  # handle 2 * v as well as v * 2

    def __abs__(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5

    # Comparison
    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __lt__(self, other: "Vector") -> bool:
        return abs(self) < abs(other)

    # Container protocol
    def __len__(self) -> int:
        return 2

    def __getitem__(self, index: int) -> float:
        if index == 0:
            return self.x
        elif index == 1:
            return self.y
        raise IndexError("Vector index out of range")

    # Callable (not common, but possible)
    def __bool__(self) -> bool:
        return self.x != 0 or self.y != 0


v1 = Vector(3, 4)
v2 = Vector(1, 2)

print(repr(v1))       # Vector(3, 4) — developer-friendly
print(str(v1))        # (3, 4) — user-friendly
print(v1 + v2)        # (4, 6)
print(v1 - v2)        # (2, 2)
print(v1 * 3)         # (9, 12)
print(3 * v1)         # (9, 12)
print(abs(v1))        # 5.0
print(v1 == Vector(3, 4))  # True
print(v1 < v2)        # False (5.0 > 2.236)
print(len(v1))        # 2
print(v1[0], v1[1])   # 3.0, 4.0
print(bool(Vector(0, 0)))  # False
```

### 6.4.3 The `NotImplemented` Sentinel

When overloading operators, return `NotImplemented` when the operation is not supported for the given type. This tells Python to try the reflected operation on the other operand.

```python
class Money:
    def __init__(self, amount: float, currency: str = "USD"):
        self.amount = amount
        self.currency = currency

    def __add__(self, other):
        if isinstance(other, Money):
            if self.currency != other.currency:
                raise ValueError(f"Cannot add {self.currency} and {other.currency}")
            return Money(self.amount + other.amount, self.currency)
        return NotImplemented  # let Python try other.__radd__(self)

    def __repr__(self) -> str:
        return f"Money({self.amount}, {self.currency!r})"

price = Money(100)
tax = Money(20)
total = price + tax
print(total)  # Money(120, 'USD')

# result = price + 50  # TypeError: unsupported operand type(s)
# Because int.__radd__(Money) also returns NotImplemented
```

---

## 6.5 Dunder/Magic Methods

Dunder (double underscore) methods let you customize how objects behave with built-in operations. Here is a comprehensive reference:

### 6.5.1 String Representation

```python
class Book:
    def __init__(self, title: str, author: str, pages: int):
        self.title = title
        self.author = author
        self.pages = pages

    def __str__(self) -> str:
        """Called by str(), print(), f-strings — user-facing"""
        return f"'{self.title}' by {self.author}"

    def __repr__(self) -> str:
        """Called by repr(), in REPL, in containers — developer-facing"""
        return f"Book({self.title!r}, {self.author!r}, {self.pages})"

    def __format__(self, spec: str) -> str:
        """Called by format() and f-strings with format spec"""
        if spec == "short":
            return f"{self.title[:10]}..."
        return str(self)

book = Book("The Great Gatsby", "F. Scott Fitzgerald", 180)
print(str(book))      # 'The Great Gatsby' by F. Scott Fitzgerald
print(repr(book))     # Book('The Great Gatsby', 'F. Scott Fitzgerald', 180)
print(f"{book}")      # 'The Great Gatsby' by F. Scott Fitzgerald
print(f"{book:short}")  # The Great...
print(f"{book!r}")    # Book('The Great Gatsby', 'F. Scott Fitzgerald', 180)

# In a list, Python uses repr()
books = [Book("A", "B", 100)]
print(books)  # [Book('A', 'B', 100)]
```

### 6.5.2 Container Protocols

```python
class Playlist:
    def __init__(self, name: str, songs: list[str]):
        self.name = name
        self._songs = list(songs)

    def __len__(self) -> int:
        return len(self._songs)

    def __getitem__(self, index):
        """Support indexing and slicing"""
        if isinstance(index, slice):
            return self._songs[index]
        return self._songs[index]

    def __setitem__(self, index, value):
        self._songs[index] = value

    def __delitem__(self, index):
        del self._songs[index]

    def __contains__(self, item) -> bool:
        return item in self._songs

    def __iter__(self):
        return iter(self._songs)

    def __reversed__(self):
        return reversed(self._songs)

    def __repr__(self) -> str:
        return f"Playlist({self.name!r}, songs={self._songs})"


playlist = Playlist("Road Trip", ["Song A", "Song B", "Song C", "Song D"])

print(len(playlist))         # 4
print(playlist[1])           # Song B
print(playlist[1:3])         # ['Song B', 'Song C']
print("Song A" in playlist)  # True

for song in playlist:
    print(song)

playlist[0] = "Song X"  # __setitem__
print(playlist)  # Playlist('Road Trip', songs=['Song X', 'Song B', 'Song C', 'Song D'])

del playlist[2]  # __delitem__
print(playlist)  # Playlist('Road Trip', songs=['Song X', 'Song B', 'Song D'])
```

### 6.5.3 Numeric Protocols

```python
class Money:
    def __init__(self, amount: float, currency: str = "USD"):
        self.amount = round(amount, 2)
        self.currency = currency

    # Arithmetic operators
    def __add__(self, other):       # self + other
        if isinstance(other, Money) and self.currency == other.currency:
            return Money(self.amount + other.amount, self.currency)
        return NotImplemented

    def __sub__(self, other):       # self - other
        if isinstance(other, Money) and self.currency == other.currency:
            return Money(self.amount - other.amount, self.currency)
        return NotImplemented

    def __mul__(self, other):       # self * other
        if isinstance(other, (int, float)):
            return Money(self.amount * other, self.currency)
        return NotImplemented

    def __rmul__(self, other):      # other * self
        return self.__mul__(other)

    def __truediv__(self, other):   # self / other
        if isinstance(other, (int, float)):
            return Money(self.amount / other, self.currency)
        return NotImplemented

    def __neg__(self):              # -self
        return Money(-self.amount, self.currency)

    def __abs__(self):              # abs(self)
        return Money(abs(self.amount), self.currency)

    # Comparison operators
    def __eq__(self, other):
        return isinstance(other, Money) and self.amount == other.amount and self.currency == other.currency

    def __lt__(self, other):
        if isinstance(other, Money) and self.currency == other.currency:
            return self.amount < other.amount
        return NotImplemented

    def __le__(self, other):
        return self == other or self < other

    # Hashing (required if __eq__ is defined)
    def __hash__(self):
        return hash((self.amount, self.currency))

    def __repr__(self) -> str:
        return f"Money({self.amount}, {self.currency!r})"


a = Money(100)
b = Money(50)
print(a + b)      # Money(150, 'USD')
print(a - b)      # Money(50, 'USD')
print(a * 2)      # Money(200, 'USD')
print(3 * b)      # Money(150, 'USD')
print(a / 4)      # Money(25.0, 'USD')
print(-a)         # Money(-100, 'USD')
print(abs(Money(-50)))  # Money(50, 'USD')
print(a > b)      # True

# Can be used in sets and as dict keys (because __hash__)
prices = {Money(10): "small", Money(50): "medium"}
```

### 6.5.4 Context Manager Protocol (`__enter__`/`__exit__`)

```python
import time

class Timer:
    """Context manager that measures execution time."""

    def __init__(self, label: str = "Block"):
        self.label = label
        self.elapsed = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self  # returned value goes to 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"{self.label}: {self.elapsed:.4f}s")
        return False  # don't suppress exceptions


# Usage
with Timer("Sum") as timer:
    total = sum(range(10_000_000))
print(f"Result: {total}, Time: {timer.elapsed:.4f}s")

# Chaining context managers
with Timer("A") as t1, Timer("B") as t2:
    pass
```

### 6.5.5 Iterator Protocol (`__iter__`/`__next__`)

```python
class Countdown:
    """Countdown from n to 1."""

    def __init__(self, start: int):
        self.current = start

    def __iter__(self):
        return self  # iterator protocol: object IS its own iterator

    def __next__(self) -> int:
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value


for n in Countdown(5):
    print(n, end=" ")
# 5 4 3 2 1

print(list(Countdown(3)))  # [3, 2, 1]
```

```python
# Separate iterator class (pattern for reusability)
class Fibonacci:
    def __init__(self, max_count: int):
        self.max_count = max_count

    def __iter__(self):
        return FibonacciIterator(self.max_count)


class FibonacciIterator:
    def __init__(self, max_count: int):
        self.max_count = max_count
        self.count = 0
        self.a, self.b = 0, 1

    def __iter__(self):
        return self

    def __next__(self) -> int:
        if self.count >= self.max_count:
            raise StopIteration
        value = self.a
        self.a, self.b = self.b, self.a + self.b
        self.count += 1
        return value


print(list(Fibonacci(10)))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Can iterate multiple times (each for loop creates a new iterator)
for n in Fibonacci(5):
    print(n, end=" ")  # 0 1 1 2 3
```

---

## 6.6 Abstract Base Classes (ABCs)

ABCs define interfaces that subclasses **must** implement. They enforce contracts at instantiation time rather than at call time.

```python
from abc import ABC, abstractmethod
import math

class Shape(ABC):
    """Abstract base class for all shapes."""

    @abstractmethod
    def area(self) -> float:
        """Calculate the area of the shape."""
        ...

    @abstractmethod
    def perimeter(self) -> float:
        """Calculate the perimeter of the shape."""
        ...

    def describe(self) -> str:
        """Concrete method — available to all subclasses."""
        return (
            f"{self.__class__.__name__}: "
            f"area={self.area():.2f}, "
            f"perimeter={self.perimeter():.2f}"
        )


class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius

    def area(self) -> float:
        return math.pi * self.radius ** 2

    def perimeter(self) -> float:
        return 2 * math.pi * self.radius


class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

    def perimeter(self) -> float:
        return 2 * (self.width + self.height)


# shape = Shape()  # TypeError: Can't instantiate abstract class Shape
# with abstract methods area, perimeter

circle = Circle(5)
rect = Rectangle(3, 4)

print(circle.describe())  # Circle: area=78.54, perimeter=31.42
print(rect.describe())    # Rectangle: area=12.00, perimeter=14.00

# Polymorphism via ABC
shapes: list[Shape] = [Circle(1), Rectangle(2, 3), Circle(4)]
total_area = sum(s.area() for s in shapes)
print(f"Total area: {total_area:.2f}")
```

### 6.6.1 Registering Virtual Subclasses

```python
from abc import ABC, abstractmethod

class Drawable(ABC):
    @abstractmethod
    def draw(self) -> str: ...

# You can register an existing class as a subclass
class TextWidget:
    def draw(self) -> str:
        return "Drawing text"

Drawable.register(TextWidget)
print(issubclass(TextWidget, Drawable))  # True
print(isinstance(TextWidget(), Drawable))  # True
```

---

## 6.7 Dataclasses

Dataclasses reduce boilerplate for classes that primarily store data. They auto-generate `__init__`, `__repr__`, `__eq__`, and more.

```python
from dataclasses import dataclass, field
from typing import ClassVar

@dataclass
class Player:
    name: str
    score: int = 0
    level: int = 1
    tags: list[str] = field(default_factory=list)  # mutable default

    # Computed property
    @property
    def rank(self) -> str:
        if self.score >= 1000:
            return "Master"
        elif self.score >= 500:
            return "Expert"
        return "Novice"


p1 = Player("Alice", score=750, tags=["pvp"])
p2 = Player("Bob")
p3 = Player("Alice", score=750, tags=["pvp"])

print(p1)  # Player(name='Alice', score=750, level=1, tags=['pvp'])
print(p1.rank)  # Expert

# Auto-generated __eq__
print(p1 == p3)  # True (same name, score, level)
print(p1 == p2)  # False

# Frozen dataclasses (immutable)
@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x)**2 + (self.y - other.y)**2) ** 0.5

p1 = Point(0, 0)
p2 = Point(3, 4)
print(p1.distance_to(p2))  # 5.0
# p1.x = 5  # FrozenInstanceError: cannot assign to field

# Can be used as dict keys (because hashable)
points = {Point(0, 0): "origin", Point(1, 1): "diagonal"}

# Slot dataclasses (memory-efficient)
@dataclass(slots=True)
class SlotPoint:
    x: float
    y: float
```

### 6.7.1 Dataclass Options

```python
@dataclass(
    frozen=True,       # immutable (generates __hash__, disallows __setattr__)
    slots=True,        # use __slots__ for memory efficiency
    order=True,        # generate __lt__, __le__, __gt__, __ge__
    kw_only=True,      # all fields must be keyword-only
    repr=True,         # generate __repr__ (default True)
    eq=True,           # generate __eq__ (default True)
    unsafe_hash=False, # generate __hash__ even if frozen=False
)
class Config:
    host: str
    port: int = 8080
    debug: bool = False
```

### 6.7.2 Post-Init Processing

```python
from dataclasses import dataclass, field

@dataclass
class User:
    first_name: str
    last_name: str
    email: str = ""

    def __post_init__(self):
        """Called after auto-generated __init__."""
        self.email = self.email or f"{self.first_name.lower()}.{self.last_name.lower()}@example.com"
        self.display_name = f"{self.first_name} {self.last_name}"

user = User("John", "Doe")
print(user.email)          # john.doe@example.com
print(user.display_name)   # John Doe
```

### 6.7.3 Inheritance with Dataclasses

```python
from dataclasses import dataclass, field

@dataclass
class Animal:
    name: str
    sound: str

@dataclass
class Dog(Animal):
    breed: str = "Mixed"
    tricks: list[str] = field(default_factory=list)

@dataclass
class GuideDog(Dog):
    handler: str = ""

    def describe(self) -> str:
        return f"{self.name} ({self.breed}) guided by {self.handler}"

dog = GuideDog("Rex", "Bark", breed="Labrador", handler="Alice")
print(dog)  # GuideDog(name='Rex', sound='Bark', breed='Labrador', tricks=[], handler='Alice')
print(dog.describe())  # Rex (Labrador) guided by Alice
```

---

## 6.8 `__slots__`

By default, Python stores instance attributes in a `__dict__` dictionary. `__slots__` restricts attributes to a fixed set, reducing memory and improving access speed.

```python
class WithoutSlots:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class WithSlots:
    __slots__ = ("x", "y")  # ONLY these attributes are allowed

    def __init__(self, x, y):
        self.x = x
        self.y = y

import sys

wo = WithoutSlots(1, 2)
ws = WithSlots(1, 2)

print(sys.getsizeof(wo.__dict__))  # ~104 bytes (dict overhead)
# ws doesn't have __dict__ at all:
# hasattr(ws, "__dict__")  # False

# Memory savings for many instances
import tracemalloc
tracemalloc.start()

class PointNoSlots:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class PointSlots:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

_ = [PointNoSlots(i, i) for i in range(10000)]
snapshot1 = tracemalloc.take_snapshot()

tracemalloc.clear_traces()
_ = [PointSlots(i, i) for i in range(10000)]
snapshot2 = tracemalloc.take_snapshot()

# Slots typically use 40-50% less memory for many instances
```

**Trade-offs:**

| Feature | `__dict__` (default) | `__slots__` |
|---|---|---|
| Memory | Higher | Lower |
| Speed | Slightly slower | Slightly faster |
| Dynamic attrs | Allowed | Blocked |
| Inheritance | Easy | Complex |
| Pickling | Straightforward | Needs care |

---

## 6.9 Metaclasses Basics

Metaclasses are "classes of classes." Just as a class defines how instances behave, a metaclass defines how classes themselves behave.

```python
# The default metaclass is 'type'
class MyClass:
    x = 10

print(type(MyClass))  # <class 'type'>
print(type(42))       # <class 'type'>
print(type("hello"))  # <class 'type'>

# You can create a class using type() directly
MyClass2 = type("MyClass2", (), {"x": 10, "greet": lambda self: "Hello"})
obj = MyClass2()
print(obj.x)         # 10
print(obj.greet())   # Hello

# Custom metaclass
class ValidatedMeta(type):
    """Metaclass that ensures all methods have docstrings."""

    def __new__(mcs, name, bases, namespace):
        for key, value in namespace.items():
            if callable(value) and not key.startswith("_"):
                if not value.__doc__:
                    raise TypeError(
                        f"Method {name}.{key} must have a docstring"
                    )
        return super().__new__(mcs, name, bases, namespace)


class API(metaclass=ValidatedMeta):
    def get_users(self):
        """Get all users."""
        return []

    def create_user(self, data):
        """Create a new user."""
        return data


# This would raise TypeError:
# class BadAPI(metaclass=ValidatedMeta):
#     def get_users(self):  # Missing docstring!
#         return []
```

> **Note:** Metaclasses are powerful but rarely needed. Prefer decorators, descriptors, or `__init_subclass__` for most use cases.

### 6.9.1 `__init_subclass__` — A Lighter Alternative

```python
class Plugin:
    """Base class with automatic plugin registration."""
    _registry: dict[str, type] = {}

    def __init_subclass__(cls, name: str = "", **kwargs):
        super().__init_subclass__(**kwargs)
        if name:
            Plugin._registry[name] = cls

class CSVPlugin(Plugin, name="csv"):
    def read(self, path):
        return f"Reading CSV from {path}"

class JSONPlugin(Plugin, name="json"):
    def read(self, path):
        return f"Reading JSON from {path}"

print(Plugin._registry)  # {'csv': <class 'CSVPlugin'>, 'json': <class 'JSONPlugin'>}
plugin = Plugin._registry["csv"]()
print(plugin.read("data.csv"))  # Reading CSV from data.csv
```

---

## 6.10 Composition vs Inheritance

### 6.10.1 The Problem with Deep Inheritance

```python
# BAD: Deep inheritance hierarchy — fragile, hard to maintain
class Animal:
    def __init__(self, name):
        self.name = name

class FlyingAnimal(Animal):
    def fly(self): ...

class SwimmingAnimal(Animal):
    def swim(self): ...

# A duck swims AND flies... but what about a penguin?
class Duck(FlyingAnimal, SwimmingAnimal):  # works!
    pass

class Penguin(SwimmingAnimal):  # can't fly... but what if it could?
    pass

# Adding new behaviors requires modifying the hierarchy
# What about a FlyingFish? A Frog that swims AND hops?
```

### 6.10.2 The Composition Approach

```python
# GOOD: Composition — assemble behaviors from components

class FlyBehavior:
    def fly(self) -> str:
        return f"{self.name} flies!"

class SwimBehavior:
    def swim(self) -> str:
        return f"{self.name} swims!"

class HopBehavior:
    def hop(self) -> str:
        return f"{self.name} hops!"

class Animal:
    def __init__(self, name: str, *behaviors):
        self.name = name
        for behavior in behaviors:
            # Attach each behavior's methods to this instance
            for method_name in dir(behavior):
                if not method_name.startswith("_") and callable(getattr(behavior, method_name)):
                    bound = getattr(behavior, method_name).__get__(self, type(self))
                    setattr(self, method_name, bound)

# Assemble animals from behaviors
duck = Animal("Duck", FlyBehavior(), SwimBehavior())
print(duck.fly())   # Duck flies!
print(duck.swim())  # Duck swims!

frog = Animal("Frog", HopBehavior(), SwimBehavior())
print(frog.hop())   # Frog hops!
print(frog.swim())  # Frog swims!

penguin = Animal("Penguin", SwimBehavior())
print(penguin.swim())  # Penguin swims!
# penguin.fly()  # AttributeError — can't fly!
```

### 6.10.3 Strategy Pattern with Composition

```python
from typing import Protocol

class SortStrategy(Protocol):
    def sort(self, data: list) -> list: ...

class BubbleSort:
    def sort(self, data: list) -> list:
        result = list(data)
        n = len(result)
        for i in range(n):
            for j in range(0, n - i - 1):
                if result[j] > result[j + 1]:
                    result[j], result[j + 1] = result[j + 1], result[j]
        return result

class QuickSort:
    def sort(self, data: list) -> list:
        if len(data) <= 1:
            return list(data)
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        middle = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + middle + self.sort(right)

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy) -> None:
        self._strategy = strategy

    def sort(self, data: list) -> list:
        return self._strategy.sort(data)


sorter = Sorter(BubbleSort())
print(sorter.sort([3, 1, 4, 1, 5, 9]))  # [1, 1, 3, 4, 5, 9]

sorter.set_strategy(QuickSort())
print(sorter.sort([3, 1, 4, 1, 5, 9]))  # [1, 1, 3, 4, 5, 9]
```

---

## 6.11 SOLID Principles

These five design principles make software more maintainable, flexible, and understandable.

### 6.11.1 Single Responsibility Principle (SRP)

> A class should have only one reason to change.

```python
# BAD: One class does too much
class Report:
    def __init__(self, data):
        self.data = data

    def calculate(self): ...
    def format_text(self): ...
    def format_pdf(self): ...
    def save_to_file(self): ...
    def send_email(self): ...

# GOOD: Each class has one responsibility
class ReportCalculator:
    def __init__(self, data):
        self.data = data
    def calculate(self): ...

class TextFormatter:
    def format(self, report) -> str: ...

class PDFFormatter:
    def format(self, report) -> bytes: ...

class FileSaver:
    def save(self, content, path): ...

class EmailSender:
    def send(self, content, recipients): ...
```

### 6.11.2 Open/Closed Principle (OCP)

> Open for extension, closed for modification.

```python
# BAD: Must modify class to add new shapes
class AreaCalculator:
    def calculate(self, shape):
        if shape.type == "circle":
            return 3.14 * shape.radius ** 2
        elif shape.type == "rectangle":
            return shape.width * shape.height
        # Must add elif for every new shape!

# GOOD: Each shape is responsible for its own area
class Shape:
    def area(self) -> float:
        raise NotImplementedError

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    def area(self):
        return 3.14 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def area(self):
        return self.width * self.height

# Adding Triangle doesn't require modifying any existing code
class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height
    def area(self):
        return 0.5 * self.base * self.height
```

### 6.11.3 Liskov Substitution Principle (LSP)

> Subtypes must be substitutable for their base types without altering program correctness.

```python
# BAD: Square violates LSP
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    def set_width(self, w):
        self.width = w
    def set_height(self, h):
        self.height = h
    def area(self):
        return self.width * self.height

class Square(Rectangle):  # VIOLATES LSP
    def set_width(self, w):
        self.width = self.height = w  # changes height too!
    def set_height(self, h):
        self.width = self.height = h  # changes width too!

def get_area(rect: Rectangle) -> float:
    rect.set_width(5)
    rect.set_height(4)
    return rect.area()  # expects 20

print(get_area(Rectangle(0, 0)))  # 20 ✓
print(get_area(Square(0, 0)))     # 16 ✗ (width was set to 4 by set_height)

# GOOD: Use composition or separate classes
class Square2:
    def __init__(self, side: float):
        self.side = side
    def area(self) -> float:
        return self.side ** 2
```

### 6.11.4 Interface Segregation Principle (ISP)

> Don't force clients to depend on interfaces they don't use.

```python
# BAD: One fat interface
class Worker:
    def work(self): ...
    def eat(self): ...
    def sleep(self): ...

# A robot can work but not eat or sleep
# class Robot(Worker):  # Must implement eat() and sleep() even though they're meaningless

# GOOD: Small, focused interfaces
class Workable:
    def work(self): ...

class Eatable:
    def eat(self): ...

class Sleepable:
    def sleep(self): ...

class Human(Workable, Eatable, Sleepable):
    def work(self): return "Working"
    def eat(self): return "Eating"
    def sleep(self): return "Sleeping"

class Robot(Workable):
    def work(self): return "Working"
```

### 6.11.5 Dependency Inversion Principle (DIP)

> Depend on abstractions, not concretions.

```python
# BAD: High-level module depends on low-level module
class MySQLDatabase:
    def save(self, data): ...

class UserService:
    def __init__(self):
        self.db = MySQLDatabase()  # tightly coupled!

# GOOD: Depend on abstraction
class Database(Protocol):
    def save(self, data) -> None: ...

class MySQLDatabase:
    def save(self, data): ...

class PostgreSQLDatabase:
    def save(self, data): ...

class UserService:
    def __init__(self, db: Database):  # depends on abstraction
        self.db = db

# Inject any database implementation
service = UserService(MySQLDatabase())
service = UserService(PostgreSQLDatabase())
```

---

## 6.12 Key Takeaways

1. **Classes** bundle data (attributes) and behavior (methods). `__init__` is the constructor; `self` refers to the instance.

2. **Class variables** are shared across all instances; **instance variables** are unique to each object. Use `self.x` for instance state, `ClassName.x` for shared state.

3. **Three method types:**
   - **Instance methods**: access instance state via `self`
   - **Class methods**: access class state via `cls`; use as factories with `@classmethod`
   - **Static methods**: utility functions with no access to `self` or `cls`

4. **Properties** (`@property`) provide getter/setter logic while maintaining a clean attribute-like API.

5. **Inheritance** creates IS-A relationships. Use `super()` to call parent methods. Multiple inheritance follows MRO (C3 linearization).

6. **Polymorphism** is achieved through duck typing — any object with the right methods works, regardless of type.

7. **Dunder methods** let you customize how objects behave with Python's built-in operations (`+`, `str()`, `len()`, context managers, etc.).

8. **ABCs** define interfaces that subclasses must implement; `@abstractmethod` enforces the contract.

9. **Dataclasses** reduce boilerplate for data-holding classes with `@dataclass`. Use `frozen=True` for immutability and `slots=True` for memory efficiency.

10. **`__slots__`** restricts attributes and reduces memory usage for instances.

11. **Composition > Inheritance** for most cases — assemble behaviors from small, focused components rather than deep inheritance hierarchies.

12. **SOLID principles** guide maintainable design: SRP, OCP, LSP, ISP, DIP.

---

## 6.13 Practice Exercises

**Exercise 1: Build a Bank Account System**

Create a `BankAccount` class with deposit, withdrawal, transfer, and transaction history. Include proper validation and a `with` statement for transaction locking.

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import threading

@dataclass
class Transaction:
    type: str
    amount: float
    timestamp: datetime = field(default_factory=datetime.now)
    balance_after: float = 0.0

    def __str__(self):
        return f"{self.timestamp:%Y-%m-%d %H:%M} {self.type}: ${self.amount:.2f} (balance: ${self.balance_after:.2f})"


class BankAccount:
    def __init__(self, owner: str, initial_balance: float = 0.0):
        self.owner = owner
        self._balance = initial_balance
        self._transactions: list[Transaction] = []
        self._lock = threading.Lock()

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        with self._lock:
            self._balance += amount
            self._transactions.append(Transaction("DEPOSIT", amount, balance_after=self._balance))

    def withdraw(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self._balance:
            raise ValueError("Insufficient funds")
        with self._lock:
            self._balance -= amount
            self._transactions.append(Transaction("WITHDRAW", amount, balance_after=self._balance))

    def transfer(self, other: "BankAccount", amount: float) -> None:
        self.withdraw(amount)
        other.deposit(amount)

    def get_statement(self) -> str:
        lines = [f"Statement for {self.owner}", "=" * 40]
        for t in self._transactions:
            lines.append(str(t))
        lines.append(f"Current balance: ${self._balance:.2f}")
        return "\n".join(lines)


# Test
account = BankAccount("Alice", 1000)
account.deposit(500)
account.withdraw(200)
other = BankAccount("Bob")
account.transfer(other, 300)
assert account.balance == 1000
assert other.balance == 300
print("All tests passed!")
```

**Exercise 2: Implement an Ordered Set**

Create a class that maintains insertion order while providing O(1) membership testing.

```python
from collections.abc import Iterator

class OrderedSet:
    def __init__(self, items=None):
        self._dict: dict = dict.fromkeys(items or [])

    def add(self, item) -> None:
        self._dict[item] = None

    def discard(self, item) -> None:
        self._dict.pop(item, None)

    def __contains__(self, item) -> bool:
        return item in self._dict

    def __len__(self) -> int:
        return len(self._dict)

    def __iter__(self) -> Iterator:
        return iter(self._dict)

    def __repr__(self) -> str:
        return f"OrderedSet({list(self._dict.keys())})"

    def __or__(self, other: "OrderedSet") -> "OrderedSet":
        result = OrderedSet(self)
        for item in other:
            result.add(item)
        return result

    def __and__(self, other: "OrderedSet") -> "OrderedSet":
        return OrderedSet(item for item in self if item in other)

    def __sub__(self, other: "OrderedSet") -> "OrderedSet":
        return OrderedSet(item for item in self if item not in other)


os = OrderedSet([3, 1, 4, 1, 5])
print(os)          # OrderedSet([3, 1, 4, 5])
assert len(os) == 4
assert 3 in os
assert 2 not in os
print("All tests passed!")
```

**Exercise 3: Build a Plugin System**

Create a plugin system using abstract base classes where plugins register themselves automatically.

```python
from abc import ABC, abstractmethod
from typing import ClassVar

class Plugin(ABC):
    _registry: ClassVar[dict[str, type]] = {}

    def __init_subclass__(cls, plugin_name: str = "", **kwargs):
        super().__init_subclass__(**kwargs)
        if plugin_name:
            Plugin._registry[plugin_name] = cls

    @classmethod
    def get_plugin(cls, name: str) -> "Plugin":
        if name not in cls._registry:
            raise KeyError(f"Plugin {name!r} not found")
        return cls._registry[name]()

    @abstractmethod
    def execute(self, data: str) -> str: ...


class UpperPlugin(Plugin, plugin_name="upper"):
    def execute(self, data: str) -> str:
        return data.upper()

class ReversePlugin(Plugin, plugin_name="reverse"):
    def execute(self, data: str) -> str:
        return data[::-1]


upper = Plugin.get_plugin("upper")
print(upper.execute("hello"))  # HELLO
assert Plugin._registry.keys() == {"upper", "reverse"}
print("All tests passed!")
```

**Exercise 4: Context Manager with Retry Logic**

Implement a context manager that retries a block of code if it raises a specific exception.

```python
import time

class RetryContext:
    def __init__(self, max_retries: int = 3, delay: float = 0.1, exceptions: tuple = (Exception,)):
        self.max_retries = max_retries
        self.delay = delay
        self.exceptions = exceptions
        self.attempt = 0
        self.last_exception = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            return False
        if not issubclass(exc_type, self.exceptions):
            return False
        self.last_exception = exc_val
        self.attempt += 1
        if self.attempt <= self.max_retries:
            time.sleep(self.delay)
            return True  # suppress exception and retry
        return False  # let it propagate after max retries


counter = 0

with RetryContext(max_retries=3) as retry:
    while True:
        counter += 1
        if counter < 3:
            raise ValueError("not yet")
        break

assert counter == 3
assert retry.last_exception is not None
print("All tests passed!")
```

**Exercise 5: Build a Decorator Factory**

Implement a decorator factory that adds timing, logging, and caching to any function.

```python
import functools
import time

def enhanced(retry: bool = False, cache: bool = False, log: bool = True):
    def decorator(func):
        if cache:
            func = functools.lru_cache(maxsize=None)(func)

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if log:
                print(f"Calling {func.__name__}({args}, {kwargs})")
            start = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                elapsed = time.perf_counter() - start
                if log:
                    print(f"  → {result} ({elapsed:.4f}s)")
                return result
            except Exception as e:
                if log:
                    print(f"  → Exception: {e}")
                raise

        if retry:
            @functools.wraps(func)
            def retry_wrapper(*args, **kwargs):
                last_exc = None
                for attempt in range(3):
                    try:
                        return wrapper(*args, **kwargs)
                    except Exception as e:
                        last_exc = e
                        time.sleep(0.01)
                raise last_exc
            return retry_wrapper

        return wrapper
    return decorator

@enhanced(cache=True, log=True)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))  # 55
print(fibonacci(10))  # 55 (cached, faster)
print("All tests passed!")
```
