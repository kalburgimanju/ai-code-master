# Chapter 1: Introduction to Python

## Welcome to Python Mastery

Welcome to your journey from zero to Python hero. This book is designed to take you from absolute beginner to confident Python developer, with comprehensive coverage of every major topic, hands-on exercises, and real-world projects. Whether you've never written a line of code or you're picking up Python from another language, this chapter lays the foundation.

---

## 1.1 What Is Python?

Python is a **high-level, interpreted, general-purpose programming language** created by **Guido van Rossum** and first released in **1991**. It emphasizes code readability with its use of significant indentation and clean syntax.

### Core Philosophy

Python's design philosophy is captured in **The Zen of Python** (PEP 20). You can view it by typing:

```python
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```

### Why Python?

| Feature              | Benefit                                              |
|----------------------|------------------------------------------------------|
| Easy to learn        | Clean, readable syntax resembling English            |
| Versatile            | Web dev, data science, AI, automation, scripting     |
| Large ecosystem      | 400,000+ packages on PyPI                            |
| Cross-platform       | Runs on Windows, macOS, Linux, and more              |
| Community support    | One of the largest developer communities worldwide   |
| Free and open source | No licensing costs; community-driven development     |
| High-level           | Memory management handled automatically              |
| Interpreted          | No compilation step; rapid development cycle         |

---

## 1.2 A Brief History of Python

```
Timeline of Python Releases
================================================================
1989  │  Guido van Rossum begins working on Python during Christmas
1991  │  Python 0.9.0 released (classes, exception handling, functions)
1994  │  Python 1.0 released — lambda, map, filter, reduce added
2000  │  Python 2.0 — list comprehensions, garbage collection
2001  │  Python 2.1 — nested scopes (static nesting)
2003  │  Python 2.3 — universal newline, import improvements
2008  │  Python 3.0 — major redesign, backward-incompatible
2010  │  Python 2.7 — last major Python 2 release
2015  │  Python 3.5 — async/await syntax, type hints
2016  │  Python 3.6 — f-strings, variable annotations
2018  │  Python 3.7 — dataclasses, `async` and `await` as keywords
2019  │  Python 3.8 — walrus operator `:=`, positional-only params
2020  │  Python 3.9 — dictionary merge operators, type hinting generics
2021  │  Python 3.10 — structural pattern matching (match/case)
2022  │  Python 3.11 — 10-60% faster, Exception Groups, `tomllib`
2023  │  Python 3.12 — per-interpreter GIL, improved f-strings
2024  │  Python 3.13 — experimental free-threaded mode, improved REPL
2025  │  Python 3.14 — template strings, improved error messages
================================================================
```

### Key Historical Facts

- **Python 2 vs Python 3**: Python 3.0 (2008) introduced backward-incompatible changes. Python 2 reached end-of-life on January 1, 2020. All modern Python development uses Python 3.
- **Guido van Rossum** was the "Benevolent Dictator For Life" (BDFL) until 2018, when he stepped down. Python is now governed by a steering council.
- **Naming**: Python is named after *Monty Python's Flying Circus*, not the snake.

---

## 1.3 Installing Python

### Checking if Python Is Already Installed

Many systems come with Python pre-installed. Open a terminal and type:

```bash
# Check Python version
python3 --version
# Output: Python 3.14.0

# Or on some systems:
python --version
```

> **Important**: On Windows, `python` may point to the Microsoft Store stub. Always verify with `python --version` or install from python.org.

### Installing on Different Operating Systems

#### Windows

1. Visit [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Download the latest Python 3.14 installer
3. **Critical**: Check "Add Python to PATH" during installation
4. Click "Install Now" for default installation
5. Verify installation:

```powershell
# Open PowerShell
python --version
pip --version
```

#### macOS

```bash
# Option 1: Using Homebrew (recommended)
brew install python@3.14

# Option 2: Using the official installer from python.org

# Verify installation
python3 --version
pip3 --version
```

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python 3 and pip
sudo apt install python3 python3-pip python3-venv

# Verify installation
python3 --version
pip3 --version
```

### Understanding `python` vs `python3`

On many Unix-like systems, `python` may refer to Python 2 (legacy). Always use `python3` explicitly:

```bash
python3 --version    # ✅ Correct — Python 3.x
python --version     # ⚠️ May point to Python 2 on older systems
```

On Windows (after proper installation):
```powershell
python --version     # ✅ Should be Python 3.x
```

---

## 1.4 The Python REPL

The **REPL** (Read-Eval-Print Loop) is Python's interactive shell. It's the fastest way to experiment with Python.

### Starting the REPL

```bash
# In your terminal:
python3
```

You'll see something like:
```
Python 3.14.0 (main, Jul  2 2025, 00:00:00) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

### REPL Basics

```python
>>> # Basic arithmetic
>>> 2 + 3
5

>>> # String operations
>>> "Hello" + " " + "World"
'Hello World'

>>> # Variables
>>> name = "Manjunath"
>>> f"Hello, {name}!"
'Hello, Manjunath!'

>>> # Lists
>>> numbers = [1, 2, 3, 4, 5]
>>> numbers.append(6)
>>> numbers
[1, 2, 3, 4, 5, 6]

>>> # Functions
>>> def greet(person):
...     return f"Hello, {person}!"
...
>>> greet("World")
'Hello, World!'

>>> # Exit the REPL
>>> exit()
```

### The Enhanced REPL (Python 3.13+)

Python 3.13 introduced a modernized REPL based on **PyREPL** with features like:

```python
# Improved editing with multi-line support
>>> def fibonacci(n):
...     """Generate the first n Fibonacci numbers."""
...     a, b = 0, 1
...     result = []
...     for _ in range(n):
...         result.append(a)
...         a, b = b, a + b
...     return result
...
>>> fibonacci(10)
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Colorized output
# Syntax highlighting
# Bracket matching
# Multi-line editing
```

### Tips for Using the REPL Effectively

```python
# Use the up arrow to recall previous commands
# Use Tab for completion

>>> import os
>>> os.pa  # Press Tab
>>> os.path  # Shows os.path module

# Use _ to access the last result
>>> 2 ** 10
1024
>>> _ * 2
2048

# Use help() for documentation
>>> help(list)
Help on class list in module builtins:
class list(object):
    |  list() -> new empty list
    |  list(iterable) -> new list initialized from iterable's items
    ...

# Use dir() to list attributes
>>> dir(str)
['__add__', '__class__', '__contains__', ...]
```

---

## 1.5 Writing Your First Programs

### Program 1: Hello, World!

The traditional first program:

```python
# hello.py
"""My first Python program."""

print("Hello, World!")
```

Run it:
```bash
python3 hello.py
# Output: Hello, World!
```

### Program 2: Temperature Converter

```python
# temperature.py
"""Convert Fahrenheit to Celsius."""

# Get temperature from user
fahrenheit = float(input("Enter temperature in Fahrenheit: "))

# Convert to Celsius
celsius = (fahrenheit - 32) * 5 / 9

# Display result
print(f"{fahrenheit}°F = {celsius:.1f}°C")
```

```
Enter temperature in Fahrenheit: 72
72.0°F = 22.2°C
```

### Program 3: Simple Calculator

```python
# calculator.py
"""A simple calculator demonstrating basic operations."""

print("=== Simple Calculator ===")
print("Operations: +, -, *, /, //, %, **")
print()

# Get inputs
num1 = float(input("Enter first number: "))
operator = input("Enter operator: ")
num2 = float(input("Enter second number: "))

# Perform calculation
if operator == "+":
    result = num1 + num2
elif operator == "-":
    result = num1 - num2
elif operator == "*":
    result = num1 * num2
elif operator == "/":
    if num2 == 0:
        print("Error: Division by zero!")
        exit()
    result = num1 / num2
elif operator == "//":
    result = num1 // num2
elif operator == "%":
    result = num1 % num2
elif operator == "**":
    result = num1 ** num2
else:
    print(f"Unknown operator: {operator}")
    exit()

print(f"Result: {num1} {operator} {num2} = {result}")
```

### Program 4: Number Guessing Game

```python
# guessing_game.py
"""An interactive number guessing game."""

import random

def play_game():
    """Play a single round of the guessing game."""
    secret_number = random.randint(1, 100)
    attempts = 0
    max_attempts = 7

    print("\n🎮 I'm thinking of a number between 1 and 100.")
    print(f"You have {max_attempts} attempts. Good luck!\n")

    while attempts < max_attempts:
        try:
            guess = int(input(f"Attempt {attempts + 1}/{max_attempts} — Your guess: "))
        except ValueError:
            print("Please enter a valid number.\n")
            continue

        attempts += 1

        if guess == secret_number:
            print(f"🎉 Congratulations! You guessed it in {attempts} attempt(s)!")
            return True
        elif guess < secret_number:
            print("📈 Too low! Try again.\n")
        else:
            print("📉 Too high! Try again.\n")

    print(f"😢 Game over! The number was {secret_number}.")
    return False

def main():
    """Main game loop."""
    print("=" * 40)
    print("   NUMBER GUESSING GAME")
    print("=" * 40)

    wins = 0
    games = 0

    while True:
        play_game()
        games += 1
        wins += wins  # placeholder — fixed below

        response = input("\nPlay again? (y/n): ").lower().strip()
        if response != 'y':
            break

    print(f"\nThanks for playing! You won {wins}/{games} games.")

if __name__ == "__main__":
    main()
```

### Program 5: File Word Counter

```python
# word_counter.py
"""Count words, lines, and characters in a text file."""

def count_file_stats(filepath):
    """Count lines, words, and characters in a file."""
    lines = 0
    words = 0
    characters = 0

    with open(filepath, 'r', encoding='utf-8') as file:
        for line in file:
            lines += 1
            words += len(line.split())
            characters += len(line)

    return lines, words, characters

def main():
    filepath = input("Enter file path: ").strip()

    try:
        lines, words, chars = count_file_stats(filepath)
        print(f"\n📊 File Statistics for '{filepath}':")
        print(f"   Lines:      {lines:,}")
        print(f"   Words:      {words:,}")
        print(f"   Characters: {chars:,}")
    except FileNotFoundError:
        print(f"❌ Error: File '{filepath}' not found.")
    except PermissionError:
        print(f"❌ Error: Permission denied to read '{filepath}'.")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
```

---

## 1.6 Setting Up Your Development Environment

### Text Editors vs IDEs

| Tool           | Type    | Best For                          | Cost  |
|----------------|---------|-----------------------------------|-------|
| VS Code        | Editor  | General development               | Free  |
| PyCharm        | IDE     | Professional Python development   | Free/$$$ |
| IDLE           | IDE     | Learning/prototyping              | Free  |
| Sublime Text   | Editor  | Fast editing                      | Free/$ |
| Vim/Neovim     | Editor  | Terminal-based development        | Free  |
| Cursor         | Editor  | AI-assisted development           | Free/$$$ |

### Setting Up VS Code (Recommended)

**Step 1**: Download and install VS Code from [https://code.visualstudio.com/](https://code.visualstudio.com/)

**Step 2**: Install the Python extension:
1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on macOS)
3. Search for "Python"
4. Install the extension by Microsoft

**Step 3**: Install recommended extensions:

```
Essential Python Extensions:
─────────────────────────────────────────────
Extension                    │ Purpose
─────────────────────────────────────────────
Python (Microsoft)           │ Language support, debugging
Pylance (Microsoft)          │ Type checking, IntelliSense
Python Debugger (Microsoft)  │ Debugging support
Ruff                         │ Linting and formatting
autoDocstring                │ Docstring generation
─────────────────────────────────────────────
```

**Step 4**: Configure VS Code for Python:

Create `.vscode/settings.json` in your project:

```json
{
    "python.defaultInterpreterPath": "python3",
    "python.analysis.typeCheckingMode": "basic",
    "editor.formatOnSave": true,
    "[python]": {
        "editor.defaultFormatter": "charliermarsh.ruff",
        "editor.codeActionsOnSave": {
            "source.fixAll.ruff": "explicit",
            "source.organizeImports.ruff": "explicit"
        }
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        ".pytest_cache": true
    }
}
```

### Alternative: PyCharm Setup

1. Download from [https://www.jetbrains.com/pycharm/](https://www.jetbrains.com/pycharm/)
2. Choose "Community Edition" (free)
3. Create a new project with Python 3.14
4. PyCharm automatically detects Python and configures the environment

---

## 1.7 Python Execution Model

Understanding how Python runs your code is crucial.

### Interpreted, Not Compiled (Well, Kind Of)

```
Source Code (.py files)
        │
        ▼
   ┌─────────┐
   │ Compiler │  ← Transforms source to bytecode
   └────┬────┘
        │
        ▼
  Bytecode (.pyc files)
        │
        ▼
   ┌─────────┐
   │   VM    │  ← Python Virtual Machine executes bytecode
   └─────────┘
```

```python
# Python compiles source code to bytecode automatically
# You can see the bytecode using the `dis` module:

import dis

def add(a, b):
    return a + b

dis.dis(add)
# Output:
#   3           0 RESUME                 0
#
#   4           2 LOAD_FAST                0 (a)
#               4 LOAD_FAST                1 (b)
#               6 BINARY_OP                0 (add)
#              10 RETURN_VALUE
```

### The `__pycache__` Directory

When Python imports a module, it compiles it to bytecode and stores it in `__pycache__/`:

```
my_project/
├── __pycache__/
│   └── my_module.cpython-314.pyc
├── main.py
└── my_module.py
```

### The `if __name__ == "__main__"` Pattern

```python
# my_script.py
"""This module can be run directly or imported."""

def main():
    print("Running as main program!")

def helper():
    """A helper function."""
    return 42

# This code only runs when the file is executed directly
# NOT when it's imported as a module
if __name__ == "__main__":
    main()

# If you import this module:
# import my_script
# → main() does NOT run
# → You can call my_script.helper()
```

---

## 1.8 Python's Data Model — A Sneak Peek

Everything in Python is an **object**. This is fundamental to understanding Python.

```python
# Everything is an object
>>> type(42)
<class 'int'>

>>> type("hello")
<class 'str'>

>>> type([1, 2, 3])
<class 'list'>

>>> type(print)
<class 'builtin_function_or_method'>

>>> type(type)
<class 'type'>
```

```python
# Even functions and classes are objects
def my_function():
    pass

class MyClass:
    pass

# They have attributes
print(my_function.__name__)  # "my_function"
print(MyClass.__name__)      # "MyClass"

# They can be assigned to variables
alias = my_function
alias()  # Works fine

# They can be stored in data structures
operations = [print, len, type, sum]
```

---

## 1.9 Python vs Other Languages

```
┌─────────────────────────────────────────────────────────┐
│              Language Comparison Matrix                  │
├──────────┬──────┬────────┬──────┬────────┬─────────────┤
│ Feature  │Python│  Java  │  C++ │   JS   │    Go       │
├──────────┼──────┼────────┼──────┼────────┼─────────────┤
│ Typing   │Dynam.│ Static │Static│ Dynam. │   Static    │
│ Speed    │ Med  │  Fast  │ V.Fast│ Med   │    Fast     │
│ Learning │ Easy │ Medium │ Hard │ Medium │   Medium    │
│ Web Dev  │  ✅  │   ✅   │  ❌  │  ✅    │     ✅      │
│ Data Sci │  ✅  │   ❌   │  ⚠️  │  ❌    │     ❌      │
│ Systems  │  ❌  │   ❌   │  ✅  │  ❌    │     ✅      │
│ Scripts  │  ✅  │   ⚠️   │  ❌  │  ⚠️    │     ✅      │
│ Mobile   │  ⚠️  │   ✅   │  ✅  │  ✅    │     ❌      │
└──────────┴──────┴────────┴──────┴────────┴─────────────┘
✅ = Great fit  ⚠️ = Possible but not ideal  ❌ = Not suitable
```

### Python's Strengths in Practice

```python
# 1. Data Science (one import can change everything)
import numpy as np
import pandas as pd

data = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'SF', 'LA']
})
print(data.describe())

# 2. Web Development (minimal boilerplate)
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

# 3. Automation (powerful in few lines)
import shutil
import os

# Backup all .py files
shutil.copytree('src', 'backup', ignore=shutil.ignore_patterns('*.pyc', '__pycache__'))

# 4. Machine Learning
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=100)
# model.fit(X_train, y_train)  — That's it!
```

---

## 1.10 Running Python Programs

### Method 1: Direct Execution

```bash
python3 my_script.py
```

### Method 2: As a Module

```bash
python3 -m my_module
```

### Method 3: Import in Python

```python
import my_module
my_module.main()
```

### Method 4: Shebang Line (Unix/macOS)

```python
#!/usr/bin/env python3
"""Script with shebang line for direct execution."""

print("This can be run with: ./script.py")

# Make executable:
# chmod +x script.py
# ./script.py
```

### Command-Line Arguments

```python
# cli_example.py
import sys
import argparse

def main():
    # Method 1: sys.argv (simple)
    print(f"Script name: {sys.argv[0]}")
    print(f"Arguments: {sys.argv[1:]}")

    # Method 2: argparse (recommended for real programs)
    parser = argparse.ArgumentParser(description="Example CLI tool")
    parser.add_argument("name", help="Your name")
    parser.add_argument("--age", type=int, default=25, help="Your age")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    if args.verbose:
        print(f"Processing user: {args.name}, age {args.age}")

    print(f"Hello, {args.name}!")

if __name__ == "__main__":
    main()
```

```bash
# Run with arguments:
python3 cli_example.py Manjunath --age 30 --verbose
# Script name: cli_example.py
# Arguments: ['Manjunath', '--age', '30', '--verbose']
# Processing user: Manjunath, age 30
# Hello, Manjunath!
```

---

## 1.11 The Python Package Installer (pip)

### Basic pip Commands

```bash
# Install a package
pip install requests

# Install a specific version
pip install requests==2.31.0

# Install with version range
pip install "requests>=2.28,<3.0"

# Upgrade a package
pip install --upgrade requests

# Uninstall a package
pip uninstall requests

# List installed packages
pip list

# Show package info
pip show requests

# Freeze current environment
pip freeze > requirements.txt

# Install from requirements file
pip install -r requirements.txt
```

### Virtual Environments (Essential!)

```bash
# Create a virtual environment
python3 -m venv myenv

# Activate it
# macOS/Linux:
source myenv/bin/activate
# Windows:
myenv\Scripts\activate

# Install packages (isolated from system Python)
pip install requests flask

# Deactivate when done
deactivate
```

```
Project Structure with Virtual Environment:
═══════════════════════════════════════════
my_project/
├── myenv/              ← Virtual environment (don't commit!)
│   ├── bin/            ← Unix executables
│   ├── lib/            ← Installed packages
│   └── pyvenv.cfg      ← Configuration
├── src/
│   └── main.py
├── requirements.txt    ← Package list (commit this!)
└── README.md
```

---

## 1.12 Python Coding Conventions (PEP 8 Overview)

```python
# ✅ GOOD — Following PEP 8
def calculate_average(numbers: list[float]) -> float:
    """Calculate the arithmetic mean of a list of numbers.

    Args:
        numbers: A list of numerical values.

    Returns:
        The arithmetic mean of the numbers.
    """
    if not numbers:
        raise ValueError("Cannot calculate average of empty list")

    total = sum(numbers)
    return total / len(numbers)


# ✅ GOOD — Naming conventions
MAX_RETRIES = 3           # Constants: UPPER_SNAKE_CASE
user_name = "alice"       # Variables: snake_case
class_name = "MyClass"    # Classes: CamelCase
def my_function():        # Functions: snake_case
    local_var = 42        # Local vars: snake_case
    _private = True       # Private: leading underscore
    __mangled = True      # Name-mangled: double leading underscore

# ❌ BAD — PEP 8 violations
def CalculateAverage(Numbers):    # Wrong naming
    TOTAL=sum(Numbers)            # Missing spaces around =
    for i in Numbers:             # Non-pythonic loop
        print(i)                  # Unnecessary
    Return total/len(Numbers)     # Wrong case
```

### PEP 8 Quick Reference

| Rule                  | Example                 | Counter-Example        |
|-----------------------|-------------------------|------------------------|
| Indentation           | 4 spaces                | Tabs (or 2 spaces)     |
| Line length           | ≤79 chars (code)        | >79 chars              |
| Blank lines           | 2 between functions     | 0 between functions    |
| Imports               | One per line            | Multiple on one line   |
| Whitespace            | `x = 1`                | `x=1`                  |
| Docstrings            | Triple quotes           | No docstring           |
| Type hints            | `def f(x: int) -> str:` | `def f(x):`            |

---

## 1.13 Resources and Next Steps

### Official Resources

```
Resource                          │ URL
──────────────────────────────────┼─────────────────────────────────
Python Official Documentation     │ https://docs.python.org/3/
Python Tutorial                   │ https://docs.python.org/3/tutorial/
PEP Index                         │ https://peps.python.org/
PyPI (Package Index)              │ https://pypi.org/
Python Discord                    │ https://pythondiscord.com/
──────────────────────────────────┴─────────────────────────────────
```

### Recommended Learning Path

```
Chapter Progression in This Book:
═══════════════════════════════════════════════════════════
  You Are Here
       ▼
[Ch 1: Introduction] ← You are here
       │
       ▼
[Ch 2: Fundamentals] ──── Variables, Types, Operators
       │
       ▼
[Ch 3: Control Flow] ──── if/else, loops, comprehensions
       │
       ▼
[Ch 4: Functions] ──────── Functions, decorators, modules
       │
       ▼
[Ch 5: Data Structures] ── Lists, dicts, sets
       │
       ▼
[Ch 6: OOP] ────────────── Classes, inheritance
       │
       ▼
[Ch 7: File I/O] ──────── Files, serialization
       │
       ▼
[Ch 8: Error Handling] ─── Exceptions, testing
       │
       ▼
[Ch 9: Advanced] ──────── Generators, async, type hints
       │
       ▼
[Ch 10: Concurrency] ──── Threading, multiprocessing
       │
       ▼
[Ch 11: Web Dev] ──────── Flask, FastAPI, Django
       │
       ▼
[Ch 12: Data Science] ─── NumPy, Pandas, ML
       │
       ▼
[Ch 13: Best Practices] ─ Patterns, packaging
       │
       ▼
[Ch 14: Projects] ─────── 5 Complete Projects
═══════════════════════════════════════════════════════════
```

---

## Key Takeaways

1. **Python is versatile** — Used for web development, data science, AI, automation, and more.
2. **Python emphasizes readability** — Clean syntax that resembles English.
3. **Install Python 3.14** — Always use the latest stable version.
4. **The REPL is your friend** — Use it for quick experiments and learning.
5. **Use virtual environments** — Always isolate project dependencies.
6. **VS Code + Python extension** — The recommended setup for most developers.
7. **`pip` is your package manager** — Install, update, and manage libraries easily.
8. **Follow PEP 8** — Write clean, consistent, Pythonic code from day one.
9. **Everything is an object** — This is the key insight that unlocks Python's power.
10. **Practice, practice, practice** — The exercises below are your next step.

---

## Practice Exercises

### Exercise 1: Hello World Variations
Write a program that prints the following:
```
=============================
   Welcome to Python, {name}!
   Today is {date}.
   You are learning Python {version}.
=============================
```
Replace the placeholders with actual values. Use `datetime.date.today()` for the date.

### Exercise 2: REPL Calculator
Using the REPL, calculate the following (don't use a calculator!):
```python
# 1. What is 2 raised to the power of 20?
# 2. What is the square root of 144? (Hint: use ** 0.5)
# 3. What is 100 divided by 3 using integer division?
# 4. What is 100 modulo 3?
# 5. Convert 98.6 Fahrenheit to Celsius
```

### Exercise 3: Environment Setup
1. Install Python 3.14 if not already installed
2. Create a project directory called `python-mastery`
3. Create a virtual environment inside it
4. Install `requests` and `flask` in the virtual environment
5. Create a `requirements.txt` file
6. Verify everything works by importing both packages in Python

### Exercise 4: First Program
Create a program called `about_me.py` that:
- Uses `input()` to ask for the user's name, age, and favorite color
- Prints a formatted paragraph about the user
- Includes at least one mathematical operation (e.g., birth year calculation)

### Exercise 5: CLI Tool
Create a program called `info.py` that:
- Takes a URL as a command-line argument using `argparse`
- Downloads the page using `requests`
- Prints the title tag content and the page size in bytes

```python
# Starter code:
import argparse
import requests

parser = argparse.ArgumentParser(description="Get info about a webpage")
parser.add_argument("url", help="The URL to fetch")
args = parser.parse_args()

# Your code here...
```

### Exercise 6: PEP 8 Audit
Review the following code and fix all PEP 8 violations:

```python
# ❌ BAD — Fix this code
def MyFunction(x,y):
    Result=x+y
    if Result>10:
        print("big")
    Else:
        print("small")
    Return Result

MyList=[1,2,3,4,5]
for I in MyList:
    MyFunction(I,10)
```

### Challenge Exercise: Temperature Dashboard
Create a program that:
1. Takes a CSV file of daily temperatures (date, high, low) as input
2. Calculates statistics: average high, average low, hottest day, coldest day
3. Displays results in a formatted table
4. Asks the user if they want to save the report to a file

---

*In the next chapter, we'll dive deep into Python's fundamentals — variables, data types, operators, and the building blocks of every Python program.*
