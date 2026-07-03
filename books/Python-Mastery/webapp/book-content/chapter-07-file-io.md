# Chapter 7: File I/O & Serialization

> *"A program that can't read or write data is like a chef who can't access the pantry — technically skilled, but unable to produce anything of lasting value."*

Everything a program learns in a single run vanishes the moment it exits. Files, databases, and APIs are how software persists state, shares data across programs, and communicates with the outside world. This chapter covers every major form of data persistence and exchange in the Python ecosystem — from low-level file handles to high-level serialization formats and database access.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     PYTHON I/O PIPELINE / DATA FLOW                     │
│                                                                          │
│  SOURCES                              SINKS                              │
│  ───────                              ─────                              │
│  Files (disk)     ──┐                Files (disk)     ──┐               │
│  Databases (SQL)  ──┤                Databases (SQL)  ──┤               │
│  APIs (HTTP/JSON) ──┤  ┌──────────┐  Files (disk)     ──┤               │
│  Stdin             ──┼─▶│ PYTHON   │─▶ APIs (HTTP)     ──┤               │
│  Network sockets  ──┤  │  CODE    │  stdout            ──┤               │
│  Archives (zip)   ──┤  └──────────┘  Logs              ──┤               │
│  Env vars / args  ──┘                Archives          ──┘               │
│                                     (zip/tar.gz)                         │
│                                                                          │
│  SERIALIZATION FORMATS                                                   │
│  ─────────────────────                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │   JSON   │  │  Pickle  │  │   CSV    │  │   YAML   │                │
│  │ text/utf8│  │  binary  │  │  text    │  │  text    │                │
│  │cross-lang│  │ Python   │  │ tabular  │  │ config   │                │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │
│  │  XML/HTML│  │  sqlite3 │  │ Protocol │                               │
│  │  markup  │  │ binary DB│  │  Buffers │                               │
│  └──────────┘  └──────────┘  └──────────┘                               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 7.1 Reading and Writing Text Files

### 7.1.1 Opening and Closing Files

The built-in `open()` function returns a **file object** (also called a *file handle*):

```python
f = open("data.txt", "r")   # open for reading (default mode)
contents = f.read()
f.close()                    # always close when done
```

Every `open()` **must** be balanced by a `close()`. Skipping `close()` leaks file descriptors and can corrupt data if writes haven't been flushed to disk. In practice, you'll almost always use the `with` statement (covered in section 7.2) to handle this automatically.

### 7.1.2 File Modes

| Mode | Description | Pointer Position | Creates File? |
|------|-------------|-----------------|---------------|
| `"r"` | Read (text, default) | Beginning | No (raises `FileNotFoundError`) |
| `"w"` | Write (truncate first) | Beginning | Yes |
| `"a"` | Append | End of file | Yes |
| `"r+"` | Read + Write | Beginning | No |
| `"w+"` | Write + Read (truncate) | Beginning | Yes |
| `"a+"` | Append + Read | End of file | Yes |
| `"rb"` | Read binary | Beginning | No |
| `"wb"` | Write binary | Beginning | Yes |
| `"ab"` | Append binary | End of file | Yes |
| `"x"` | Exclusive create (fails if exists) | — | Yes (or `FileExistsError`) |

```python
# Append mode — useful for log files
with open("app.log", "a") as log:
    log.write("2026-07-01 Service started\n")
```

### 7.1.3 The `encoding` Parameter

Text mode uses the platform's default encoding unless you specify one explicitly. On many systems this is UTF-8, but it's **always best practice to specify encoding**:

```python
# Explicit encoding — portable and unambiguous
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Write with a specific encoding
with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Héllo, Wörld! 🌍\n")

# Handle encoding errors gracefully
with open("mixed.txt", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()  # Invalid bytes replaced with U+FFFD
```

| `errors` value | Behavior |
|----------------|----------|
| `"strict"` | Raises `UnicodeDecodeError` (default) |
| `"replace"` | Replaces with `?` or `U+FFFD` |
| `"ignore"` | Silently drops undecodable bytes |
| `"xmlcharrefreplace"` | Replaces with XML character references |
| `"backslashreplace"` | Replaces with `\xNN` escape sequences |

### 7.1.4 Reading Files

```python
# --- Three ways to read ---

# 1. .read() — entire file as a single string
with open("data.txt", encoding="utf-8") as f:
    whole = f.read()          # str (or bytes in binary mode)

# 2. .readline() — one line at a time
with open("data.txt", encoding="utf-8") as f:
    first_line = f.readline()    # "Header\n"
    second_line = f.readline()   # "Row 1\n"

# 3. .readlines() — all lines as a list
with open("data.txt", encoding="utf-8") as f:
    all_lines = f.readlines()    # ["Header\n", "Row 1\n", "Row 2\n"]
```

**The Pythonic way — iterate directly:**

```python
with open("data.txt", encoding="utf-8") as f:
    for line in f:            # reads lazily, one line at a time
        print(line.rstrip())  # rstrip() removes trailing \n
```

This is the **most memory-efficient approach** for large files because Python reads one line at a time into memory rather than loading the entire file. For a 10 GB log file, this pattern uses constant memory while `readlines()` would consume all 10 GB.

### 7.1.5 Writing Files

```python
# .write() returns the number of characters written
with open("output.txt", "w", encoding="utf-8") as f:
    chars_written = f.write("First line\n")
    print(f"Wrote {chars_written} characters")
    f.write("Second line\n")

# .writelines() — writes a list of strings (caller adds newlines)
lines = ["Line 1\n", "Line 2\n", "Line 3\n"]
with open("output.txt", "w", encoding="utf-8") as f:
    f.writelines(lines)
```

> **Gotcha:** `writelines()` does **not** add newlines between items. The caller is responsible for including line terminators in each string.

### 7.1.6 Text vs Binary Mode

```
┌──────────────────────────────────────────────────────────┐
│                  TEXT MODE vs BINARY MODE                │
├─────────────────────────┬────────────────────────────────┤
│       TEXT MODE         │        BINARY MODE             │
├─────────────────────────┼────────────────────────────────┤
│ Default encoding        │ Raw bytes (no decoding)        │
│ (platform-dependent)    │                                │
│                         │                                │
│ Newlines translated:    │ Newlines kept as-is:           │
│   \n ↔ \r\n            │   \n stays \n                  │
│                         │                                │
│ str objects             │ bytes objects                  │
│                         │                                │
│ Human-readable data     │ Images, ZIP files, pickles,    │
│ (.txt, .csv, .json)    │ compiled code, protocol data   │
│                         │                                │
│ open("f.txt", "r")     │ open("f.bin", "rb")            │
└─────────────────────────┴────────────────────────────────┘
```

```python
# Binary read — no encoding, no newline translation
with open("photo.jpg", "rb") as f:
    header = f.read(20)    # bytes: b'\xff\xd8\xff\xe0...'
    assert header[:2] == b'\xff\xd8'  # JPEG magic bytes
```

### 7.1.7 File Pointer and Seeking

```python
with open("data.txt", "r+") as f:
    f.write("Hello, World!")     # writes 13 chars
    f.seek(7)                    # move pointer to position 7
    f.write("Python!")           # overwrites "World!" → "Python!"
    # File now contains: "Hello, Python!"

    position = f.tell()          # returns current position
    print(f"Current position: {position}")
```

| Method | Description |
|--------|-------------|
| `f.tell()` | Returns current position as integer |
| `f.seek(offset, whence)` | Move pointer: `whence=0` (default, from start), `1` (from current), `2` (from end) |

> **Note:** `seek()` and `tell()` work reliably with binary mode. Text-mode seeks may fail on platforms that perform newline translation.

---

## 7.2 Context Managers

### 7.2.1 The `with` Statement in Depth

The `with` statement guarantees that **cleanup code runs even if exceptions occur**. It replaces the error-prone try/finally pattern:

```python
# WITHOUT context manager (error-prone)
f = open("data.txt")
try:
    data = f.read()
finally:
    f.close()

# WITH context manager (clean and safe)
with open("data.txt") as f:
    data = f.read()
# f.close() called automatically, even on exception
```

### 7.2.2 The `__enter__` and `__exit__` Protocol

Context managers implement two dunder methods defined by the **context manager protocol**:

```
┌────────────────────────────────────────────────────────────────┐
│                CONTEXT MANAGER PROTOCOL FLOW                  │
│                                                                │
│  with expression as target:                                    │
│      body                                                      │
│                                                                │
│  ┌──────────┐         ┌──────────────────┐                     │
│  │__enter__ │────────▶│ Execute the body │                     │
│  │  returns │         │ (target = return │                     │
│  │  value   │         │   from __enter__)│                     │
│  └──────────┘         └────────┬─────────┘                     │
│                                │                                │
│                     ┌──────────▼─────────┐                     │
│                     │   body completes   │                     │
│                     │   (success or      │                     │
│                     │    exception)      │                     │
│                     └──────────┬─────────┘                     │
│                                │                                │
│                     ┌──────────▼─────────┐                     │
│                     │    __exit__        │                     │
│                     │  (cleanup logic)   │                     │
│                     └────────────────────┘                     │
└────────────────────────────────────────────────────────────────┘
```

```python
class ManagedResource:
    def __enter__(self):
        print("Acquiring resource")
        return self                    # bound to `resource` in `as resource`

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Releasing resource")
        return False                   # don't suppress exceptions


with ManagedResource() as resource:
    print("Using resource")
```

The `__exit__` method receives three exception-related arguments. If the body raised an exception, they are non-`None`:

| Argument | Type | Description |
|----------|------|-------------|
| `exc_type` | `type` | The exception class (e.g., `ValueError`) |
| `exc_val` | `Exception` | The exception instance |
| `exc_tb` | `traceback` | The traceback object |

Returning `True` from `__exit__` **suppresses** the exception (generally discouraged):

```python
class SuppressAll:
    def __exit__(self, exc_type, exc_val, exc_tb):
        return True  # ⚠️ Suppresses ALL exceptions — use with care

with SuppressAll():
    raise RuntimeError("This will be silently swallowed")
print("Execution continues")  # This runs!
```

### 7.2.3 Writing Custom Context Managers

```python
import time

class Timer:
    """A context manager that measures execution time."""

    def __enter__(self) -> "Timer":
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f} seconds")

    @property
    def duration(self) -> float:
        return self.elapsed


with Timer() as t:
    total = sum(range(10_000_000))
# Elapsed: 0.2314 seconds
print(f"Computed sum in {t.duration:.2f}s")
```

### 7.2.4 `contextlib.contextmanager`

The `contextlib` module provides a simpler way to build context managers using a generator:

```python
from contextlib import contextmanager
import time

@contextmanager
def timer(label: str):
    """Time a block of code."""
    start = time.perf_counter()
    try:
        yield start          # control passes to `with` body
    except Exception as e:
        print(f"[{label}] exception: {e}")
        raise                 # re-raise after cleanup
    finally:
        elapsed = time.perf_counter() - start
        print(f"[{label}] elapsed: {elapsed:.4f}s")


with timer("sum-computation"):
    total = sum(range(10_000_000))
# [sum-computation] elapsed: 0.2314s
```

**Practical example — database connection:**

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db(db_path: str = "app.db"):
    """Provide a transactional database connection."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# Usage
with get_db() as db:
    db.execute("INSERT INTO users (name) VALUES (?)", ("Alice",))
    users = db.execute("SELECT * FROM users").fetchall()
```

### 7.2.5 `contextlib.suppress`

Silently ignore specific exceptions:

```python
import os
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("might_not_exist.txt")
# If the file doesn't exist, no exception — clean and readable
```

### 7.2.6 `contextlib.redirect_stdout`

Redirect standard output to a different stream:

```python
import sys
from io import StringIO
from contextlib import redirect_stdout

f = StringIO()
with redirect_stdout(f):
    print("This goes to the buffer, not the console")
    print("So does this")

output = f.getvalue()
print(f"Captured: {output!r}")
# Captured: 'This goes to the buffer, not the console\nSo does this\n'
```

This is invaluable for testing code that prints output, and for building CLIs that need to capture or redirect output programmatically.

### 7.2.7 `contextlib.ExitStack`

Manage a **dynamic number** of context managers:

```python
from contextlib import ExitStack

with ExitStack() as stack:
    files = [
        stack.enter_context(open(f, "w"))
        for f in ("out_1.txt", "out_2.txt", "out_3.txt")
    ]
    # All files open; all close safely at exit
    for i, f in enumerate(files, 1):
        f.write(f"Output file {i}\n")
```

`ExitStack` is especially useful when the number of resources isn't known at write-time:

```python
from contextlib import ExitStack

def process_files(paths: list[str], keep_open: bool = False):
    """Open and process files, optionally keeping them open."""
    with ExitStack() as stack:
        files = [stack.enter_context(open(p)) for p in paths]
        if keep_open:
            # Prevent cleanup — the caller is responsible
            stack.pop_all()
        return [f.read() for f in files]
```

---

## 7.3 Working with CSV

### 7.3.1 Reading CSV Files

The `csv` module handles the complexities of quoting, delimiters, and escaping:

```python
import csv

with open("sales.csv", encoding="utf-8") as f:
    reader = csv.reader(f)
    header = next(reader)          # ['Date', 'Product', 'Revenue']
    for row in reader:
        print(f"{row[0]}: {row[1]} = ${row[2]}")
```

### 7.3.2 `csv.DictReader` — Access by Column Name

```python
import csv

with open("sales.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        # row is a dict-like: {'Date': '2026-01-15', 'Product': 'Widget', ...}
        print(f"{row['Date']}: {row['Product']} = ${row['Revenue']}")
```

### 7.3.3 Writing CSV Files

```python
import csv

data = [
    ["Date", "Product", "Revenue"],
    ["2026-01-15", "Widget", "1200.50"],
    ["2026-01-16", "Gadget", "890.00"],
]

with open("output.csv", "w", newline="", encoding="utf-8") as f:     # newline="" prevents extra blank lines
    writer = csv.writer(f)
    writer.writerows(data)
```

### 7.3.4 `csv.DictWriter`

```python
import csv

fieldnames = ["name", "age", "city"]
rows = [
    {"name": "Alice", "age": 30, "city": "Seattle"},
    {"name": "Bob", "age": 25, "city": "Portland"},
]

with open("people.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()          # writes "name,age,city"
    writer.writerows(rows)
```

### 7.3.5 Dialects and Delimiters

```python
import csv

# Tab-separated values
with open("data.tsv", encoding="utf-8") as f:
    reader = csv.reader(f, delimiter="\t")
    for row in reader:
        print(row)

# Register a custom dialect
csv.register_dialect(
    "pipe",
    delimiter="|",
    quotechar="'",
    escapechar="\\",
    doublequote=False,
)

with open("data.pipe", encoding="utf-8") as f:
    reader = csv.reader(f, dialect="pipe")
    for row in reader:
        print(row)
```

| Dialect | Delimiter | Quotechar | doublequote | lineterminator |
|---------|-----------|-----------|-------------|----------------|
| `excel` | `,` | `"` | `True` | `\r\n` |
| `excel-tab` | `\t` | `"` | `True` | `\r\n` |
| `unix` | `,` | `"` | `True` | `\n` |

### 7.3.4 Handling Large CSV Files Efficiently

```python
import csv

# Streaming — process row by row without loading entire file
def sum_revenue(csv_path: str) -> float:
    """Sum revenue column from a potentially huge CSV file."""
    total = 0.0
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += float(row["Revenue"])
    return total

# For very large files, consider using pandas with chunksize:
# import pandas as pd
# for chunk in pd.read_csv("huge.csv", chunksize=10_000):
#     process(chunk)
```

> **Gotcha:** Always open CSV files for writing with `newline=""` to prevent Python from adding extra blank lines on Windows.

---

## 7.4 Working with JSON

### 7.4.1 Encoding (Python → JSON)

```python
import json

data = {
    "users": [
        {"name": "Alice", "age": 30, "active": True},
        {"name": "Bob",   "age": 25, "active": False},
    ]
}

# dumps() returns a string; dump() writes to a file
json_string = json.dumps(data, indent=2)
print(json_string)

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
```

Output:

```json
{
  "users": [
    {"name": "Alice", "age": 30, "active": true},
    {"name": "Bob", "age": 25, "active": false}
  ]
}
```

### 7.4.2 Decoding (JSON → Python)

```python
import json

# loads() from string; load() from file
parsed = json.loads('{"x": 1, "y": [1, 2, 3]}')

with open("data.json", encoding="utf-8") as f:
    data = json.load(f)
```

**Type mapping:**

| JSON | Python |
|------|--------|
| `object {}` | `dict` |
| `array []` | `list` |
| `string ""` | `str` |
| `number (integer)` | `int` |
| `number (float)` | `float` |
| `true` / `false` | `True` / `False` |
| `null` | `None` |

### 7.4.3 `indent` and `sort_keys` for Pretty Printing

```python
import json

data = {"banana": 3, "apple": 5, "cherry": 1}

# Compact (no extra whitespace)
compact = json.dumps(data)
print(compact)   # {"banana": 3, "apple": 5, "cherry": 1}

# Pretty-printed with sorted keys
pretty = json.dumps(data, indent=2, sort_keys=True)
print(pretty)
# {
#   "apple": 5,
#   "banana": 3,
#   "cherry": 1
# }
```

### 7.4.4 Custom Serialization with `default`

```python
import json
from datetime import datetime, date

# --- Custom encoder for datetime objects ---
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

event = {"name": "Conference", "date": datetime(2026, 9, 15, 9, 0)}
print(json.dumps(event, cls=DateTimeEncoder))
# {"name": "Conference", "date": "2026-09-15T09:00:00"}
```

**Using the `default` function parameter (simpler approach):**

```python
import json
from datetime import datetime

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

data = {"timestamp": datetime.now()}
print(json.dumps(data, default=json_serial, indent=2))
```

### 7.4.5 Custom Deserialization with `object_hook`

```python
import json
from datetime import datetime

def as_datetime(dct):
    """Convert ISO date strings back to datetime objects."""
    for key, value in dct.items():
        if isinstance(value, str):
            try:
                dct[key] = datetime.fromisoformat(value)
            except ValueError:
                pass
    return dct

json_string = '{"event": "Meetup", "date": "2026-07-01T18:00:00"}'
restored = json.loads(json_string, object_hook=as_datetime)
print(type(restored["date"]))   # <class 'datetime.datetime'>
```

### 7.4.6 Working with Complex Objects

```python
import json
from dataclasses import dataclass, asdict, field

@dataclass
class Product:
    name: str
    price: float
    tags: list[str] = field(default_factory=list)

products = [Product("Widget", 9.99, ["sale"]), Product("Gadget", 24.50)]

# Convert dataclasses to dict, then serialize
print(json.dumps([asdict(p) for p in products], indent=2))
```

### 7.4.7 JSON Lines (JSONL) — One JSON Object Per Line

```python
import json

# Write JSONL — useful for log data and streaming pipelines
records = [
    {"id": 1, "action": "click"},
    {"id": 2, "action": "scroll"},
]

with open("events.jsonl", "w", encoding="utf-8") as f:
    for record in records:
        f.write(json.dumps(record) + "\n")

# Read JSONL — process one record at a time (memory efficient)
with open("events.jsonl", encoding="utf-8") as f:
    for line in f:
        record = json.loads(line)
        print(record["action"])
```

### 7.4.8 Streaming JSON with `ijson`

For extremely large JSON files (multi-GB), loading the entire structure into memory is impractical. The `ijson` library lets you **stream-parse** JSON objects lazily:

```python
# pip install ijson

import ijson

# Stream-parse a huge array of objects — only one in memory at a time
with open("huge_events.json", "rb") as f:
    # Iterate over items in the "events" array
    parser = ijson.items(f, "events.item")
    for event in parser:
        if event["type"] == "purchase":
            process_purchase(event)  # each event parsed on-demand
```

| Library | Memory | Speed | Use Case |
|---------|--------|-------|----------|
| `json` | Full file in memory | Fast | Files < 100 MB |
| `ijson` | One item at a time | Moderate | Files > 1 GB, streaming |
| `orjson` | Full file in memory | Very fast | High-performance pipelines |
| `ujson` | Full file in memory | Fast | Drop-in `json` replacement |

---

## 7.5 Pickle and Binary Serialization

### 7.5.1 Pickle Basics

`pickle` serializes **any Python object** to a byte stream — not just the JSON-friendly subset:

```python
import pickle

# Serialize
data = {"set": {1, 2, 3}, "tuple": (4, 5), "bytes": b"\x00\x01"}
serialized = pickle.dumps(data)

# Deserialize
restored = pickle.loads(serialized)
print(restored)   # {'set': {1, 2, 3}, 'tuple': (4, 5), 'bytes': b'\x00\x01'}
```

### 7.5.2 Pickle Protocol Versions

```python
import pickle

data = list(range(1000))

# Higher protocol = more compact, but less backward-compatible
for protocol in range(pickle.HIGHEST_PROTOCOL + 1):
    serialized = pickle.dumps(data, protocol=protocol)
    print(f"Protocol {protocol}: {len(serialized)} bytes")
# Protocol 0: largest (ASCII-based)
# Protocol 5 (Python 3.8+): smallest (binary, supports out-of-band buffers)
```

| Protocol | Python Version | Format | Notes |
|----------|---------------|--------|-------|
| 0 | All | ASCII text | Most compatible, largest |
| 1 | All | Binary | Supports class instances |
| 2 | 2.3+ | Binary | Efficient new-style classes |
| 3 | 3.0+ | Binary | Default in Python 3.0–3.7 |
| 4 | 3.4+ | Binary | Large objects, very large frames |
| 5 | 3.8+ | Binary | Out-of-band buffer support |

### 7.5.3 Security: Why Unpickling Untrusted Data Is Dangerous

> ⚠️ **NEVER unpickle data from untrusted sources.** Pickle can execute arbitrary code during deserialization.

```python
import pickle
import io

# Malicious pickle can run ANY code:
class Exploit:
    def __reduce__(self):
        import os
        return (os.system, ("echo 'YOU HAVE BEEN HACKED'",))

# Pickling this object and unpickling it executes the command!
payload = pickle.dumps(Exploit())
pickle.loads(payload)  # Runs: echo 'YOU HAVE BEEN HACKED'
```

**If you must unpickle untrusted data, use a restricted Unpickler:**

```python
import pickle

class SafeUnpickler(pickle.Unpickler):
    """Only allow specific safe classes to be unpickled."""
    ALLOWED_CLASSES = {
        "builtins": {"set", "frozenset", "dict", "list", "tuple"},
    }

    def find_class(self, module, name):
        if module in self.ALLOWED_CLASSES and name in self.ALLOWED_CLASSES[module]:
            return super().find_class(module, name)
        raise pickle.UnpicklingError(f"Forbidden: {module}.{name}")

# Usage
data = pickle.dumps({"safe": "data"})
restored = SafeUnpickler(io.BytesIO(data)).load()
```

### 7.5.4 The `shelve` Module — Persistent Dictionary

`shelve` provides a dictionary-like interface backed by pickle on disk:

```python
import shelve

# Write
with shelve.open("mydata") as db:
    db["users"] = ["Alice", "Bob", "Charlie"]
    db["config"] = {"debug": True, "port": 8080}

# Read
with shelve.open("mydata") as db:
    print(db["users"])       # ['Alice', 'Bob', 'Charlie']
    print(db["config"])      # {'debug': True, 'port': 8080}
    print(list(db.keys()))   # ['users', 'config']
```

> **Note:** `shelve` is convenient but has limitations — keys must be strings, writes aren't always atomic, and it uses pickle under the same security constraints.

### 7.5.5 JSON vs Pickle vs Marshal

| Feature | JSON | Pickle | Marshal |
|---------|------|--------|---------|
| **Format** | Text (human-readable) | Binary (opaque) | Binary (opaque) |
| **Cross-language** | ✅ Yes | ❌ Python only | ❌ CPython only |
| **Types supported** | Basic types | Almost all Python types | Code objects |
| **Sets, tuples** | ❌ (arrays only) | ✅ Native | ❌ No |
| **`datetime`, `bytes`** | Needs custom encoder | ✅ Native | ❌ No |
| **Security** | ✅ Safe | ⚠️ **Dangerous** | ⚠️ **Dangerous** |
| **Speed** | Moderate | Fast | Very fast |
| **File size** | Larger | Smaller | Smallest |
| **Stability** | ✅ Stable across versions | ⚠️ Protocol changes | ❌ Internal use only |
| **Use case** | APIs, config, data exchange | Caching, ML models | `.pyc` files only |

> **Rule of thumb:** Use JSON by default. Use Pickle only for trusted, Python-only pipelines. Never use Marshal directly — it's an internal CPython format.

---

## 7.6 pathlib — Modern Path Handling

`pathlib` provides an object-oriented, cross-platform approach to file system paths. It's the recommended replacement for `os.path` in all new code.

### 7.6.1 Creating Path Objects

```python
from pathlib import Path

p1 = Path(".")                      # current directory
p2 = Path("data", "files")          # data/files
p3 = Path("/usr/bin/python3")       # absolute path
p4 = Path.home()                    # user home directory
p5 = Path.cwd()                     # current working directory

# Path objects are cross-platform — use forward slashes on all OS
p6 = Path("src") / "utils" / "helpers.py"   # src/utils/helpers.py
```

### 7.6.2 Path Properties and Decomposition

```python
from pathlib import Path

p = Path("/home/user/documents/report.pdf")

p.name        # "report.pdf"
p.stem        # "report"  (name without suffix)
p.suffix      # ".pdf"
p.parent      # Path("/home/user/documents")
p.parts       # ('/', 'home', 'user', 'documents', 'report.pdf')
p.is_absolute()   # True
p.exists()        # True or False
p.is_file()       # True
p.is_dir()        # False
```

### 7.6.3 The `/` Operator, `joinpath`, and Building Paths

```python
from pathlib import Path

# The / operator joins paths naturally
base = Path("/project")
config = base / "config" / "settings.yaml"
print(config)   # /project/config/settings.yaml

# joinpath — equivalent to /
config2 = base.joinpath("config", "settings.yaml")

# Modify paths
new_path = p.with_name("summary.pdf")       # Change filename
new_path = p.with_suffix(".txt")            # Change extension
new_path = p.parent / "new_report.pdf"      # Replace in parent
```

### 7.6.4 Globbing and Searching

```python
from pathlib import Path

project = Path(".")

# Find all Python files recursively
py_files = list(project.rglob("*.py"))

# Find .txt files only in immediate directory
txt_files = list(project.glob("*.txt"))

# Pattern matching
for p in project.glob("**/test_*.py"):
    print(p)
```

| Pattern | Meaning |
|---------|---------|
| `*.py` | All `.py` files in current dir |
| `**/*.py` | All `.py` files recursively |
| `**/` | All directories recursively |
| `src/**/test_*.py` | Test files anywhere under `src/` |

### 7.6.5 Reading and Writing with Path

```python
from pathlib import Path

p = Path("notes.txt")

# Write
p.write_text("Hello, pathlib!\n", encoding="utf-8")

# Read
content = p.read_text(encoding="utf-8")

# Binary
p.write_bytes(b"\x89PNG\r\n")
data = p.read_bytes()
```

### 7.6.6 File Info: `stat`, `exists`, `is_file`, `is_dir`

```python
from pathlib import Path

p = Path("chapter-07.md")

if p.exists():
    st = p.stat()
    print(f"Size: {st.st_size:,} bytes")
    print(f"Modified: {st.st_mtime}")

# Safe existence checks before operations
if p.is_file():
    content = p.read_text()

if p.is_dir():
    for child in p.iterdir():
        print(child.name)
```

### 7.6.7 Directory Operations

```python
from pathlib import Path

# Create directories
Path("output/data").mkdir(parents=True, exist_ok=True)
# parents=True creates intermediate dirs; exist_ok=True won't error if exists

# List directory contents
for p in Path(".").iterdir():
    print(f"{p.name:30s} {'DIR' if p.is_dir() else 'FILE'}")

# Rename / move
p = Path("old_name.txt")
p.rename("new_name.txt")

# Delete
Path("temp_file.txt").unlink()            # delete a file
Path("temp_file.txt").unlink(missing_ok=True)  # no error if missing
Path("empty_dir").rmdir()                 # delete empty directory
```

### 7.6.8 pathlib vs os.path

| Feature | `os.path` | `pathlib` |
|---------|-----------|-----------|
| Join paths | `os.path.join("a", "b")` | `Path("a") / "b"` |
| Get name | `os.path.basename(p)` | `Path(p).name` |
| Get dir | `os.path.dirname(p)` | `Path(p).parent` |
| Extension | `os.path.splitext(p)[1]` | `Path(p).suffix` |
| Exists | `os.path.exists(p)` | `Path(p).exists()` |
| Read file | `open(p).read()` | `Path(p).read_text()` |
| Create dir | `os.makedirs(p, exist_ok=True)` | `Path(p).mkdir(parents=True, exist_ok=True)` |
| Glob | `glob.glob("**/*.py")` | `Path(".").rglob("*.py")` |
| Cross-platform | Yes | Yes |
| OOP design | No (string-based) | Yes (method chaining) |

> **Recommendation:** Use `pathlib` for all new code. It's cleaner, more readable, and handles cross-platform concerns elegantly.

---

## 7.7 Working with YAML

### 7.7.1 PyYAML Basics

```python
import yaml

# Parse YAML
yaml_text = """
server:
  host: localhost
  port: 8080
  debug: true
features:
  - authentication
  - logging
  - caching
"""
config = yaml.safe_load(yaml_text)
print(config["server"]["host"])       # "localhost"
print(config["features"])            # ['authentication', 'logging', 'caching']
```

### 7.7.2 Writing YAML

```python
import yaml

data = {
    "database": {
        "host": "localhost",
        "port": 5432,
        "credentials": {"user": "admin", "password": "secret"},
    },
    "cache_enabled": True,
}

with open("config.yaml", "w", encoding="utf-8") as f:
    yaml.dump(data, f, default_flow_style=False, sort_keys=False)
```

Output:

```yaml
database:
  host: localhost
  port: 5432
  credentials:
    user: admin
    password: secret
cache_enabled: true
```

### 7.7.3 Loading and Dumping Complex Structures

```python
import yaml

# YAML handles nested structures, anchors, and multi-line strings natively
complex_yaml = """
defaults: &defaults
  adapter: postgres
  host: localhost

development:
  <<: *defaults
  database: dev_db

production:
  <<: *defaults
  database: prod_db
  pool_size: 20
"""

config = yaml.safe_load(complex_yaml)
print(config["development"]["adapter"])  # "postgres"
print(config["production"]["pool_size"]) # 20
```

### 7.7.4 Security Considerations

> ⚠️ **Always use `yaml.safe_load()`**, never `yaml.load()` without a Loader. Unsafe loading can execute arbitrary Python code.

```python
import yaml

# SAFE — only loads basic Python types
config = yaml.safe_load(open("config.yaml"))

# UNSAFE — DON'T DO THIS:
# dangerous = yaml.load(open("bad.yaml"), Loader=yaml.FullLoader)
```

```python
# Malicious YAML can execute code:
# !!python/object/apply:os.system ['rm -rf /']
```

| Loader | Supported Types | Safety |
|--------|----------------|--------|
| `yaml.safe_load` | dict, list, str, int, float, bool, None | ✅ Safe |
| `yaml.FullLoader` | Adds Python tags (set, etc.) | ⚠️ Mostly safe |
| `yaml.UnsafeLoader` | All Python objects | ❌ Dangerous |

---

## 7.8 Working with SQLite

### 7.8.1 Creating Tables

`sqlite3` is included in the Python standard library — no installation needed:

```python
import sqlite3

conn = sqlite3.connect("app.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
conn.commit()
conn.close()
```

### 7.8.2 CRUD Operations with Parameterized Queries

> ⚠️ **Never use string formatting to build SQL queries.** Always use parameterized queries to prevent SQL injection.

```python
import sqlite3

conn = sqlite3.connect("app.db")
conn.row_factory = sqlite3.Row       # access columns by name

# --- CREATE ---
conn.execute(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    ("Alice", "alice@example.com"),
)
conn.commit()

# --- READ ---
cursor = conn.execute("SELECT * FROM users WHERE name = ?", ("Alice",))
user = cursor.fetchone()
print(dict(user))   # {'id': 1, 'name': 'Alice', 'email': 'alice@example.com', ...}

# --- UPDATE ---
conn.execute(
    "UPDATE users SET email = ? WHERE name = ?",
    ("newalice@example.com", "Alice"),
)
conn.commit()

# --- DELETE ---
conn.execute("DELETE FROM users WHERE name = ?", ("Alice",))
conn.commit()

conn.close()
```

### 7.8.3 Using Context Managers for Database Connections

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db(db_path: str = "app.db"):
    """Provide a transactional database connection."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Usage
with get_db() as db:
    db.execute("INSERT INTO users (name, email) VALUES (?, ?)", ("Bob", "bob@example.com"))
    users = db.execute("SELECT * FROM users").fetchall()
    for u in users:
        print(u["name"], u["email"])
```

### 7.8.4 Row Factory for Dict-Like Access

```python
import sqlite3

conn = sqlite3.connect("app.db")

# Default — rows are tuples
cursor = conn.execute("SELECT * FROM users")
row = cursor.fetchone()
print(row)         # (1, 'Alice', 'alice@example.com', '2026-07-01 12:00:00')

# With Row factory — access by column name
conn.row_factory = sqlite3.Row
cursor = conn.execute("SELECT * FROM users")
row = cursor.fetchone()
print(dict(row))   # {'id': 1, 'name': 'Alice', 'email': 'alice@example.com', ...}
```

### 7.8.5 Batch Operations

```python
import sqlite3

data = [
    ("Alice", "alice@example.com"),
    ("Bob", "bob@example.com"),
    ("Charlie", "charlie@example.com"),
]

with sqlite3.connect("app.db") as conn:
    conn.executemany(
        "INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)",
        data,
    )
    conn.commit()
```

---

## 7.9 Working with APIs (requests)

### 7.9.1 GET Requests

```python
import requests

response = requests.get("https://jsonplaceholder.typicode.com/posts/1")

if response.ok:
    data = response.json()
    print(data["title"])
else:
    print(f"Error: {response.status_code}")
```

### 7.9.2 POST, PUT, DELETE

```python
import requests

# POST — create a resource
payload = {"title": "New Post", "body": "Content here", "userId": 1}
response = requests.post(
    "https://jsonplaceholder.typicode.com/posts",
    json=payload,                    # sets Content-Type: application/json automatically
)
print(response.status_code)   # 201 Created
print(response.json())        # created resource with new `id`

# PUT — replace a resource
response = requests.put(
    "https://jsonplaceholder.typicode.com/posts/1",
    json={"title": "Updated", "body": "New content", "userId": 1},
)

# DELETE — remove a resource
response = requests.delete("https://jsonplaceholder.typicode.com/posts/1")
```

### 7.9.3 Headers, Params, and Timeouts

```python
import requests

# Custom headers + query params
response = requests.get(
    "https://api.example.com/search",
    headers={"Authorization": "Bearer YOUR_TOKEN"},
    params={"q": "python", "page": 1, "per_page": 10},
    timeout=(3.05, 30),          # (connect_timeout, read_timeout)
)
```

### 7.9.4 Error Handling with `raise_for_status()`

```python
import requests
from requests.exceptions import Timeout, ConnectionError, HTTPError

try:
    response = requests.get(
        "https://api.example.com/data",
        timeout=(3.05, 30),
    )
    response.raise_for_status()       # raises HTTPError for 4xx/5xx
    data = response.json()

except Timeout:
    print("Request timed out")
except ConnectionError:
    print("Connection failed")
except HTTPError as e:
    print(f"HTTP error: {e.response.status_code}")
except requests.exceptions.JSONDecodeError:
    print("Response was not valid JSON")
```

### 7.9.5 Sessions for Connection Pooling

```python
import requests

# A Session reuses the underlying TCP connection (connection pooling)
with requests.Session() as session:
    session.headers.update({"Authorization": "Bearer YOUR_TOKEN"})

    # Both requests share the same connection pool
    r1 = session.get("https://api.example.com/users")
    r2 = session.get("https://api.example.com/orders")
```

### 7.9.6 Response Object Reference

| Property/Method | Description |
|-----------------|-------------|
| `response.status_code` | HTTP status (200, 404, etc.) |
| `response.ok` | `True` if status < 400 |
| `response.json()` | Parse JSON body |
| `response.text` | Body as string |
| `response.content` | Body as bytes |
| `response.headers` | Response headers (dict-like) |
| `response.elapsed` | Time taken (`timedelta`) |
| `response.raise_for_status()` | Raises `HTTPError` on 4xx/5xx |

---

## 7.10 Temporary Files and Directories

### 7.10.1 The `tempfile` Module

```python
import tempfile

# --- TemporaryFile — unnamed, auto-deleted on close ---
with tempfile.TemporaryFile(mode="w+t") as f:
    f.write("temporary data\n")
    f.seek(0)
    print(f.read())
# File is deleted when exiting the `with` block

# --- NamedTemporaryFile — has a file name ---
with tempfile.NamedTemporaryFile(suffix=".csv", delete=True) as f:
    f.write(b"id,name\n1,Alice\n")
    f.flush()
    print(f.name)       # e.g., /tmp/tmp12345.csv
    # File exists while `with` block is open; deleted on exit (if delete=True)

# --- TemporaryDirectory ---
with tempfile.TemporaryDirectory() as tmpdir:
    print(f"Created: {tmpdir}")
    # Create files inside tmpdir
    # Everything in tmpdir is deleted when exiting the `with` block
```

### 7.10.2 Getting the System Temp Directory

```python
import tempfile

print(tempfile.gettempdir())   # e.g., /tmp on Linux, C:\Users\...\AppData\Local\Temp on Windows
```

### 7.10.3 Choosing the Right Tool

| Tool | Purpose | Auto-deleted? |
|------|---------|---------------|
| `TemporaryFile` | Anonymous file (no path) | ✅ Yes |
| `NamedTemporaryFile` | File with a visible path | ✅ Yes (default) |
| `TemporaryDirectory` | Auto-cleaned directory | ✅ Yes |
| `mkdtemp()` | Create temp dir, manual cleanup | ❌ Manual |
| `mkstemp()` | Create temp file, manual cleanup | ❌ Manual |

---

## 7.11 Working with Archives

### 7.11.1 Zip Files

```python
import zipfile

# --- Create a zip archive ---
with zipfile.ZipFile("archive.zip", "w") as zf:
    zf.write("file1.txt")              # stores as file1.txt
    zf.write("file2.txt", arcname="data/file2.txt")  # custom archive path

# --- Read a zip archive ---
with zipfile.ZipFile("archive.zip") as zf:
    print(zf.namelist())               # ['file1.txt', 'data/file2.txt']
    content = zf.read("file1.txt")     # bytes

# --- Extract ---
with zipfile.ZipFile("archive.zip") as zf:
    zf.extractall("output_dir")

# --- Append to existing zip ---
with zipfile.ZipFile("archive.zip", "a") as zf:
    zf.write("file3.txt")
```

### 7.11.2 Tar Files

```python
import tarfile

# Create a tar.gz (gzip compressed)
with tarfile.open("archive.tar.gz", "w:gz") as tar:
    tar.add("file1.txt")
    tar.add("file2.txt", arcname="data/file2.txt")

# Read
with tarfile.open("archive.tar.gz", "r:gz") as tar:
    for member in tar.getmembers():
        print(f"{member.name:30s} {member.size:,} bytes")

# Extract all
with tarfile.open("archive.tar.gz", "r:gz") as tar:
    tar.extractall("output_dir")
```

### 7.11.3 Compression with gzip and bz2

```python
import gzip
import bz2

# gzip — compress a text file
with gzip.open("data.txt.gz", "wt", encoding="utf-8") as f:
    f.write("This text will be compressed\n")

with gzip.open("data.txt.gz", "rt", encoding="utf-8") as f:
    content = f.read()

# bz2 — higher compression ratio
with bz2.open("data.txt.bz2", "wt", encoding="utf-8") as f:
    f.write("This text will be compressed with bzip2\n")

with bz2.open("data.txt.bz2", "rt", encoding="utf-8") as f:
    content = f.read()
```

### 7.11.4 Archive Format Reference

| Archive Type | Module | Compression | Use Case |
|-------------|--------|-------------|----------|
| `.zip` | `zipfile` | Yes (deflate) | Cross-platform, widely supported |
| `.tar` | `tarfile` | No | Unix archives |
| `.tar.gz` | `tarfile` | gzip | Linux distributions, Python packages |
| `.tar.bz2` | `tarfile` | bzip2 | Higher compression |
| `.tar.xz` | `tarfile` | xz/lzma | Maximum compression |
| `.gz` | `gzip` | gzip | Single-file compression |
| `.bz2` | `bz2` | bzip2 | Single-file, higher ratio |

> ⚠️ **Security:** Always validate paths before extracting archives to prevent **path traversal attacks** (e.g., a malicious entry like `../../etc/passwd`).

---

## 7.12 File System Operations

### 7.12.1 shutil.copy and shutil.copy2

```python
import shutil

# Copy a file (preserves permissions)
shutil.copy("source.txt", "destination.txt")

# Copy a file (preserves metadata — permissions, timestamps)
shutil.copy2("source.txt", "destination.txt")

# Copy entire directory tree
shutil.copytree("src_project", "dst_project")

# Copy tree, ignoring certain files
shutil.copytree(
    "src_project",
    "dst_project",
    ignore=shutil.ignore_patterns("*.pyc", "__pycache__", ".git"),
)
```

### 7.12.2 shutil.move

```python
import shutil

# Move file or directory
shutil.move("old_location/file.txt", "new_location/file.txt")

# Rename (same as move on the same filesystem)
shutil.move("old_name.txt", "new_name.txt")
```

### 7.12.3 shutil.rmtree — DANGEROUS

```python
import shutil

# Remove an entire directory tree — USE WITH EXTREME CAUTION
# shutil.rmtree("build_output")  # ⚠️ Deletes everything recursively

# Safer: ignore errors
shutil.rmtree("build_output", ignore_errors=True)

# Safest: dry run first, then delete
import os

for root, dirs, files in os.walk("build_output", topdown=False):
    for name in files:
        os.remove(os.path.join(root, name))
    for name in dirs:
        os.rmdir(os.path.join(root, name))
```

> ⚠️ **`shutil.rmtree()` is irreversible.** There is no recycle bin. Always verify the path before calling it. Consider adding a confirmation prompt or a dry-run mode.

### 7.12.4 shutil.disk_usage

```python
import shutil

usage = shutil.disk_usage("/")
print(f"Total:     {usage.total / (1024**3):.1f} GB")
print(f"Used:      {usage.used / (1024**3):.1f} GB")
print(f"Free:      {usage.free / (1024**3):.1f} GB")
```

### 7.12.5 os.walk for Directory Traversal

```python
import os

# Walk a directory tree
for root, dirs, files in os.walk("/project"):
    level = root.replace("/project", "").count(os.sep)
    indent = " " * 2 * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = " " * 2 * (level + 1)
    for file in files:
        print(f"{subindent}{file}")
```

### 7.12.6 glob.glob for File Pattern Matching

```python
import glob

# Simple pattern matching
py_files = glob.glob("src/**/*.py", recursive=True)
log_files = glob.glob("/var/log/*.log")

for f in py_files:
    print(f)
```

### 7.12.7 shutil.make_archive

```python
import shutil

# Create a zip archive of a directory
shutil.make_archive("backup", "zip", "project_dir")
# Creates backup.zip containing project_dir

# Create a tar.gz archive
shutil.make_archive("backup", "gztar", "project_dir")
# Creates backup.tar.gz
```

---

## Serialization Format Comparison

```
┌──────────────────────────────────────────────────────────────────────────┐
│                SERIALIZATION FORMAT COMPARISON                           │
│                                                                          │
│  Feature         JSON      Pickle     CSV      YAML     SQLite          │
│  ───────         ────      ──────     ───      ────     ──────          │
│  Readable?       ✅ Yes    ❌ No      ✅ Yes   ✅ Yes   ❌ Binary       │
│  Cross-lang?     ✅ Yes    ❌ Python   ✅ Yes   ✅ Yes   ✅ Yes          │
│  Schema?         ❌ No     ❌ No      Header   ❌ No     ✅ Yes          │
│  Speed           Moderate  Fast       Moderate Moderate  Fast            │
│  Size            Larger    Smallest   Compact  Compact   Varies          │
│  Nesting?        ✅ Yes    ✅ Yes     ❌ Flat   ✅ Yes   Tables only    │
│  Binary data?    ❌ No     ✅ Yes     ❌ No     ❌ No    BLOBs          │
│  Query?          ❌ Manual  ❌ Manual  ❌ Manual ❌ Manual ✅ SQL         │
│  Streaming?      ⚠️ jsonl  ⚠️ Records ✅ Line   ⚠️ Custom ✅ Cursor     │
│                                                                          │
│  BEST FOR:                                                                │
│  JSON   → APIs, config, cross-language data exchange                     │
│  Pickle → Caching Python objects, ML model persistence (trusted only)    │
│  CSV    → Tabular data, spreadsheets, data import/export                 │
│  YAML   → Configuration files, human-editable settings                  │
│  SQLite → Structured data, queries, relationships, integrity             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Always use `with` statements** to ensure files are properly closed, even when exceptions occur.
2. **Specify `encoding="utf-8"`** explicitly when opening text files — don't rely on platform defaults.
3. **Iterate directly over file objects** for memory-efficient line-by-line reading of large files.
4. **Context managers** implement `__enter__`/`__exit__` — use `@contextmanager` for lightweight custom ones, and `ExitStack` for dynamic resource management.
5. **Use the `csv` module** instead of splitting CSV manually — quoting and escaping edge cases are complex.
6. **JSON is the default serialization format** for APIs, config, and cross-language data. Use `json.JSONEncoder` for custom types.
7. **Never unpickle untrusted data** — pickle can execute arbitrary code during deserialization.
8. **Use `pathlib.Path`** for all new file path operations — it's cleaner and more Pythonic than `os.path`.
9. **Always use `yaml.safe_load()`**, never `yaml.load()` without a Loader — unsafe loading can execute arbitrary code.
10. **Use parameterized queries** (`?` placeholders) with SQLite to prevent SQL injection attacks.
11. **Set timeouts on every HTTP request** and use `raise_for_status()` for proper error handling.
12. **Use `TemporaryFile` and `TemporaryDirectory`** for auto-cleaned temporary resources — they're safer than manual cleanup.
13. **Validate archive extraction paths** before calling `extractall()` to prevent path traversal attacks.
14. **Never use `shutil.rmtree()` without confirming the target** — deleted files are gone permanently.

---

## Practice Exercises

### Exercise 1: Line Counter

Write a function that counts lines, words, and characters in a text file:

```python
def count_file_stats(filepath: str) -> dict[str, int]:
    """Count lines, words, and characters in a file.

    Returns:
        A dict with keys: "lines", "words", "chars".
    """
    # Your implementation here
    # Handle FileNotFoundError gracefully
    pass

# Test
# stats = count_file_stats("chapter-07.md")
# print(f"Lines: {stats['lines']}, Words: {stats['words']}, Chars: {stats['chars']}")
```

### Exercise 2: CSV Report Generator

Build a function that reads a CSV of sales data and generates a summary report:

```python
import csv

def generate_sales_report(csv_path: str, output_path: str) -> None:
    """Read sales.csv and write a summary report to output_path.

    Expected CSV columns: Date, Product, Region, Revenue, Units

    Report should include:
    - Total revenue
    - Top 3 products by revenue
    - Revenue by region
    - Write the report as a plain text file
    """
    # Your implementation here
    pass
```

### Exercise 3: JSON Config Merger

Write a function that deep-merges two JSON config files:

```python
import json

def merge_configs(base_path: str, override_path: str, output_path: str) -> dict:
    """Deep-merge two JSON config files.

    Rules:
    - override values take precedence
    - Nested dicts are merged recursively
    - Lists are replaced (not merged)
    - Write merged result to output_path
    - Return the merged dict
    """
    # Your implementation here
    pass

# Test
# base = {"server": {"host": "localhost", "port": 8080}, "debug": False}
# override = {"server": {"port": 9000}, "debug": True, "new_key": "hello"}
# Expected: {"server": {"host": "localhost", "port": 9000}, "debug": True, "new_key": "hello"}
```

### Exercise 4: File Organizer

Write a script that organizes files in a directory by extension:

```python
import shutil
from pathlib import Path

def organize_directory(source: str, dry_run: bool = True) -> dict[str, list[str]]:
    """Organize files by extension into subdirectories.

    Rules:
    - .py files → python/
    - .jpg, .png, .gif files → images/
    - .pdf, .docx, .txt files → documents/
    - Everything else → other/

    Args:
        source: Directory to organize.
        dry_run: If True, only report what would happen.

    Returns:
        Dict mapping category names to lists of filenames.
    """
    # Your implementation here
    pass

# Test
# result = organize_directory("./downloads", dry_run=True)
# for category, files in result.items():
#     print(f"{category}: {len(files)} files")
```

### Exercise 5: SQLite Blog Database

Build a complete blog database with CRUD operations:

```python
import sqlite3
from contextlib import contextmanager

@contextmanager
def get_blog_db(db_path: str = "blog.db"):
    """Create a blog database connection with auto-commit/rollback."""
    # Your implementation here
    pass

def init_db(db_path: str = "blog.db") -> None:
    """Create the posts and comments tables.

    posts: id, title, body, author, created_at
    comments: id, post_id (FK), author, body, created_at
    """
    # Your implementation here
    pass

def create_post(db, title: str, body: str, author: str) -> int:
    """Insert a post and return its ID."""
    # Your implementation here
    pass

def get_post_with_comments(db, post_id: int) -> dict:
    """Return a post and its comments as a nested dict."""
    # Your implementation here
    pass

def search_posts(db, keyword: str) -> list[dict]:
    """Full-text search posts by keyword in title or body."""
    # Your implementation here
    pass
```

---

*In the next chapter, we'll explore Python's powerful concurrency and parallelism — threads, processes, asyncio, and how to write programs that do multiple things at once.*
