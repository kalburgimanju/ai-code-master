# Chapter 8: API Gateway — Routing, Securing, and Managing Requests at the Edge

> *"An API gateway is the front door of your system — it decides who gets in, where they go, and how fast they can walk."*

---

## 8.1 — What Is an API Gateway?

An API Gateway is a server that sits between clients and your backend services. It acts as a single entry point for all client requests, handling cross-cutting concerns like authentication, rate limiting, request routing, and protocol translation so that individual services don't have to.

```
                    API GATEWAY ARCHITECTURE
  ┌─────────────────────────────────────────────────────────┐
  │                      CLIENTS                             │
  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐               │
  │  │Web   │  │Mobile│  │IoT   │  │Third │               │
  │  │App   │  │App   │  │Device│  │Party │               │
  │  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘               │
  │     └─────────┴─────────┴─────────┘                     │
  │                      │                                   │
  │              ┌───────▼────────┐                          │
  │              │   API GATEWAY  │                          │
  │              │  ───────────── │                          │
  │              │  • Routing     │                          │
  │              │  • Auth (JWT)  │                          │
  │              │  • Rate Limit  │                          │
  │              │  • Transform   │                          │
  │              │  • Logging     │                          │
  │              │  • SSL Terminate│                         │
  │              └──┬────┬────┬──┘                          │
  │                 │    │    │                              │
  │         ┌───────┘    │    └───────┐                     │
  │         ▼            ▼            ▼                      │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
  │  │ User     │ │ Order    │ │ Product  │                │
  │  │ Service  │ │ Service  │ │ Service  │                │
  │  └──────────┘ └──────────┘ └──────────┘                │
  └─────────────────────────────────────────────────────────┘
```

### Core Responsibilities

| Responsibility | Description |
|---|---|
| **Request Routing** | Direct requests to the correct backend service |
| **Authentication** | Verify identity via JWT, OAuth, API keys |
| **Authorization** | Enforce permissions per endpoint or user role |
| **Rate Limiting** | Protect backends from overload |
| **Request/Response Transformation** | Reshape payloads between client and service |
| **SSL Termination** | Handle TLS at the edge; internal traffic stays plain |
| **Protocol Translation** | Accept HTTP/REST from clients; call gRPC internally |
| **Logging & Monitoring** | Centralized request logs, metrics, and tracing |
| **Caching** | Cache responses to reduce backend load |
| **Circuit Breaking** | Protect backends from cascading failures |

---

## 8.2 — When to Use an API Gateway

### Good Fit ✅

- Microservices architecture with many backend services
- Multiple client types (web, mobile, IoT, third-party)
- Need for centralized authentication and authorization
- Requirement for rate limiting and throttling
- Protocol translation (REST ↔ gRPC)
- API versioning and lifecycle management

### Poor Fit ❌

- Monolithic applications (add unnecessary latency)
- Single-service deployments (pointless indirection)
- Ultra-low-latency requirements (every hop adds latency)
- Simple internal service-to-service communication (use a service mesh instead)

---

## 8.3 — Routing Patterns

### 8.3.1 — Path-Based Routing

Route requests based on URL path segments:

```
  PATH-BASED ROUTING
  ═══════════════════

  GET /api/v1/users/123     ──► User Service (GET /users/123)
  POST /api/v1/orders       ──► Order Service (POST /orders)
  GET /api/v1/products      ──► Product Service (GET /products)
  GET /api/v2/users/123     ──► User Service v2 (GET /users/123)
```

### 8.3.2 — Header-Based Routing

Route based on custom headers (useful for A/B testing, canary releases):

```
  HEADER-BASED ROUTING
  ═════════════════════

  Request with X-Canary: true  ──► Canary Service (new version)
  Request without header        ──► Stable Service (current version)
```

### 8.3.3 — Weighted Routing (Canary)

Split traffic between versions:

```
  WEIGHTED ROUTING
  ═════════════════

  100% of traffic
  ┌──────────────────────────────────────────┐
  │                                          │
  │  90% ──────────►  Order Service v1      │
  │                                          │
  │  10% ──────────►  Order Service v2      │
  │                                          │
  └──────────────────────────────────────────┘
```

### 8.3.4 — Regex/Pattern Routing

Match complex URL patterns:

```
  REGEX ROUTING
  ══════════════

  /users/{id:\d+}       ──► User Service (numeric IDs only)
  /users/{id:[a-z]+}    ──► User Service (username lookup)
  /files/{path:*}       ──► File Service (catch-all)
```

---

## 8.4 — Authentication & Authorization

### 8.4.1 — JWT Validation at the Gateway

The gateway validates JWTs so backend services don't have to:

```
  JWT VALIDATION FLOW
  ════════════════════

  Client                    Gateway                   Service
    │                         │                          │
    │  GET /api/orders        │                          │
    │  Authorization: Bearer  │                          │
    │  <JWT>                  │                          │
    │────────────────────────►│                          │
    │                         │  1. Validate signature   │
    │                         │  2. Check expiration     │
    │                         │  3. Extract claims       │
    │                         │  4. Check permissions    │
    │                         │                          │
    │                         │  Forward with            │
    │                         │  X-User-Id: 123          │
    │                         │  X-User-Role: admin      │
    │                         │─────────────────────────►│
    │                         │                          │
    │                         │◄─────────────────────────│
    │◄────────────────────────│       Response           │
```

```python
"""
API Gateway authentication middleware.
Validates JWT tokens and extracts user claims for downstream services.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

import hashlib
import hmac
import json
import base64


class Permission(Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"


@dataclass
class UserClaims:
    user_id: str
    email: str
    roles: list[str]
    permissions: list[Permission]
    expires_at: datetime
    issued_at: datetime


@dataclass
class GatewayRequest:
    method: str
    path: str
    headers: dict[str, str]
    body: bytes = b""


@dataclass
class GatewayResponse:
    status: int
    headers: dict[str, str]
    body: bytes


@dataclass
class Route:
    path_pattern: str
    method: str
    upstream_url: str
    required_permissions: list[Permission] = field(default_factory=list)
    rate_limit: int = 100  # requests per minute


class JWTValidator:
    """Simple JWT validator (HMAC-SHA256 for demonstration)."""

    def __init__(self, secret: str) -> None:
        self._secret = secret.encode()

    def validate(self, token: str) -> UserClaims:
        """Validate JWT and return extracted claims."""
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT format")

        header_b64, payload_b64, signature_b64 = parts

        # Verify signature
        expected_sig = hmac.new(
            self._secret,
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256,
        ).digest()
        actual_sig = base64.urlsafe_b64decode(signature_b64 + "==")

        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Invalid JWT signature")

        # Decode payload
        payload_json = base64.urlsafe_b64decode(payload_b64 + "==")
        payload = json.loads(payload_json)

        # Check expiration
        expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise ValueError("JWT has expired")

        # Extract claims
        permissions = [Permission(p) for p in payload.get("permissions", [])]

        return UserClaims(
            user_id=payload["sub"],
            email=payload.get("email", ""),
            roles=payload.get("roles", []),
            permissions=permissions,
            expires_at=expires_at,
            issued_at=datetime.fromtimestamp(payload["iat"], tz=timezone.utc),
        )


class AuthMiddleware:
    """Gateway authentication and authorization middleware."""

    def __init__(self, jwt_validator: JWTValidator) -> None:
        self._validator = jwt_validator

    def process(self, request: GatewayRequest, route: Route) -> GatewayRequest:
        """
        Validate JWT and check permissions.
        Raises ValueError if authentication/authorization fails.
        Returns enriched request with user claims in headers.
        """
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise ValueError("Missing or invalid Authorization header")

        token = auth_header[7:]
        claims = self._validator.validate(token)

        # Check required permissions
        for required in route.required_permissions:
            if required not in claims.permissions:
                raise ValueError(
                    f"Insufficient permissions: {required.value} required"
                )

        # Enrich request headers for downstream services
        enriched_headers = {
            **request.headers,
            "X-User-Id": claims.user_id,
            "X-User-Email": claims.email,
            "X-User-Roles": ",".join(claims.roles),
            "X-Forwarded-By": "api-gateway",
        }

        return GatewayRequest(
            method=request.method,
            path=request.path,
            headers=enriched_headers,
            body=request.body,
        )
```

---

## 8.5 — Rate Limiting

### 8.5.1 — Rate Limiting Algorithms

| Algorithm | How It Works | Pros | Cons |
|---|---|---|---|
| **Fixed Window** | Count requests in fixed time windows | Simple | Burst at window boundaries |
| **Sliding Window Log** | Timestamps of all requests in window | Precise | Memory-intensive |
| **Sliding Window Counter** | Weighted average of current + previous window | Good balance | Approximate |
| **Token Bucket** | Tokens added at fixed rate; each request consumes a token | Allows bursts | More complex |
| **Leaky Bucket** | Requests queued; processed at fixed rate | Smooth output | Adds latency |

```
  TOKEN BUCKET ALGORITHM
  ═══════════════════════

  Bucket capacity: 10 tokens
  Refill rate: 2 tokens/second

  t=0s: [██████████] 10 tokens — 5 requests → [█████] 5 tokens left
  t=1s: [██████████] refilled +2 → [███████] 7 tokens
  t=2s: [██████████] refilled +2 → [█████████] 9 tokens (capped at 10)
```

```python
"""
Token bucket rate limiter for API Gateway.
Thread-safe implementation suitable for production use.
"""
import time
import threading
from dataclasses import dataclass, field


@dataclass
class TokenBucket:
    """A thread-safe token bucket rate limiter."""
    capacity: int
    refill_rate: float  # tokens per second
    tokens: float = field(init=False)
    last_refill: float = field(init=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False)

    def __post_init__(self) -> None:
        self.tokens = float(self.capacity)
        self.last_refill = time.monotonic()

    def _refill(self) -> None:
        """Add tokens based on elapsed time."""
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

    def allow(self, tokens: int = 1) -> bool:
        """Try to consume tokens. Returns True if allowed, False if rate-limited."""
        with self._lock:
            self._refill()
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

    @property
    def available_tokens(self) -> float:
        with self._lock:
            self._refill()
            return self.tokens


class RateLimiter:
    """Per-client rate limiter using token buckets."""

    def __init__(self, capacity: int, refill_rate: float) -> None:
        self._capacity = capacity
        self._refill_rate = refill_rate
        self._buckets: dict[str, TokenBucket] = {}
        self._lock = threading.Lock()

    def _get_bucket(self, client_id: str) -> TokenBucket:
        if client_id not in self._buckets:
            with self._lock:
                if client_id not in self._buckets:
                    self._buckets[client_id] = TokenBucket(
                        capacity=self._capacity,
                        refill_rate=self._refill_rate,
                    )
        return self._buckets[client_id]

    def is_allowed(self, client_id: str, tokens: int = 1) -> dict:
        """Check if a request from client_id is allowed."""
        bucket = self._get_bucket(client_id)
        allowed = bucket.allow(tokens)
        remaining = int(bucket.available_tokens)

        return {
            "allowed": allowed,
            "remaining": remaining,
            "limit": self._capacity,
            "retry_after": 0 if allowed else int((tokens - bucket.available_tokens) / self._refill_rate) + 1,
        }


# --- Demo ---
limiter = RateLimiter(capacity=10, refill_rate=2.0)

print("=== Rate Limiter Demo (capacity=10, refill=2/s) ===")
for i in range(12):
    result = limiter.is_allowed("client-1")
    status = "✅ ALLOWED" if result["allowed"] else "❌ REJECTED"
    print(
        f"  Request {i+1:>2}: {status}  "
        f"(remaining={result['remaining']}, "
        f"retry_after={result['retry_after']}s)"
    )
```

---

## 8.6 — Request/Response Transformation

The gateway can reshape payloads between clients and services:

```
  TRANSFORMATION SCENARIOS
  ═════════════════════════

  1. Field Renaming
     Client sends { "user_name": "Alice" }
     Service expects { "name": "Alice" }

  2. Response Aggregation
     Client:  GET /dashboard  (1 request)
     Gateway: GET /users/me + GET /orders + GET /notifications  (3 calls)
     Gateway: Merge into single response

  3. Payload Filtering
     Service returns { "id": 1, "name": "Alice", "password_hash": "..." }
     Gateway strips sensitive fields before responding
```

```python
"""
Request/response transformation middleware for API Gateway.
"""
from dataclasses import dataclass, field
import json


@dataclass
class TransformationRule:
    """A single field transformation rule."""
    source_field: str
    target_field: str
    transform: str = "rename"  # rename, extract, default, mask


@dataclass
class TransformConfig:
    """Configuration for request/response transformations."""
    request_renames: dict[str, str] = field(default_factory=dict)
    response_hides: list[str] = field(default_factory=list)
    response_adds: dict[str, str] = field(default_factory=dict)
    aggregations: list[str] = field(default_factory=list)


class RequestTransformer:
    """Transforms client requests before forwarding to services."""

    def __init__(self, config: TransformConfig) -> None:
        self._config = config

    def transform_request(self, body: dict) -> dict:
        """Rename fields in the request body."""
        transformed = {}
        for key, value in body.items():
            target_key = self._config.request_renames.get(key, key)
            transformed[target_key] = value
        return transformed

    def transform_response(self, body: dict) -> dict:
        """Filter and augment the response body."""
        transformed = {
            k: v
            for k, v in body.items()
            if k not in self._config.response_hides
        }
        transformed.update(self._config.response_adds)
        return transformed


class ResponseAggregator:
    """Aggregate multiple service responses into one."""

    def __init__(self) -> None:
        self._responses: dict[str, dict] = {}

    def collect(self, service_name: str, response: dict) -> None:
        """Collect a response from a service."""
        self._responses[service_name] = response

    def aggregate(self) -> dict:
        """Merge all collected responses into a single payload."""
        result = {}
        for service, data in self._responses.items():
            result[service] = data
        self._responses.clear()
        return result


# --- Demo ---
config = TransformConfig(
    request_renames={
        "user_name": "name",
        "email_addr": "email",
    },
    response_hides=["password_hash", "internal_id"],
    response_adds={"source": "api-gateway"},
)

transformer = RequestTransformer(config)

# Request transformation
client_request = {"user_name": "Alice", "email_addr": "alice@example.com", "age": 30}
print("Client request:", json.dumps(client_request, indent=2))
print("Transformed:", json.dumps(transformer.transform_request(client_request), indent=2))

# Response transformation
service_response = {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "password_hash": "$2b$12$...",
    "internal_id": "int-abc-123",
}
print("\nService response:", json.dumps(service_response, indent=2))
print("Filtered:", json.dumps(transformer.transform_response(service_response), indent=2))

# Response aggregation
aggregator = ResponseAggregator()
aggregator.collect("users", {"id": 1, "name": "Alice"})
aggregator.collect("orders", {"count": 5, "total": 299.99})
aggregator.collect("notifications", {"unread": 3})
print("\nAggregated:", json.dumps(aggregator.aggregate(), indent=2))
```

---

## 8.7 — API Versioning

### 8.7.1 — Versioning Strategies

| Strategy | Example | Pros | Cons |
|---|---|---|---|
| **URL path** | `/api/v1/users` | Explicit, cacheable | URL proliferation |
| **Query parameter** | `/users?version=1` | Easy to add | Easy to forget |
| **Header** | `Accept: application/vnd.api.v1+json` | Clean URLs | Hidden from URL bar |
| **Content negotiation** | `Accept: application/json;version=1` | RESTful | Complex to implement |

```
  VERSION LIFECYCLE
  ═══════════════════

  v1 (Current)     ──────────────────────────────────►  Sunset: Dec 2026
  v2 (Current)     ──────────────────────────────────►  Sunset: Jun 2027
  v3 (Beta)        ──────────────────────────────────►  In development

  Gateway behavior:
  • v1 requests → v1 service (deprecated, logs warning)
  • v2 requests → v2 service (stable)
  • v3 requests → v3 service (beta, requires header)
  • No version → latest stable (v2)
```

```python
"""
API versioning management for the gateway.
"""
from dataclasses import dataclass
from datetime import date, datetime
from enum import Enum


class VersionStatus(Enum):
    BETA = "beta"
    STABLE = "stable"
    DEPRECATED = "deprecated"
    SUNSET = "sunset"


@dataclass
class APIVersion:
    version: str
    status: VersionStatus
    released: date
    sunset_date: date | None
    upstream_url: str
    description: str


class VersionRouter:
    """Route requests to the correct API version."""

    def __init__(self) -> None:
        self._versions: dict[str, APIVersion] = {}
        self._default_version: str = ""

    def register(self, version: APIVersion) -> None:
        self._versions[version.version] = version
        if version.status == VersionStatus.STABLE:
            self._default_version = version.version

    def resolve_version(self, requested_version: str | None) -> APIVersion:
        """Resolve which version to use based on the request."""
        if requested_version and requested_version in self._versions:
            version = self._versions[requested_version]
        elif self._default_version:
            version = self._versions[self._default_version]
        else:
            raise ValueError("No API version available")

        if version.status == VersionStatus.SUNSET:
            raise ValueError(
                f"API version {version.version} has been sunset. "
                f"Please migrate to a supported version."
            )

        return version

    def get_version_info(self) -> list[dict]:
        """Return information about all registered versions."""
        return [
            {
                "version": v.version,
                "status": v.status.value,
                "released": v.released.isoformat(),
                "sunset": v.sunset_date.isoformat() if v.sunset_date else None,
            }
            for v in self._versions.values()
        ]


# --- Demo ---
router = VersionRouter()
router.register(APIVersion("v1", VersionStatus.DEPRECATED, date(2024, 1, 1), date(2026, 12, 31), "https://v1.internal", "Legacy"))
router.register(APIVersion("v2", VersionStatus.STABLE, date(2025, 6, 1), None, "https://v2.internal", "Current stable"))
router.register(APIVersion("v3", VersionStatus.BETA, date(2026, 3, 1), None, "https://v3.internal", "Next generation"))

print("=== API Version Info ===")
for info in router.get_version_info():
    print(f"  {info['version']}: {info['status']} (released {info['released']})")

# Route a request
for req_version in [None, "v1", "v2", "v3"]:
    try:
        resolved = router.resolve_version(req_version)
        label = req_version or "(default)"
        print(f"\n  Request {label} → {resolved.version} ({resolved.status.value})")
    except ValueError as e:
        print(f"\n  Request {req_version} → ERROR: {e}")
```

---

## 8.8 — Kong API Gateway Configuration

Kong is one of the most widely used API gateways. Here's a practical configuration:

```yaml
# Kong declarative configuration (kong.yml)
_format_version: "3.0"

services:
  - name: user-service
    url: http://user-service.internal:8080
    routes:
      - name: user-routes
        paths:
          - /api/v1/users
        methods:
          - GET
          - POST
          - PUT
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: redis
          redis_host: redis.internal
      - name: jwt
        config:
          claims_to_verify:
            - exp
      - name: cors
        config:
          origins:
            - "https://app.example.com"
          methods:
            - GET
            - POST
          headers:
            - Authorization
            - Content-Type

  - name: order-service
    url: http://order-service.internal:8081
    routes:
      - name: order-routes
        paths:
          - /api/v1/orders
        methods:
          - GET
          - POST
    plugins:
      - name: rate-limiting
        config:
          minute: 50
          policy: local
      - name: request-transformer
        config:
          add:
            headers:
              - X-Gateway-Source: kong

  - name: product-service
    url: http://product-service.internal:8082
    routes:
      - name: product-routes
        paths:
          - /api/v1/products
          - /api/v2/products
    plugins:
      - name: proxy-cache
        config:
          response_code:
            - 200
          request_method:
            - GET
          content_type:
            - application/json
          cache_ttl: 60
          storage: redis
          redis_host: redis.internal
```

### Kong Plugin Ecosystem

| Plugin | Purpose |
|---|---|
| `rate-limiting` | Request throttling per client/IP/key |
| `jwt` | JWT token validation |
| `oauth2` | OAuth 2.0 authorization |
| `cors` | Cross-origin resource sharing |
| `request-transformer` | Modify requests before proxying |
| `response-transformer` | Modify responses before returning |
| `proxy-cache` | Cache responses in Redis/Varnish |
| `bot-detection` | Block known bots and scrapers |
| `ip-restriction` | Whitelist/blacklist IPs |
| `acl` | Access control lists by group |

---

## 8.9 — AWS API Gateway

```
  AWS API GATEWAY ARCHITECTURE
  ═════════════════════════════

  ┌──────────┐     ┌──────────────────────┐     ┌──────────────┐
  │  Client  │────►│  AWS API Gateway     │────►│  Lambda /    │
  │          │     │  (REST or HTTP API)  │     │  ECS / ALB   │
  └──────────┘     │                      │     └──────────────┘
                   │  • Authorizers       │
                   │  • Throttling        │     ┌──────────────┐
                   │  • Request Validation│────►│  DynamoDB    │
                   │  • API Keys          │     └──────────────┘
                   │  • Usage Plans       │
                   │  • CloudWatch Logs   │     ┌──────────────┐
                   │                      │────►│  SNS / SQS   │
                   └──────────────────────┘     └──────────────┘
```

```typescript
// AWS API Gateway + Lambda example (TypeScript)
// Deployed via AWS CDK

import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda handler
    const userHandler = new lambda.Function(this, 'UserHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    // REST API
    const api = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'My Service',
      description: 'API Gateway with Lambda backend',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 500,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      },
    });

    // JWT Authorizer
    const authorizer = new apigateway.JwtAuthorizer(this, 'MyAuthorizer', {
      identitySource: '$request.header.Authorization',
      resultsCacheTtl: cdk.Duration.minutes(5),
      issuer: 'https://auth.example.com',
      audience: ['my-api'],
    });

    // Routes with authorization
    const users = api.root.addResource('users');
    users.addMethod('GET', new apigateway.LambdaIntegration(userHandler), {
      authorizer,
    });
    users.addMethod('POST', new apigateway.LambdaIntegration(userHandler), {
      authorizer,
    });

    const user = users.addResource('{id}');
    user.addMethod('GET', new apigateway.LambdaIntegration(userHandler), {
      authorizer,
    });

    // Usage plan with API key
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'Basic',
      throttle: { rateLimit: 100, burstLimit: 50 },
      quota: { limit: 10000, period: apigateway.Period.MONTH },
    });

    const apiKey = api.addApiKey('ApiKey');
    plan.addApiKey(apiKey);
    plan.addApiStage({ stage: api.deploymentStage });
  }
}
```

---

## 8.10 — Circuit Breaking at the Gateway

The gateway can protect backends by implementing circuit breaking:

```
  CIRCUIT BREAKER STATES
  ═══════════════════════

  ┌──────────┐  failures > threshold  ┌──────────┐
  │  CLOSED  │───────────────────────►│   OPEN   │
  │ (normal) │                        │ (reject) │
  └──────────┘◄───────────────────────└──────────┘
       ▲       successes > threshold        │
       │                                    │ timeout
       │                                    ▼
       │                              ┌──────────┐
       │                              │HALF-OPEN │
       └──────────────────────────────│ (probe)  │
                                      └──────────┘
```

---

## 8.11 — Real-World Case Studies

### 8.11.1 — Netflix Zuul

Netflix built Zuul as their edge service gateway:

| Feature | Implementation |
|---|---|
| **Routing** | Dynamic routing via Eureka service discovery |
| **Filter system** | Pre-filters (auth), routing filters, post-filters (metrics) |
| **Resilience** | Hystrix circuit breakers per route |
| **Observability** | Real-time request logging and metrics |
| **Canary** | Percentage-based traffic splitting |

### 8.11.2 — Stripe API Gateway

Stripe's API gateway handles billions of requests:

- **Versioning**: Header-based (`Stripe-Version: 2025-01-01`)
- **Idempotency**: `Idempotency-Key` header prevents duplicate charges
- **Rate limiting**: Per-key limits with generous defaults
- **Request validation**: Schema validation at the gateway edge

### 8.11.3 — Cloudflare Workers as Gateway

Cloudflare Workers run at the edge (300+ data centers):

```
  EDGE GATEWAY
  ══════════════

  Client ──► Nearest Cloudflare POP ──► Worker (auth, transform) ──► Origin

  • 0ms additional latency (runs at the edge)
  • DDoS protection built in
  • Custom logic in JavaScript/WASM
```

---

## 8.12 — Anti-Patterns and Pitfalls

```
  COMMON API GATEWAY MISTAKES
  ════════════════════════════

  ✗ Putting business logic in the gateway
    → Gateways should route, not decide

  ✗ Gateway as a single point of failure
    → Deploy multiple gateway instances behind a load balancer

  ✗ No request timeout configuration
    → A slow service can tie up gateway connections indefinitely

  ✗ Ignoring gateway performance
    → Every hop adds latency; measure and optimize

  ✗ Synchronous aggregation of many services
    → Use async patterns or GraphQL federation instead

  ✗ Not versioning from day one
    → Breaking changes become impossible without downtime
```

---

## 8.13 — Architecture Decision Matrix

```
  DECISION: CHOOSING A GATEWAY SOLUTION

  ┌──────────────────────┬────────────────────────────────────────────┐
  │  Scenario            │  Recommended Solution                      │
  ├──────────────────────┼────────────────────────────────────────────┤
  │  AWS-native stack    │  AWS API Gateway + Lambda                  │
  │  Self-hosted, full   │  Kong + Kong Manager                       │
  │  control             │                                            │
  │  Kubernetes-native   │  Kong Ingress Controller / Ambassador      │
  │  GraphQL             │  Apollo Router / GraphQL Mesh               │
  │  Edge computing      │  Cloudflare Workers / AWS CloudFront       │
  │  Simple proxy        │  Nginx / Traefik                           │
  │  gRPC gateway        │  gRPC-Web proxy / Envoy                    │
  └──────────────────────┴────────────────────────────────────────────┘
```

---

## 8.14 — Practice Exercises

### Exercise 1: Build a Rate Limiter

Extend the `RateLimiter` class from Section 8.5 to support:
1. Sliding window rate limiting
2. Different limits per endpoint (e.g., 100/min for reads, 10/min for writes)
3. A `get_usage_stats()` method that returns request counts per client

### Exercise 2: Gateway Load Balancing

Design a gateway that distributes traffic across 3 backend service instances using round-robin. Add health checking: if an instance fails 3 consecutive health checks, remove it from rotation until it recovers.

### Exercise 3: Request Transformation Pipeline

Implement a transformation pipeline where multiple transformers can be chained:

```
Client Request → [Auth Transform] → [Field Rename] → [Payload Filter] → Service
```

Each transformer should implement a `transform(request) -> request` interface.

---

## 8.15 — Summary

### Key Takeaways

| Concept | Summary |
|---|---|
| **What is an API Gateway** | Single entry point for all client requests; handles cross-cutting concerns |
| **Routing** | Path-based, header-based, weighted, and regex routing patterns |
| **Authentication** | Validate JWTs at the edge; enrich requests with user claims |
| **Rate Limiting** | Token bucket, sliding window, and fixed window algorithms |
| **Transformation** | Reshape requests/responses between clients and services |
| **Versioning** | URL path, header, or content negotiation strategies |
| **Circuit Breaking** | Protect backends from cascading failures |
| **Kong** | Leading open-source gateway with rich plugin ecosystem |
| **AWS API Gateway** | Managed gateway for serverless and microservice architectures |

### When to Use an API Gateway

```
  ┌──────────────────────────────────────────────────────────┐
  │                                                          │
  │  USE AN API GATEWAY WHEN:                                │
  │  ✓ Multiple backend services need a unified entry point  │
  │  ✓ Multiple client types (web, mobile, IoT)              │
  │  ✓ Centralized auth, rate limiting, and monitoring needed│
  │  ✓ API versioning and lifecycle management required      │
  │                                                          │
  │  AVOID WHEN:                                             │
  │  ✗ Single monolithic application                         │
  │  ✗ Ultra-low-latency requirements (every hop matters)    │
  │  ✗ Simple internal service communication                 │
  │                                                          │
  └──────────────────────────────────────────────────────────┘
```

---

*Next Chapter: [Chapter 9 — CQRS](chapter-09-cqrs.md) → Separating read and write operations for scalability and clarity.*
