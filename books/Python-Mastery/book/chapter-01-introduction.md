# Chapter 1: Introduction to Python

## 1.1 A Brief History of Python

Python was created by **Guido van Rossum** at CWI (Centrum Wiskunde & Informatica) in the Netherlands. The first version, **Python 0.9.0**, was released on **February 20, 1991**. It included classes with inheritance, exception handling, functions, and core data types like `list`, `dict`, and `str`.

### Timeline

```
1989  - Guido starts working on Python (as a Christmas project!)
1991  - Python 0.9.0 released
1994  - Python 1.0 released
2000  - Python 2.0 (list comprehensions, garbage collection)
2008  - Python 3.0 (breaking changes, cleaner language)
2010  - Python 2.7 (last Python 2 release)
2015  - Python 3.5 (async/await, type hints)
2018  - Python 3.7 (dataclasses, f-string improvements)
2020  - Python 2 end-of-life
2021  - Python 3.10 (match/case)
2022  - Python 3.11 (10-60% faster, exception groups)
2023  - Python 3.12 (f-string improvements, better error messages)
2024  - Python 3.13 (free-threaded mode, experimental JIT)
2025  - Python 3.14 (stable, template strings, improved JIT)
```

### The Zen of Python

Type `import this` in your Python REPL to see the guiding principles:

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

## 1.2 Python 2 vs Python 3

| Feature | Python 2 | Python 3 |
|---------|----------|----------|
| Print | `print "hello"` (statement) | `print("hello")` (function) |
| Integer division | `5 / 2 = 2` | `5 / 2 = 2.5`, `5 // 2 = 2` |
| Unicode | ASCII by default | Unicode by default |
| Range | `range()` returns list | `range()` returns iterator |
| Input | `raw_input()` | `input()` |
| Error syntax | `except ValueError, e:` | `except ValueError as e:` |
| Support | EOL since Jan 2020 | Actively maintained |

**Python 2 is dead.** Always use Python 3.

## 1.3 Installing Python

### macOS

```bash
# Using Homebrew (recommended)
brew install python@3.14

# Verify installation
python3 --version
# Python 3.14.0
```

### Windows

1. Visit [python.org/downloads](https://www.python.org/downloads/)
2. Download the latest Python 3.14 installer
3. **Check "Add Python to PATH"** during installation
4. Open Command Prompt and verify:

```cmd
python --version
Python 3.14.0
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3 python3-pip python3-venv

# Verify
python3 --version
```

## 1.4 The Python REPL

The **REPL** (Read-Eval-Print Loop) is Python's interactive shell:

```bash
$ python3
Python 3.14.0 (main, Jun 2025)
Type "help", "copyright", "credits" or "license" for more information.
>>> 
```

### REPL Basics

```python
>>> # Basic arithmetic
>>> 2 + 2
4

>>> # String operations
>>> "Hello, " + "World!"
'Hello, World!'

>>> # Variables
>>> name = "Python"
>>> f"Version: {name}"
'Version: Python'

>>> # Import and use modules
>>> import math
>>> math.pi
3.141592653589793

>>> # Multi-line with backslash
>>> total = (1 +
...          2 +
...          3)
>>> total
6

>>> # Underscores in numbers (Python 3.6+)
>>> population = 8_000_000_000
>>> population
8000000000

>>> # Exit the REPL
>>> exit()
# or press Ctrl+D (Unix) / Ctrl+Z (Windows)
```

> **Tip:** Use the REPL for quick experiments, but write real code in `.py` files.

## 1.5 Your First Programs

### Hello, World!

```python
# hello.py
print("Hello, World!")
```

```bash
$ python3 hello.py
Hello, World!
```

### A Simple Calculator

```python
# calculator.py
import math

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "Error: Division by zero"
    return a / b

# Simple calculator
num1 = float(input("Enter first number: "))
num2 = float(input("Enter second number: "))

print(f"\nResults:")
print(f"  {num1} + {num2} = {add(num1, num2)}")
print(f"  {num1} - {num2} = {subtract(num1, num2)}")
print(f"  {num1} * {num2} = {multiply(num1, num2)}")
print(f"  {num1} / {num2} = {divide(num1, num2)}")
print(f"  {num1} ^ {num2} = {math.pow(num1, num2)}")
```

### Comments in Python

```python
# This is a single-line comment

"""
This is a multi-line
docstring / block comment.
Used for module, class, and function documentation.
"""

x = 42  # Inline comment
```

## 1.6 How Python Works

Python is an **interpreted, compiled** language. Here is the execution pipeline:

```
Source Code (.py)
       │
       ▼
   ┌────────────┐
   │  Compiler   │  (compiles to bytecode)
   └────────────┘
       │
       ▼
Bytecode (.pyc)
       │
       ▼
   ┌────────────┐
   │    PVM     │  (Python Virtual Machine)
   └────────────┘
       │
       ▼
   Execution
```

### Key Points

- Python compiles source code to **bytecode** (`.pyc` files in `__pycache__/`)
- The **Python Virtual Machine (PVM)** executes the bytecode
- You never interact with bytecode directly
- `import` triggers compilation; `exec()` compiles and runs at once

```python
# Bytecode example
import dis

def greet(name):
    return f"Hello, {name}!"

# Disassemble the function
dis.dis(greet)
# Output:
#   2           0 LOAD_CONST               1 ('Hello, ')
#               2 LOAD_FAST                0 (name)
#               4 FORMAT_VALUE             0
#               6 LOAD_CONST               2 ('!')
#               8 BUILD_STRING             3
#              10 RETURN_VALUE
```

## 1.7 IDE Setup

### Visual Studio Code (Recommended)

1. Install VS Code from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install the **Python extension** by Microsoft
3. Install the **Pylance** extension for type checking
4. Configure settings:

```json
{
  "python.defaultInterpreterPath": "python3",
  "python.analysis.typeCheckingMode": "basic",
  "editor.formatOnSave": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.tabSize": 4
  }
}
```

### PyCharm

- **Community Edition** (free) — great for pure Python
- **Professional Edition** (paid) — supports web frameworks, databases
- Excellent debugging, testing, and refactoring tools

### Useful VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| Python (Microsoft) | Language support, debugging |
| Pylance | Type checking, IntelliSense |
| Black Formatter | Code formatting |
| Python Indent | Correct indentation |
| autoDocstring | Generate docstrings |
| Ruff | Fast linter + formatter |

## 1.8 Python Virtual Environments

Virtual environments isolate project dependencies:

```bash
# Create a virtual environment
$ python3 -m venv .venv

# Activate it
$ source .venv/bin/activate     # macOS/Linux
$ .venv\Scripts\activate        # Windows

# Install packages
(.venv)$ pip install requests flask

# Save dependencies
(.venv)$ pip freeze > requirements.txt

# Install from requirements
(.venv)$ pip install -r requirements.txt

# Deactivate
(.venv)$ deactivate
```

### Using `uv` (Modern Alternative)

`uv` is a fast, modern Python package manager:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create a virtual environment
uv venv

# Install packages (10-100x faster than pip)
uv pip install requests flask

# Run a script with uv
uv run python script.py
```

## 1.9 Running Python Scripts

```bash
# Direct execution
python3 script.py

# Using uv
uv run script.py

# Shebang line (Unix) — add as first line of script
#!/usr/bin/env python3

# Execute a module
python3 -m http.server 8000

# Run a module as a script
python3 -m pytest
```

## 1.10 Python's Data Model

Understanding how Python sees the world helps you write better code:

```python
# Everything is an object in Python
>>> type(42)
<class 'int'>

>>> type("hello")
<class 'str'>

>>> type([1, 2, 3])
<class 'list'>

>>> type(lambda x: x)
<class 'function'>

>>> type(type)
<class 'type'>

# Even modules and functions are objects
>>> import math
>>> type(math)
<class 'module'>

>>> isinstance(42, object)
True

>>> isinstance("hello", object)
True
```

---

## Key Takeaways

- Python was created by Guido van Rossum in 1991; always use Python 3
- The Zen of Python emphasizes readability, simplicity, and explicitness
- Python compiles to bytecode, which the PVM executes
- Use `venv` or `uv` for isolated project environments
- VS Code with Python/Pylance extensions is the recommended IDE
- Everything in Python is an object
- The REPL is great for experimentation; use `.py` files for real code

---

## Practice Exercises

1. **Setup Check:** Install Python 3.14 and verify with `python3 --version`. Create a virtual environment and install `requests` into it.

2. **Hello Variations:** Write a program that takes your name as input and prints:
   ```
   Hello, Alice!
   Your name has 5 characters.
   Uppercase: ALICE
   ```

3. **Calculator Plus:** Extend the calculator program to include:
   - Modulo (`%`)
   - Floor division (`//`)
   - Power (`**`)
   - Minimum and maximum

4. **Bytecode Explorer:** Write a simple function and use `dis.dis()` to examine its bytecode. What instructions do you see?

5. **Environment Setup:** Set up a complete Python development environment with VS Code, the Python extension, and a virtual environment. Install `black` and `ruff` for formatting and linting.
