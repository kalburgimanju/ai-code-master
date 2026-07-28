# Chapter 11: Streaming and Real-time Execution

## Why Streaming?

Streaming provides real-time feedback for better UX:
- **Perceived speed** - Users see progress immediately
- **Interactivity** - Cancel, redirect, or approve mid-stream
- **Debugging** - See intermediate reasoning
- **Long-running tasks** - Avoid timeout issues

---

## Streaming Modes

LangGraph supports multiple streaming modes:

```python
app = graph.compile()

# 1. Values mode - full state at each step
for chunk in app.stream(input, config, stream_mode="values"):
    print(chunk["status"])

# 2. Updates mode - only changed fields
for chunk in app.stream(input, config, stream_mode="updates"):
    print(chunk)

# 3. Messages mode - for chat interfaces
for chunk in app.stream(input, config, stream_mode="messages"):
    print(chunk)

# 4. Custom mode - node-specific
for chunk in app.stream(input, config, stream_mode="custom"):
    print(chunk)
```

---

## Streaming LLM Output

### Token-by-Token Streaming

```python
from langchain_core.callbacks import AsyncIteratorCallbackHandler
from langchain_openai import ChatOpenAI

async def stream_llm(state: State):
    callback = AsyncIteratorCallbackHandler()
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        streaming=True,
        callbacks=[callback]
    )
    
    # Start generation in background
    task = asyncio.create_task(llm.ainvoke(state["messages"]))
    
    # Yield tokens as they arrive
    async for token in callback.aiter():
        yield {"messages": [token], "streaming": True}
    
    # Wait for completion
    result = await task
    yield {"messages": [result], "streaming": False}
```

### Streaming with Tool Calls

```python
async def stream_with_tools(state: State):
    llm = ChatOpenAI(model="gpt-4o-mini", streaming=True)
    llm_with_tools = llm.bind_tools(tools)
    
    # Stream the LLM response (including tool calls)
    async for chunk in llm_with_tools.astream(state["messages"]):
        yield {"messages": [chunk]}
    
    # If tool calls, execute and continue
    if chunk.tool_calls:
        for tool_call in chunk.tool_calls:
            result = await tools[tool_call["name"]].ainvoke(tool_call["args"])
            yield {"messages": [ToolMessage(content=result, tool_call_id=tool_call["id"])]}
```

---

## Real-time UI Updates

### Server-Sent Events (SSE)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

@app.post("/stream")
async def stream_endpoint(request: Request):
    input_data = await request.json()
    config = {"configurable": {"thread_id": input_data["thread_id"]}}
    
    async def event_generator():
        async for chunk in app.astream(input_data["input"], config, stream_mode="values"):
            # Format as SSE
            yield f"data: {json.dumps(chunk)}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### WebSocket Streaming

```python
from fastapi import WebSocket
import asyncio

@app.websocket("/ws/{thread_id}")
async def websocket_stream(websocket: WebSocket, thread_id: str):
    await websocket.accept()
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Stream graph execution
            async for chunk in app.astream(data["input"], config, stream_mode="values"):
                await websocket.send_json({
                    "type": "state_update",
                    "data": chunk
                })
            
            await websocket.send_json({"type": "complete"})
            
    except WebSocketDisconnect:
        pass
```

---

## Streaming with Human-in-the-Loop

```python
async def stream_with_hitl(state: State):
    config = {"configurable": {"thread_id": state["thread_id"]}}
    
    async for chunk in app.astream(state["input"], config, stream_mode="values"):
        if "__interrupt__" in chunk:
            # Yield interrupt for UI
            yield {
                "type": "interrupt",
                "data": chunk["__interrupt__"][0].value
            }
            
            # Wait for human response (via queue, WebSocket, etc.)
            human_response = await get_human_response(state["thread_id"])
            
            # Resume with human input
            async for resume_chunk in app.astream(
                Command(resume=human_response), config, stream_mode="values"
            ):
                yield {"type": "state_update", "data": resume_chunk}
        else:
            yield {"type": "state_update", "data": chunk}
```

---

## Progress Indicators

### Custom Progress Streaming

```python
class ProgressState(TypedDict):
    task: str
    progress: float  # 0.0 to 1.0
    status: str
    current_step: str
    results: Annotated[list, operator.add]

def progress_node(state: ProgressState) -> dict:
    # Simulate long-running work with progress updates
    for i in range(10):
        yield {
            "progress": (i + 1) / 10,
            "current_step": f"Processing step {i + 1}/10",
            "status": "running"
        }
        await asyncio.sleep(1)  # Real work here
    
    yield {
        "progress": 1.0,
        "status": "complete",
        "results": ["Result 1", "Result 2"]
    }
```

### Streaming Progress to UI

```python
async def stream_with_progress(input_data: dict, thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    
    async for chunk in app.astream(input_data, config, stream_mode="custom"):
        # Custom mode lets nodes yield progress directly
        if "progress" in chunk:
            yield {
                "type": "progress",
                "progress": chunk["progress"],
                "step": chunk["current_step"],
                "status": chunk["status"]
            }
        else:
            yield {"type": "result", "data": chunk}
```

---

## Cancelling Streaming Execution

```python
from langgraph.graph import StateGraph
import asyncio

class CancellableState(TypedDict):
    task: str
    cancelled: bool
    results: list

async def long_running_node(state: CancellableState):
    for i in range(100):
        # Check cancellation flag
        if state.get("cancelled"):
            return {"status": "cancelled", "results": state["results"]}
        
        # Do work
        result = await do_work_step(i)
        yield {"results": [result]}
    
    return {"status": "complete"}

# Cancellation endpoint
@app.post("/cancel/{thread_id}")
async def cancel_execution(thread_id: str):
    # Get current state
    config = {"configurable": {"thread_id": thread_id}}
    state = app.get_state(config)
    
    # Update with cancellation flag
    app.update_state(config, {"cancelled": True})
    
    return {"status": "cancelling"}
```

---

## Streaming Best Practices

### 1. Choose Right Stream Mode

| Mode | Use Case |
|------|----------|
| `values` | Full state for debugging, simple UIs |
| `updates` | Efficient, only changes |
| `messages` | Chat interfaces |
| `custom` | Fine-grained control, progress |

### 2. Handle Backpressure

```python
async def stream_with_backpressure(input_data, config):
    queue = asyncio.Queue(maxsize=100)
    
    async def producer():
        async for chunk in app.astream(input_data, config, stream_mode="values"):
            await queue.put(chunk)
        await queue.put(None)  # Sentinel
    
    async def consumer():
        while True:
            chunk = await queue.get()
            if chunk is None:
                break
            yield chunk
    
    producer_task = asyncio.create_task(producer())
    async for chunk in consumer():
        yield chunk
    await producer_task
```

### 3. Error Handling in Streams

```python
async def safe_stream(input_data, config):
    try:
        async for chunk in app.astream(input_data, config, stream_mode="values"):
            yield chunk
    except Exception as e:
        yield {"type": "error", "error": str(e), "recoverable": True}
    finally:
        # Cleanup
        pass
```

---

## Complete Streaming Example

```python
# streaming_app.py
from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from langgraph.graph import StateGraph
from langgraph.checkpoint.sqlite import SqliteSaver
import json

app = FastAPI()
checkpointer = SqliteSaver.from_conn_string("streaming.db")
compiled = build_graph().compile(checkpointer=checkpointer)

@app.post("/stream")
async def stream_endpoint(request: Request):
    data = await request.json()
    thread_id = data["thread_id"]
    input_data = data["input"]
    config = {"configurable": {"thread_id": thread_id}}
    
    async def generate():
        async for chunk in compiled.astream(input_data, config, stream_mode="values"):
            # Filter/transform for client
            event = {
                "thread_id": thread_id,
                "timestamp": datetime.now().isoformat(),
                "state": chunk
            }
            yield f"data: {json.dumps(event)}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.websocket("/ws/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: str):
    await websocket.accept()
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        while True:
            msg = await websocket.receive_json()
            
            if msg["type"] == "input":
                async for chunk in compiled.astream(msg["input"], config, stream_mode="values"):
                    await websocket.send_json({
                        "type": "update",
                        "data": chunk
                    })
                
                await websocket.send_json({"type": "done"})
                
    except WebSocketDisconnect:
        pass

# Client HTML
html = """
<!DOCTYPE html>
<html>
<body>
    <div id="output"></div>
    <script>
        const evtSource = new EventSource("/stream");
        evtSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            document.getElementById("output").innerHTML += 
                `<div>${data.state.status}: ${JSON.stringify(data.state)}</div>`;
        };
    </script>
</body>
</html>
"""
```

---

## Summary

| Feature | Implementation |
|---------|----------------|
| **Token streaming** | `streaming=True` + callbacks |
| **State streaming** | `app.astream(stream_mode="values")` |
| **Progress updates** | Custom node yields |
| **SSE** | `StreamingResponse` with generator |
| **WebSocket** | Bidirectional real-time |
| **Cancellation** | State flag + check in nodes |
| **HITL + streaming** | Interrupt + resume in stream |

---

## Next Chapter: Testing and Debugging Graphs

In Chapter 12, we'll cover testing strategies, debugging techniques, and observability for LangGraph applications.