# Chapter 7: File I/O & Serialization

> *"A program that can't read or write data is like a chef who can't access the pantry — technically skilled, but unable to produce anything of lasting value."*

Everything a program learns in a single run vanishes the moment it exits. Files, databases, and APIs are how software persists state, shares data across programs, and communicates with the outside world. This chapter covers every major form of data persistence and exchange in the Python ecosystem — from low-level file handles to high-level serialization formats.

```
┌──────────────────────────────────────────────────────────────────┐
│                   PYTHON I/O / DATA FLOW                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Python Object  ←→  Serialization  ←→  String/Bytes  ←→  File   │
│                                                                  │
│  ┌─────────┐     ┌──────────────┐     ┌──────────┐     ┌─────┐ │
│  │ dict,   │     │ json.dumps() │     │          │     │     │ │
│  │ list,   │ ←→  │ pickle.dumps │ ←→  │ str/bytes│ ←→  │File │ │
│  │ class   │     │ csv.writer   │     │          │     │     │ │
│  └─────────┘     └──────────────┘     └──────────┘     └─────┘ │
│                                                                  │
│  Formats: JSON, CSV, Pickle, YAML, TOML, XML                    │
│  Paths: os.path, pathlib.Path                                    │
│  Encoding: utf-8, latin-1, ascii, utf-16                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7.1 Opening and Reading Files

### 7.1.1 The `open()` Function

```python
# Basic syntax
f = open("filename.txt", mode="r", encoding="utf-8")
content = f.read()
f.close()  # ALWAYS close when done!
```

### 7.1.2 File Modes

| Mode | Description | Creates? | Truncates? | Position |
|---|---|---|---|---|
| `'r'` | Read (text) | No | No | Beginning |
| `'w'` | Write (text) | Yes | **Yes** | Beginning |
| `'a'` | Append (text) | Yes | No | End |
| `'x'` | Exclusive create | Yes | N/A | Beginning |
| `'r+'` | Read + Write | No | No | Beginning |
| `'w+'` | Write + Read | Yes | **Yes** | Beginning |
| `'a+'` | Append + Read | Yes | No | End |
| `'rb'` | Read (binary) | No | No | Beginning |
| `'wb'` | Write (binary) | Yes | **Yes** | Beginning |
| `'ab'` | Append (binary) | Yes | No | End |
| `'r+b'` | Read + Write (binary) | No | No | Beginning |
| `'w+b'` | Write + Read (binary) | Yes | **Yes** | Beginning |
| `'a+b'` | Append + Read (binary) | Yes | No | End |

```python
# Exclusive creation — raises FileExistsError if file already exists
# f = open("existing.txt", "x")  # FileExistsError!

# Binary modes — for images, audio, pickled data, etc.
f = open("image.png", "rb")
data = f.read()  # returns bytes, not str
f.close()
```

### 7.1.3 Reading Methods

```python
# Create a sample file for demonstration
with open("sample.txt", "w", encoding="utf-8") as f:
    f.write("Line 1: Hello, World!\n")
    f.write("Line 2: Python is awesome.\n")
    f.write("Line 3: File I/O is essential.\n")
    f.write("Line 4: Goodbye!\n")

# ─────── read() — entire file as a single string ───────
with open("sample.txt", "r", encoding="utf-8") as f:
    content = f.read()
    print(type(content))  # <class 'str'>
    print(content)
# Line 1: Hello, World!
# Line 2: Python is awesome.
# Line 3: File I/O is essential.
# Line 4: Goodbye!

# read(n) — read exactly n characters
with open("sample.txt", "r", encoding="utf-8") as f:
    first_10 = f.read(10)
    print(first_10)  # "Line 1: He"
    next_5 = f.read(5)
    print(next_5)    # "llo, "

# ─────── readline() — one line at a time ───────
with open("sample.txt", "r", encoding="utf-8") as f:
    line1 = f.readline()
    print(line1.strip())  # "Line 1: Hello, World!"
    line2 = f.readline()
    print(line2.strip())  # "Line 2: Python is awesome."
    # Read rest
    rest = f.readline()
    print(rest)  # "" (empty when at EOF)

# ─────── readlines() — list of all lines ───────
with open("sample.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    print(lines)
# ['Line 1: Hello, World!\n', 'Line 2: Python is awesome.\n', ...]

# ─────── Iterate line by line (memory efficient!) ───────
with open("sample.txt", "r", encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        print(f"{i}: {line.strip()}")
# 1: Line 1: Hello, World!
# 2: Line 2: Python is awesome.
# 3: Line 3: File I/O is essential.
# 4: Line 4: Goodbye!
```

### 7.1.4 Writing Methods

```python
# ─────── write() — write a single string ───────
with open("output.txt", "w", encoding="utf-8") as f:
    written = f.write("Hello, World!\n")
    print(written)  # 15 (number of characters written)
    f.write("Second line\n")

# ─────── writelines() — write a list of strings ───────
lines = ["First\n", "Second\n", "Third\n"]
with open("output.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)  # Note: does NOT add newlines automatically

# ─────── Append mode ───────
with open("output.txt", "a", encoding="utf-8") as f:
    f.write("Appended line\n")

# ─────── Print to file ───────
with open("output.txt", "a", encoding="utf-8") as f:
    print("Printed directly to file", file=f)
    print("With sep and end:", 1, 2, 3, sep=" -> ", end="!\n", file=f)
```

---

## 7.2 The `with` Statement (Context Managers)

The `with` statement ensures files are properly closed, even if exceptions occur. **Always use it.**

```python
# WITHOUT with — risky!
f = open("data.txt", "w")
f.write("Hello")
# If an exception occurs here, the file is never closed!
f.close()

# WITH with — safe!
with open("data.txt", "w") as f:
    f.write("Hello")
# File is automatically closed, even if an exception occurred

# ─────── Multiple files ───────
with open("input.txt", "r") as fin, open("output.txt", "w") as fout:
    for line in fin:
        fout.write(line.upper())

# ─────── Nested with (Python < 3.1 style) ───────
with open("input.txt", "r") as fin:
    with open("output.txt", "w") as fout:
        for line in fin:
            fout.write(line.upper())

# ─────── Custom context manager ───────
class ManagedFile:
    def __init__(self, filename, mode="r", encoding="utf-8"):
        self.filename = filename
        self.mode = mode
        self.encoding = encoding

    def __enter__(self):
        self.file = open(self.filename, self.mode, encoding=self.encoding)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False  # don't suppress exceptions


with ManagedFile("test.txt", "w") as f:
    f.write("Hello from managed file!")
```

### 7.2.1 Contextlib Utilities

```python
from contextlib import contextmanager, suppress, redirect_stdout, redirect_stderr
import io

# @contextmanager — decorator for creating context managers from generators
@contextmanager
def managed_resource(name):
    print(f"Acquiring {name}")
    resource = {"name": name, "active": True}
    try:
        yield resource  # value goes to 'as' variable
    except Exception as e:
        print(f"Error: {e}")
        resource["active"] = False
    finally:
        print(f"Releasing {name}")

with managed_resource("database") as db:
    print(f"Using {db['name']}")
# Acquiring database
# Using database
# Releasing database

# suppress — ignore specific exceptions
from contextlib import suppress

with suppress(FileNotFoundError):
    import os
    os.remove("nonexistent_file.txt")  # no error!
# FileNotFoundError is silently ignored

# redirect_stdout — capture print output
f = io.StringIO()
with redirect_stdout(f):
    print("This goes to the string buffer")
output = f.getvalue()
print(f"Captured: {output!r}")  # Captured: 'This goes to the string buffer\n'
```

---

## 7.3 `pathlib` — Modern Path Handling

`pathlib` (Python 3.4+) provides an object-oriented interface to filesystem paths. It's the recommended way to handle file paths.

```python
from pathlib import Path

# Create Path objects
p = Path(".")
home = Path.home()  # /Users/username
project = Path("/Users/alice/projects/myapp")
config = Path("config") / "settings" / "app.json"  # joins with /

print(type(p))        # <class 'pathlib.PosixPath'>
print(p)              # .
print(config)         # config/settings/app.json

# ─────── Path components ───────
file_path = Path("/home/alice/documents/report.pdf")
print(file_path.name)      # report.pdf
print(file_path.stem)      # report
print(file_path.suffix)    # .pdf
print(file_path.parent)    # /home/alice/documents
print(file_path.parts)     # ('/', 'home', 'alice', 'documents', 'report.pdf')
print(file_path.anchor)    # /
```

### 7.3.1 Reading and Writing with Pathlib

```python
from pathlib import Path

data_dir = Path("data")
data_dir.mkdir(exist_ok=True)  # mkdir -p equivalent

# ─────── Write text ───────
file_path = data_dir / "hello.txt"
file_path.write_text("Hello, pathlib!\n", encoding="utf-8")

# ─────── Read text ───────
content = file_path.read_text(encoding="utf-8")
print(content)  # Hello, pathlib!

# ─────── Write bytes ───────
binary_path = data_dir / "data.bin"
binary_path.write_bytes(b"\x00\x01\x02\x03")

# ─────── Read bytes ───────
data = binary_path.read_bytes()
print(data)  # b'\x00\x01\x02\x03'

# ─────── Append ───────
with open(file_path, "a", encoding="utf-8") as f:
    f.write("Appended line\n")

# ─────── Read lines ───────
lines = file_path.read_text().splitlines()
print(lines)
```

### 7.3.2 Directory Operations

```python
from pathlib import Path

# Create directories
Path("a/b/c").mkdir(parents=True, exist_ok=True)  # mkdir -p
Path("empty_dir").mkdir(exist_ok_ok=False)  # raises FileExistsError if exists

# List directory contents
for item in Path(".").iterdir():
    print(f"{'[DIR]' if item.is_dir() else '[FILE]'} {item.name}")

# ─────── Glob patterns ───────
# Find all Python files
for py_file in Path(".").glob("**/*.py"):  # ** = recursive
    print(py_file)

# Find all .txt files in current directory only
for txt_file in Path(".").glob("*.txt"):
    print(txt_file)

# rglob is recursive glob
for f in Path("src").rglob("*.py"):
    print(f)

# ─────── Check existence ───────
p = Path("config.json")
print(p.exists())        # True/False
print(p.is_file())       # True/False
print(p.is_dir())        # True/False
print(p.is_symlink())    # True/False

# ─────── File operations ───────
source = Path("data.txt")
dest = Path("backup/data.txt")

# Copy
import shutil
dest.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(source, dest)  # copy2 preserves metadata

# Rename / move
Path("old_name.txt").rename("new_name.txt")

# Delete
Path("unwanted.txt").unlink(missing_ok=True)  # no error if missing
Path("empty_dir").rmdir()  # only removes empty directories

# Stat
stat = Path("data.txt").stat()
print(f"Size: {stat.st_size} bytes")
print(f"Modified: {stat.st_mtime}")
```

### 7.3.3 Building Paths Safely

```python
from pathlib import Path

# Platform-agnostic path building
config_dir = Path.home() / ".config" / "myapp"
log_file = config_dir / "logs" / "app.log"

# Resolve to absolute path
relative = Path("./data/files/data.csv")
absolute = relative.resolve()
print(absolute)  # /Users/alice/projects/myapp/data/files/data.csv

# Relative path from one path to another
source = Path("/home/alice/project/src/main.py")
target = Path("/home/alice/project/tests/test_main.py")
relative = target.relative_to(Path("/home/alice/project"))
print(relative)  # tests/test_main.py

# Suffix operations
p = Path("report.tar.gz")
print(p.suffixes)     # ['.tar', '.gz']
new_p = p.with_suffix(".txt")  # report.tar.txt
print(new_p)

# Stem operations
p = Path("document.pdf")
print(p.stem)         # document
new_p = p.with_stem("report")  # report.pdf (Python 3.9+)
print(new_p)
```

---

## 7.4 Working with Directories: `os` vs `pathlib`

| Operation | `os.path` | `pathlib.Path` |
|---|---|---|
| Join paths | `os.path.join(a, b)` | `Path(a) / b` |
| Get name | `os.path.basename(p)` | `Path(p).name` |
| Get dir | `os.path.dirname(p)` | `Path(p).parent` |
| Exists? | `os.path.exists(p)` | `Path(p).exists()` |
| Is file? | `os.path.isfile(p)` | `Path(p).is_file()` |
| Is dir? | `os.path.isdir(p)` | `Path(p).is_dir()` |
| Absolute | `os.path.abspath(p)` | `Path(p).resolve()` |
| Extension | `os.path.splitext(p)` | `Path(p).suffix` |
| List dir | `os.listdir(p)` | `list(Path(p).iterdir())` |
| Glob | `glob.glob(p)` | `Path(p).glob(pattern)` |
| Mkdir | `os.makedirs(p)` | `Path(p).mkdir(parents=True)` |
| Remove | `os.remove(p)` | `Path(p).unlink()` |
| Rename | `os.rename(a, b)` | `Path(a).rename(b)` |
| Size | `os.path.getsize(p)` | `Path(p).stat().st_size` |
| Stat | `os.stat(p)` | `Path(p).stat()` |

```python
# os approach (old-style)
import os

for root, dirs, files in os.walk("src"):
    for f in files:
        if f.endswith(".py"):
            print(os.path.join(root, f))

# pathlib approach (modern)
from pathlib import Path

for f in Path("src").rglob("*.py"):
    print(f)
```

---

## 7.5 CSV Module

The `csv` module handles reading and writing CSV files properly, including quoting and delimiter handling.

### 7.5.1 Reading CSV

```python
import csv

# Create sample CSV
with open("employees.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age", "Department"])
    writer.writerow(["Alice", 30, "Engineering"])
    writer.writerow(["Bob", 25, "Marketing"])
    writer.writerow(["Charlie", 35, "Engineering"])

# ─────── csv.reader — returns lists ───────
with open("employees.csv", "r", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)  # skip header
    print(header)  # ['Name', 'Age', 'Department']
    for row in reader:
        print(row)  # ['Alice', '30', 'Engineering']

# ─────── csv.DictReader — returns dicts (much nicer!) ───────
with open("employees.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"{row['Name']} works in {row['Department']}")
# Alice works in Engineering
# Bob works in Marketing
# Charlie works in Engineering
```

### 7.5.2 Writing CSV

```python
import csv

data = [
    {"name": "Alice", "age": 30, "city": "New York"},
    {"name": "Bob", "age": 25, "city": "San Francisco"},
    {"name": "Charlie", "age": 35, "city": "Chicago"},
]

# ─────── csv.writer — write from lists ───────
with open("people.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age", "City"])  # header
    for person in data:
        writer.writerow([person["name"], person["age"], person["city"]])

# ─────── csv.DictWriter — write from dicts (recommended) ───────
with open("people2.csv", "w", newline="", encoding="utf-8") as f:
    fieldnames = ["name", "age", "city"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()  # writes the header row
    writer.writerows(data)  # write all rows at once

# ─────── Custom dialects ───────
# Tab-separated
with open("data.tsv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter="\t")
    writer.writerow(["Name", "Age", "City"])
    writer.writerow(["Alice", 30, "New York"])

# Pipe-separated
with open("data.psv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, delimiter="|")
    writer.writerow(["Name", "Age", "City"])
    writer.writerow(["Alice", 30, "New York"])
```

### 7.5.3 Handling Edge Cases

```python
import csv
from io import StringIO

# ─────── Quoting ───────
data = [["Name", "Description"], ["Alice", 'She said "hello"'], ["Bob", "Has, comma"]]

output = StringIO()
writer = csv.writer(output, quoting=csv.QUOTE_ALL)
writer.writerows(data)
print(output.getvalue())
# "Name","Description"
# "Alice","She said ""hello"""
# "Bob","Has, comma"

# ─────── Escape characters ───────
output = StringIO()
writer = csv.writer(output, escapechar="\\", doublequote=False)
writer.writerow(["Name", "He said \"hi\""])
print(output.getvalue())  # Name,He said \"hi\"

# ─────── Skip bad lines ───────
# bad_lines parameter is available in pandas, not in csv module
# For stdlib, use error handling:
import io

csv_data = "Name,Age\nAlice,30\nBob,twenty\nCharlie,35"
reader = csv.reader(io.StringIO(csv_data))
header = next(reader)
for i, row in enumerate(reader, 1):
    try:
        age = int(row[1])
        print(f"{row[0]}: {age}")
    except ValueError:
        print(f"Skipping row {i}: invalid age '{row[1]}'")
```

---

## 7.6 JSON Module

JSON (JavaScript Object Notation) is the most common data interchange format. Python's `json` module handles encoding and decoding.

### 7.6.1 Encoding (Python → JSON)

```python
import json

# ─────── Simple types ───────
print(json.dumps(42))          # "42"
print(json.dumps(3.14))        # "3.14"
print(json.dumps("hello"))     # "\"hello\""
print(json.dumps(True))        # "true"
print(json.dumps(None))        # "null"

# ─────── Collections ───────
print(json.dumps([1, 2, 3]))        # "[1, 2, 3]"
print(json.dumps({"a": 1, "b": 2})) # "{\"a\": 1, \"b\": 2}"

# ─────── Pretty printing ───────
data = {
    "users": [
        {"name": "Alice", "age": 30, "hobbies": ["reading", "coding"]},
        {"name": "Bob", "age": 25, "hobbies": ["gaming"]},
    ],
    "total": 2
}

# Default: compact
compact = json.dumps(data)
print(compact)
# {"users": [{"name": "Alice", "age": 30, "hobbies": ["reading", "coding"]}, ...]}

# Pretty: with indentation
pretty = json.dumps(data, indent=2, sort_keys=True)
print(pretty)
# {
#   "total": 2,
#   "users": [
#     {
#       "name": "Alice",
#       "age": 30,
#       "hobbies": [
#         "reading",
#         "coding"
#       ]
#     },
#     ...
#   ]
# }

# ─────── Write to file ───────
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
```

### 7.6.2 Decoding (JSON → Python)

```python
import json

# ─────── Parse from string ───────
json_str = '{"name": "Alice", "age": 30, "active": true, "address": null}'
data = json.loads(json_str)
print(data)
# {'name': 'Alice', 'age': 30, 'active': True, 'address': None}

# ─────── Type mapping (JSON → Python) ───────
# JSON object → dict
# JSON array → list
# JSON string → str
# JSON number (int) → int
# JSON number (float) → float
# JSON true → True
# JSON false → False
# JSON null → None

# ─────── Read from file ───────
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# ─────── Error handling ───────
try:
    result = json.loads("not valid json")
except json.JSONDecodeError as e:
    print(f"Invalid JSON: {e}")
    # Invalid JSON: Expecting value: line 1 column 1 (char 0)
```

### 7.6.3 Custom JSON Encoder

```python
import json
from datetime import datetime, date
from pathlib import Path

class CustomEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return {"__type__": "datetime", "value": obj.isoformat()}
        if isinstance(obj, date):
            return {"__type__": "date", "value": obj.isoformat()}
        if isinstance(obj, Path):
            return {"__type__": "path", "value": str(obj)}
        if isinstance(obj, set):
            return {"__type__": "set", "value": list(obj)}
        if isinstance(obj, bytes):
            return {"__type__": "bytes", "value": obj.hex()}
        return super().default(obj)


data = {
    "created": datetime(2024, 6, 15, 10, 30),
    "path": Path("/home/alice/report.pdf"),
    "tags": {"python", "tutorial"},
    "data": b"\x00\x01\x02",
}

encoded = json.dumps(data, cls=CustomEncoder, indent=2)
print(encoded)
# {
#   "created": {"__type__": "datetime", "value": "2024-06-15T10:30:00"},
#   "path": {"__type__": "path", "value": "/home/alice/report.pdf"},
#   "tags": {"__type__": "set", "value": ["python", "tutorial"]},
#   "data": {"__type__": "bytes", "value": "000102"}
# }

# Custom decoder
def custom_decoder(dct):
    if "__type__" in dct:
        type_name = dct["__type__"]
        if type_name == "datetime":
            return datetime.fromisoformat(dct["value"])
        if type_name == "date":
            return date.fromisoformat(dct["value"])
        if type_name == "path":
            return Path(dct["value"])
        if type_name == "set":
            return set(dct["value"])
        if type_name == "bytes":
            return bytes.fromhex(dct["value"])
    return dct

decoded = json.loads(encoded, object_hook=custom_decoder)
print(decoded)
print(type(decoded["created"]))  # <class 'datetime.datetime'>
print(type(decoded["tags"]))     # <class 'set'>
```

### 7.6.4 JSON Lines (JSONL)

```python
import json

# JSONL: one JSON object per line — great for streaming/logs
records = [
    {"id": 1, "name": "Alice", "score": 95},
    {"id": 2, "name": "Bob", "score": 87},
    {"id": 3, "name": "Charlie", "score": 92},
]

# Write JSONL
with open("data.jsonl", "w", encoding="utf-8") as f:
    for record in records:
        f.write(json.dumps(record) + "\n")

# Read JSONL
with open("data.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        record = json.loads(line.strip())
        print(f"{record['name']}: {record['score']}")
```

---

## 7.7 Pickle Module

`pickle` serializes Python objects into binary format and deserializes them back. Unlike JSON, it can handle complex Python objects (classes, functions, etc.).

```python
import pickle

# ─────── Basic usage ───────
data = {"name": "Alice", "scores": [95, 87, 92], "metadata": {"version": 2}}

# Serialize to bytes
pickled = pickle.dumps(data)
print(type(pickled))  # <class 'bytes'>
print(len(pickled))   # 125 bytes (binary format)

# Deserialize from bytes
unpickled = pickle.loads(pickled)
print(unpickled)  # {'name': 'Alice', 'scores': [95, 87, 92], ...}

# ─────── File I/O ───────
# Save to file
with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

# Load from file
with open("data.pkl", "rb") as f:
    loaded = pickle.load(f)

# ─────── Pickle can handle complex objects ───────
import math

class GameState:
    def __init__(self, level=1, score=0):
        self.level = level
        self.score = score
        self.inventory = []

    def __repr__(self):
        return f"GameState(level={self.level}, score={self.score})"

game = GameState(level=5, score=12500)
game.inventory = ["sword", "shield", "potion"]

pickled_game = pickle.dumps(game)
loaded_game = pickle.loads(pickled_game)
print(loaded_game)  # GameState(level=5, score=12500)
print(loaded_game.inventory)  # ['sword', 'shield', 'potion']
```

### ⚠️ Pickle Security Warning

```python
# NEVER unpickle data from untrusted sources!
# Pickle can execute arbitrary code during deserialization

# This malicious pickle could run any command:
import os

class Malicious:
    def __reduce__(self):
        return (os.system, ("echo 'You've been hacked!'",))

# malicious_bytes = pickle.dumps(Malicious())
# pickle.loads(malicious_bytes)  # Would execute os.system("echo 'You've been hacked!'")

# SAFE alternatives:
# - Use JSON for data interchange
# - Use msgpack for binary + speed
# - Use pickle only with YOUR OWN data
# - Set pickle.Unpickler with custom find_class if needed
```

### 7.7.1 Pickle Protocols

```python
import pickle

data = [1, 2, 3, {"a": 1}]

# Different protocols (higher = newer, faster, more compact)
for protocol in range(pickle.HIGHEST_PROTOCOL + 1):
    pickled = pickle.dumps(data, protocol=protocol)
    print(f"Protocol {protocol}: {len(pickled)} bytes")

# Protocol 0: ASCII, compatible with Python 2
# Protocol 1: Simple binary
# Protocol 2: New-style classes
# Protocol 3: Bytes objects (Python 3 default)
# Protocol 4: Large objects (supports >4GB)
# Protocol 5: Out-of-band data (Python 3.8+)

# Use highest available protocol for best performance
optimized = pickle.dumps(data, protocol=pickle.HIGHEST_PROTOCOL)
```

---

## 7.8 Working with Temporary Files

```python
import tempfile
import os

# ─────── Temporary file ───────
with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
    f.write("Temporary data\n")
    temp_path = f.name
    print(f"Created: {temp_path}")

# Use the file...
with open(temp_path, "r") as f:
    print(f.read())  # Temporary data

os.unlink(temp_path)  # Clean up

# ─────── Temporary directory ───────
with tempfile.TemporaryDirectory() as tmpdir:
    print(f"Created temp dir: {tmpdir}")
    # Write files in the temp dir
    file_path = os.path.join(tmpdir, "data.txt")
    with open(file_path, "w") as f:
        f.write("Hello, temp!")
    # Directory (and contents) deleted automatically when exiting

# ─────── Spooled temporary file (in-memory until size threshold) ───────
from tempfile import SpooledTemporaryFile

with SpooledTemporaryFile(max_size=1024 * 1024) as f:
    f.write(b"Small data stays in memory")
    f.seek(0)
    print(f.read())  # b'Small data stays in memory'
# File is rolled to disk if content exceeds max_size
```

---

## 7.9 File Locking Concepts

File locking prevents concurrent processes from corrupting shared files.

```python
import fcntl
import os

class FileLock:
    """Simple file locking using fcntl (Unix only)."""
    def __init__(self, filepath):
        self.filepath = filepath
        self.lock_file = filepath + ".lock"
        self._fd = None

    def __enter__(self):
        self._fd = open(self.lock_file, "w")
        try:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_EX)
            return self
        except Exception:
            self._fd.close()
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._fd:
            fcntl.flock(self._fd.fileno(), fcntl.LOCK_UN)
            self._fd.close()

# Usage (Unix)
# with FileLock("shared_data.json"):
#     data = json.load(open("shared_data.json"))
#     data["counter"] += 1
#     json.dump(data, open("shared_data.json", "w"))

# Cross-platform alternative: portalocker library
# pip install portalocker
# import portalocker
# with portalocker.Lock("shared_data.json"):
#     ...
```

---

## 7.10 Encoding

### 7.10.1 Common Encodings

| Encoding | Description | Use Case |
|---|---|---|
| `utf-8` | Variable-width Unicode (1-4 bytes) | **Default for most text** |
| `utf-16` | 2 or 4 bytes per character | Windows internals |
| `ascii` | 7-bit, English only | Legacy systems |
| `latin-1` | 8-bit, Western European | Legacy data |
| `cp1252` | Windows Western European | Windows legacy |
| `utf-8-sig` | UTF-8 with BOM | Excel CSV files |

```python
# ─────── Reading with different encodings ───────
# Try utf-8 first (most common)
try:
    with open("data.txt", "r", encoding="utf-8") as f:
        content = f.read()
except UnicodeDecodeError:
    # Fall back to latin-1 (never raises UnicodeDecodeError)
    with open("data.txt", "r", encoding="latin-1") as f:
        content = f.read()

# ─────── Writing with BOM (Byte Order Mark) ───────
# Excel needs BOM for UTF-8 CSV
with open("excel_data.csv", "w", encoding="utf-8-sig", newline="") as f:
    f.write("Name,Age\nAlice,30\n")

# ─────── Binary to text ───────
raw_bytes = "Hello, 世界!".encode("utf-8")
print(raw_bytes)  # b'Hello, \xe4\xb8\x96\xe7\x95\x8c!'
print(len(raw_bytes))  # 16 (Hello + 3*3 bytes for CJK + !)

# Decode back
text = raw_bytes.decode("utf-8")
print(text)  # Hello, 世界!

# ─────── Detect encoding (with chardet library) ───────
# pip install chardet
# import chardet
# with open("unknown.txt", "rb") as f:
#     raw = f.read()
#     result = chardet.detect(raw)
#     print(result)  # {'encoding': 'utf-8', 'confidence': 0.99}
#     text = raw.decode(result["encoding"])
```

---

## 7.11 Common Patterns and Best Practices

```python
# ─────── Pattern 1: Atomic writes (write to temp, then rename) ───────
import tempfile
from pathlib import Path

def atomic_write(filepath: str | Path, content: str, encoding: str = "utf-8"):
    """Write to a temp file, then atomically rename."""
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(
        mode="w",
        dir=filepath.parent,
        suffix=".tmp",
        delete=False,
        encoding=encoding,
    ) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)

    tmp_path.rename(filepath)  # Atomic on most filesystems


atomic_write("output/result.txt", "Hello, atomic write!\n")

# ─────── Pattern 2: Read CSV into list of dicts ───────
import csv
from pathlib import Path

def read_csv(path: str | Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

# ─────── Pattern 3: Write dict to JSON with backup ───────
import json
from datetime import datetime

def save_json(data: dict, path: str | Path, backup: bool = True):
    path = Path(path)
    if backup and path.exists():
        backup_path = path.with_suffix(f".{datetime.now():%Y%m%d%H%M%S}.bak")
        path.rename(backup_path)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)

# ─────── Pattern 4: Process large file line by line ───────
def process_large_file(filepath: str, max_lines: int = 0):
    """Memory-efficient processing of large files."""
    count = 0
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            count += 1
            if max_lines and count > max_lines:
                break
            # Process each line without loading entire file
            yield line.strip()

# ─────── Pattern 5: Read all files in directory ───────
from pathlib import Path

def read_all_text_files(directory: str | Path) -> dict[str, str]:
    """Read all .txt files in a directory."""
    result = {}
    for path in Path(directory).glob("*.txt"):
        result[path.name] = path.read_text(encoding="utf-8")
    return result
```

---

## 7.12 Key Takeaways

1. **Always use `with` statements** for file I/O — they ensure files are closed even if exceptions occur.

2. **Choose the right file mode**: `'r'` for reading, `'w'` for writing (truncates!), `'a'` for appending, `'x'` for exclusive creation, and add `'b'` for binary.

3. **`pathlib` is the modern way** to handle file paths. Use `Path / "child"` to join paths and methods like `.read_text()`, `.write_text()`, `.glob()`, `.iterdir()`.

4. **For CSV**: use `csv.DictReader` and `csv.DictWriter` for readable code with named fields.

5. **For JSON**: use `json.dumps`/`json.loads` for text data, with custom `JSONEncoder` for complex types. Use `json.dump`/`json.load` for file I/O.

6. **For binary data**: use `pickle` only with your own data — never unpickle untrusted input. Consider `msgpack` or `protobuf` for safer binary serialization.

7. **Memory efficiency**: process large files line-by-line rather than reading them all at once.

8. **Atomic writes**: write to a temp file, then rename — prevents corruption if the process crashes mid-write.

9. **Encoding**: always specify `encoding="utf-8"` explicitly — don't rely on platform defaults.

10. **`pathlib` vs `os.path`**: `pathlib` is cleaner and more Pythonic. Use it for new code; `os.path` is still fine for existing code.

---

## 7.13 Practice Exercises

**Exercise 1: Log File Parser**

Write a function that parses a log file and returns a list of dicts with parsed fields.

```python
from pathlib import Path

def parse_log_file(filepath: str | Path) -> list[dict]:
    entries = []
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Parse format: "2024-01-15 10:30:00 [ERROR] Message here"
            parts = line.split(" ", 2)
            if len(parts) >= 3 and parts[2].startswith("["):
                level = parts[2].split("]")[0].strip("[]")
                message = parts[2].split("] ", 1)[1] if "] " in parts[2] else ""
                entries.append({
                    "timestamp": f"{parts[0]} {parts[1]}",
                    "level": level,
                    "message": message,
                })
    return entries
```

**Exercise 2: CSV Reporter**

Build a CSV report generator that reads data from a dict, adds computed columns, and writes a formatted CSV.

```python
import csv
from pathlib import Path

def generate_report(data: list[dict], output_path: str | Path):
    if not data:
        return

    fieldnames = list(data[0].keys()) + ["total"]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            row["total"] = sum(v for v in row.values() if isinstance(v, (int, float)))
            writer.writerow(row)

# Test
data = [
    {"product": "Widget", "q1": 100, "q2": 150, "q3": 200},
    {"product": "Gadget", "q1": 50, "q2": 75, "q3": 120},
]
generate_report(data, "report.csv")
```

**Exercise 3: Config File Manager**

Create a class that manages a JSON config file with defaults, auto-loading, and saving.

```python
import json
from pathlib import Path
from typing import Any

class ConfigManager:
    def __init__(self, path: str | Path, defaults: dict | None = None):
        self.path = Path(path)
        self.defaults = defaults or {}
        self._data: dict = {}
        self.load()

    def load(self) -> None:
        if self.path.exists():
            with open(self.path, "r", encoding="utf-8") as f:
                self._data = json.load(f)
        else:
            self._data = {}

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2)

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, self.defaults.get(key, default))

    def set(self, key: str, value: Any) -> None:
        self._data[key] = value
        self.save()

    def __getitem__(self, key: str) -> Any:
        return self.get(key)

    def __setitem__(self, key: str, value: Any) -> None:
        self.set(key, value)


# Test
config = ConfigManager("app_config.json", defaults={"debug": False, "port": 8080})
print(config.get("debug"))       # False (from defaults)
config.set("debug", True)
print(config["debug"])           # True (from file)
```

**Exercise 4: File Backup Utility**

Build a backup utility that copies directory trees, preserves structure, and generates a manifest.

```python
import shutil
import json
from pathlib import Path
from datetime import datetime

def backup_directory(source: str | Path, dest: str | Path, manifest_name: str = "manifest.json"):
    source = Path(source)
    dest = Path(dest) / datetime.now().strftime("%Y%m%d_%H%M%S")
    dest.mkdir(parents=True)

    manifest = {"source": str(source), "files": []}

    for file_path in source.rglob("*"):
        if file_path.is_file():
            relative = file_path.relative_to(source)
            target = dest / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(file_path, target)
            manifest["files"].append(str(relative))

    manifest_path = dest / manifest_name
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    return dest, manifest

# Test
source_dir = Path("my_project")
source_dir.mkdir(exist_ok=True)
(source_dir / "main.py").write_text("print('hello')")
(source_dir / "lib").mkdir(exist_ok=True)
(source_dir / "lib" / "utils.py").write_text("# utilities")

backup_path, manifest = backup_directory(source_dir, "backups")
print(f"Backed up {len(manifest['files'])} files to {backup_path}")
```

**Exercise 5: JSONL Processor**

Build a JSONL (JSON Lines) file processor that supports filtering, transforming, and aggregating records.

```python
import json
from pathlib import Path
from typing import Callable

def process_jsonl(
    input_path: str | Path,
    output_path: str | Path | None = None,
    filter_fn: Callable[[dict], bool] | None = None,
    transform_fn: Callable[[dict], dict] | None = None,
) -> list[dict]:
    records = []

    with open(input_path, "r", encoding="utf-8") as f:
        for line in f:
            record = json.loads(line.strip())
            if filter_fn and not filter_fn(record):
                continue
            if transform_fn:
                record = transform_fn(record)
            records.append(record)

    if output_path:
        with open(output_path, "w", encoding="utf-8") as f:
            for record in records:
                f.write(json.dumps(record) + "\n")

    return records

# Test: create sample JSONL
sample = [{"name": "Alice", "score": 85, "passed": True},
          {"name": "Bob", "score": 42, "passed": False},
          {"name": "Charlie", "score": 91, "passed": True}]

with open("students.jsonl", "w") as f:
    for r in sample:
        f.write(json.dumps(r) + "\n")

# Filter only passing students
passing = process_jsonl("students.jsonl", filter_fn=lambda r: r["passed"])
assert len(passing) == 2
assert all(r["passed"] for r in passing)
print("All tests passed!")
```

**Exercise 6: Path Search Tool**

Create a tool that searches for files matching patterns and returns structured results.

```python
from pathlib import Path
from dataclasses import dataclass

@dataclass
class SearchResult:
    path: Path
    size: int
    extension: str

def search_files(
    root: str | Path,
    pattern: str = "**/*",
    min_size: int = 0,
    max_size: int = float("inf"),
    extensions: set[str] | None = None,
) -> list[SearchResult]:
    results = []
    root = Path(root)

    for path in root.glob(pattern):
        if not path.is_file():
            continue
        size = path.stat().st_size
        if size < min_size or size > max_size:
            continue
        ext = path.suffix.lower()
        if extensions and ext not in extensions:
            continue
        results.append(SearchResult(path=path, size=size, extension=ext))

    return sorted(results, key=lambda r: r.size, reverse=True)

# Test
results = search_files(Path("."), "**/*.py", min_size=100, extensions={".py"})
for r in results[:5]:
    print(f"{r.path} ({r.size:,} bytes, {r.extension})")
```
