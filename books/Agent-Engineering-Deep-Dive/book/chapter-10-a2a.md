# Chapter 10: Agent-to-Agent Protocol (A2A)

> "The network is the computer." — John Gage, Sun Microsystems

---

## 10.1 The Agent Web

In the previous chapter, we explored MCP — the protocol for connecting agents to tools and data. But MCP addresses a specific problem: agent-to-tool communication. A different, equally important problem is **agent-to-agent communication** — how do independent agents discover each other, negotiate tasks, and collaborate across organizational boundaries?

This is the problem that the **Agent-to-Agent (A2A) Protocol**, introduced by Google in April 2025, aims to solve. A2A is an open protocol that enables AI agents built on different frameworks, by different organizations, and running on different infrastructure to communicate and collaborate seamlessly.

### Why Agent-to-Agent Communication Matters

The AI industry is heading toward a world where agents are not isolated — they are interconnected. Consider these scenarios:

- **Enterprise automation**: Your company's procurement agent needs to communicate with a supplier's inventory agent to place an order.
- **Multi-vendor workflows**: A project management agent delegates a design task to an external agency's design agent.
- **Personal assistants**: Your personal AI agent negotiates with a restaurant's reservation agent to book a table.
- **Scientific research**: A data analysis agent collaborates with a simulation agent from a different research lab.

In each case, the agents:
1. Are built by different organizations
2. Run on different infrastructure
3. Use different underlying models
4. Have different capabilities and trust levels
5. Need to communicate without sharing internal implementation details

A2A provides the standardized protocol for these interactions.

### The Landscape: MCP vs A2A

Understanding the distinction between MCP and A2A is critical:

| Dimension | MCP | A2A |
|---|---|---|
| **Purpose** | Agent ↔ Tool/Data | Agent ↔ Agent |
| **Communication model** | Client-server (agent is client) | Peer-to-peer (agents are equal) |
| **Discovery** | Static configuration | Dynamic agent discovery |
| **Capability description** | Tool schemas | Agent skill cards |
| **Task model** | Tool call → result | Long-running task delegation |
| **Statefulness** | Stateless tool calls | Stateful task lifecycle |
| **Human oversight** | Per-tool permissions | Task-level approval |
| **Trust model** | Tool is trusted by host | Agent trust is negotiated |

MCP and A2A are **complementary, not competing**. An agent might use MCP to access its own tools while using A2A to delegate work to other agents.

```
┌─────────────────────────────────────────────────────────────────┐
│                     THE PROTOCOL LANDSCAPE                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     YOUR AGENT                            │   │
│  │                                                           │   │
│  │  ┌─────────┐     ┌─────────┐     ┌─────────┐            │   │
│  │  │  MCP    │     │  A2A    │     │  Your   │            │   │
│  │  │ Client  │     │ Client  │     │  Code   │            │   │
│  │  └────┬────┘     └────┬────┘     └─────────┘            │   │
│  │       │               │                                   │   │
│  └───────┼───────────────┼───────────────────────────────────┘   │
│          │               │                                       │
│    ┌─────┴─────┐   ┌─────┴──────────────────────────┐          │
│    │           │   │                                  │          │
│    ▼           ▼   ▼                                  ▼          │
│  ┌─────┐   ┌─────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │Tool │   │ DB  │  │ Agent B │  │ Agent C │  │ Agent D │    │
│  │Server│  │     │  │(Design) │  │(Finance)│  │(Legal)  │    │
│  └─────┘   └─────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                                  │
│  ←─ MCP ─→←─ MCP ─→←────────── A2A ──────────────────→       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.2 A2A Architecture

A2A follows a peer-to-peer model where agents communicate as equals, but with clearly defined roles for each interaction.

### Core Concepts

**Agent**: An AI system that can receive tasks, process them, and return results. In A2A, an agent is not just an LLM — it's a complete system with its own tools, memory, and capabilities.

**Agent Card**: A metadata document (typically at `/.well-known/agent.json`) that describes an agent's capabilities, skills, endpoint, and authentication requirements. This is how agents discover each other.

**Task**: A unit of work that one agent delegates to another. Tasks have a lifecycle: submitted → working → completed (or failed).

**Message**: A communication unit within a task. Messages contain parts (text, files, structured data) and are exchanged between the client and remote agent.

**Part**: A fragment of a message. Parts can be text, files, or structured data (JSON). A message can contain multiple parts.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    A2A ARCHITECTURE                              │
│                                                                  │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │    CLIENT AGENT      │         │    REMOTE AGENT      │       │
│  │    (Requesting)      │         │    (Performing)      │       │
│  │                       │         │                       │       │
│  │  ┌─────────────┐    │         │  ┌─────────────┐    │       │
│  │  │ Task Manager │    │         │  │ Task Manager │    │       │
│  │  └──────┬──────┘    │         │  └──────┬──────┘    │       │
│  │         │            │         │         │            │       │
│  │  ┌──────▼──────┐    │  HTTP/  │  ┌──────▼──────┐    │       │
│  │  │   A2A       │◄───┤  SSE   ├──►│   A2A       │    │       │
│  │  │   Client    │    │         │  │   Server    │    │       │
│  │  └─────────────┘    │         │  └─────────────┘    │       │
│  │                       │         │                       │       │
│  │  ┌─────────────┐    │         │  ┌─────────────┐    │       │
│  │  │Agent Card   │    │         │  │Agent Card   │    │       │
│  │  │Discovery    │    │         │  │Published    │    │       │
│  │  └─────────────┘    │         │  └─────────────┘    │       │
│  └─────────────────────┘         └─────────────────────┘       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AGENT CARD REGISTRY                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐          │   │
│  │  │ Agent A   │  │ Agent B   │  │ Agent C   │          │   │
│  │  │ Card      │  │ Card      │  │ Card      │          │   │
│  │  └───────────┘  └───────────┘  └───────────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Cards

Agent cards are the foundation of A2A discovery. An agent publishes its card at a well-known URL, and other agents fetch it to understand what the agent can do.

```json
{
  "name": "Acme Design Agent",
  "description": "Professional design agent that creates UI mockups, logos, and brand guidelines.",
  "url": "https://design.acme.com/a2a",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  },
  "authentication": {
    "schemes": ["Bearer"],
    "credentials": "https://design.acme.com/.well-known/oauth-authorization-server"
  },
  "defaultInputModes": ["text", "file"],
  "defaultOutputModes": ["file", "text"],
  "skills": [
    {
      "id": "ui-mockup",
      "name": "UI Mockup Generation",
      "description": "Create UI mockups from text descriptions or wireframes",
      "tags": ["design", "ui", "mockup"],
      "examples": [
        "Create a landing page mockup for a SaaS product",
        "Design a mobile app dashboard for analytics"
      ]
    },
    {
      "id": "logo-design",
      "name": "Logo Design",
      "description": "Generate logo concepts and brand identity materials",
      "tags": ["design", "logo", "branding"],
      "examples": [
        "Design a minimalist logo for a tech startup",
        "Create a wordmark for a consulting firm"
      ]
    },
    {
      "id": "brand-guidelines",
      "name": "Brand Guidelines",
      "description": "Create comprehensive brand guideline documents",
      "tags": ["design", "brand", "guidelines"],
      "examples": [
        "Create brand guidelines for a new product launch",
        "Develop a style guide for a company rebrand"
      ]
    }
  ]
}
```

### Key Agent Card Fields

| Field | Purpose | Required |
|---|---|---|
| `name` | Human-readable agent name | ✅ |
| `description` | What the agent does | ✅ |
| `url` | A2A endpoint URL | ✅ |
| `version` | Protocol version | ✅ |
| `capabilities` | What the agent supports (streaming, push notifications) | ✅ |
| `authentication` | How to authenticate | ✅ |
| `defaultInputModes` | Accepted input types | ✅ |
| `defaultOutputModes` | Produced output types | ✅ |
| `skills` | Specific capabilities the agent offers | ✅ |

---

## 10.3 Task Lifecycle

A2A tasks follow a well-defined lifecycle with clear state transitions.

### Task States

```
┌───────────────────────────────────────────────────────┐
│                 TASK STATE MACHINE                     │
│                                                        │
│                    ┌──────────┐                        │
│                    │ SUBMITTED│                        │
│                    └────┬─────┘                        │
│                         │                              │
│                    ┌────▼─────┐                        │
│              ┌─────│ WORKING  │─────┐                 │
│              │     └────┬─────┘     │                 │
│              │          │           │                 │
│              ▼          │           ▼                 │
│       ┌──────────┐     │     ┌──────────┐            │
│       │ INPUT    │     │     │ CANCELED │            │
│       │ REQUIRED │     │     └──────────┘            │
│       └────┬─────┘     │                              │
│            │           │                              │
│            ▼           ▼                              │
│       ┌──────────┐  ┌──────────┐                     │
│       │ SUBMITTED│  │COMPLETED │                     │
│       │ (resubmit)│ │          │                     │
│       └──────────┘  └──────────┘                     │
│                                                        │
│              ┌──────────┐                              │
│              │ FAILED   │                              │
│              └──────────┘                              │
└───────────────────────────────────────────────────────┘
```

| State | Description | Who Sets It |
|---|---|---|
| `submitted` | Task has been sent to the remote agent | Client |
| `working` | Remote agent is processing the task | Remote agent |
| `input-required` | Remote agent needs more information | Remote agent |
| `completed` | Task finished successfully | Remote agent |
| `failed` | Task failed | Remote agent |
| `canceled` | Task was canceled | Client or remote agent |

### The Input-Required Pattern

One of A2A's most powerful features is the `input-required` state. This enables **interactive task execution** where the remote agent can pause and ask for clarification:

```
┌────────────────────────────────────────────────────────────┐
│              INTERACTIVE TASK FLOW                          │
│                                                             │
│  Client Agent                Remote Agent                   │
│      │                           │                          │
│      │──── Task: "Design a logo"──→                        │
│      │                           │                          │
│      │                    ┌──────▼──────┐                  │
│      │                    │  Analyzing  │                  │
│      │                    │  request    │                  │
│      │                    └──────┬──────┘                  │
│      │                           │                          │
│      │←── State: input-required ──│                        │
│      │    "What style? Minimal   │                          │
│      │     or elaborate?"        │                          │
│      │                           │                          │
│      │─── "Minimal, geometric"──→│                          │
│      │                           │                          │
│      │                    ┌──────▼──────┐                  │
│      │                    │  Generating │                  │
│      │                    │  designs    │                  │
│      │                    └──────┬──────┘                  │
│      │                           │                          │
│      │←── State: completed ──────│                         │
│      │    [logo file]           │                          │
│      │                           │                          │
└────────────────────────────────────────────────────────────┘
```

This pattern is crucial because:
1. It avoids wasting resources on tasks with ambiguous requirements
2. It enables iterative refinement through dialogue
3. It maintains clear ownership of decisions (the client decides, the remote agent executes)

### Task Messages and Parts

Tasks communicate through messages, and messages contain parts:

```
Task
├── Message (client → remote)
│   ├── Part: TextPart ("Design a logo for Acme Corp")
│   └── Part: FilePart (reference_image.png)
│
├── Message (remote → client)
│   ├── Part: TextPart ("What style do you prefer?")
│   └── Part: DataPart (style_options.json)
│
├── Message (client → remote)
│   └── Part: TextPart ("Minimal, geometric")
│
└── Message (remote → client)
    ├── Part: TextPart ("Here are three concepts:")
    ├── Part: FilePart (logo_concept_1.svg)
    ├── Part: FilePart (logo_concept_2.svg)
    └── Part: FilePart (logo_concept_3.svg)
```

### Part Types

| Part Type | Description | Use Case |
|---|---|---|
| `TextPart` | Plain text or markdown content | Instructions, descriptions, responses |
| `FilePart` | Binary file data or URI reference | Images, documents, code files |
| `DataPart` | Structured JSON data | Metadata, configuration, structured results |

---

## 10.4 The A2A Protocol in Detail

### HTTP Transport

A2A uses standard HTTP for transport, making it easy to implement and deploy:

| Endpoint | Method | Purpose |
|---|---|---|
| `/.well-known/agent.json` | GET | Fetch agent card (discovery) |
| `/` | POST | Send task (create or continue) |
| `/` | GET | List tasks |
| `/{taskId}` | GET | Get task status |
| `/{taskId}` | POST | Send message to task |
| `/{taskId}` | DELETE | Cancel task |
| `/{taskId}/cancel` | POST | Request task cancellation |
| `/{taskId}/subscribe` | GET (SSE) | Subscribe to task updates |

### Request/Response Flow

**Step 1: Discover the Agent**

```http
GET https://design.acme.com/.well-known/agent.json HTTP/1.1
```

Response:
```json
{
  "name": "Acme Design Agent",
  "skills": [...],
  "url": "https://design.acme.com/a2a",
  ...
}
```

**Step 2: Authenticate**

```http
POST https://design.acme.com/a2a HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json
```

**Step 3: Create a Task**

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "tasks/send",
  "params": {
    "id": "task-001",
    "message": {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Create a minimal logo for a fintech startup called 'PayFlow'"
        },
        {
          "type": "file",
          "file": {
            "name": "reference.png",
            "uri": "https://example.com/reference.png"
          }
        }
      ]
    },
    "configuration": {
      "acceptedOutputModes": ["file", "text"],
      "pushNotification": {
        "url": "https://myagent.com/a2a/notifications",
        "token": "optional-verification-token"
      }
    }
  }
}
```

**Step 4: Check Task Status**

```json
{
  "jsonrpc": "2.0",
  "id": "req-002",
  "method": "tasks/get",
  "params": {
    "id": "task-001"
  }
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "id": "req-002",
  "result": {
    "id": "task-001",
    "status": {
      "state": "completed",
      "timestamp": "2026-07-16T10:30:00Z"
    },
    "artifacts": [
      {
        "name": "Logo Concepts",
        "parts": [
          {
            "type": "file",
            "file": {
              "name": "payflow-logo.svg",
              "uri": "https://design.acme.com/results/task-001/logo.svg"
            }
          }
        ]
      }
    ]
  }
}
```

### Streaming with SSE

For long-running tasks, A2A supports Server-Sent Events (SSE) for real-time updates:

```http
GET https://design.acme.com/a2a/task-001/subscribe HTTP/1.1
Accept: text/event-stream
Authorization: Bearer <token>
```

Event stream:
```
event: task-update
data: {"taskId":"task-001","status":{"state":"working"}}

event: task-update
data: {"taskId":"task-001","status":{"state":"working"},"message":"Generating initial concepts..."}

event: task-update
data: {"taskId":"task-001","status":{"state":"completed"},"artifacts":[...]}

event: done
data: {}
```

### Push Notifications

A2A supports push notifications so remote agents can notify clients of task completion without the client polling:

```json
{
  "jsonrpc": "2.0",
  "method": "tasks/send",
  "params": {
    "id": "task-002",
    "message": {...},
    "configuration": {
      "pushNotification": {
        "url": "https://myagent.com/notifications",
        "token": "verification-token-123",
        "authentication": {
          "schemes": ["Bearer"],
          "credentials": "https://myagent.com/oauth/token"
        }
      }
    }
  }
}
```

The remote agent sends a POST to the notification URL when the task completes:

```http
POST https://myagent.com/notifications HTTP/1.1
Authorization: Bearer verification-token-123
Content-Type: application/json

{
  "event": "task-completed",
  "taskId": "task-002",
  "result": {...}
}
```

---

## 10.5 Security and Trust

Agent-to-agent communication introduces new security challenges. Unlike tool calls (where the tool is trusted by the agent's host), agent-to-agent communication involves potentially untrusted remote parties.

### Authentication

A2A supports standard authentication mechanisms:

| Mechanism | Description | When to Use |
|---|---|---|
| **Bearer Token** | Simple API key or JWT | Internal services, low-risk operations |
| **OAuth 2.0** | Delegated authorization | Cross-organization, user-delegated access |
| **mTLS** | Mutual TLS certificates | High-security, infrastructure-level trust |

### Authorization Model

A2A uses a capability-based authorization model. The agent card declares what skills are available, and the client must be authorized to use each skill:

```
┌──────────────────────────────────────────────────────────┐
│                AUTHORIZATION FLOW                         │
│                                                           │
│  1. Client discovers agent card                          │
│     → Sees available skills                              │
│                                                           │
│  2. Client authenticates with remote agent               │
│     → Provides credentials (token, OAuth, etc.)          │
│                                                           │
│  3. Client sends task request                            │
│     → Specifies which skill to invoke                    │
│                                                           │
│  4. Remote agent checks authorization                    │
│     → Is this client allowed to use this skill?          │
│     → Are there rate limits or quotas?                   │
│                                                           │
│  5. Remote agent processes or rejects                    │
│     → 200 OK if authorized                               │
│     → 403 Forbidden if not                               │
│     → 429 Too Many Requests if rate limited              │
└──────────────────────────────────────────────────────────┘
```

### Trust Boundaries

In production A2A deployments, trust is established through several mechanisms:

**Level 1: Anonymous** — Agent cards are public, but no tasks can be submitted without authentication.

**Level 2: Authenticated** — Agent verifies the client's identity but applies no skill-level restrictions.

**Level 3: Authorized** — Agent enforces skill-level permissions, rate limits, and quotas per client.

**Level 4: Verified** — Agent requires signed task requests, maintains audit logs, and enforces compliance policies.

```
Trust Level    Use Case                    Implementation
─────────────────────────────────────────────────────────
Anonymous      Public agent directory      Agent card only
Authenticated  Internal company agents     Bearer tokens
Authorized     Cross-org workflows         OAuth 2.0 + RBAC
Verified       Financial/legal agents      mTLS + signatures + audit
```

### Data Privacy

When agents exchange data, privacy must be preserved:

- **Input sanitization**: Remote agents should not receive more data than necessary for the task.
- **Output filtering**: Results may need filtering before forwarding to the client.
- **Encryption**: All A2A communication should use TLS in transit.
- **Data retention**: Define and enforce data retention policies for task data.
- **Audit logging**: Record all agent-to-agent interactions for compliance.

---

## 10.6 Implementing A2A

### Server Implementation

Here's a minimal A2A server implementation in Python:

```python
from fastapi import FastAPI, Request
from pydantic import BaseModel

app = FastAPI()

AGENT_CARD = {
    "name": "Translation Agent",
    "description": "Translates text between 50+ languages",
    "url": "https://translate.example.com/a2a",
    "version": "1.0.0",
    "capabilities": {
        "streaming": False,
        "pushNotifications": True,
        "stateTransitionHistory": True
    },
    "authentication": {"schemes": ["Bearer"]},
    "defaultInputModes": ["text"],
    "defaultOutputModes": ["text"],
    "skills": [
        {
            "id": "translate",
            "name": "Text Translation",
            "description": "Translate text between languages",
            "tags": ["translation", "language"],
            "examples": ["Translate 'Hello world' to Spanish"]
        }
    ]
}

tasks: dict[str, Task] = {}

@app.get("/.well-known/agent.json")
async def get_agent_card():
    return AGENT_CARD

@app.post("/a2a")
async def handle_task(request: Request):
    body = await request.json()
    method = body.get("method")
    
    if method == "tasks/send":
        return await handle_task_send(body)
    elif method == "tasks/get":
        return await handle_task_get(body)
    elif method == "tasks/cancel":
        return await handle_task_cancel(body)
    
    return {"jsonrpc": "2.0", "error": {"code": -32601, "message": "Method not found"}}

async def handle_task_send(body: dict):
    params = body["params"]
    task_id = params["id"]
    message = params["message"]
    
    # Create or update task
    task = Task(id=task_id, status="working")
    tasks[task_id] = task
    
    # Process the task
    text_parts = [p["text"] for p in message["parts"] if p["type"] == "text"]
    input_text = " ".join(text_parts)
    
    # Perform translation
    result = await translate(input_text)
    
    task.status = "completed"
    task.artifacts = [{
        "parts": [{"type": "text", "text": result}]
    }]
    
    return {
        "jsonrpc": "2.0",
        "id": body["id"],
        "result": task.to_dict()
    }

async def handle_task_get(body: dict):
    task_id = body["params"]["id"]
    task = tasks.get(task_id)
    if not task:
        return {"jsonrpc": "2.0", "error": {"code": -32001, "message": "Task not found"}}
    return {"jsonrpc": "2.0", "id": body["id"], "result": task.to_dict()}
```

### Client Implementation

```python
import httpx

class A2AClient:
    def __init__(self, agent_url: str, auth_token: str):
        self.agent_url = agent_url
        self.headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    async def discover(self) -> dict:
        """Fetch the agent card."""
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.agent_url}/.well-known/agent.json")
            return resp.json()
    
    async def send_task(self, task_id: str, text: str) -> dict:
        """Send a task to the remote agent."""
        payload = {
            "jsonrpc": "2.0",
            "id": f"req-{task_id}",
            "method": "tasks/send",
            "params": {
                "id": task_id,
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": text}]
                }
            }
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                self.agent_url,
                json=payload,
                headers=self.headers
            )
            return resp.json()
    
    async def get_task(self, task_id: str) -> dict:
        """Get the status of a task."""
        payload = {
            "jsonrpc": "2.0",
            "id": f"req-get-{task_id}",
            "method": "tasks/get",
            "params": {"id": task_id}
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                self.agent_url,
                json=payload,
                headers=self.headers
            )
            return resp.json()

# Usage
async def main():
    client = A2AClient("https://translate.example.com/a2a", "token-123")
    
    # Discover
    card = await client.discover()
    print(f"Agent: {card['name']}")
    print(f"Skills: {[s['name'] for s in card['skills']]}")
    
    # Send task
    result = await client.send_task("task-001", "Translate 'Hello world' to French")
    
    # Get result
    task = await client.get_task("task-001")
    print(f"Status: {task['result']['status']['state']}")
    print(f"Result: {task['result']['artifacts'][0]['parts'][0]['text']}")
```

---

## 10.7 Orchestration Patterns with A2A

A2A enables several powerful orchestration patterns beyond simple task delegation.

### Pattern 1: Agent Discovery and Selection

An orchestrator agent discovers available agents and selects the best one for each task:

```
┌────────────────────────────────────────────────────────────────┐
│              AGENT DISCOVERY PATTERN                            │
│                                                                 │
│  ┌──────────┐                                                  │
│  │ Task:    │                                                  │
│  │ "Translate│                                                 │
│  │  + Design │                                                 │
│  │  + Legal  │                                                 │
│  │  review"  │                                                 │
│  └────┬─────┘                                                  │
│       │                                                        │
│       ▼                                                        │
│  ┌──────────┐                                                  │
│  │ Registry │                                                  │
│  │ Lookup   │                                                  │
│  └────┬─────┘                                                  │
│       │                                                        │
│  ┌────┼──────────────────┬──────────────────┐                 │
│  │    │                  │                  │                 │
│  ▼    ▼                  ▼                  ▼                 │
│ ┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│ │Agent │  │Agent     │  │Agent     │  │Agent     │          │
│ │A:    │  │B:        │  │C:        │  │D:        │          │
│ │Trans-│  │Design    │  │Legal     │  │Translate │          │
│ │late  │  │Agent     │  │Review    │  │+ Design  │          │
│ │      │  │          │  │Agent     │  │(combo)   │          │
│ └──────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                 │
│  Orchestrator selects:                                         │
│  - Agent D for combined translate+design (best match)         │
│  - Agent C for legal review (only legal specialist)           │
└────────────────────────────────────────────────────────────────┘
```

Implementation:

```python
class AgentOrchestrator:
    def __init__(self, registry_url: str):
        self.registry = AgentRegistry(registry_url)
    
    async def execute_task(self, task_description: str):
        # Discover available agents
        agents = await self.registry.list_agents()
        
        # Match task to agents by skill
        scored_agents = []
        for agent in agents:
            card = await agent.discover()
            score = self._match_score(task_description, card["skills"])
            scored_agents.append((score, agent, card))
        
        # Select best agent
        scored_agents.sort(reverse=True, key=lambda x: x[0])
        best_score, best_agent, best_card = scored_agents[0]
        
        if best_score < 0.5:
            return {"error": "No suitable agent found"}
        
        # Delegate task
        result = await best_agent.send_task(
            task_id=str(uuid4()),
            text=task_description
        )
        
        return result
```

### Pattern 2: Agent Chains

Chain multiple agents where the output of one becomes the input of the next:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT CHAIN PATTERN                           │
│                                                                  │
│  User Request                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ Agent A  │───→│ Agent B  │───→│ Agent C  │───→│ Agent D  │ │
│  │          │    │          │    │          │    │          │ │
│  │ Research │    │ Analyze  │    │ Write    │    │ Review   │ │
│  │ Data     │    │ Findings │    │ Report   │    │ & Edit   │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│       │               │               │               │        │
│       ▼               ▼               ▼               ▼        │
│   Raw Data       Analysis        Draft Report    Final Report  │
└─────────────────────────────────────────────────────────────────┘
```

```python
async def agent_chain(task: str, agent_chain: list[A2AClient]):
    current_input = task
    
    for agent in agent_chain:
        result = await agent.send_task(
            task_id=str(uuid4()),
            text=current_input
        )
        
        # Extract text from result
        artifacts = result["result"]["artifacts"]
        current_input = extract_text(artifacts)
    
    return current_input
```

### Pattern 3: Parallel Agent Execution

Run multiple agents simultaneously and merge their results:

```
┌─────────────────────────────────────────────────────────────────┐
│                  PARALLEL AGENT PATTERN                          │
│                                                                  │
│                      ┌──────────┐                               │
│                      │  TASK    │                               │
│                      └────┬─────┘                               │
│                           │                                     │
│              ┌────────────┼────────────┐                       │
│              │            │            │                        │
│              ▼            ▼            ▼                        │
│         ┌────────┐  ┌────────┐  ┌────────┐                    │
│         │Agent A │  │Agent B │  │Agent C │                    │
│         │        │  │        │  │        │                    │
│         │Language│  │Culture │  │Industry│                    │
│         │Check   │  │Context │  │Terminol-│                   │
│         │        │  │        │  │ogy     │                    │
│         └───┬────┘  └───┬────┘  └───┬────┘                    │
│             │           │           │                           │
│             └───────────┼───────────┘                           │
│                         │                                       │
│                    ┌────▼─────┐                                 │
│                    │  MERGE   │                                 │
│                    │ Results  │                                 │
│                    └────┬─────┘                                 │
│                         │                                       │
│                    ┌────▼─────┐                                 │
│                    │  FINAL   │                                 │
│                    │  OUTPUT  │                                 │
│                    └──────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pattern 4: Fallback and Redundancy

If one agent fails, fall back to alternatives:

```python
async def execute_with_fallback(task: str, agents: list[A2AClient]):
    for agent in agents:
        try:
            result = await agent.send_task(task_id=str(uuid4()), text=task)
            if result["result"]["status"]["state"] == "completed":
                return result
        except (httpx.HTTPError, TimeoutError) as e:
            continue  # Try next agent
    
    return {"error": "All agents failed"}
```

### Pattern 5: Human-in-the-Loop

A2A's `input-required` state naturally supports human-in-the-loop workflows:

```
┌─────────────────────────────────────────────────────────────────┐
│                HUMAN-IN-THE-LOOP PATTERN                         │
│                                                                  │
│  Client Agent          Remote Agent          Human               │
│      │                    │                    │                 │
│      │── Task ───────────→│                    │                 │
│      │                    │                    │                 │
│      │               ┌────▼────┐              │                 │
│      │               │ Needs   │              │                 │
│      │               │ human   │              │                 │
│      │               │ input   │              │                 │
│      │               └────┬────┘              │                 │
│      │←─ input-required ──│                    │                 │
│      │   "Approve design?"│                    │                 │
│      │                    │                    │                 │
│      │───────────── Forward to human ─────────→│                │
│      │                    │                    │                 │
│      │                    │    ←── "Approved" ─│                │
│      │── Resubmit with ──→│                    │                 │
│      │   approval         │                    │                 │
│      │                    │                    │                 │
│      │               ┌────▼────┐              │                 │
│      │               │ Complete│              │                 │
│      │               └────┬────┘              │                 │
│      │←─ completed ───────│                    │                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10.8 Agent Registries and Discovery

As the number of available agents grows, registries become essential for discovery.

### Registry Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   AGENT REGISTRY ARCHITECTURE                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   REGISTRY SERVICE                        │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Agent Card  │  │ Skill Index  │  │ Rating &     │   │   │
│  │  │ Store       │  │              │  │ Trust Score  │   │   │
│  │  └─────────────┘  └──────────────┘  └──────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │ Search API  │  │ Matchmaking  │  │ Health Check │   │   │
│  │  │             │  │ Engine       │  │ Monitor      │   │   │
│  │  └─────────────┘  └──────────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐          │
│  │ Agent A  │        │ Agent B  │        │ Agent C  │          │
│  │ Card     │        │ Card     │        │ Card     │          │
│  └──────────┘        └──────────┘        └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Registry Operations

**Registration**: Agents register their cards with the registry, providing metadata about their capabilities.

**Search**: Orchestrators search for agents by skill, tag, description, or capability.

**Matchmaking**: The registry suggests the best agent for a given task based on skill matching, reputation, and availability.

**Health Monitoring**: The registry periodically checks that registered agents are still available and responsive.

```python
class AgentRegistry:
    def __init__(self):
        self.agents: dict[str, AgentCard] = {}
        self.ratings: dict[str, float] = {}
    
    async def register(self, card: AgentCard):
        """Register an agent card."""
        self.agents[card.url] = card
    
    async def search(self, query: str, tags: list[str] = None) -> list[AgentCard]:
        """Search for agents matching query and tags."""
        results = []
        for card in self.agents.values():
            score = self._relevance_score(card, query, tags)
            if score > 0.3:
                results.append((score, card))
        
        results.sort(reverse=True, key=lambda x: x[0])
        return [card for _, card in results]
    
    async def recommend(self, task_description: str) -> AgentCard:
        """Recommend the best agent for a task."""
        candidates = await self.search(task_description)
        if not candidates:
            raise NoAgentFoundError("No suitable agent found")
        
        # Factor in ratings and availability
        scored = []
        for card in candidates:
            availability = await self._check_availability(card.url)
            rating = self.ratings.get(card.url, 3.0)
            score = rating * availability
            scored.append((score, card))
        
        scored.sort(reverse=True, key=lambda x: x[0])
        return scored[0][1]
```

### Decentralized Discovery

Beyond centralized registries, A2A supports decentralized discovery:

- **DNS-based discovery**: Agent cards at well-known URLs discoverable via DNS SRV records
- **mDNS/Avahi**: Local network agent discovery
- **Blockchain registries**: Decentralized, tamper-proof agent registration
- **Federated registries**: Registries that sync with each other

---

## 10.9 A2A and MCP Together

The real power of agent protocols emerges when A2A and MCP work together. An agent can use MCP to access its own tools while using A2A to collaborate with other agents.

### Combined Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              AGENT USING BOTH MCP AND A2A                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   YOUR AGENT                              │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │              REASONING ENGINE                     │    │   │
│  │  │  (LLM + Planning + Memory + Reflection)          │    │   │
│  │  └───────────┬─────────────────┬───────────────────┘    │   │
│  │              │                 │                          │   │
│  │  ┌───────────▼──────┐  ┌──────▼──────────────┐         │   │
│  │  │   MCP CLIENT     │  │   A2A CLIENT          │         │   │
│  │  │                  │  │                       │         │   │
│  │  │ Access tools &   │  │ Delegate to other     │         │   │
│  │  │ data sources     │  │ agents                │         │   │
│  │  └────────┬─────────┘  └──────────┬────────────┘         │   │
│  └───────────┼───────────────────────┼───────────────────────┘   │
│              │                       │                           │
│     ┌────────┴────────┐     ┌───────┴────────┐                 │
│     │                 │     │                 │                  │
│     ▼                 ▼     ▼                 ▼                  │
│  ┌──────┐  ┌──────┐  ┌──────────┐  ┌──────────┐              │
│  │MCP   │  │MCP   │  │Agent B   │  │Agent C   │              │
│  │Server│  │Server│  │(Design)  │  │(Legal)   │              │
│  │(DB)  │  │(File)│  │via A2A   │  │via A2A   │              │
│  └──────┘  └──────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Use Case: Content Pipeline

A content creation agent uses MCP to access its internal tools and A2A to delegate specialized work:

```python
class ContentPipelineAgent:
    def __init__(self):
        # MCP: Access internal tools
        self.mcp_client = MCPClient()
        self.mcp_client.connect("filesystem-server")
        self.mcp_client.connect("database-server")
        
        # A2A: Access external agents
        self.a2a_client = A2AClient("https://registry.example.com")
    
    async def create_content(self, topic: str):
        # Step 1: Research using MCP tools
        research = await self.mcp_client.call("search_database", {"query": topic})
        existing_content = await self.mcp_client.call("read_file", {"path": f"content/{topic}.md"})
        
        # Step 2: Delegate writing to A2A agent
        writing_agent = await self.a2a_client.find_agent(skill="technical-writing")
        draft = await writing_agent.send_task(f"Write an article about {topic} based on: {research}")
        
        # Step 3: Delegate design to A2A agent
        design_agent = await self.a2a_client.find_agent(skill="ui-mockup")
        images = await design_agent.send_task(f"Create header images for article about {topic}")
        
        # Step 4: Store results using MCP
        await self.mcp_client.call("write_file", {
            "path": f"content/{topic}-final.md",
            "content": combine(draft, images)
        })
        
        return "Content created successfully"
```

---

## 10.10 Error Handling in A2A

A2A defines specific error codes and handling patterns:

### Error Codes

| Code | Name | Description |
|---|---|---|
| `-32700` | Parse error | Invalid JSON |
| `-32600` | Invalid request | Malformed request |
| `-32601` | Method not found | Unknown method |
| `-32602` | Invalid params | Invalid parameters |
| `-32603` | Internal error | Server-side error |
| `-32001` | Task not found | Task ID doesn't exist |
| `-32002` | Task not cancellable | Task can't be canceled |
| `-32003` | Push notification not supported | Agent doesn't support push |

### Retry Strategies

```python
async def send_with_retry(client: A2AClient, task_id: str, text: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            result = await client.send_task(task_id, text)
            
            # Check for task-level errors
            if result.get("error"):
                error_code = result["error"]["code"]
                if error_code == -32603:  # Internal error - retry
                    await asyncio.sleep(2 ** attempt)
                    continue
                elif error_code == -32601:  # Method not found - don't retry
                    raise A2AError(f"Method not found: {result['error']['message']}")
            
            return result
            
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:  # Rate limited
                retry_after = int(e.response.headers.get("Retry-After", 60))
                await asyncio.sleep(retry_after)
                continue
            elif e.response.status_code >= 500:  # Server error - retry
                await asyncio.sleep(2 ** attempt)
                continue
            else:
                raise  # Client error - don't retry
    
    raise A2AMaxRetriesError(f"Failed after {max_retries} attempts")
```

### Timeout Handling

```python
async def send_with_timeout(client: A2AClient, task_id: str, text: str, timeout: int = 300):
    result = await client.send_task(task_id, text)
    
    # Poll for completion with timeout
    start = time.time()
    while time.time() - start < timeout:
        task = await client.get_task(task_id)
        state = task["result"]["status"]["state"]
        
        if state == "completed":
            return task["result"]
        elif state == "failed":
            raise A2ATaskFailedError(task["result"]["status"].get("message", "Unknown error"))
        elif state == "input-required":
            # Handle interactive input
            response = await get_human_input(task["result"]["status"]["message"])
            await client.send_task(task_id, response)
        
        await asyncio.sleep(2)  # Poll interval
    
    raise A2ATimeoutError(f"Task {task_id} did not complete within {timeout}s")
```

---

## 10.11 Production Considerations

### Scalability

| Concern | Solution |
|---|---|
| High task volume | Horizontal scaling of A2A servers behind load balancer |
| Long-running tasks | Async processing with task queues |
| Cross-region communication | Multi-region agent deployment with DNS routing |
| Protocol versioning | Version negotiation in agent cards |

### Monitoring

```python
# Track A2A metrics
metrics = {
    "tasks_sent": Counter("a2a_tasks_sent", "Total tasks sent", ["agent", "skill"]),
    "task_duration": Histogram("a2a_task_duration_seconds", "Task duration", ["agent", "skill"]),
    "task_errors": Counter("a2a_task_errors", "Task errors", ["agent", "error_type"]),
    "agent_availability": Gauge("a2a_agent_available", "Agent availability", ["agent"]),
}
```

### Cost Management

Agent-to-agent communication has real costs:
- **Token costs**: Each agent maintains its own context
- **Network costs**: HTTP calls between agents
- **Compute costs**: Each agent's processing

Implement budget controls:

```python
class A2ABudgetManager:
    def __init__(self, max_cost_per_task: float = 1.00):
        self.max_cost = max_cost_per_task
    
    async def check_budget(self, task_id: str, agent_url: str) -> bool:
        current_cost = self.get_task_cost(task_id)
        estimated_cost = self.estimate_agent_cost(agent_url)
        
        if current_cost + estimated_cost > self.max_cost:
            raise BudgetExceededError(
                f"Task {task_id} would exceed budget: "
                f"${current_cost:.2f} + ${estimated_cost:.2f} > ${self.max_cost:.2f}"
            )
        return True
```

---

## 10.12 The Emerging Agent Web

A2A is more than a protocol — it's the foundation for an emerging **agent web** where AI agents are first-class citizens of the internet.

### Vision: Agents as a Service

In the near future, agent registries will function like app stores:

```
┌─────────────────────────────────────────────────────────────────┐
│                  THE AGENT WEB                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 AGENT MARKETPLACE                         │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ Translation│  │ Design  │  │ Legal    │              │   │
│  │  │ Agent     │  │ Agent   │  │ Review   │              │   │
│  │  │ ⭐ 4.8   │  │ ⭐ 4.5  │  │ ⭐ 4.9   │              │   │
│  │  │ $0.01/   │  │ $0.05/  │  │ $0.10/   │              │   │
│  │  │ request  │  │ request │  │ request  │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ Code     │  │ Data     │  │ Research │              │   │
│  │  │ Review   │  │ Analysis │  │ Agent    │              │   │
│  │  │ Agent    │  │ Agent    │  │          │              │   │
│  │  │ ⭐ 4.7   │  │ ⭐ 4.6  │  │ ⭐ 4.4   │              │   │
│  │  │ $0.02/   │  │ $0.03/  │  │ $0.01/   │              │   │
│  │  │ review   │  │ query   │  │ query    │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│              ┌───────────────┼───────────────┐                 │
│              ▼               ▼               ▼                  │
│         ┌────────┐     ┌────────┐     ┌────────┐              │
│         │Startup │     │Enterprise│   │Personal│              │
│         │Agent   │     │Agent   │     │Agent   │              │
│         │(uses   │     │(uses   │     │(uses   │              │
│         │market- │     │market- │     │market- │              │
│         │place)  │     │place)  │     │place)  │              │
│         └────────┘     └────────┘     └────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Standards and Governance

The agent web requires governance:

- **Interoperability standards**: A2A, MCP, and future protocols must evolve together
- **Trust frameworks**: How do agents verify each other's capabilities?
- **Liability models**: Who is responsible when an agent-to-agent interaction causes harm?
- **Regulation**: How do existing regulations apply to autonomous agent interactions?

### The Road Ahead

A2A is still young (introduced in 2025), but its trajectory mirrors the early web:

| Web Era | Agent Era Equivalent |
|---|---|
| Static HTML pages | Simple tool-calling agents |
| CGI scripts | ReAct agents |
| HTTP/HTML standardization | MCP + A2A standardization |
| Search engines (Google) | Agent registries |
| Web 2.0 (user-generated content) | User-created agents |
| APIs and microservices | Agent-to-agent protocols |
| Cloud computing | Agent-as-a-Service platforms |

The agent web is not a future concept — it's being built today. Understanding A2A is understanding the infrastructure layer of this emerging paradigm.

---

## 10.13 Summary

| Concept | Description |
|---|---|
| **A2A Protocol** | Open standard for agent-to-agent communication |
| **Agent Card** | Metadata document describing agent capabilities |
| **Task Lifecycle** | submitted → working → completed/failed |
| **Input-Required** | Interactive task execution with agent-initiated questions |
| **MCP + A2A** | Complementary protocols: tools vs. agents |
| **Agent Registry** | Centralized discovery and matchmaking |
| **Agent Web** | Emerging ecosystem of interconnected agents |

A2A transforms agents from isolated tools into participants in a collaborative ecosystem. Combined with MCP for tool access, it provides the complete communication infrastructure for the agent era.

---

*Next: Chapter 11 — Inference Optimization, where we explore the engineering behind making agents fast, efficient, and affordable.*
