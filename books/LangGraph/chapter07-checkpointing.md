# Chapter 7: Checkpointing and Persistence

## Why Checkpointing Matters

Checkpointing is LangGraph's built-in persistence mechanism that automatically saves the complete graph state at every step. This enables:

- **Resumability** - Continue from any point after interruption
- **Time-travel debugging** - Inspect state at any historical step
- **Human-in-the-loop** - Pause for human input, resume later
- **Fault tolerance** - Recover from crashes without losing progress
- **Audit trails** - Complete history of every decision

---

## Checkpointer Backends

### 1. MemorySaver (Development)

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)

# In-memory only - lost on restart
config = {"configurable": {"thread_id": "session-123"}}
result = app.invoke(initial_state, config)
```

**Use for:** Development, testing, ephemeral sessions

### 2. SqliteSaver (Local Persistence)

```python
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# File-based (persists across restarts)
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")

# Or with existing connection
conn = sqlite3.connect("checkpoints.db", check_same_thread=False)
checkpointer = SqliteSaver(conn)

app = graph.compile(checkpointer=checkpointer)
```

**Use for:** Local development, single-instance production, edge devices

### 3. PostgresSaver (Production)

```python
from langgraph.checkpoint.postgres import PostgresSaver

# PostgreSQL for production scale
checkpointer = PostgresSaver.from_conn_string(
    "postgresql://user:pass@localhost:5432/langgraph"
)

# With connection pool
from psycopg_pool import ConnectionPool
pool = ConnectionPool("postgresql://user:pass@localhost:5432/langgraph", max_size=20)
checkpointer = PostgresSaver(pool)

app = graph.compile(checkpointer=checkpointer)
```

**Use for:** Production, multi-instance, high availability

### 4. Async Checkpointers

```python
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

# Async for non-blocking I/O
async_checkpointer = AsyncSqliteSaver.from_conn_string("checkpoints.db")
app = graph.compile(checkpointer=async_checkpointer)

# Async invoke
result = await app.ainvoke(initial_state, config)
```

---

## Thread Management

### Thread ID: The Key Concept

Each `thread_id` represents an independent conversation/session:

```python
# User 1's session
config_1 = {"configurable": {"thread_id": "user-123"}}

# User 2's session (completely separate state)
config_2 = {"configurable": {"thread_id": "user-456"}}

# Same graph, different threads = isolated state
result_1 = app.invoke(input_1, config_1)
result_2 = app.invoke(input_2, config_2)
```

### Thread Namespace

Organize threads with namespaces:

```python
config = {
    "configurable": {
        "thread_id": "session-123",
        "checkpoint_ns": "research"  # Namespace: "research/session-123"
    }
}

# Multiple namespaces for same user
config_research = {"configurable": {"thread_id": "user-123", "checkpoint_ns": "research"}}
config_chat = {"configurable": {"thread_id": "user-123", "checkpoint_ns": "chat"}}
```

---

## Checkpoint Operations

### Saving Checkpoints (Automatic)

Checkpoints are saved automatically after each node:

```python
app = graph.compile(checkpointer=checkpointer)

# Each invoke creates checkpoints at every node
result = app.invoke(initial_state, config)
# Checkpoints saved: after node1, node2, node3, etc.
```

### Listing Checkpoints

```python
# List all checkpoints for a thread
checkpoints = list(checkpointer.list(config))

for cp in checkpoints:
    print(f"Checkpoint ID: {cp.config['configurable']['checkpoint_id']}")
    print(f"  Step: {cp.metadata.get('step', 'N/A')}")
    print(f"  Timestamp: {cp.metadata.get('timestamp', 'N/A')}")
    print(f"  Parent: {cp.parent_config}")
    print(f"  State keys: {list(cp.channel_values.keys())}")
```

### Getting Specific Checkpoint

```python
# Get latest checkpoint
latest = checkpointer.get(config)

# Get specific checkpoint by ID
specific_config = {
    "configurable": {
        "thread_id": "session-123",
        "checkpoint_id": "specific-checkpoint-id"
    }
}
checkpoint = checkpointer.get(specific_config)

state = checkpoint.channel_values
print(f"Messages: {len(state.get('messages', []))}")
```

### Resuming from Checkpoint

```python
# Resume from latest (continue conversation)
result = app.invoke(new_input, config)  # Automatically resumes

# Resume from specific checkpoint
config_with_id = {
    "configurable": {
        "thread_id": "session-123",
        "checkpoint_id": "checkpoint-abc-123"
    }
}
result = app.invoke(new_input, config_with_id)
```

---

## Time-Travel Debugging

### Inspect Historical State

```python
def debug_history(thread_id: str):
    """Print full execution history."""
    config = {"configurable": {"thread_id": thread_id}}
    checkpoints = list(checkpointer.list(config))
    
    print(f"History for {thread_id}:")
    for i, cp in enumerate(reversed(checkpoints)):  # Oldest first
        state = cp.channel_values
        step = cp.metadata.get('step', i)
        print(f"\n--- Step {step} ---")
        print(f"Checkpoint: {cp.config['configurable']['checkpoint_id']}")
        print(f"Status: {state.get('status', 'N/A')}")
        print(f"Messages: {len(state.get('messages', []))}")
        if 'findings' in state:
            print(f"Findings: {len(state['findings'])}")

debug_history("research-session-123")
```

### Replay from Any Point

```python
def replay_from_step(thread_id: str, step: int):
    """Replay execution from a specific step."""
    config = {"configurable": {"thread_id": thread_id}}
    checkpoints = list(checkpointer.list(config))
    
    # Find checkpoint at step
    target_cp = checkpoints[-(step + 1)]  # Reverse order
    
    resume_config = {
        "configurable": {
            "thread_id": thread_id,
            "checkpoint_id": target_cp.config['configurable']['checkpoint_id']
        }
    }
    
    # Continue from that point
    result = app.invoke({"continue": True}, resume_config)
    return result
```

### Compare States

```python
def compare_checkpoints(thread_id: str, cp_id_1: str, cp_id_2: str):
    """Compare two checkpoints."""
    cp1 = checkpointer.get({"configurable": {"thread_id": thread_id, "checkpoint_id": cp_id_1}})
    cp2 = checkpointer.get({"configurable": {"thread_id": thread_id, "checkpoint_id": cp_id_2}})
    
    state1 = cp1.channel_values
    state2 = cp2.channel_values
    
    all_keys = set(state1.keys()) | set(state2.keys())
    
    for key in all_keys:
        v1 = state1.get(key)
        v2 = state2.get(key)
        if v1 != v2:
            print(f"\n{key}:")
            print(f"  Before: {v1}")
            print(f"  After:  {v2}")
```

---

## Checkpoint Serialization

### What Gets Serialized

LangGraph serializes the entire state using JSON. Supported types:

```python
# ✅ Supported (JSON-serializable)
state = {
    "strings": "text",
    "numbers": 42,
    "booleans": True,
    "lists": [1, 2, 3],
    "dicts": {"key": "value"},
    "pydantic_models": MyModel(...),  # Auto-serialized
    "datetime": datetime.now(),  # ISO format string
    "uuid": uuid.uuid4(),  # String
}

# ❌ NOT supported
state = {
    "functions": lambda x: x,
    "database_connections": db_conn,
    "file_handles": open("file.txt"),
    "thread_locks": threading.Lock(),
    "custom_objects": MyCustomClass(),
}
```

### Custom Serialization

```python
from langgraph.checkpoint.base import BaseCheckpointSaver
import json

class CustomCheckpointer(BaseCheckpointSaver):
    def __init__(self, serializer=None):
        self.serializer = serializer or json.dumps
    
    def put(self, config, checkpoint, metadata, new_versions):
        # Custom serialization logic
        serialized = self.serializer(checkpoint)
        # Store serialized...
    
    def get(self, config):
        # Custom deserialization
        data = self._fetch(config)
        return json.loads(data)
```

---

## Migration and Versioning

### Schema Migration

```python
CURRENT_VERSION = 3

def migrate_state(old_state: dict) -> dict:
    """Migrate state to current version."""
    version = old_state.get("_schema_version", 1)
    
    if version == 1:
        # v1 -> v2: Add confidence field
        old_state["confidence"] = 0.5
        old_state["_schema_version"] = 2
        version = 2
    
    if version == 2:
        # v2 -> v3: Restructure findings
        old_state["findings"] = [
            {"content": f, "source": "legacy", "timestamp": "unknown"}
            for f in old_state.get("findings", [])
        ]
        old_state["_schema_version"] = 3
    
    return old_state

# Apply on checkpoint load
class MigratingCheckpointer(SqliteSaver):
    def get(self, config):
        checkpoint = super().get(config)
        if checkpoint:
            checkpoint.channel_values = migrate_state(checkpoint.channel_values)
        return checkpoint
```

### Backward Compatibility

```python
def node_with_migration(state: State) -> dict:
    """Handle both old and new state formats."""
    # Old format: findings is list of strings
    # New format: findings is list of dicts
    findings = state.get("findings", [])
    
    if findings and isinstance(findings[0], str):
        # Migrate inline
        findings = [{"content": f, "source": "legacy"} for f in findings]
    
    # Process with new format
    new_finding = do_research()
    return {"findings": [*findings, new_finding]}
```

---

## Production Patterns

### 1. Checkpoint TTL (Cleanup)

```python
import time
from langgraph.checkpoint.sqlite import SqliteSaver

class TTLCheckpointer(SqliteSaver):
    def __init__(self, conn, ttl_days: int = 30):
        super().__init__(conn)
        self.ttl_seconds = ttl_days * 24 * 3600
    
    def cleanup_old_checkpoints(self):
        """Delete checkpoints older than TTL."""
        cutoff = time.time() - self.ttl_seconds
        cursor = self.conn.execute(
            "DELETE FROM checkpoints WHERE timestamp < ?", (cutoff,)
        )
        return cursor.rowcount

# Run cleanup periodically
checkpointer = TTLCheckpointer(conn, ttl_days=30)
# Schedule: checkpointer.cleanup_old_checkpoints()
```

### 2. Checkpoint Compression

```python
import gzip
import json

class CompressedCheckpointer(SqliteSaver):
    def put(self, config, checkpoint, metadata, new_versions):
        # Compress large state
        serialized = json.dumps(checkpoint.channel_values).encode()
        if len(serialized) > 10000:  # Compress if > 10KB
            compressed = gzip.compress(serialized)
            metadata["_compressed"] = True
            metadata["_original_size"] = len(serialized)
            checkpoint.channel_values = {"_compressed_data": compressed.hex()}
        
        super().put(config, checkpoint, metadata, new_versions)
    
    def get(self, config):
        checkpoint = super().get(config)
        if checkpoint and checkpoint.metadata.get("_compressed"):
            compressed = bytes.fromhex(checkpoint.channel_values["_compressed_data"])
            decompressed = gzip.decompress(compressed)
            checkpoint.channel_values = json.loads(decompressed)
        return checkpoint
```

### 3. Encrypted Checkpoints

```python
from cryptography.fernet import Fernet

class EncryptedCheckpointer(SqliteSaver):
    def __init__(self, conn, key: bytes):
        super().__init__(conn)
        self.cipher = Fernet(key)
    
    def put(self, config, checkpoint, metadata, new_versions):
        # Encrypt sensitive fields
        sensitive_keys = ["api_keys", "user_data", "secrets"]
        for key in sensitive_keys:
            if key in checkpoint.channel_values:
                data = json.dumps(checkpoint.channel_values[key]).encode()
                checkpoint.channel_values[key] = self.cipher.encrypt(data).decode()
        
        super().put(config, checkpoint, metadata, new_versions)
    
    def get(self, config):
        checkpoint = super().get(config)
        if checkpoint:
            sensitive_keys = ["api_keys", "user_data", "secrets"]
            for key in sensitive_keys:
                if key in checkpoint.channel_values:
                    encrypted = checkpoint.channel_values[key].encode()
                    decrypted = self.cipher.decrypt(encrypted)
                    checkpoint.channel_values[key] = json.loads(decrypted)
        return checkpoint
```

---

## Monitoring and Observability

### Checkpoint Metrics

```python
import time
from functools import wraps

def monitor_checkpoints(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        
        # Log metrics
        print(f"Checkpoint {func.__name__}: {duration:.3f}s")
        return result
    return wrapper

class MonitoredCheckpointer(SqliteSaver):
    @monitor_checkpoints
    def put(self, *args, **kwargs):
        return super().put(*args, **kwargs)
    
    @monitor_checkpoints
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)
```

### Health Checks

```python
def checkpointer_health(checkpointer) -> dict:
    """Check checkpointer health."""
    try:
        # Test write/read
        test_config = {"configurable": {"thread_id": "health-check"}}
        test_checkpoint = {
            "channel_values": {"test": "data"},
            "metadata": {"timestamp": time.time()}
        }
        
        checkpointer.put(test_config, test_checkpoint, {}, {})
        result = checkpointer.get(test_config)
        
        # Cleanup
        checkpointer.conn.execute(
            "DELETE FROM checkpoints WHERE thread_id = ?", ("health-check",)
        )
        
        return {"healthy": True, "latency_ms": 0}
    except Exception as e:
        return {"healthy": False, "error": str(e)}
```

---

## Testing with Checkpointers

### Unit Test with MemorySaver

```python
import pytest
from langgraph.checkpoint.memory import MemorySaver

@pytest.fixture
def checkpointer():
    return MemorySaver()

def test_graph_with_checkpointer(checkpointer):
    graph = build_graph()
    app = graph.compile(checkpointer=checkpointer)
    
    config = {"configurable": {"thread_id": "test-123"}}
    
    # First invocation
    result1 = app.invoke({"input": "hello"}, config)
    assert result1["status"] == "complete"
    
    # Second invocation (continues)
    result2 = app.invoke({"input": "world"}, config)
    assert len(result2["messages"]) == 4  # 2 human + 2 AI
```

### Integration Test with SQLite

```python
def test_persistence_across_restarts(tmp_path):
    db_path = tmp_path / "test.db"
    
    # First process
    checkpointer1 = SqliteSaver.from_conn_string(str(db_path))
    app1 = graph.compile(checkpointer=checkpointer1)
    
    config = {"configurable": {"thread_id": "persist-test"}}
    result1 = app1.invoke({"step": 1}, config)
    
    # Simulate restart - new checkpointer
    checkpointer2 = SqliteSaver.from_conn_string(str(db_path))
    app2 = graph.compile(checkpointer=checkpointer2)
    
    # Should resume
    result2 = app2.invoke({"step": 2}, config)
    
    assert result2["step"] == 2
    assert "step 1" in str(result2)  # Previous state preserved
```

---

## Summary

| Backend | Use Case | Pros | Cons |
|---------|----------|------|------|
| **MemorySaver** | Dev/Test | Fast, simple | Not persistent |
| **SqliteSaver** | Local/Edge | File-based, portable | Single writer |
| **PostgresSaver** | Production | Scalable, concurrent | Requires PostgreSQL |

**Key Concepts:**
- `thread_id` = isolated conversation
- `checkpoint_ns` = namespace for organization
- Automatic checkpoint after each node
- Time-travel via `checkpoint_id`
- Migration for schema evolution

---

## Next Chapter: Human-in-the-Loop Workflows

In Chapter 8, we'll explore human-in-the-loop patterns: interrupt/resume, approval workflows, editing, and UI integration.