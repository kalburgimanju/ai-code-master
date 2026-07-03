# Chapter 10: Concurrency & Parallelism

Modern applications rarely do just one thing at a time. A web server handles thousands of simultaneous connections. A data pipeline reads from a disk while writing to a database. A GUI keeps responding while computing results in the background. Python provides several powerful tools for doing multiple things at once — but choosing the *right* tool for the *right* job is one of the most important decisions you'll make as a Python developer.

This chapter dives deep into Python's concurrency and parallelism primitives: threads, processes, and async/await. You'll learn not just the APIs, but the underlying mental models, synchronization strategies, and performance trade-offs that separate a working concurrent program from a correct and efficient one.

---

## 10.1 Concurrency vs Parallelism

### Definitions

**Concurrency** is about *dealing* with multiple things at once. A single person can cook a meal by chopping vegetables, then stirring the pot while the water heats — interleaving tasks to make progress on all of them without finishing any single one faster.

**Parallelism** is about *doing* multiple things at once. Two chefs working side by side can chop vegetables and stir the pot simultaneously — the wall-clock time for the overall task decreases because work happens on separate hardware.

### The Key Difference

```
┌─────────────────────────────────────────────────────────────┐
│                     CONCURRENCY                             │
│                                                             │
│  Task A: ████░░░░████░░░░████░░░░                          │
│  Task B: ░░░░████░░░░████░░░░████                          │
│                                                             │
│  One CPU core switching between tasks (interleaving)        │
│  ─────────────────────────────────────────────────────────  │
│                     PARALLELISM                             │
│                                                             │
│  CPU Core 1: Task A: ████████████████████                   │
│  CPU Core 2: Task B: ████████████████████                   │
│                                                             │
│  Multiple CPU cores running tasks simultaneously            │
└─────────────────────────────────────────────────────────────┘
```

### When to Use Which

| Scenario | Best Approach | Why |
|---|---|---|
| Downloading 100 web pages | Threading or asyncio | I/O-bound — threads alternate while waiting for network |
| Processing 100 large images | Multiprocessing | CPU-bound — multiple cores do real computation |
| Handling 10,000 web requests | asyncio | I/O-bound — thousands of lightweight tasks with minimal memory |
| Reading files while computing | Threading | One task is I/O, one is CPU; threads let them overlap |
| Matrix multiplication | Multiprocessing | CPU-bound — pure computation benefits from cores |

### The Decision Tree

```
                    Is your workload...
                           │
              ┌────────────┴────────────┐
              │                         │
         I/O-bound?                CPU-bound?
              │                         │
     ┌────────┴────────┐       ┌────────┴────────┐
     │                 │       │                 │
  High latency?   Low latency?  Multiple cores   Single core
     │                 │         available?      sufficient?
     │                 │            │                │
     ▼                 ▼            ▼                ▼
  asyncio        Threading     Multiprocessing  Threading is
  or threading                  or concurrent.   fine — GIL
                            futures (Process)    doesn't matter
```

### I/O-Bound vs CPU-Bound

An **I/O-bound** program spends most of its time waiting for external resources — network responses, disk reads, database queries, user input. The CPU is idle during these waits, so another thread can run.

A **CPU-bound** program spends most of its time doing arithmetic, string manipulation, or data transformation. The CPU is the bottleneck, so you need multiple cores (and multiple processes) to speed things up.

The Python GIL (Global Interpreter Lock) means that even in a multi-threaded program, only one thread executes Python bytecode at a time. This makes threading excellent for I/O-bound work (threads release the GIL while waiting) but ineffective for CPU-bound work (threads can't truly run in parallel).

---

## 10.2 Threading

Python's `threading` module provides a high-level interface for creating and managing threads. Each thread runs its own function, and the operating system schedules them to run (possibly on the same core).

### Thread Creation and Starting

The most basic pattern is creating a `Thread` object and calling `start()`:

```python
import threading
import time


def download_page(url: str) -> None:
    """Simulate downloading a web page."""
    print(f"[{threading.current_thread().name}] Starting download from {url}")
    time.sleep(2)  # Simulate network delay
    print(f"[{threading.current_thread().name}] Finished downloading from {url}")


def main() -> None:
    urls = [
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3",
        "https://example.com/page4",
    ]

    threads: list[threading.Thread] = []
    start_time = time.perf_counter()

    for url in urls:
        thread = threading.Thread(target=download_page, args=(url,))
        threads.append(thread)
        thread.start()

    # Wait for all threads to complete
    for thread in threads:
        thread.join()

    elapsed = time.perf_counter() - start_time
    print(f"\nAll downloads completed in {elapsed:.2f} seconds")


if __name__ == "__main__":
    main()
```

Without threading, the four 2-second downloads would take ~8 seconds total. With threading, they overlap and complete in ~2 seconds.

### Using `target` with Keyword Arguments

You can pass keyword arguments to the target function:

```python
def fetch(url: str, timeout: int = 30, retries: int = 3) -> None:
    print(f"Fetching {url} (timeout={timeout}, retries={retries})")
    time.sleep(1)


# Pass keyword arguments via kwargs dict
thread = threading.Thread(
    target=fetch,
    kwargs={"url": "https://example.com", "timeout": 10, "retries": 5},
)
thread.start()
thread.join()
```

### Subclassing Thread

For more complex work, you can subclass `threading.Thread` and override `run()`:

```python
import threading
import time


class DownloadWorker(threading.Thread):
    """A thread that downloads content from a URL."""

    def __init__(self, url: str, timeout: int = 30) -> None:
        super().__init__(name=f"Download-{url.split('/')[-1]}")
        self.url = url
        self.timeout = timeout
        self.result: str | None = None
        self.error: Exception | None = None

    def run(self) -> None:
        """Override run() with the thread's work."""
        try:
            self.result = self._do_download()
        except Exception as exc:
            self.error = exc

    def _do_download(self) -> str:
        print(f"[{self.name}] Downloading {self.url}...")
        time.sleep(1.5)  # Simulate network I/O
        return f"<html>Content from {self.url}</html>"


def main() -> None:
    urls = ["https://example.com/a", "https://example.com/b", "https://example.com/c"]
    workers = [DownloadWorker(url) for url in urls]

    for w in workers:
        w.start()
    for w in workers:
        w.join()

    for w in workers:
        if w.error:
            print(f"  FAILED: {w.error}")
        else:
            print(f"  OK ({len(w.result)} chars)")


if __name__ == "__main__":
    main()
```

### The `join()` Method

`Thread.join(timeout=None)` blocks the calling thread until the target thread finishes. Without `join()`, the main thread would exit immediately, potentially killing daemon threads before they complete.

```python
def worker() -> None:
    time.sleep(1)
    print("Worker done")


thread = threading.Thread(target=worker)
thread.start()
thread.join()  # Main thread blocks here until worker finishes
print("Main continues after worker is done")
```

You can also use a timeout:

```python
thread.join(timeout=5.0)
if thread.is_alive():
    print("Thread did not finish within 5 seconds")
```

### Daemon Threads

Daemon threads are background threads that are automatically killed when all non-daemon (main) threads exit. They're useful for background tasks like heartbeats, log flushing, or monitoring.

```python
import threading
import time


def background_monitor() -> None:
    while True:
        print(f"  [monitor] Active threads: {threading.active_count()}")
        time.sleep(1)


def main() -> None:
    monitor = threading.Thread(target=background_monitor, daemon=True)
    monitor.start()

    # Main work
    print("Doing main work...")
    time.sleep(3)
    print("Main work done — daemon thread will be killed automatically")


if __name__ == "__main__":
    main()
```

Key rules for daemon threads:
- Daemon threads are killed abruptly — no cleanup, no `finally` blocks guaranteed to run
- Never do I/O cleanup (closing files, flushing buffers) in daemon threads
- Non-daemon threads keep the process alive; daemons don't

### Thread Lifecycle

```
┌───────────────────────────────────────────────────────────────┐
│                    THREAD LIFECYCLE                            │
│                                                               │
│  start()                                                      │
│     │                                                         │
│     ▼                                                         │
│  ┌──────────┐   run() completes   ┌──────────┐               │
│  │  STARTED │ ──────────────────▶ │  ENDED   │               │
│  └──────────┘                      └──────────┘               │
│     │                                                        │
│     │  (if join() is called, caller blocks                   │
│     │   until the thread reaches ENDED)                      │
│     │                                                        │
│     ▼                                                        │
│  ┌──────────┐                                                │
│  │ WAITING  │ ◀── join() called from another thread          │
│  │ ON JOIN  │                                                │
│  └──────────┘                                                │
│                                                               │
│  If daemon=True and all non-daemon threads exit:              │
│  ┌──────────┐                                                │
│  │ KILLED   │ ◀── interpreter shutdown                        │
│  │ (forced) │                                                │
│  └──────────┘                                                │
└───────────────────────────────────────────────────────────────┘
```

### The GIL and Its Impact

The **Global Interpreter Lock** (GIL) is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously.

**What the GIL means in practice:**

- **I/O-bound tasks**: The GIL is released during I/O operations (network, disk, sleep). Threads genuinely run concurrently for I/O-heavy workloads.
- **CPU-bound tasks**: Only one thread executes Python code at a time. Threads do *not* speed up computation — they actually add overhead from context switching.

```python
import threading
import time


def cpu_work(iterations: int) -> None:
    """Pure CPU work — no I/O."""
    total = 0
    for i in range(iterations):
        total += i * i


def main() -> None:
    iterations = 50_000_000

    # Single-threaded
    start = time.perf_counter()
    cpu_work(iterations)
    cpu_work(iterations)
    single_time = time.perf_counter() - start
    print(f"Single-threaded: {single_time:.2f}s")

    # Multi-threaded
    start = time.perf_counter()
    t1 = threading.Thread(target=cpu_work, args=(iterations,))
    t2 = threading.Thread(target=cpu_work, args=(iterations,))
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    multi_time = time.perf_counter() - start
    print(f"Multi-threaded:   {multi_time:.2f}s")
    print(f"Speedup:          {single_time / multi_time:.2f}x")


if __name__ == "__main__":
    main()
# Typical output:
# Single-threaded: 4.12s
# Multi-threaded:   4.38s      <-- SLOWER due to GIL + overhead
# Speedup:          0.94x
```

### Freeing the GIL with Extensions

Some operations release the GIL even for CPU work:
- `numpy` array operations (C-level loops)
- File I/O (`open().read()`)
- `time.sleep()` 
- `zlib.compress()` / `zlib.decompress()`
- `hashlib` operations

This is why numpy can speed up CPU-bound work with threads — the heavy lifting happens in C code that drops the GIL:

```python
import numpy as np
import threading
import time


def cpu_intensive() -> None:
    """NumPy operations release the GIL."""
    a = np.random.rand(1000, 1000)
    b = np.random.rand(1000, 1000)
    c = a @ b  # Matrix multiply — C code, releases GIL


def main() -> None:
    # Single-threaded
    start = time.perf_counter()
    for _ in range(4):
        cpu_intensive()
    single_time = time.perf_counter() - start

    # Multi-threaded — NumPy releases GIL during computation
    start = time.perf_counter()
    threads = [threading.Thread(target=cpu_intensive) for _ in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    multi_time = time.perf_counter() - start

    print(f"Single-threaded: {single_time:.2f}s")
    print(f"Multi-threaded:  {multi_time:.2f}s")
    print(f"Speedup:         {single_time / multi_time:.2f}x")


if __name__ == "__main__":
    main()
```

### Freeing the GIL: Python 3.13+ and the Free-Threaded Build

Python 3.13 introduced an experimental free-threaded build (`--disable-gil`) that removes the GIL entirely. This allows true multi-threaded parallelism for CPU-bound Python code:

```python
# To use the free-threaded build:
# 1. Install a free-threaded Python build
# 2. Run with: python -X gil=0 script.py
# 3. Or check at runtime:
import sys
if sys._is_gil_enabled():
    print("GIL is enabled")
else:
    print("GIL is disabled — true multi-threading available")
```

---

## 10.3 Thread Synchronization

When multiple threads access shared state, you need synchronization primitives to prevent data corruption and race conditions.

### Lock (Mutex)

A `Lock` ensures that only one thread can execute a critical section at a time:

```python
import threading


counter = 0
lock = threading.Lock()


def increment(n: int) -> None:
    global counter
    for _ in range(n):
        lock.acquire()
        try:
            counter += 1
        finally:
            lock.release()


def main() -> None:
    global counter
    n_per_thread = 100_000
    threads = [threading.Thread(target=increment, args=(n_per_thread,)) for _ in range(10)]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    expected = n_per_thread * 10
    print(f"Counter: {counter:,} (expected {expected:,})")
    assert counter == expected, "Race condition detected!"


if __name__ == "__main__":
    main()
```

The context manager form is cleaner and less error-prone:

```python
def increment(n: int) -> None:
    global counter
    for _ in range(n):
        with lock:  # Automatically acquires and releases
            counter += 1
```

### RLock (Reentrant Lock)

An `RLock` can be acquired multiple times by the same thread without deadlocking. It tracks which thread holds it and how many times:

```python
import threading


rlock = threading.RLock()


def nested_function() -> None:
    with rlock:
        print("  Outer acquisition OK")
        with rlock:  # Same thread can re-acquire
            print("  Inner acquisition OK")
        print("  Left inner, still holding outer")


def main() -> None:
    # Two threads compete for the same RLock
    t1 = threading.Thread(target=nested_function)
    t2 = threading.Thread(target=nested_function)
    t1.start()
    t2.start()
    t1.join()
    t2.join()


if __name__ == "__main__":
    main()
```

Use `RLock` when a function that acquires a lock calls another function that also acquires the same lock — the classic "nested locking" pattern.

### Condition Variables

A `Condition` object allows threads to wait until a certain condition is met. One thread signals the condition, and waiting threads wake up:

```python
import threading
import time


items: list[int] = []
condition = threading.Condition()


def producer() -> None:
    for i in range(5):
        with condition:
            items.append(i)
            print(f"  Produced: {i}")
            condition.notify()  # Wake one waiting consumer
        time.sleep(0.1)


def consumer() -> None:
    for _ in range(5):
        with condition:
            while not items:
                print("  Consumer waiting...")
                condition.wait()  # Release lock and wait for notify
            item = items.pop(0)
            print(f"  Consumed: {item}")


def main() -> None:
    prod = threading.Thread(target=producer)
    cons = threading.Thread(target=consumer)
    cons.start()
    prod.start()
    prod.join()
    cons.join()


if __name__ == "__main__":
    main()
```

Key `Condition` methods:
- `wait(timeout=None)` — release the lock, wait for notification, re-acquire the lock
- `notify(n=1)` — wake up `n` threads waiting on this condition
- `notify_all()` — wake up all waiting threads

### Semaphore and BoundedSemaphore

A `Semaphore` is a counter-based lock that allows a fixed number of threads to access a resource:

```python
import threading
import time


# Allow only 3 concurrent database connections
db_semaphore = threading.Semaphore(3)


def connect_to_db(connection_id: int) -> None:
    print(f"  Connection {connection_id} waiting for slot...")
    with db_semaphore:
        print(f"  Connection {connection_id} acquired slot")
        time.sleep(1)  # Simulate work
        print(f"  Connection {connection_id} released slot")


def main() -> None:
    threads = [threading.Thread(target=connect_to_db, args=(i,)) for i in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


if __name__ == "__main__":
    main()
```

A `BoundedSemaphore` is the same but raises an error if you release more times than you acquire:

```python
sem = threading.BoundedSemaphore(3)
sem.acquire()
sem.release()
# sem.release()  # Raises ValueError: semaphore released too many times
```

### Event Object

An `Event` is a simple flag that threads can wait on or set:

```python
import threading
import time


shutdown_event = threading.Event()


def worker(worker_id: int) -> None:
    while not shutdown_event.is_set():
        print(f"  Worker {worker_id} working...")
        time.sleep(0.5)
    print(f"  Worker {worker_id} shutting down")


def main() -> None:
    threads = [threading.Thread(target=worker, args=(i,)) for i in range(3)]
    for t in threads:
        t.start()

    time.sleep(2)
    print("\n  Setting shutdown event...")
    shutdown_event.set()  # All workers will see this and exit

    for t in threads:
        t.join()


if __name__ == "__main__":
    main()
```

### Barrier

A `Barrier` forces a group of threads to all reach a synchronization point before any can proceed:

```python
import threading
import time


barrier = threading.Barrier(3)


def phase(phase_name: str) -> None:
    for i in range(3):
        print(f"  Thread {threading.current_thread().name}: Phase {phase_name} step {i}")
        time.sleep(0.3)
    print(f"  Thread {threading.current_thread().name}: hit barrier")
    barrier.wait()  # Blocks until all 3 threads arrive
    print(f"  Thread {threading.current_thread().name}: proceeding past barrier")


def main() -> None:
    threads = [threading.Thread(target=phase, args=("A",)) for _ in range(3)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


if __name__ == "__main__":
    main()
```

### Race Conditions and How to Prevent Them

A **race condition** occurs when multiple threads read and write shared data without synchronization, and the result depends on the unpredictable order of execution.

```
┌─────────────────────────────────────────────────────────────────┐
│                   RACE CONDITION SCENARIO                        │
│                                                                  │
│  Shared variable: counter = 0                                    │
│                                                                  │
│  Thread A                    Thread B                            │
│  ────────                    ────────                            │
│  read counter → 0            read counter → 0                    │
│  increment: 0 + 1 = 1       increment: 0 + 1 = 1               │
│  write counter → 1           write counter → 1                   │
│                                                                  │
│  Expected result: 2                                              │
│  Actual result:   1  ← Thread B's increment was lost!            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Fix: Wrap the read-modify-write in a Lock:               │  │
│  │                                                            │  │
│  │  with lock:                                               │  │
│  │      counter = counter + 1                                │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

The classic "check then act" pattern is also a race condition:

```python
import threading


class Inventory:
    def __init__(self, stock: int = 10) -> None:
        self.stock = stock
        self.lock = threading.Lock()

    def sell(self, quantity: int = 1) -> bool:
        with self.lock:  # Prevents race between check and decrement
            if self.stock >= quantity:
                self.stock -= quantity
                return True
            return False


def main() -> None:
    inv = Inventory(stock=5)
    results: list[bool] = []
    lock = threading.Lock()

    def buy() -> None:
        result = inv.sell()
        with lock:
            results.append(result)

    threads = [threading.Thread(target=buy) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print(f"Successful sales: {sum(results)}/10")
    print(f"Remaining stock:  {inv.stock}")
    assert inv.stock >= 0, "Stock went negative!"


if __name__ == "__main__":
    main()
```

---

## 10.4 Thread Safety

### The Queue Module

The `queue` module provides thread-safe FIFO, LIFO, and priority queues. These are the backbone of producer-consumer patterns:

```python
import queue
import threading
import time


def producer(q: queue.Queue[str], producer_id: int) -> None:
    for i in range(5):
        item = f"item-{producer_id}-{i}"
        q.put(item)
        print(f"  Producer {producer_id}: put {item}")
        time.sleep(0.1)
    print(f"  Producer {producer_id}: done")


def consumer(q: queue.Queue[str], consumer_id: int) -> None:
    while True:
        try:
            item = q.get(timeout=2)
            print(f"  Consumer {consumer_id}: got {item}")
            time.sleep(0.2)  # Simulate processing
            q.task_done()
        except queue.Empty:
            break


def main() -> None:
    q: queue.Queue[str] = queue.Queue(maxsize=10)

    producers = [
        threading.Thread(target=producer, args=(q, i))
        for i in range(3)
    ]
    consumers = [
        threading.Thread(target=consumer, args=(q, i))
        for i in range(2)
    ]

    for t in consumers:
        t.start()
    for t in producers:
        t.start()

    for t in producers:
        t.join()
    q.join()  # Wait until all items have been processed

    print("All items processed")


if __name__ == "__main__":
    main()
```

### Queue Types

| Queue Type | Structure | Use Case |
|---|---|---|
| `queue.Queue` | FIFO | General-purpose work distribution |
| `queue.LifoQueue` | LIFO (stack) | Undo/redo, DFS traversal |
| `queue.PriorityQueue` | Priority-ordered | Task scheduling by priority |

```python
import queue


pq: queue.PriorityQueue[tuple[int, str]] = queue.PriorityQueue()
pq.put((3, "low priority"))
pq.put((1, "HIGH priority"))
pq.put((2, "medium priority"))

while not pq.empty():
    priority, task = pq.get()
    print(f"  Priority {priority}: {task}")

# Output:
#   Priority 1: HIGH priority
#   Priority 2: medium priority
#   Priority 3: low priority
```

### Atomic Operations in Python

Certain operations in CPython are atomic due to the GIL:
- `x += 1` is *not* atomic (it's actually `LOAD`, `ADD`, `STORE`)
- `list.append(x)` is atomic
- `dict[key] = value` is atomic
- `x = value` (simple assignment) is atomic

**Do not rely on this.** Use explicit locks for correctness and portability.

### Deadlock Detection and Prevention

A **deadlock** occurs when two or more threads are blocked, each waiting for the other to release a resource:

```
┌─────────────────────────────────────────────────────────────┐
│                     DEADLOCK SCENARIO                        │
│                                                              │
│  Thread A holds Lock 1, wants Lock 2                        │
│  Thread B holds Lock 2, wants Lock 1                        │
│                                                              │
│  Thread A                    Thread B                        │
│  ────────                    ────────                        │
│  acquire(Lock 1) ✓          acquire(Lock 2) ✓               │
│  acquire(Lock 2) ⟳ waiting  acquire(Lock 1) ⟳ waiting       │
│                                                              │
│  Neither thread can proceed → DEADLOCK                       │
└─────────────────────────────────────────────────────────────┘
```

**Prevention strategies:**

1. **Lock ordering**: Always acquire locks in the same global order.

```python
import threading


lock_a = threading.Lock()
lock_b = threading.Lock()


def safe_function() -> None:
    with lock_a:  # Always acquire A before B
        with lock_b:
            print("  Both locks acquired safely")


def main() -> None:
    threads = [threading.Thread(target=safe_function) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


if __name__ == "__main__":
    main()
```

2. **Try-acquire with timeout**: Avoid indefinite blocking.

```python
import threading
import time


lock_a = threading.Lock()
lock_b = threading.Lock()


def worker() -> None:
    while True:
        acquired_a = lock_a.acquire(timeout=1)
        if not acquired_a:
            continue
        try:
            acquired_b = lock_b.acquire(timeout=1)
            if not acquired_b:
                continue  # Back off and retry
            try:
                print(f"  {threading.current_thread().name}: both locks acquired")
                return
            finally:
                lock_b.release()
        finally:
            if acquired_a:
                lock_a.release()


def main() -> None:
    threads = [threading.Thread(target=worker, name=f"Worker-{i}") for i in range(4)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()


if __name__ == "__main__":
    main()
```

3. **Context managers** ensure locks are always released, even if exceptions occur.

---

## 10.5 Multiprocessing

The `multiprocessing` module spawns separate processes, each with its own Python interpreter and memory space. This bypasses the GIL entirely, allowing true parallel execution on multiple cores.

### Basic Process Creation

```python
import multiprocessing
import os
import time


def worker(name: str) -> None:
    print(f"  Worker {name} (PID {os.getpid()}) starting")
    time.sleep(1)
    print(f"  Worker {name} (PID {os.getpid()}) done")


def main() -> None:
    print(f"  Main process PID: {os.getpid()}")
    processes: list[multiprocessing.Process] = []

    for i in range(4):
        p = multiprocessing.Process(target=worker, args=(f"proc-{i}",))
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    print("  All processes completed")


if __name__ == "__main__":
    main()
```

### Memory Isolation

Each process has its own memory space. Modifying a variable in one process does not affect another:

```python
import multiprocessing


def modify_shared(shared_list: list[int]) -> None:
    """This modifies a COPY, not the original."""
    shared_list.append(999)
    print(f"  Child process sees: {shared_list}")


def main() -> None:
    shared_list = [1, 2, 3]
    p = multiprocessing.Process(target=modify_shared, args=(shared_list,))
    p.start()
    p.join()

    print(f"  Parent process sees: {shared_list}")
    # Parent still sees [1, 2, 3] — no modification occurred in parent


if __name__ == "__main__":
    main()
```

### Shared State with `multiprocessing.Value` and `multiprocessing.Array`

```python
import multiprocessing


def increment(counter: multiprocessing.Value) -> None:
    for _ in range(100_000):
        with counter.get_lock():
            counter.value += 1


def main() -> None:
    counter = multiprocessing.Value("i", 0)  # "i" = signed int, initial value 0

    processes = [multiprocessing.Process(target=increment, args=(counter,)) for _ in range(4)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()

    print(f"Counter: {counter.value:,}")
    assert counter.value == 400_000


if __name__ == "__main__":
    multiprocessing.set_start_method("fork")  # or "spawn" on Windows
    main()
```

### IPC with `multiprocessing.Queue`

```python
import multiprocessing
import time


def producer(q: multiprocessing.Queue) -> None:
    for i in range(5):
        q.put(f"message-{i}")
        print(f"  Produced: message-{i}")
        time.sleep(0.2)
    q.put(None)  # Sentinel value to signal completion


def consumer(q: multiprocessing.Queue) -> None:
    while True:
        msg = q.get()
        if msg is None:
            break
        print(f"  Consumed: {msg}")


def main() -> None:
    q = multiprocessing.Queue()
    prod = multiprocessing.Process(target=producer, args=(q,))
    cons = multiprocessing.Process(target=consumer, args=(q,))

    prod.start()
    cons.start()
    prod.join()
    cons.join()


if __name__ == "__main__":
    main()
```

### IPC with `multiprocessing.Pipe`

A `Pipe` creates a direct connection between two processes — faster than `Queue` for bidirectional communication:

```python
import multiprocessing


def child_process(conn: multiprocessing.Connection) -> None:
    conn.send({"status": "ready", "pid": multiprocessing.current_process().pid})
    msg = conn.recv()
    print(f"  Child received: {msg}")
    conn.send(f"Child processed: {msg}")
    conn.close()


def main() -> None:
    parent_conn, child_conn = multiprocessing.Pipe()

    p = multiprocessing.Process(target=child_process, args=(child_conn,))
    p.start()
    child_conn.close()  # Parent doesn't need child's end

    # Parent side
    greeting = parent_conn.recv()
    print(f"  Parent received: {greeting}")

    parent_conn.send("hello from parent")
    reply = parent_conn.recv()
    print(f"  Parent received: {reply}")

    p.join()
    parent_conn.close()


if __name__ == "__main__":
    main()
```

### Pool for Parallel Execution

`Pool` manages a fixed number of worker processes and distributes work via `map`, `apply`, or `starmap`:

```python
import multiprocessing
import math


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True


def count_primes_in_range(args: tuple[int, int]) -> int:
    start, end = args
    return sum(1 for n in range(start, end) if is_prime(n))


def main() -> None:
    ranges = [(2, 250_000), (250_000, 500_000), (500_000, 750_000), (750_000, 1_000_000)]

    with multiprocessing.Pool(processes=4) as pool:
        results = pool.map(count_primes_in_range, ranges)

    total = sum(results)
    print(f"Total primes under 1,000,000: {total:,}")
    assert 78_490 <= total <= 78_500  # Known answer is 78,498


if __name__ == "__main__":
    main()
```

### Start Methods: fork vs spawn vs forkserver

Python supports three start methods for creating processes:

| Method | Description | Platform | Trade-offs |
|---|---|---|---|
| `fork` | Copies parent memory | Unix only | Fast but can be unsafe with threads/locks |
| `spawn` | Starts fresh Python interpreter | All platforms | Safe but slower startup |
| `forkserver` | Forks from a server process | Unix only | Safe + fast after initial fork |

```python
import multiprocessing

# Set the start method (must be called before creating any Process)
# Recommended: use "spawn" for safety
multiprocessing.set_start_method("spawn", force=True)
```

### Shared Memory with `multiprocessing.Manager`

For more complex shared structures (dictionaries, lists across processes):

```python
import multiprocessing
import time


def worker(shared_dict: dict, shared_list: list, worker_id: int) -> None:
    shared_dict[f"worker-{worker_id}"] = worker_id * 100
    shared_list.append(worker_id)
    time.sleep(0.1)


def main() -> None:
    with multiprocessing.Manager() as manager:
        shared_dict = manager.dict()
        shared_list = manager.list()

        processes = [
            multiprocessing.Process(target=worker, args=(shared_dict, shared_list, i))
            for i in range(5)
        ]
        for p in processes:
            p.start()
        for p in processes:
            p.join()

        print(f"Dict: {dict(shared_dict)}")
        print(f"List: {list(shared_list)}")


if __name__ == "__main__":
    main()
```

### Threading vs Multiprocessing Comparison

| Feature | `threading` | `multiprocessing` |
|---|---|---|
| **Memory** | Shared memory space | Isolated memory per process |
| **GIL** | Only one thread runs Python bytecode | Each process has its own GIL |
| **Best for** | I/O-bound tasks | CPU-bound tasks |
| **Overhead** | Low (lightweight) | High (process creation, IPC serialization) |
| **Communication** | Shared variables (with locks) | `Queue`, `Pipe`, `Value`, `Array` |
| **Startup** | Fast | Slower (new interpreter) |
| **Fault isolation** | One thread crash kills all | One process crash doesn't affect others |
| **Scalability** | Limited by GIL for CPU work | Scales with CPU cores |

---

## 10.6 concurrent.futures

The `concurrent.futures` module provides a high-level interface for parallel execution via `ThreadPoolExecutor` and `ProcessPoolExecutor`. It abstracts away the details of thread/process management with a clean `Future`-based API.

### ThreadPoolExecutor

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time


def fetch(url: str) -> dict:
    """Simulate an HTTP fetch."""
    time.sleep(1)
    return {"url": url, "status": 200, "size": len(url) * 100}


def main() -> None:
    urls = [f"https://example.com/page/{i}" for i in range(10)]

    with ThreadPoolExecutor(max_workers=5) as executor:
        # Submit individual tasks
        futures = {executor.submit(fetch, url): url for url in urls}

        # Process results as they complete
        for future in as_completed(futures):
            url = futures[future]
            result = future.result()
            print(f"  Fetched {url}: {result['size']} bytes")


if __name__ == "__main__":
    main()
```

### ProcessPoolExecutor

```python
from concurrent.futures import ProcessPoolExecutor
import math


def compute(n: int) -> int:
    """Compute the number of primes up to n using a simple sieve."""
    if n < 2:
        return 0
    sieve = [True] * (n + 1)
    sieve[0] = sieve[1] = False
    for i in range(2, math.isqrt(n) + 1):
        if sieve[i]:
            for j in range(i * i, n + 1, i):
                sieve[j] = False
    return sum(sieve)


def main() -> None:
    limits = [1_000_000, 2_000_000, 3_000_000, 4_000_000]

    with ProcessPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(compute, limit): limit for limit in limits}

        for future in as_completed(futures):
            limit = futures[future]
            result = future.result()
            print(f"  Primes up to {limit:,}: {result:,}")


if __name__ == "__main__":
    main()
```

### `submit()` vs `map()`

`submit()` returns a `Future` for each call — you get results incrementally:

```python
with ThreadPoolExecutor() as executor:
    futures = [executor.submit(fetch, url) for url in urls]
    for f in as_completed(futures):
        print(f.result())  # Order: whichever finishes first
```

`map()` is simpler and preserves input order:

```python
with ThreadPoolExecutor() as executor:
    results = executor.map(fetch, urls, timeout=30)
    for result in results:
        print(result)  # Order: same as input
```

### Future Objects

A `Future` represents a pending or completed result:

```python
from concurrent.futures import Future


def example_futures() -> None:
    future = Future()
    print(future.done())  # False

    future.set_result(42)
    print(future.done())  # True
    print(future.result())  # 42
```

Key `Future` methods:
- `result(timeout=None)` — blocks until done, then returns the result (or raises the exception)
- `done()` — returns `True` if the future is completed, cancelled, or raised
- `cancel()` — attempt to cancel the future (may fail if it's already running)
- `exception()` — returns the exception if the future raised one, else `None`

### Error Handling

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time


def risky_task(task_id: int) -> str:
    if task_id == 3:
        raise ValueError(f"Task {task_id} failed!")
    time.sleep(0.5)
    return f"Task {task_id} result"


def main() -> None:
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(risky_task, i): i for i in range(6)}

        for future in as_completed(futures):
            task_id = futures[future]
            try:
                result = future.result()
                print(f"  {task_id}: {result}")
            except Exception as exc:
                print(f"  {task_id}: FAILED — {exc}")


if __name__ == "__main__":
    main()
```

### Practical Example: Parallel File Processing

```python
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path


def word_count(filepath: str) -> tuple[str, int]:
    """Count words in a file."""
    text = Path(filepath).read_text(encoding="utf-8")
    count = len(text.split())
    return filepath, count


def main() -> None:
    # Create dummy files
    text_dir = Path("/tmp/concurrent_demo")
    text_dir.mkdir(exist_ok=True)
    for i in range(8):
        (text_dir / f"file_{i}.txt").write_text(f"word " * (1000 * (i + 1)))

    files = [str(f) for f in text_dir.glob("*.txt")]

    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(word_count, files))

    for filepath, count in sorted(results):
        print(f"  {Path(filepath).name}: {count:,} words")


if __name__ == "__main__":
    main()
```

---

## 10.7 asyncio

`asyncio` provides infrastructure for writing single-threaded concurrent code using coroutines. Instead of threads or processes, the event loop manages tasks cooperatively — each task yields control when it would otherwise block.

### The Event Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASYNCIO EVENT LOOP                           │
│                                                                  │
│  Task Queue:  [Task A] [Task B] [Task C] [Task D]               │
│                      │                                           │
│                      ▼                                           │
│              ┌──────────────┐                                    │
│              │  Event Loop  │ ◀── asyncio.run()                  │
│              └──────┬───────┘                                    │
│                     │                                            │
│        ┌────────────┼────────────┐                               │
│        ▼            ▼            ▼                               │
│   Task A runs  Task B runs  Task C runs                          │
│   until await  until await  until await                          │
│        │            │            │                               │
│        ▼            ▼            ▼                               │
│   I/O pending  I/O pending  I/O ready                            │
│   (yields)     (yields)     (resumes) ──▶ Task C continues      │
│                                                                  │
│  When a task awaits I/O, the loop runs the next ready task.      │
│  All coroutines run in ONE thread, taking turns cooperatively.   │
└─────────────────────────────────────────────────────────────────┘
```

### Coroutines with async/await

```python
import asyncio


async def fetch_data(url: str, delay: float) -> dict:
    """Simulate an async network request."""
    print(f"  Starting fetch from {url}")
    await asyncio.sleep(delay)  # Non-blocking sleep
    print(f"  Finished fetch from {url}")
    return {"url": url, "data": f"content from {url}"}


async def main() -> None:
    # Sequential (slow)
    start = asyncio.get_event_loop().time()
    await fetch_data("https://a.com", 1.0)
    await fetch_data("https://b.com", 1.0)
    await fetch_data("https://c.com", 1.0)
    print(f"  Sequential: {asyncio.get_event_loop().time() - start:.2f}s\n")

    # Concurrent (fast)
    start = asyncio.get_event_loop().time()
    await asyncio.gather(
        fetch_data("https://a.com", 1.0),
        fetch_data("https://b.com", 1.0),
        fetch_data("https://c.com", 1.0),
    )
    print(f"  Concurrent: {asyncio.get_event_loop().time() - start:.2f}s")


if __name__ == "__main__":
    asyncio.run(main())
```

### Creating Tasks

`asyncio.create_task()` schedules a coroutine to run concurrently without waiting for it immediately:

```python
import asyncio


async def background_task(name: str) -> str:
    await asyncio.sleep(2)
    return f"{name} completed"


async def main() -> None:
    # create_task() schedules and returns immediately
    task1 = asyncio.create_task(background_task("Task-1"))
    task2 = asyncio.create_task(background_task("Task-2"))

    print("  Tasks started, doing other work...")
    await asyncio.sleep(0.5)  # Other work
    print("  Other work done, waiting for tasks...")

    # Now await the results
    result1 = await task1
    result2 = await task2
    print(f"  {result1}")
    print(f"  {result2}")


if __name__ == "__main__":
    asyncio.run(main())
```

### Gathering and Waiting

```python
import asyncio
import random


async def worker(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name} finished in {delay:.1f}s"


async def main() -> None:
    # gather() — runs all concurrently, returns results in order
    results = await asyncio.gather(
        worker("W1", 2.0),
        worker("W2", 1.0),
        worker("W3", 1.5),
    )
    for r in results:
        print(f"  {r}")

    print()

    # wait() — more control over completion behavior
    tasks = [
        asyncio.create_task(worker(f"W-{i}", random.uniform(0.5, 2.0)))
        for i in range(5)
    ]

    # Wait for all tasks
    done, pending = await asyncio.wait(tasks)
    print(f"  Completed: {len(done)}, Pending: {len(pending)}")
    for task in done:
        print(f"  Result: {task.result()}")


if __name__ == "__main__":
    asyncio.run(main())
```

### asyncio.sleep vs time.sleep

| | `asyncio.sleep()` | `time.sleep()` |
|---|---|---|
| **Blocking** | No — yields control to event loop | Yes — blocks the entire thread |
| **Use in async code** | Yes | Never (use `await asyncio.sleep()`) |
| **Use in sync code** | No | Yes |
| **Effect on event loop** | Loop continues processing other tasks | Loop frozen for the duration |

```python
import asyncio
import time


async def async_approach() -> None:
    """This works correctly — other tasks can run during sleep."""
    await asyncio.sleep(1)
    print("  Async sleep done")


def bad_sync_in_async() -> None:
    """This BLOCKS the entire event loop."""
    time.sleep(1)
    print("  Sync sleep done")


async def main() -> None:
    # Good: async sleep
    await asyncio.sleep(0.1)

    # Bad: time.sleep() in async code blocks the loop!
    # time.sleep(1)  # DON'T DO THIS


if __name__ == "__main__":
    asyncio.run(main())
```

### Async Semaphores and Locks

```python
import asyncio


async def limited_fetch(
    semaphore: asyncio.Semaphore, url: str
) -> str:
    async with semaphore:  # Limits concurrent requests
        print(f"  Fetching {url}")
        await asyncio.sleep(1)  # Simulate network
        return f"data from {url}"


async def main() -> None:
    # Allow only 3 concurrent requests
    sem = asyncio.Semaphore(3)
    urls = [f"https://api.example.com/{i}" for i in range(10)]

    tasks = [limited_fetch(sem, url) for url in urls]
    results = await asyncio.gather(*tasks)
    print(f"\n  Fetched {len(results)} URLs")


if __name__ == "__main__":
    asyncio.run(main())
```

### Async Context Managers and Iterators

```python
import asyncio


class AsyncDatabase:
    """Simulates an async database connection."""

    async def __aenter__(self) -> "AsyncDatabase":
        print("  Opening database connection")
        await asyncio.sleep(0.1)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        print("  Closing database connection")
        await asyncio.sleep(0.1)

    async def query(self, sql: str) -> list[dict]:
        await asyncio.sleep(0.1)
        return [{"id": 1, "result": sql}]


class AsyncDataStream:
    """Simulates an async iterator over streaming data."""

    def __init__(self, items: list[str]) -> None:
        self.items = items
        self.index = 0

    def __aiter__(self) -> "AsyncDataStream":
        return self

    async def __anext__(self) -> str:
        if self.index >= len(self.items):
            raise StopAsyncIteration
        await asyncio.sleep(0.1)  # Simulate async fetch
        item = self.items[self.index]
        self.index += 1
        return item


async def main() -> None:
    # Async context manager
    async with AsyncDatabase() as db:
        result = await db.query("SELECT * FROM users")
        print(f"  Query result: {result}")

    print()

    # Async iterator
    stream = AsyncDataStream(["alpha", "beta", "gamma"])
    async for item in stream:
        print(f"  Stream item: {item}")


if __name__ == "__main__":
    asyncio.run(main())
```

### Using aiosqlite for Async Database Access

```python
import asyncio

# pip install aiosqlite
import aiosqlite


async def main() -> None:
    async with aiosqlite.connect(":memory:") as db:
        await db.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE
            )
        """)

        users = [
            ("Alice", "alice@example.com"),
            ("Bob", "bob@example.com"),
            ("Charlie", "charlie@example.com"),
        ]
        await db.executemany(
            "INSERT INTO users (name, email) VALUES (?, ?)", users
        )
        await db.commit()

        async with db.execute("SELECT * FROM users WHERE name = ?", ("Alice",)) as cursor:
            row = await cursor.fetchone()
            print(f"  Found: {row}")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 10.8 Async Patterns

### Fan-Out / Fan-In

Fan-out distributes work across multiple tasks; fan-in collects results:

```python
import asyncio
import random


async def compute_partial(data: list[int], chunk_id: int) -> tuple[int, int]:
    """Compute sum of a data chunk."""
    await asyncio.sleep(random.uniform(0.1, 0.5))  # Simulate variable work
    total = sum(data)
    print(f"  Chunk {chunk_id} computed: {total}")
    return chunk_id, total


async def main() -> None:
    # Fan-out: split work across tasks
    data = list(range(1, 101))
    chunk_size = 25
    chunks = [data[i : i + chunk_size] for i in range(0, len(data), chunk_size)]

    tasks = [compute_partial(chunk, i) for i, chunk in enumerate(chunks)]

    # Fan-in: gather all results
    results = await asyncio.gather(*tasks)
    final = sum(total for _, total in results)
    print(f"\n  Final total: {final}")


if __name__ == "__main__":
    asyncio.run(main())
```

### Producer-Consumer with asyncio.Queue

```python
import asyncio
import random


async def async_producer(queue: asyncio.Queue[int], producer_id: int) -> None:
    for i in range(5):
        item = producer_id * 100 + i
        await asyncio.sleep(random.uniform(0.1, 0.3))
        await queue.put(item)
        print(f"  Producer {producer_id}: put {item}")
    print(f"  Producer {producer_id}: done")


async def async_consumer(queue: asyncio.Queue[int], consumer_id: int) -> None:
    while True:
        item = await queue.get()
        if item is None:  # Sentinel
            break
        await asyncio.sleep(0.2)  # Simulate processing
        print(f"  Consumer {consumer_id}: processed {item}")
        queue.task_done()


async def main() -> None:
    queue: asyncio.Queue[int | None] = asyncio.Queue(maxsize=10)

    # Start consumers
    consumers = [asyncio.create_task(async_consumer(queue, i)) for i in range(3)]

    # Start producers
    producers = [asyncio.create_task(async_producer(queue, i)) for i in range(4)]

    # Wait for producers to finish
    await asyncio.gather(*producers)

    # Signal consumers to stop
    for _ in consumers:
        await queue.put(None)

    # Wait for consumers to finish
    await asyncio.gather(*consumers)
    print("\n  All work completed")


if __name__ == "__main__":
    asyncio.run(main())
```

### Rate Limiting with Semaphore

```python
import asyncio
import time


async def api_request(
    sem: asyncio.Semaphore, endpoint: str, rate_limiter: asyncio.Semaphore
) -> str:
    async with sem:
        # Additional per-second rate limiting
        async with rate_limiter:
            print(f"  Requesting {endpoint} at {time.time():.1f}")
            await asyncio.sleep(0.5)  # Simulate API call
            return f"response from {endpoint}"


async def main() -> None:
    sem = asyncio.Semaphore(5)  # Max 5 concurrent
    rate_limiter = asyncio.Semaphore(2)  # Max 2 per "tick"

    endpoints = [f"/api/v1/resource/{i}" for i in range(20)]
    tasks = [api_request(sem, ep, rate_limiter) for ep in endpoints]

    results = await asyncio.gather(*tasks)
    print(f"\n  Completed {len(results)} requests")


if __name__ == "__main__":
    asyncio.run(main())
```

### Task Groups (Python 3.11+)

`asyncio.TaskGroup` provides structured concurrency — all tasks in the group must complete (or be cancelled) before the context manager exits:

```python
import asyncio


async def fetch_user(user_id: int) -> dict:
    await asyncio.sleep(0.5)
    return {"id": user_id, "name": f"User-{user_id}"}


async def fetch_orders(user_id: int) -> list[dict]:
    await asyncio.sleep(0.7)
    return [{"order_id": i, "user_id": user_id} for i in range(3)]


async def main() -> None:
    async with asyncio.TaskGroup() as tg:
        user_task = tg.create_task(fetch_user(1))
        orders_task = tg.create_task(fetch_orders(1))

    # Both tasks are guaranteed complete here
    user = user_task.result()
    orders = orders_task.result()

    print(f"  User: {user}")
    print(f"  Orders: {len(orders)} items")


if __name__ == "__main__":
    asyncio.run(main())
```

If any task raises an exception, `TaskGroup` cancels all other tasks and raises an `ExceptionGroup`:

```python
import asyncio


async def failing_task() -> str:
    await asyncio.sleep(0.5)
    raise RuntimeError("Task failed!")


async def good_task() -> str:
    await asyncio.sleep(1)
    return "success"


async def main() -> None:
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(failing_task())
            tg.create_task(good_task())
    except* RuntimeError as eg:
        for exc in eg.exceptions:
            print(f"  Caught: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
```

### Structured Concurrency Concepts

Structured concurrency ensures that:
1. **No task outlives its scope** — when a `TaskGroup` exits, all its tasks are done or cancelled
2. **Errors propagate** — exceptions in child tasks reach the parent
3. **Cancellation is explicit** — cancelling a parent cancels all children

```
┌─────────────────────────────────────────────────────────────────┐
│              UNSTRUCTURED vs STRUCTURED CONCURRENCY              │
│                                                                  │
│  UNSTRUCTURED (fire-and-forget):                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  task = asyncio.create_task(work())                       │  │
│  │  # task might outlive the scope that created it            │  │
│  │  # exceptions might be silently lost                       │  │
│  │  # hard to cancel cleanly                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  STRUCTURED (TaskGroup):                                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  async with asyncio.TaskGroup() as tg:                    │  │
│  │      tg.create_task(work())                                │  │
│  │      tg.create_task(other_work())                          │  │
│  │  # ALL tasks guaranteed complete or cancelled              │  │
│  │  # exceptions propagate as ExceptionGroup                  │  │
│  │  # cancellation is automatic and clean                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.9 Performance Comparison

### Threading vs Multiprocessing vs asyncio

| Scenario | Threading | Multiprocessing | asyncio |
|---|---|---|---|
| **HTTP requests (1000)** | Good (~10s) | Overkill (~12s) | Best (~3s) |
| **Image processing (100)** | Slow (GIL) | Best (~2s) | Impossible (CPU) |
| **File I/O (100 files)** | Good | Good | Best with aiofiles |
| **Database queries** | Good | Good | Best with async drivers |
| **Real-time game server** | OK | Unnecessary | Best |
| **Scientific computing** | Slow | Best | N/A |
| **Memory usage** | Low | High (per process) | Very low |
| **Startup overhead** | Low | High | Very low |

### Benchmarking with timeit

```python
import asyncio
import multiprocessing
import threading
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor


def cpu_bound_task(n: int) -> int:
    """Calculate sum of squares."""
    return sum(i * i for i in range(n))


def io_bound_task(duration: float) -> str:
    """Simulate I/O with sleep."""
    time.sleep(duration)
    return "done"


def benchmark_threading(func, args_list: list, max_workers: int) -> float:
    start = time.perf_counter()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(func, args_list))
    return time.perf_counter() - start


def benchmark_multiprocessing(func, args_list: list, max_workers: int) -> float:
    start = time.perf_counter()
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(func, args_list))
    return time.perf_counter() - start


async def benchmark_async(func, args_list: list) -> float:
    start = time.perf_counter()
    tasks = [asyncio.create_task(asyncio.to_thread(func, arg)) for arg in args_list]
    await asyncio.gather(*tasks)
    return time.perf_counter() - start


def main() -> None:
    # IO-bound benchmark
    io_args = [0.1] * 20
    print("IO-bound task (20 x 0.1s sleep):")

    t_thread = benchmark_threading(io_bound_task, io_args, 10)
    print(f"  Threading:        {t_thread:.2f}s")

    t_mp = benchmark_multiprocessing(io_bound_task, io_args, 4)
    print(f"  Multiprocessing:  {t_mp:.2f}s")

    t_async = asyncio.run(benchmark_async(io_bound_task, io_args))
    print(f"  asyncio:          {t_async:.2f}s")

    print()

    # CPU-bound benchmark
    cpu_args = [1_000_000] * 4
    print("CPU-bound task (4 x 1M sum of squares):")

    t_thread = benchmark_threading(cpu_bound_task, cpu_args, 4)
    print(f"  Threading:        {t_thread:.2f}s")

    t_mp = benchmark_multiprocessing(cpu_bound_task, cpu_args, 4)
    print(f"  Multiprocessing:  {t_mp:.2f}s")


if __name__ == "__main__":
    main()
```

### Choosing the Right Approach

```
┌──────────────────────────────────────────────────────────────────┐
│                  CONCURRENCY DECISION FLOWCHART                   │
│                                                                  │
│                    Start here                                    │
│                       │                                          │
│              ┌────────┴────────┐                                 │
│              │  Is the task    │                                 │
│              │  I/O or CPU?    │                                 │
│              └────────┬────────┘                                 │
│            ┌──────────┴──────────┐                               │
│            │                     │                               │
│         I/O-bound            CPU-bound                           │
│            │                     │                               │
│     ┌──────┴──────┐     ┌───────┴───────┐                      │
│     │  Scale to   │     │  Use all CPU  │                       │
│     │  thousands  │     │  cores?       │                       │
│     │  of tasks?  │     └───────┬───────┘                       │
│     └──────┬──────┘        ┌────┴────┐                          │
│       ┌────┴────┐          │         │                           │
│      Yes        No       Yes        No                          │
│       │         │          │         │                           │
│       ▼         ▼          ▼         ▼                           │
│   asyncio   threading    Process   threading                     │
│   + async   ThreadPool   Pool or   (single                      │
│   I/O libs  Executor     Process   core OK)                     │
│                               Pool                               │
│                                                                  │
│   Need shared mutable state?                                    │
│       │                                                          │
│   ┌───┴───┐                                                     │
│   │       │                                                     │
│  Yes      No                                                    │
│   │       │                                                     │
│   ▼       ▼                                                     │
│ threading  Any approach works                                    │
│ + Lock     (pick for performance)                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Concurrency ≠ Parallelism.** Concurrency is about interleaving tasks; parallelism is about executing them simultaneously on separate cores.

2. **The GIL makes threads unsuitable for CPU-bound Python work.** Threads share one GIL, so only one thread executes Python bytecode at a time. Use multiprocessing for CPU-bound tasks.

3. **Threads excel at I/O-bound tasks.** During network/disk waits, the GIL is released, allowing other threads to run concurrently.

4. **`asyncio` is the most efficient choice for high-concurrency I/O.** A single thread can manage thousands of async tasks with minimal memory overhead — far less than one thread per connection.

5. **`multiprocessing` provides true parallelism.** Each process has its own Python interpreter and GIL, so multiple cores can work simultaneously.

6. **Always synchronize access to shared state.** Use `Lock`, `RLock`, or `Semaphore` from the `threading` module to prevent race conditions. Use `multiprocessing.Lock` for cross-process synchronization.

7. **The `queue` module is your friend.** `queue.Queue`, `LifoQueue`, and `PriorityQueue` are thread-safe by design — use them to pass data between threads without manual locking.

8. **`concurrent.futures` provides the cleanest high-level API.** `ThreadPoolExecutor` and `ProcessPoolExecutor` manage worker pools, submit tasks, and return `Future` objects with minimal boilerplate.

9. **Avoid `time.sleep()` in async code.** It blocks the entire event loop. Always use `await asyncio.sleep()` to yield control back to the loop.

10. **Use `asyncio.TaskGroup` (Python 3.11+) for structured concurrency.** It guarantees that all tasks complete or are cancelled, and exceptions propagate cleanly as `ExceptionGroup`.

11. **Prevent deadlocks by always acquiring locks in a consistent global order.** Use context managers (`with lock:`) to ensure locks are always released, even if exceptions occur.

12. **Prefer `multiprocessing.Pool` for simple parallel data processing.** Its `map()`, `starmap()`, and `apply_async()` methods handle process lifecycle, work distribution, and result collection automatically.

---

## Practice Exercises

### Exercise 1: Thread-Safe Web Scraper

Build a thread-safe URL scraper that downloads pages concurrently with a configurable thread pool. Use `queue.Queue` to pass results and `threading.Semaphore` to limit concurrent connections.

```python
import threading
import queue
import time


class WebScraper:
    def __init__(self, max_connections: int = 5) -> None:
        self.semaphore = threading.Semaphore(max_connections)
        self.result_queue: queue.Queue[dict] = queue.Queue()
        self.lock = threading.Lock()
        self.stats = {"success": 0, "failure": 0}

    def _fetch(self, url: str) -> dict:
        """Fetch a URL (implement with urllib or requests)."""
        # TODO: Implement actual HTTP fetch
        with self.semaphore:
            time.sleep(1)  # Simulate network I/O
            return {"url": url, "status": 200, "length": 1024}

    def scrape(self, urls: list[str]) -> list[dict]:
        """Scrape all URLs concurrently."""
        threads = []
        for url in urls:
            t = threading.Thread(target=self._fetch_and_store, args=(url,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        results = []
        while not self.result_queue.empty():
            results.append(self.result_queue.get())
        return results

    def _fetch_and_store(self, url: str) -> None:
        # TODO: Call _fetch, update stats thread-safely, put result in queue
        pass


# TODO: Write tests verifying concurrency and thread safety
```

### Exercise 2: Parallel Map-Reduce

Implement a parallel map-reduce framework using `multiprocessing.Pool`. The mapper transforms data items, and the reducer aggregates results.

```python
import multiprocessing
from typing import Any, Callable


def parallel_map_reduce(
    data: list[Any],
    mapper: Callable[[Any], Any],
    reducer: Callable[[Any, Any], Any],
    num_workers: int = 4,
) -> Any:
    """
    Process data in parallel:
    1. Map 'mapper' over all data items using multiple processes
    2. Reduce results with 'reducer'

    Example:
        parallel_map_reduce([1, 2, 3, 4], lambda x: x*x, lambda a, b: a+b)
        # Returns 30 (1+4+9+16)
    """
    # TODO: Implement using multiprocessing.Pool
    pass


def word_count_mapper(line: str) -> dict[str, int]:
    """Map a line to word counts."""
    counts: dict[str, int] = {}
    for word in line.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts


def word_count_reducer(a: dict[str, int], b: dict[str, int]) -> dict[str, int]:
    """Merge two word count dictionaries."""
    for word, count in b.items():
        a[word] = a.get(word, 0) + count
    return a


# TODO: Write tests
# parallel_map_reduce(["hello world", "world hello"], word_count_mapper, word_count_reducer)
# Expected: {"hello": 2, "world": 2}
```

### Exercise 3: Async Rate Limiter

Build an async rate limiter that ensures no more than N requests per second. Use `asyncio.Semaphore` and timestamps to enforce the rate limit.

```python
import asyncio
import time


class AsyncRateLimiter:
    """Rate limiter allowing max 'max_per_second' calls per second."""

    def __init__(self, max_per_second: int = 10) -> None:
        self.max_per_second = max_per_second
        self.semaphore = asyncio.Semaphore(max_per_second)
        self.timestamps: list[float] = []

    async def acquire(self) -> None:
        """Wait until a request slot is available."""
        # TODO: Implement rate limiting logic
        # Hints:
        # - Track timestamps of recent requests
        # - If at capacity, sleep until the oldest request expires
        # - Use self.semaphore to limit concurrency
        pass

    async def __aenter__(self) -> "AsyncRateLimiter":
        await self.acquire()
        return self

    async def __aexit__(self, *args) -> None:
        pass


async def fetch(url: str) -> str:
    """Simulate an HTTP request."""
    await asyncio.sleep(0.1)
    return f"data from {url}"


async def main() -> None:
    limiter = AsyncRateLimiter(max_per_second=5)
    urls = [f"https://api.example.com/{i}" for i in range(30)]

    start = time.perf_counter()
    async with asyncio.TaskGroup() as tg:
        for url in urls:
            async with limiter:
                tg.create_task(fetch(url))

    elapsed = time.perf_counter() - start
    print(f"30 requests completed in {elapsed:.1f}s (limit: 5/s)")


if __name__ == "__main__":
    asyncio.run(main())
```

### Exercise 4: Pipeline Pattern with asyncio

Implement an async pipeline with three stages: `generate → transform → consume`. Each stage runs concurrently as a separate coroutine connected by `asyncio.Queue`.

```python
import asyncio
import random


async def generate(queue: asyncio.Queue[int], num_items: int) -> None:
    """Stage 1: Generate random numbers."""
    # TODO: Put num_items random integers into the queue
    pass


async def transform(
    in_queue: asyncio.Queue[int], out_queue: asyncio.Queue[str]
) -> None:
    """Stage 2: Transform numbers to formatted strings."""
    # TODO: Read from in_queue, transform, put into out_queue
    # Use a sentinel (None) to know when generation is done
    pass


async def consume(queue: asyncio.Queue[str], results: list[str]) -> None:
    """Stage 3: Collect results."""
    # TODO: Read from queue until sentinel, append to results list
    pass


async def pipeline(num_items: int = 100) -> list[str]:
    """Run the full pipeline."""
    q1: asyncio.Queue[int] = asyncio.Queue()
    q2: asyncio.Queue[str] = asyncio.Queue()
    results: list[str] = []

    # TODO: Start generate, transform, consume as concurrent tasks
    # TODO: Wait for all to complete
    # TODO: Return results

    return results


def main() -> None:
    results = asyncio.run(pipeline(100))
    print(f"Pipeline processed {len(results)} items")
    print(f"Sample: {results[:5]}")


if __name__ == "__main__":
    main()
```

### Exercise 5: Async Database Connection Pool

Implement a simple async connection pool using `asyncio.Semaphore` and a queue. The pool should support `acquire()`, `release()`, and context manager usage.

```python
import asyncio


class Connection:
    """Simulated database connection."""

    def __init__(self, conn_id: int) -> None:
        self.conn_id = conn_id
        self.in_use = False

    async def execute(self, query: str) -> str:
        await asyncio.sleep(0.1)
        return f"Result for conn-{self.conn_id}: {query}"

    async def close(self) -> None:
        await asyncio.sleep(0.05)


class AsyncConnectionPool:
    def __init__(self, max_size: int = 5) -> None:
        self.max_size = max_size
        self.semaphore = asyncio.Semaphore(max_size)
        self.pool: asyncio.Queue[Connection] = asyncio.Queue(maxsize=max_size)
        self._initialized = False

    async def initialize(self) -> None:
        """Pre-create all connections."""
        # TODO: Create max_size Connection objects and put them in the pool
        pass

    async def acquire(self) -> Connection:
        """Acquire a connection from the pool."""
        # TODO: Wait on semaphore, get connection from pool
        pass

    async def release(self, conn: Connection) -> None:
        """Release a connection back to the pool."""
        # TODO: Put connection back, release semaphore
        pass

    async def __aenter__(self) -> "AsyncConnectionPool":
        await self.initialize()
        return self

    async def __aexit__(self, *args) -> None:
        """Close all connections."""
        # TODO: Drain the pool and close each connection
        pass


class PooledConnection:
    """Context manager that acquires and auto-releases a connection."""

    def __init__(self, pool: AsyncConnectionPool) -> None:
        self.pool = pool
        self.conn: Connection | None = None

    async def __aenter__(self) -> Connection:
        self.conn = await self.pool.acquire()
        return self.conn

    async def __aexit__(self, *args) -> None:
        if self.conn:
            await self.pool.release(self.conn)


async def main() -> None:
    async with AsyncConnectionPool(max_size=3) as pool:
        tasks = []
        for i in range(10):
            async with PooledConnection(pool) as conn:
                result = await conn.execute(f"SELECT {i}")
                print(f"  {result}")
                tasks.append(result)

    print(f"\n  Executed {len(tasks)} queries")


if __name__ == "__main__":
    asyncio.run(main())
```

---

**Next:** In Chapter 11, we'll explore Python's networking primitives — sockets, HTTP clients and servers, and building networked applications from the ground up.
