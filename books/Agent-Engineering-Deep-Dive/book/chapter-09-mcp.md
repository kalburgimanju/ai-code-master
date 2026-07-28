# Chapter 9: Model Context Protocol (MCP)

> "The future is already here — it's just not evenly distributed." — William Gibson

---

## 9.1 What is MCP?

The **Model Context Protocol (MCP)** is an open standard created by Anthropic in late 2024 for connecting AI models to external data sources, tools, and services. It defines a universal interface that allows any AI application to interact with any external system through a single, standardized protocol — much like USB-C standardized how devices connect to peripherals.

Before MCP, every AI application team built their own tool integrations. A chatbot needing to read files would write custom filesystem logic. A coding assistant needing GitHub access would build a bespoke GitHub integration. An enterprise AI system needing database access would wire up its own database connector. Each integration was bespoke, fragile, and impossible to reuse across projects. The result was a fragmented ecosystem where thousands of teams solved the same problems independently.

MCP solves this by providing a **client-server protocol** with well-defined primitives — Tools, Resources, and Prompts — that any AI model can use to interact with any external system. Servers expose capabilities using these primitives; clients discover and invoke them. Build a GitHub MCP server once, and every MCP-compatible AI application can use it.

### The USB-C Analogy

Think of MCP as the USB-C of AI applications:

| Before USB-C | Before MCP |
|---|---|
| Each device has a unique connector | Each AI app builds custom integrations |
| Proprietary cables per brand | Proprietary tool code per application |
| No interoperability | No reusable integrations |
| Expensive, wasteful | Duplication, wasted effort |

| After USB-C | After MCP |
|---|---|
| One cable works everywhere | One server works for every client |
| Standard connector | Standard protocol |
| Full interoperability | Any client + any server |
| Simple, universal | Build once, use everywhere |

### MCP Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOST (AI App)                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐  │
│  │ Claude    │  │ GPT       │  │ Gemini    │  │ Llama      │  │
│  │ Desktop   │  │ IDE       │  │ Research  │  │ Enterprise │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬──────┘  │
│        │              │              │              │           │
│  ┌─────┴──────────────┴──────────────┴──────────────┴──────┐    │
│  │                    MCP CLIENT LAYER                     │    │
│  └──────┬──────────────┬──────────────┬──────────────┬─────┘    │
└─────────┼──────────────┼──────────────┼──────────────┼──────────┘
          │              │              │              │
    ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐  ┌───┴───────┐
    │   stdio   │  │  HTTP+SSE │  │ Streamable│  │   Future  │
    │  transport│  │  transport│  │   HTTP    │  │ transports│
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───┬───────┘
          │              │              │              │
    ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐  ┌───┴───────┐
    │  MCP      │  │  MCP      │  │  MCP      │  │  MCP      │
    │  Server   │  │  Server   │  │  Server   │  │  Server   │
    │(Filesystem│  │(GitHub)   │  │(Database) │  │(Custom)   │
    └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

---

## 9.2 MCP Architecture

MCP follows a **client-server architecture** with three distinct roles: Hosts, Clients, and Servers.

### Roles and Relationships

**Host**: The AI application itself — Claude Desktop, a custom chatbot, an IDE, or any application that embeds an LLM. The host manages one or more MCP clients and controls the overall user experience.

**Client**: A protocol-level component created by the host for each server connection. The client handles the MCP protocol handshake, capability negotiation, and message routing. One client maintains a **1:1 connection** with one server.

**Server**: A process that exposes capabilities (tools, resources, prompts) over the MCP protocol. Servers are lightweight and focused — a filesystem server exposes file operations, a database server exposes query capabilities, and so on.

```
                    HOST (e.g., Claude Desktop)
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────┴────┐ ┌────┴────┐ ┌───┴─────┐
   │ Client  │ │ Client  │ │ Client  │
   │    A    │ │    B    │ │    C    │
   └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │
   ┌────┴────┐ ┌────┴────┐ ┌───┴─────┐
   │ Server  │ │ Server  │ │ Server  │
   │    A    │ │    B    │ │    C    │
   │(Files)  │ │(GitHub) │ │(DB)     │
   └─────────┘ └─────────┘ └─────────┘
```

### Connection Lifecycle

Every MCP connection follows four phases:

1. **Initialization**: Client sends `initialize` with protocol version and capabilities. Server responds with its own capabilities.
2. **Capability Negotiation**: Both parties exchange capability sets. The client declares what features it supports (sampling, roots); the server declares what it offers (tools, resources, prompts).
3. **Operation**: Normal message exchange — tool calls, resource reads, prompt requests.
4. **Shutdown**: Either party sends `close` to gracefully terminate.

```
  Client                          Server
    │                               │
    │──── initialize ──────────────>│
    │     {protocolVersion,         │
    │      clientCapabilities}      │
    │                               │
    │<─── initialize result ────────│
    │     {protocolVersion,         │
    │      serverCapabilities}      │
    │                               │
    │──── initialized ─────────────>│
    │     (notification)            │
    │                               │
    │     ┌─── OPERATION PHASE ──┐  │
    │     │  tools/list          │  │
    │     │  tools/call          │  │
    │     │  resources/list      │  │
    │     │  resources/read      │  │
    │     │  prompts/list        │  │
    │     │  prompts/get         │  │
    │     └──────────────────────┘  │
    │                               │
    │──── shutdown ────────────────>│
    │<─── shutdown result ─────────│
    │                               │
```

### Transport Layers

MCP supports multiple transport mechanisms:

| Transport | Mechanism | Use Case | Latency |
|---|---|---|---|
| **stdio** | Standard input/output pipes | Local CLI tools, desktop apps | Very low |
| **HTTP + SSE** | HTTP POST for requests, SSE for responses | Web deployment, remote servers | Low-medium |
| **Streamable HTTP** | HTTP POST with streaming response bodies | Modern web, bidirectional | Low |

The transport layer is pluggable — the same MCP server can be exposed over stdio for local use or HTTP for remote access. The protocol logic remains identical regardless of transport.

---

## 9.3 Core Primitives

MCP defines three core primitives that servers expose to clients:

### Tools

Tools are **functions the model can call** to perform actions or retrieve computed results. They are the MCP equivalent of API endpoints — a tool takes structured input (JSON Schema parameters) and returns structured output.

```python
# Example: A search tool
@mcp.tool()
async def web_search(query: str, max_results: int = 10) -> str:
    """Search the web for information.
    
    Args:
        query: The search query string
        max_results: Maximum number of results to return
    """
    results = await search_engine.search(query, max=max_results)
    return json.dumps([{"title": r.title, "url": r.url, "snippet": r.snippet}
                       for r in results])
```

Tools are **model-controlled** — the AI model decides when and how to call them based on the conversation context.

### Resources

Resources are **data the model can read** but not modify. They expose information through URIs, similar to how files are addressed in a filesystem. A resource might be a file, a database table, an API endpoint's current state, or any structured data source.

```python
# Example: A file resource
@mcp.resource("file://{path}")
async def read_file(path: str) -> str:
    """Read the contents of a file at the given path."""
    with open(path, "r") as f:
        return f.read()

# Example: A database table resource
@mcp.resource("db://users/{table_name}")
async def read_table(table_name: str) -> str:
    """Read all rows from a database table."""
    rows = await db.fetch_all(f"SELECT * FROM {table_name}")
    return json.dumps(rows)
```

Resources are **application-controlled** — the host application decides what resources to expose, not the model.

### Prompts

Prompts are **pre-built templates** for common interaction patterns. They are reusable prompt structures that users or applications can invoke to set up specific contexts.

```python
# Example: A code review prompt
@mcp.prompt()
def code_review_prompt(language: str, code: str) -> str:
    """Generate a code review prompt for the given code."""
    return f"""Please review the following {language} code for:
- Bugs and logical errors
- Performance issues
- Security vulnerabilities
- Code style and best practices

Code to review:
```{language}
{code}
```

Provide your review with specific line references and suggested fixes."""

# Example: A data analysis prompt
@mcp.prompt()
def analyze_data_prompt(data_uri: str, question: str) -> str:
    """Generate a data analysis prompt."""
    return f"""Analyze the data at {data_uri} and answer: {question}

Steps:
1. Load and inspect the data
2. Identify relevant columns/fields
3. Perform statistical analysis
4. Provide a clear, actionable answer"""
```

### Comparison: Tools vs Resources vs Prompts

| Aspect | Tools | Resources | Prompts |
|---|---|---|---|
| **Purpose** | Perform actions / computations | Expose data for reading | Template interactions |
| **Controlled by** | AI model (decides when to call) | Application (decides what to expose) | User / application (invokes explicitly) |
| **Input** | JSON Schema parameters | URI with optional parameters | Named arguments |
| **Output** | Computed result (text, JSON, files) | Raw data content (text, JSON) | Prompt string |
| **Side effects** | Yes (can modify external state) | No (read-only) | No (generates text) |
| **Examples** | Search, create file, send email | Read file, list tables, get status | Code review, summarize, compare |
| **Analogy** | API endpoints (POST/PUT) | Read-only API endpoints (GET) | Macro / template |

---

## 9.4 Building an MCP Server

Let's build a complete MCP server from scratch. We'll use the Python MCP SDK (`mcp`) to create a server that exposes tools, resources, and prompts for a task management system.

### Server Setup and Initialization

```python
"""Task Manager MCP Server"""
import json
import uuid
from datetime import datetime
from mcp.server.fastmcp import FastMCP

# Initialize the MCP server
mcp = FastMCP(
    name="task-manager",
    version="1.0.0",
    description="A task management MCP server"
)

# In-memory task storage (production would use a database)
tasks: dict[str, dict] = {}


def _get_task(task_id: str) -> dict:
    """Retrieve a task by ID or raise an error."""
    if task_id not in tasks:
        raise ValueError(f"Task {task_id} not found")
    return tasks[task_id]
```

### Defining Tools

```python
@mcp.tool()
async def create_task(title: str, description: str = "", priority: str = "medium") -> str:
    """Create a new task.
    
    Args:
        title: The task title (required)
        description: Optional task description
        priority: Task priority: low, medium, high, or critical
    """
    if priority not in ("low", "medium", "high", "critical"):
        return json.dumps({"error": f"Invalid priority: {priority}"})
    
    task_id = str(uuid.uuid4())[:8]
    task = {
        "id": task_id,
        "title": title,
        "description": description,
        "priority": priority,
        "status": "open",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
    tasks[task_id] = task
    return json.dumps(task, indent=2)


@mcp.tool()
async def update_task(
    task_id: str,
    title: str | None = None,
    description: str | None = None,
    status: str | None = None,
    priority: str | None = None,
) -> str:
    """Update an existing task.
    
    Args:
        task_id: The ID of the task to update
        title: New title (optional)
        description: New description (optional)
        status: New status: open, in_progress, completed (optional)
        priority: New priority: low, medium, high, critical (optional)
    """
    task = _get_task(task_id)
    
    if title is not None:
        task["title"] = title
    if description is not None:
        task["description"] = description
    if status is not None:
        task["status"] = status
    if priority is not None:
        task["priority"] = priority
    
    task["updated_at"] = datetime.now().isoformat()
    tasks[task_id] = task
    return json.dumps(task, indent=2)


@mcp.tool()
async def list_tasks(status: str | None = None) -> str:
    """List all tasks, optionally filtered by status.
    
    Args:
        status: Filter by status: open, in_progress, completed (optional)
    """
    filtered = tasks.values()
    if status:
        filtered = [t for t in filtered if t["status"] == status]
    return json.dumps(list(filtered), indent=2)
```

### Exposing Resources

```python
@mcp.resource("tasks://summary")
async def task_summary() -> str:
    """Get a summary of all tasks by status and priority."""
    summary = {
        "total": len(tasks),
        "by_status": {},
        "by_priority": {},
    }
    for task in tasks.values():
        status = task["status"]
        priority = task["priority"]
        summary["by_status"][status] = summary["by_status"].get(status, 0) + 1
        summary["by_priority"][priority] = summary["by_priority"].get(priority, 0) + 1
    return json.dumps(summary, indent=2)


@mcp.resource("tasks://{task_id}")
async def get_task_resource(task_id: str) -> str:
    """Get a specific task by ID as a readable resource."""
    task = _get_task(task_id)
    return json.dumps(task, indent=2)
```

### Defining Prompt Templates

```python
@mcp.prompt()
def daily_standup() -> str:
    """Generate a daily standup report template for tasks."""
    open_count = sum(1 for t in tasks.values() if t["status"] == "open")
    in_progress_count = sum(1 for t in tasks.values() if t["status"] == "in_progress")
    completed_count = sum(1 for t in tasks.values() if t["status"] == "completed")
    
    return f"""Based on the current task board, generate a daily standup report:

Current Status:
- Open tasks: {open_count}
- In progress: {in_progress_count}
- Completed: {completed_count}

Please format as:
1. What was accomplished (completed tasks)
2. What's in progress (in-progress tasks)
3. What's next (open tasks by priority)
4. Any blockers or concerns"""


@mcp.prompt()
def task_prioritization() -> str:
    """Generate a task prioritization analysis."""
    if not tasks:
        return "No tasks to prioritize. Create some tasks first."
    
    task_list = json.dumps(list(tasks.values()), indent=2)
    return f"""Analyze these tasks and recommend prioritization:

{task_list}

Consider: urgency, impact, dependencies, and effort.
Output a ranked list with reasoning for each priority level."""
```

### Running the Server

```python
# Entry point
if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### Complete Server in Action

```
$ uv run python task_server.py

# The server is now running on stdio, ready to accept MCP connections.
# A client can:
# 1. Call tools: create_task, update_task, list_tasks
# 2. Read resources: tasks://summary, tasks://{task_id}
# 3. Use prompts: daily_standup, task_prioritization
```

---

## 9.5 Building an MCP Client

Now let's build an MCP client that connects to the server above and exercises its capabilities.

### Client Initialization

```python
"""MCP Client Implementation"""
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    # Define the server connection (stdio transport)
    server_params = StdioServerParameters(
        command="uv",
        args=["run", "python", "task_server.py"],
    )
    
    # Connect to the server
    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            # Initialize the connection
            await session.initialize()
            
            # Discover available capabilities
            await explore_server(session)
            
            # Use the tools
            await use_tools(session)
            
            # Read resources
            await use_resources(session)
            
            # Use prompts
            await use_prompts(session)
```

### Discovering Available Capabilities

```python
async def explore_server(session: ClientSession):
    """Discover what the server offers."""
    # List available tools
    tools = await session.list_tools()
    print("=== Available Tools ===")
    for tool in tools.tools:
        print(f"  - {tool.name}: {tool.description}")
        if tool.inputSchema:
            props = tool.inputSchema.get("properties", {})
            print(f"    Parameters: {list(props.keys())}")
    
    # List available resources
    resources = await session.list_resources()
    print("\n=== Available Resources ===")
    for resource in resources.resources:
        print(f"  - {resource.uri}: {resource.description}")
    
    # List available prompts
    prompts = await session.list_prompts()
    print("\n=== Available Prompts ===")
    for prompt in prompts.prompts:
        print(f"  - {prompt.name}: {prompt.description}")
```

### Calling Tools and Processing Results

```python
async def use_tools(session: ClientSession):
    """Demonstrate tool usage."""
    # Create a task
    result = await session.call_tool(
        "create_task",
        arguments={
            "title": "Implement user authentication",
            "description": "Add JWT-based auth to the API",
            "priority": "high",
        }
    )
    task = json.loads(result.content[0].text)
    print(f"Created task: {task['id']}")
    
    # Create more tasks
    await session.call_tool("create_task", arguments={
        "title": "Write unit tests",
        "priority": "medium",
    })
    await session.call_tool("create_task", arguments={
        "title": "Update documentation",
        "priority": "low",
    })
    
    # List all open tasks
    result = await session.call_tool(
        "list_tasks",
        arguments={"status": "open"}
    )
    print("Open tasks:")
    print(result.content[0].text)
    
    # Update a task to in-progress
    await session.call_tool(
        "update_task",
        arguments={
            "task_id": task["id"],
            "status": "in_progress",
        }
    )
```

### Reading Resources

```python
async def use_resources(session: ClientSession):
    """Demonstrate resource reading."""
    # Read the task summary
    result = await session.read_resource("tasks://summary")
    summary = json.loads(result.contents[0].text)
    print(f"\nTask Summary:")
    print(f"  Total: {summary['total']}")
    print(f"  By status: {summary['by_status']}")
    print(f"  By priority: {summary['by_priority']}")
```

### Using Prompts

```python
async def use_prompts(session: ClientSession):
    """Demonstrate prompt retrieval."""
    # Get the daily standup prompt
    result = await session.get_prompt("daily_standup")
    print("\n=== Daily Standup Prompt ===")
    print(result.messages[0].content.text)
    
    # Get prioritization prompt with arguments
    result = await session.get_prompt("task_prioritization")
    print("\n=== Task Prioritization Prompt ===")
    print(result.messages[0].content.text)
```

### Running the Client

```python
import asyncio
asyncio.run(main())
```

**Expected Output:**

```
=== Available Tools ===
  - create_task: Create a new task.
    Parameters: ['title', 'description', 'priority']
  - update_task: Update an existing task.
    Parameters: ['task_id', 'title', 'description', 'status', 'priority']
  - list_tasks: List all tasks, optionally filtered by status.
    Parameters: ['status']

=== Available Resources ===
  - tasks://summary: Get a summary of all tasks by status and priority.
  - tasks://{task_id}: Get a specific task by ID as a readable resource.

=== Available Prompts ===
  - daily_standup: Generate a daily standup report template for tasks.
  - task_prioritization: Generate a task prioritization analysis.

Created task: a3f2b1c8
Open tasks:
[{"id": "a3f2b1c8", "title": "Implement user authentication", ...}, ...]
```

---

## 9.6 Transport Deep Dive

### stdio Transport

The simplest transport — the server runs as a child process and communicates via standard input/output pipes. The client writes JSON-RPC messages to the server's stdin; the server writes responses to stdout.

```python
# stdio transport — server side
if __name__ == "__main__":
    mcp.run(transport="stdio")

# stdio transport — client side
from mcp.client.stdio import stdio_client
from mcp import StdioServerParameters

params = StdioServerParameters(
    command="uv",
    args=["run", "python", "my_server.py"],
    env={"MY_VAR": "value"},  # optional environment
)

async with stdio_client(params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        # ... use session
```

**Advantages**: Zero configuration, works offline, natural for CLI tools.  
**Limitations**: Local only, one client per server process, no network access.

### HTTP with Server-Sent Events (SSE)

For remote servers, MCP originally used HTTP POST for client-to-server messages and Server-Sent Events (SSE) for server-to-client streaming.

```python
# Server: run as HTTP+SSE
mcp.run(transport="sse", host="0.0.0.0", port=8000)

# Client: connect over HTTP
from mcp.client.sse import sse_client

async with sse_client("http://localhost:8000/sse") as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        # ... use session
```

**Advantages**: Network-accessible, works through firewalls, standard HTTP.  
**Limitations**: Requires a persistent SSE connection, more complex infrastructure.

### Streamable HTTP

The modern transport that unifies request-response and streaming into a single HTTP endpoint. Uses POST with streaming response bodies.

```python
# Server: run with streamable HTTP
mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)

# Client: connect via streamable HTTP
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client("http://localhost:8000/mcp") as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        # ... use session
```

**Advantages**: Single endpoint, bidirectional streaming, HTTP-native, session management.  
**Limitations**: Newer standard, less tooling support (but growing rapidly).

### When to Use Which Transport

| Scenario | Recommended Transport | Reason |
|---|---|---|
| Desktop AI assistant | stdio | Local, zero-config, low latency |
| CLI tool integration | stdio | Natural for subprocess communication |
| Cloud-hosted MCP server | Streamable HTTP | Network access, scalable |
| Web-based AI application | Streamable HTTP | Browser-compatible |
| Microservice integration | Streamable HTTP | Standard HTTP infrastructure |
| Legacy system bridge | HTTP + SSE | Broader compatibility |
| Embedded / IoT | stdio | Resource-constrained, local only |

---

## 9.7 Security Considerations

MCP servers often handle sensitive data and perform privileged operations. Security must be considered at every layer.

### Authentication and Authorization

```python
# Middleware example: API key authentication
from mcp.server.fastmcp import FastMCP
from mcp.types import ToolError

mcp = FastMCP("secure-server")

def verify_api_key(api_key: str) -> bool:
    """Verify the API key against the allowed set."""
    valid_keys = {"key-abc-123", "key-def-456"}
    return api_key in valid_keys

@mcp.tool()
async def sensitive_operation(data: str, api_key: str) -> str:
    """A tool that requires authentication.
    
    Args:
        data: The data to process
        api_key: Your API key for authentication
    """
    if not verify_api_key(api_key):
        raise ToolError("Authentication failed: invalid API key")
    
    # Proceed with authenticated operation
    return f"Processed: {data}"
```

### Rate Limiting

```python
import time
from collections import defaultdict

class RateLimiter:
    """Simple sliding window rate limiter."""
    
    def __init__(self, max_calls: int = 100, window_seconds: int = 60):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self.calls: dict[str, list[float]] = defaultdict(list)
    
    def check(self, client_id: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        self.calls[client_id] = [
            t for t in self.calls[client_id] if t > cutoff
        ]
        if len(self.calls[client_id]) >= self.max_calls:
            return False
        self.calls[client_id].append(now)
        return True

rate_limiter = RateLimiter(max_calls=50, window_seconds=60)

@mcp.tool()
async def rate_limited_tool(query: str, client_id: str = "default") -> str:
    """A tool with rate limiting."""
    if not rate_limiter.check(client_id):
        raise ToolError("Rate limit exceeded. Try again later.")
    return f"Result for: {query}"
```

### Input Validation

```python
import re
from mcp.types import ToolError

@mcp.tool()
async def safe_file_read(file_path: str) -> str:
    """Read a file safely with path validation.
    
    Args:
        file_path: Path to the file to read
    """
    # Reject path traversal attempts
    if ".." in file_path or file_path.startswith("/"):
        raise ToolError("Path traversal not allowed")
    
    # Restrict to allowed directories
    allowed_dirs = ["/data", "/logs", "/tmp"]
    if not any(file_path.startswith(d) for d in allowed_dirs):
        raise ToolError(f"Access denied: not in allowed directories")
    
    # Sanitize the path
    safe_path = re.sub(r'[^\w\-_./]', '', file_path)
    
    with open(safe_path, "r") as f:
        return f.read()
```

### Sandbox Execution

For tools that execute code or run commands, sandboxing is essential:

```python
import subprocess
import shlex

@mcp.tool()
async def run_python_code(code: str) -> str:
    """Execute Python code in a sandboxed environment.
    
    Args:
        code: Python code to execute (max 1000 chars)
    """
    if len(code) > 1000:
        raise ToolError("Code exceeds maximum length of 1000 characters")
    
    # Dangerous imports to block
    blocked = ["os", "sys", "subprocess", "shutil", "socket", "http"]
    for module in blocked:
        if f"import {module}" in code or f"from {module}" in code:
            raise ToolError(f"Import of '{module}' is not allowed in sandbox")
    
    # Execute with timeout and resource limits
    result = subprocess.run(
        ["python", "-c", code],
        capture_output=True,
        text=True,
        timeout=10,  # 10 second timeout
    )
    
    if result.returncode != 0:
        return f"Error: {result.stderr}"
    return result.stdout
```

### Trust Boundaries

```
┌──────────────────────────────────────────────────────────┐
│                    TRUST BOUNDARY                        │
│                                                         │
│   HOST (High Trust)                                     │
│   ┌─────────────────────────────────────────────┐       │
│   │  User input → Sanitized → Sent to Client    │       │
│   └──────────────────────┬──────────────────────┘       │
│                          │                              │
│              ┌───────────┴───────────┐                  │
│              │  MEDIUM TRUST BOUNDARY │                  │
│              │                       │                  │
│   CLIENT     │  Client validates     │                  │
│              │  responses, enforces  │                  │
│              │  policy               │                  │
│              └───────────┬───────────┘                  │
│                          │                              │
│              ┌───────────┴───────────┐                  │
│              │   LOW TRUST BOUNDARY   │                  │
│              │                       │                  │
│   SERVER     │  Server executes      │                  │
│              │  tools, reads data    │                  │
│              │  (potentially hostile) │                  │
│              └───────────────────────┘                  │
│                                                         │
└──────────────────────────────────────────────────────────┘
```

### Audit Logging

```python
import logging
from datetime import datetime

audit_logger = logging.getLogger("mcp.audit")

@mcp.tool()
async def audited_tool(operation: str, data: str) -> str:
    """A tool with comprehensive audit logging."""
    audit_logger.info(json.dumps({
        "timestamp": datetime.now().isoformat(),
        "tool": "audited_tool",
        "operation": operation,
        "data_length": len(data),
        "status": "called",
    }))
    
    try:
        result = f"Processed: {operation} on {len(data)} bytes"
        audit_logger.info(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "tool": "audited_tool",
            "status": "completed",
            "result_length": len(result),
        }))
        return result
    except Exception as e:
        audit_logger.error(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "tool": "audited_tool",
            "status": "failed",
            "error": str(e),
        }))
        raise
```

---

## 9.8 MCP in Production

### Connection Pooling and Management

```python
import asyncio
from contextlib import asynccontextmanager
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPConnectionPool:
    """Manage a pool of MCP server connections."""
    
    def __init__(self, server_params: StdioServerParameters, pool_size: int = 5):
        self.server_params = server_params
        self.pool_size = pool_size
        self._pool: asyncio.Queue[ClientSession] = asyncio.Queue(maxsize=pool_size)
        self._initialized = False
    
    async def initialize(self):
        """Create initial pool of connections."""
        for _ in range(self.pool_size):
            session = await self._create_session()
            await self._pool.put(session)
        self._initialized = True
    
    async def _create_session(self) -> ClientSession:
        """Create a new MCP session."""
        # Note: In production, manage the context manager lifecycle carefully
        read, write = await stdio_client(self.server_params).__aenter__()
        session = ClientSession(read, write)
        await session.__aenter__()
        await session.initialize()
        return session
    
    @asynccontextmanager
    async def acquire(self):
        """Acquire a session from the pool."""
        session = await self._pool.get()
        try:
            yield session
        finally:
            await self._pool.put(session)
    
    async def close(self):
        """Close all connections in the pool."""
        while not self._pool.empty():
            session = await self._pool.get()
            await session.__aexit__(None, None, None)

# Usage
pool = MCPConnectionPool(server_params, pool_size=3)
await pool.initialize()

async with pool.acquire() as session:
    result = await session.call_tool("my_tool", arguments={"query": "hello"})
    print(result)
```

### Error Handling and Retries

```python
import asyncio
from mcp.types import ToolError, McpError

class MCPRetryPolicy:
    """Configurable retry policy for MCP operations."""
    
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 30.0,
        exponential_base: float = 2.0,
    ):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
    
    def get_delay(self, attempt: int) -> float:
        delay = self.base_delay * (self.exponential_base ** attempt)
        return min(delay, self.max_delay)

async def call_tool_with_retry(
    session: ClientSession,
    tool_name: str,
    arguments: dict,
    policy: MCPRetryPolicy | None = None,
) -> dict:
    """Call an MCP tool with automatic retries."""
    policy = policy or MCPRetryPolicy()
    
    for attempt in range(policy.max_retries + 1):
        try:
            result = await session.call_tool(tool_name, arguments=arguments)
            
            # Check for error in result
            if result.isError:
                error_text = result.content[0].text
                if "rate limit" in error_text.lower() and attempt < policy.max_retries:
                    delay = policy.get_delay(attempt)
                    await asyncio.sleep(delay)
                    continue
                raise ToolError(error_text)
            
            return result
            
        except McpError as e:
            if attempt < policy.max_retries:
                delay = policy.get_delay(attempt)
                print(f"Retry {attempt + 1}/{policy.max_retries} after {delay}s: {e}")
                await asyncio.sleep(delay)
                continue
            raise
    
    raise ToolError(f"Failed after {policy.max_retries + 1} attempts")
```

### Monitoring MCP Servers

```python
import time
from dataclasses import dataclass, field
from collections import defaultdict

@dataclass
class MCPMetrics:
    """Track MCP server performance metrics."""
    
    tool_calls: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    tool_errors: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    tool_latencies: dict[str, list[float]] = field(default_factory=lambda: defaultdict(list))
    resource_reads: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    active_connections: int = 0
    total_connections: int = 0
    
    def record_tool_call(self, tool_name: str, duration_ms: float, success: bool):
        self.tool_calls[tool_name] += 1
        self.tool_latencies[tool_name].append(duration_ms)
        if not success:
            self.tool_errors[tool_name] += 1
    
    def get_summary(self) -> dict:
        summary = {
            "total_tool_calls": sum(self.tool_calls.values()),
            "total_errors": sum(self.tool_errors.values()),
            "error_rate": (
                sum(self.tool_errors.values()) / max(sum(self.tool_calls.values()), 1)
            ),
            "active_connections": self.active_connections,
            "total_connections": self.total_connections,
            "tools": {},
        }
        for tool_name in self.tool_calls:
            latencies = self.tool_latencies[tool_name]
            summary["tools"][tool_name] = {
                "calls": self.tool_calls[tool_name],
                "errors": self.tool_errors.get(tool_name, 0),
                "avg_latency_ms": sum(latencies) / max(len(latencies), 1),
                "p99_latency_ms": sorted(latencies)[int(len(latencies) * 0.99)] if latencies else 0,
            }
        return summary

metrics = MCPMetrics()

@mcp.tool()
async def monitored_tool(query: str) -> str:
    """A tool with built-in metrics collection."""
    start = time.monotonic()
    try:
        result = f"Processed: {query}"
        duration = (time.monotonic() - start) * 1000
        metrics.record_tool_call("monitored_tool", duration, success=True)
        return result
    except Exception as e:
        duration = (time.monotonic() - start) * 1000
        metrics.record_tool_call("monitored_tool", duration, success=False)
        raise
```

### Versioning and Backward Compatibility

When evolving your MCP server, maintain backward compatibility:

| Change Type | Breaking? | Action Required |
|---|---|---|
| Add new tool | No | None — clients ignore unknown tools |
| Add optional parameter to tool | No | None — defaults handle missing params |
| Remove tool | Yes | Deprecated period + client notification |
| Rename tool | Yes | Add new name, deprecate old name |
| Change tool output format | Yes | Version the tool or add new tool |
| Add new resource | No | None — clients discover via list |
| Add new prompt | No | None — clients discover via list |

```python
# Versioned tools for backward compatibility
@mcp.tool()
async def search_v1(query: str) -> str:
    """Search for information (v1 — deprecated)."""
    return await _search_impl(query, version=1)

@mcp.tool()
async def search_v2(query: str, filters: dict | None = None) -> str:
    """Search for information with optional filters.
    
    Args:
        query: Search query
        filters: Optional filters for results
    """
    return await _search_impl(query, version=2, filters=filters)

async def _search_impl(query: str, version: int = 2, filters: dict | None = None) -> str:
    """Internal search implementation."""
    results = await do_search(query)
    if filters:
        results = apply_filters(results, filters)
    return json.dumps(results)
```

---

## 9.9 The MCP Ecosystem

The MCP ecosystem has grown rapidly since its introduction. Hundreds of MCP servers are now available for common services and tools.

### Popular MCP Servers

| Server | Provider | Capabilities | Description |
|---|---|---|---|
| **Filesystem** | Anthropic | Read/write files, list directories | Local filesystem access |
| **GitHub** | Anthropic | Repos, issues, PRs, code search | GitHub API integration |
| **PostgreSQL** | Anthropic | Query, schema, tables | Database access |
| **Slack** | Anthropic | Messages, channels, users | Slack workspace integration |
| **Google Drive** | Community | Files, folders, search | Google Drive access |
| **Docker** | Community | Containers, images, compose | Docker management |
| **Kubernetes** | Community | Pods, deployments, services | K8s cluster management |
| **Brave Search** | Anthropic | Web search, news search | Web search integration |
| **Memory** | Anthropic | Key-value store, entity tracking | Persistent memory for agents |
| **Puppeteer** | Community | Browser automation, screenshots | Web scraping and testing |
| **Sentry** | Community | Errors, performance, releases | Error monitoring |
| **Linear** | Community | Issues, projects, teams | Project management |
| **Notion** | Community | Pages, databases, blocks | Knowledge management |
| **AWS** | Community | S3, Lambda, DynamoDB, etc. | Cloud infrastructure |

### Building a Server for Your Own Services

Any internal service can be exposed as an MCP server:

```python
"""MCP server wrapping your internal REST API."""
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("internal-api-server")

API_BASE = "https://api.mycompany.com/v1"
API_KEY = os.environ["INTERNAL_API_KEY"]

@mcp.tool()
async def get_customer(customer_id: str) -> str:
    """Look up a customer by ID.
    
    Args:
        customer_id: The customer's unique identifier
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_BASE}/customers/{customer_id}",
            headers={"Authorization": f"Bearer {API_KEY}"},
        )
        resp.raise_for_status()
        return json.dumps(resp.json(), indent=2)

@mcp.tool()
async def create_order(customer_id: str, items: list[dict]) -> str:
    """Create an order for a customer.
    
    Args:
        customer_id: The customer placing the order
        items: List of items with product_id and quantity
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_BASE}/orders",
            json={"customer_id": customer_id, "items": items},
            headers={"Authorization": f"Bearer {API_KEY}"},
        )
        resp.raise_for_status()
        return json.dumps(resp.json(), indent=2)

@mcp.resource("customers://{customer_id}/history")
async def customer_history(customer_id: str) -> str:
    """Get the full order history for a customer."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_BASE}/customers/{customer_id}/orders",
            headers={"Authorization": f"Bearer {API_KEY}"},
        )
        resp.raise_for_status()
        return json.dumps(resp.json(), indent=2)
```

---

## 9.10 MCP vs Traditional Tool Integration

### Comparison Table

| Aspect | MCP | Function Calling | Custom Integration |
|---|---|---|---|
| **Standardization** | Open standard, vendor-neutral | Provider-specific | Proprietary |
| **Reusability** | Build once, use everywhere | Per-provider | Per-application |
| **Discovery** | Runtime capability negotiation | Static tool definitions | Hardcoded |
| **Transport** | Pluggable (stdio, HTTP) | HTTP API calls | Any |
| **Security** | Built-in trust boundaries | Provider-dependent | Application-specific |
| **Overhead** | Protocol + transport overhead | API call overhead | Varies widely |
| **Ecosystem** | Growing rapidly | Large (per provider) | None |
| **Best for** | Multi-model, multi-tool systems | Single-provider integrations | Simple, one-off integrations |

### Function Calling vs MCP

Function calling (available in OpenAI, Anthropic, Google models) embeds tool definitions directly in the API request:

```python
# Function calling — tools defined per request
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    tools=[{
        "name": "get_weather",
        "description": "Get current weather",
        "input_schema": {
            "type": "object",
            "properties": {
                "location": {"type": "string"}
            }
        }
    }],
    messages=[{"role": "user", "content": "Weather in SF?"}]
)
```

MCP externalizes tools into servers that can be reused across any client:

```python
# MCP — tools defined in a reusable server
# Server: tools registered once
@mcp.tool()
async def get_weather(location: str) -> str:
    """Get current weather for a location."""
    return json.dumps(await fetch_weather(location))

# Client: discovers tools at runtime
tools = await session.list_tools()  # Auto-discovered!
```

### When MCP is Overkill

MCP adds protocol overhead. It may be overkill when:

- You have a **single model provider** with **few tools** (function calling is simpler)
- You're building a **prototype** or **proof of concept** (speed > architecture)
- Your tools are **static** and unlikely to be reused (custom integration is fine)
- You're in a **resource-constrained environment** where protocol overhead matters

### Migration Strategy

For teams with existing custom integrations, a phased migration works best:

| Phase | Action | Risk |
|---|---|---|
| **Phase 1** | Wrap existing tools as MCP server (thin wrapper) | Low |
| **Phase 2** | Add MCP client to one AI application | Low |
| **Phase 3** | Migrate tool logic into MCP server (remove wrapper) | Medium |
| **Phase 4** | Add MCP client to remaining applications | Low |
| **Phase 5** | Remove old custom integrations | Medium |

```python
# Phase 1: Thin wrapper around existing integration
from my_existing_github_client import GitHubClient  # existing code

github = GitHubClient(token=os.environ["GITHUB_TOKEN"])

@mcp.tool()
async def create_issue(repo: str, title: str, body: str = "") -> str:
    """Create a GitHub issue (thin wrapper over existing client)."""
    # Reuse existing, battle-tested client code
    result = github.create_issue(repo, title=title, body=body)
    return json.dumps(result)
```

---

## Summary

The Model Context Protocol (MCP) represents a fundamental shift in how AI applications connect to the world. By standardizing the interface between models and tools, MCP eliminates the thousands of bespoke integrations that previously fragmented the AI ecosystem.

**Key takeaways:**

1. **Three primitives** — Tools, Resources, and Prompts — cover the full spectrum of model-to-system interactions.
2. **Client-server architecture** with pluggable transports (stdio, HTTP+SSE, Streamable HTTP) enables both local and remote deployment.
3. **Security is critical** — always implement authentication, rate limiting, input validation, and audit logging in production MCP servers.
4. **The ecosystem is growing rapidly** — hundreds of community and official MCP servers already exist for common services.
5. **MCP complements function calling** — function calling is for single-provider, simple scenarios; MCP is for multi-model, reusable, production-grade tool systems.

Build your tools once as MCP servers, and every AI application — today and tomorrow — can use them without modification.

> **Looking ahead:** Chapter 10 will explore the Agent-to-Agent Protocol (A2A), which extends beyond agent-to-tool communication to enable direct agent-to-agent collaboration across different frameworks and organizations.

*Next: [Chapter 10 — Agent-to-Agent Protocol](chapter-10-a2a.md)*