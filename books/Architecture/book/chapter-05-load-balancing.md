# Chapter 5: Load Balancing

> *"If one server can handle 1,000 requests, ten servers can handle 10,000 — but only if you distribute the load wisely."*

## What Is Load Balancing?

Load balancing is the process of distributing incoming network traffic across multiple backend servers (instances) to ensure no single server becomes overwhelmed. A load balancer acts as a traffic cop, routing requests to the server best equipped to handle them at any given moment.

```
                        Load Balancer
                    ┌─────────────────┐
  Client 1 ──────►│                  │──────► Server 1
  Client 2 ──────►│   LB Algorithm   │──────► Server 2
  Client 3 ──────►│   (distributes)  │──────► Server 3
  Client 4 ──────►│                  │──────► Server 4
  Client 5 ──────►│                  │──────► Server 5
                    └─────────────────┘
```

## Load Balancing Algorithms

### Round Robin

Distributes requests sequentially across servers:

```
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A  (cycles back)
Request 5 → Server B
```

```python
class RoundRobinBalancer:
    def __init__(self, servers: list[str]):
        self.servers = servers
        self.current = 0

    def next_server(self) -> str:
        server = self.servers[self.current]
        self.current = (self.current + 1) % len(self.servers)
        return server


# Usage
balancer = RoundRobinBalancer([
    "server-1:8080",
    "server-2:8080",
    "server-3:8080",
])

for _ in range(6):
    print(balancer.next_server())
# server-1, server-2, server-3, server-1, server-2, server-3
```

### Weighted Round Robin

Servers receive proportionally more traffic based on weight:

```
Server A (weight 5): ████████████  (50%)
Server B (weight 3): ███████       (30%)
Server C (weight 2): ████          (20%)
```

```python
class WeightedRoundRobinBalancer:
    def __init__(self, servers: dict[str, int]):
        """servers: {"server-1:8080": 5, "server-2:8080": 3}"""
        self.servers = []
        for server, weight in servers.items():
            self.servers.extend([server] * weight)
        self.current = 0

    def next_server(self) -> str:
        server = self.servers[self.current]
        self.current = (self.current + 1) % len(self.servers)
        return server
```

### Least Connections

Routes to the server with the fewest active connections:

```
Server A: 3 active connections ◄── pick this
Server B: 7 active connections
Server C: 5 active connections
Server D: 12 active connections
```

```python
import heapq


class LeastConnectionsBalancer:
    def __init__(self, servers: list[str]):
        self.connections: dict[str, int] = {s: 0 for s in servers}
        self._heap = [(0, i, s) for i, s in enumerate(servers)]
        heapq.heapify(self._heap)

    def next_server(self) -> str:
        count, _, server = heapq.heappop(self.connections)
        self.connections[server] = count + 1
        heapq.heappush(self._heap, (self.connections[server], id(server), server))
        return server

    def release(self, server: str):
        if server in self.connections:
            self.connections[server] = max(0, self.connections[server] - 1)
```

### Consistent Hashing

Maps servers and keys to a hash ring, ensuring minimal redistribution when servers are added or removed:

```
                    Hash Ring
               ┌───────────────┐
              ╱                 ╲
            ╱                     ╲
      A •╱                         ╲• B
          ╲                         ╱
            ╲                     ╱
              ╲                 ╱
               • C            ╱
               └───────────────┘

Key "user:123" → hash → maps between A and B → routes to B
Key "order:456" → hash → maps between B and C → routes to C
```

```python
import hashlib
from bisect import bisect_right


class ConsistentHashBalancer:
    def __init__(self, servers: list[str], virtual_nodes: int = 150):
        self.ring: dict[int, str] = {}
        self.sorted_keys: list[int] = []
        self.virtual_nodes = virtual_nodes

        for server in servers:
            self.add_server(server)

    def _hash(self, key: str) -> int:
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add_server(self, server: str):
        for i in range(self.virtual_nodes):
            key = self._hash(f"{server}:{i}")
            self.ring[key] = server
            self.sorted_keys.append(key)
        self.sorted_keys.sort()

    def remove_server(self, server: str):
        for i in range(self.virtual_nodes):
            key = self._hash(f"{server}:{i}")
            self.ring.pop(key, None)
        self.sorted_keys = [k for k in self.sorted_keys if self.ring.get(k) == server]
        # Rebuild sorted_keys for remaining servers
        self.sorted_keys = sorted(self.ring.keys())

    def get_server(self, key: str) -> str:
        if not self.sorted_keys:
            raise ValueError("No servers available")

        h = self._hash(key)
        idx = bisect_right(self.sorted_keys, h) % len(self.sorted_keys)
        return self.ring[self.sorted_keys[idx]]


# Usage
balancer = ConsistentHashBalancer(["server-1", "server-2", "server-3"])

# Same key always routes to same server
print(balancer.get_server("user:123"))  # server-2
print(balancer.get_server("user:123"))  # server-2 (same!)
print(balancer.get_server("user:456"))  # server-1

# When server-2 is removed, only ~1/N of keys remap
balancer.remove_server("server-2")
print(balancer.get_server("user:123"))  # server-1 or server-3
```

### IP Hash

Uses client IP to determine server assignment (sticky sessions):

```python
import hashlib


class IPHashBalancer:
    def __init__(self, servers: list[str]):
        self.servers = servers

    def get_server(self, client_ip: str) -> str:
        ip_hash = int(hashlib.md5(client_ip.encode()).hexdigest(), 16)
        idx = ip_hash % len(self.servers)
        return self.servers[idx]
```

## Algorithm Comparison

| Algorithm | Session Persistence | Even Distribution | Complexity | Best For |
|-----------|-------------------|-------------------|------------|----------|
| Round Robin | No | Yes | Low | Uniform servers |
| Weighted RR | No | Proportional | Low | Mixed-capacity servers |
| Least Connections | Implicit | Yes | Medium | Long-lived connections |
| Consistent Hash | Yes (by key) | Yes | High | Caches, sessions |
| IP Hash | Yes (by IP) | Approximate | Low | Stateful applications |
| Least Response Time | No | Yes | Medium | Performance-sensitive |

## Layer 4 vs Layer 7 Load Balancing

```
┌─────────────────────────────────────────────────────┐
│                   OSI Model                         │
│                                                     │
│  Layer 7 (Application) ─── HTTP headers, URL,       │
│                            content-based routing     │
│                                                     │
│  Layer 4 (Transport) ──── TCP/UDP, IP:port          │
│                            fast, connection-based    │
│                                                     │
│  Layer 3 (Network) ────── IP routing                │
└─────────────────────────────────────────────────────┘
```

| Feature | Layer 4 (TCP) | Layer 7 (HTTP) |
|---------|-------------|----------------|
| **Speed** | Faster (no payload inspection) | Slower (parses HTTP) |
| **Routing** | IP + Port | URL, headers, cookies |
| **SSL** | Pass-through or termination | Full termination + re-encrypt |
| **Content Awareness** | No | Yes (can route by path, header) |
| **Sticky Sessions** | IP-based | Cookie-based |
| **Use Case** | Database, TCP services | Web applications, APIs |
| **Throughput** | Higher | Lower (more processing) |

## Nginx Configuration

```nginx
# nginx.conf — Load Balancer

upstream backend {
    # Least connections algorithm
    least_conn;

    # Server pool
    server 10.0.0.1:8080 weight=5;
    server 10.0.0.2:8080 weight=3;
    server 10.0.0.3:8080 weight=2;

    # Health check parameters
    # (requires nginx plus or upstream_health_check module)
    # max_fails=3 fail_timeout=30s;

    # Connection keepalive to upstream
    keepalive 32;
}

upstream websocket {
    ip_hash;  # Sticky sessions for WebSockets
    server 10.0.0.1:8081;
    server 10.0.0.2:8081;
    server 10.0.0.3:8081;
}

server {
    listen 80;
    server_name example.com;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # Proxy to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Connection keepalive
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;

        # Retry on failure (try next server)
        proxy_next_upstream error timeout http_502 http_503;
        proxy_next_upstream_tries 3;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;

    location /api/v1/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://backend;
    }
}
```

## HAProxy Configuration

```
# /etc/haproxy/haproxy.cfg

global
    maxconn 50000
    log /dev/log local0
    stats socket /var/run/haproxy.sock mode 660

defaults
    mode http
    timeout connect 5s
    timeout client  30s
    timeout server  30s
    option httplog
    option dontlognull
    retries 3
    option redispatch

# Stats dashboard
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s

# Frontend
frontend http_front
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/example.pem

    # ACL-based routing
    acl is_api path_beg /api/
    acl is_ws hdr(Upgrade) -i websocket

    use_backend api_back if is_api
    use_backend ws_back if is_ws
    default_backend web_back

# API Backend
backend api_back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200

    server api1 10.0.0.1:8080 check inter 5s fall 3 rise 2
    server api2 10.0.0.2:8080 check inter 5s fall 3 rise 2
    server api3 10.0.0.3:8080 check inter 5s fall 3 rise 2

# WebSocket Backend (sticky sessions)
backend ws_back
    balance source
    option httpchk GET /health
    cookie SERVERID insert indirect nocache

    server ws1 10.0.0.1:8081 check cookie ws1
    server ws2 10.0.0.2:8081 check cookie ws2

# Web Backend
backend web_back
    balance leastconn
    option httpchk GET /health

    server web1 10.0.0.1:3000 check
    server web2 10.0.0.2:3000 check
```

## Health Checks

### Active Health Checks

```python
import asyncio
import aiohttp
from dataclasses import dataclass, field


@dataclass
class Server:
    host: str
    port: int
    healthy: bool = True
    failure_count: int = 0
    success_count: int = 0

    @property
    def url(self) -> str:
        return f"http://{self.host}:{self.port}"


class HealthChecker:
    def __init__(self, servers: list[Server], interval: int = 10,
                 failure_threshold: int = 3, success_threshold: int = 2):
        self.servers = servers
        self.interval = interval
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.running = False

    async def check_server(self, server: Server) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{server.url}/health", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    return resp.status == 200
        except Exception:
            return False

    async def run_checks(self):
        while self.running:
            tasks = [self._check(s) for s in self.servers]
            await asyncio.gather(*tasks)
            await asyncio.sleep(self.interval)

    async def _check(self, server: Server):
        healthy = await self.check_server(server)

        if healthy:
            server.success_count += 1
            server.failure_count = 0
            if not server.healthy and server.success_count >= self.success_threshold:
                server.healthy = True
                print(f"Server {server.url} recovered")
        else:
            server.failure_count += 1
            server.success_count = 0
            if server.healthy and server.failure_count >= self.failure_threshold:
                server.healthy = False
                print(f"Server {server.url} marked unhealthy")

    def start(self):
        self.running = True
        asyncio.create_task(self.run_checks())

    def stop(self):
        self.running = False

    def get_healthy_servers(self) -> list[Server]:
        return [s for s in self.servers if s.healthy]
```

## Cloud Load Balancers

| Provider | Type | Layer | Features |
|----------|------|-------|----------|
| **AWS ALB** | Application | L7 | Path-based routing, WAF, SSL termination |
| **AWS NLB** | Network | L4 | Ultra-low latency, static IP, TCP/UDP |
| **GCP LB** | Global | L7 | Global anycast, CDN, SSL |
| **Azure LB** | Standard | L4 | Zone-redundant, HA ports |
| **Cloudflare** | Global | L7 | DDoS protection, edge caching |

### AWS ALB with Terraform

```hcl
resource "aws_lb" "app" {
  name               = "app-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = var.public_subnets
}

resource "aws_lb_target_group" "api" {
  name     = "api-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path              = "/health"
    healthy_threshold = 2
    unhealthy_threshold = 3
    timeout           = 5
    interval          = 10
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_target_group_attachment" "api" {
  for_each         = aws_instance.api
  target_group_arn = aws_lb_target_group.api.arn
  target_id        = each.value.id
  port             = 8080
}
```

## Complete Python Load Balancer

```python
# load_balancer.py
import asyncio
import aiohttp
from dataclasses import dataclass, field
from enum import Enum
import random
import time
from collections import defaultdict


class Algorithm(str, Enum):
    ROUND_ROBIN = "round_robin"
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    RANDOM = "random"


@dataclass
class Backend:
    url: str
    weight: int = 1
    healthy: bool = True
    active_connections: int = 0
    total_requests: int = 0
    total_failures: int = 0
    avg_response_time: float = 0.0


class LoadBalancer:
    def __init__(self, algorithm: Algorithm = Algorithm.ROUND_ROBIN):
        self.algorithm = algorithm
        self.backends: list[Backend] = []
        self.current_index = 0

    def add_backend(self, url: str, weight: int = 1):
        self.backends.append(Backend(url=url, weight=weight))

    def remove_backend(self, url: str):
        self.backends = [b for b in self.backends if b.url != url]

    def _next_round_robin(self) -> Backend:
        healthy = [b for b in self.backends if b.healthy]
        if not healthy:
            raise RuntimeError("No healthy backends available")
        backend = healthy[self.current_index % len(healthy)]
        self.current_index += 1
        return backend

    def _next_least_connections(self) -> Backend:
        healthy = [b for b in self.backends if b.healthy]
        if not healthy:
            raise RuntimeError("No healthy backends available")
        return min(healthy, key=lambda b: b.active_connections)

    def _next_weighted(self) -> Backend:
        healthy = [b for b in self.backends if b.healthy]
        if not healthy:
            raise RuntimeError("No healthy backends available")
        total_weight = sum(b.weight for b in healthy)
        r = random.uniform(0, total_weight)
        cumulative = 0
        for backend in healthy:
            cumulative += backend.weight
            if r <= cumulative:
                return backend
        return healthy[-1]

    def _next_random(self) -> Backend:
        healthy = [b for b in self.backends if b.healthy]
        if not healthy:
            raise RuntimeError("No healthy backends available")
        return random.choice(healthy)

    def get_backend(self) -> Backend:
        match self.algorithm:
            case Algorithm.ROUND_ROBIN:
                return self._next_round_robin()
            case Algorithm.LEAST_CONNECTIONS:
                return self._next_least_connections()
            case Algorithm.WEIGHTED_ROUND_ROBIN:
                return self._next_weighted()
            case Algorithm.RANDOM:
                return self._next_random()

    async def forward(self, method: str, path: str, **kwargs) -> dict:
        last_error = None
        for _ in range(len(self.backends)):
            backend = self.get_backend()
            try:
                backend.active_connections += 1
                start = time.monotonic()

                async with aiohttp.ClientSession() as session:
                    async with session.request(
                        method, f"{backend.url}{path}",
                        timeout=aiohttp.ClientTimeout(total=10),
                        **kwargs,
                    ) as resp:
                        elapsed = time.monotonic() - start
                        backend.avg_response_time = (
                            backend.avg_response_time * 0.9 + elapsed * 0.1
                        )
                        backend.total_requests += 1

                        if resp.status >= 500:
                            backend.total_failures += 1
                            last_error = f"Server error: {resp.status}"
                            continue

                        return {"status": resp.status, "data": await resp.json()}

            except Exception as e:
                backend.total_failures += 1
                last_error = str(e)
            finally:
                backend.active_connections -= 1

        raise RuntimeError(f"All backends failed. Last error: {last_error}")

    def get_stats(self) -> list[dict]:
        return [
            {
                "url": b.url,
                "healthy": b.healthy,
                "weight": b.weight,
                "active_connections": b.active_connections,
                "total_requests": b.total_requests,
                "total_failures": b.total_failures,
                "avg_response_time_ms": round(b.avg_response_time * 1000, 2),
            }
            for b in self.backends
        ]


# Usage
async def main():
    lb = LoadBalancer(Algorithm.LEAST_CONNECTIONS)
    lb.add_backend("http://localhost:8001", weight=5)
    lb.add_backend("http://localhost:8002", weight=3)
    lb.add_backend("http://localhost:8003", weight=2)

    # Simulate requests
    for i in range(20):
        try:
            result = await lb.forward("GET", "/health")
            print(f"Request {i}: {result}")
        except Exception as e:
            print(f"Request {i} failed: {e}")

    # Print stats
    for stat in lb.get_stats():
        print(stat)


if __name__ == "__main__":
    asyncio.run(main())
```

## Summary

Load balancing distributes traffic across servers to ensure high availability and optimal performance. Choose Round Robin for uniform servers, Least Connections for variable request durations, Consistent Hashing for session affinity, and Weighted algorithms for mixed-capacity deployments. Use Layer 7 for HTTP-aware routing and Layer 4 for raw TCP performance. Always implement health checks to automatically remove unhealthy servers from the pool.

**Key Takeaways:**
- Start with Round Robin for most use cases; switch to Least Connections for long-lived connections
- Always implement health checks with failure thresholds
- Consistent hashing minimizes redistribution when servers change
- Layer 7 gives content-aware routing; Layer 4 gives raw performance
- Monitor backend metrics (response time, error rate, connection count) to tune configuration
