"""
NexusAI API Gateway
Main API gateway for routing requests to NexusAI template products
"""

import os
from dataclasses import dataclass
from datetime import datetime

import redis
import uvicorn
from fastapi import FastAPI, Header, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.security import HTTPBearer

from .analytics import AnalyticsCollector
from .auth import authenticate_api_key
from .billing import SubscriptionManager
from .services import ServiceRegistry

# Initialize services
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True,
)

app = FastAPI(
    title="NexusAI API Gateway",
    description="Central API gateway for NexusAI template products marketplace",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware
app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth scheme
security = HTTPBearer()


@dataclass
class GatewayConfig:
    """Gateway configuration"""

    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    auth_secret: str = os.getenv("AUTH_SECRET", "changeme")
    rate_limit: int = int(os.getenv("RATE_LIMIT", 1000))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")


# Initialize services
config = GatewayConfig()
service_registry = ServiceRegistry(redis_client)
subscription_manager = SubscriptionManager(redis_client)
analytics = AnalyticsCollector(redis_client)


# Health check endpoint
@app.get("/")
async def gateway_status():
    """Gateway status check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "redis": "connected" if redis_client.ping() else "disconnected",
            "registry": len(service_registry.get_all_services()),
            "subscriptions": subscription_manager.get_active_subscription_count(),
        },
    }


# Service discovery
@app.get("/gateway/services")
async def list_services():
    """List all available NexusAI template services"""
    services = []
    for service_id, service_config in service_registry.get_all_services().items():
        services.append(
            {
                "id": service_id,
                "name": service_config.get("name", service_id),
                "description": service_config.get("description", ""),
                "version": service_config.get("version", "1.0.0"),
                "base_url": service_config.get("base_url", ""),
                "authentication": service_config.get("authentication_type", "none"),
                "pricing_tiers": service_config.get("pricing_tiers", {}),
                "subscription_required": service_config.get(
                    "subscription_required", False
                ),
                "tags": service_config.get("tags", []),
            }
        )

    return {
        "services": services,
        "total": len(services),
        "timestamp": datetime.utcnow().isoformat(),
    }


# Service details
@app.get("/gateway/services/{service_id}")
async def get_service_details(service_id: str):
    """Get details for a specific service"""
    service_config = service_registry.get_service(service_id)

    if not service_config:
        raise HTTPException(status_code=404, detail=f"Service not found: {service_id}")

    return {
        "id": service_id,
        "name": service_config.get("name", service_id),
        "description": service_config.get("description", ""),
        "version": service_config.get("version", "1.0.0"),
        "base_url": service_config.get("base_url", ""),
        "authentication": service_config.get("authentication_type", "none"),
        "subscription_required": service_config.get("subscription_required", False),
        "pricing_tiers": service_config.get("pricing_tiers", {}),
        "tags": service_config.get("tags", []),
        "endpoints": service_config.get("endpoints", []),
        "capabilities": service_config.get("capabilities", []),
        "requirements": service_config.get("requirements", []),
        "created_at": service_config.get("created_at"),
        "updated_at": service_config.get("updated_at"),
    }


# Authentication
@app.post("/gateway/auth/register")
async def register_service(service_config: dict):
    """Register a new service with the gateway"""

    required_fields = ["id", "name", "base_url"]
    for field in required_fields:
        if field not in service_config:
            raise HTTPException(
                status_code=400, detail=f"Missing required field: {field}"
            )

    service_id = service_config["id"]

    if service_registry.get_service(service_id):
        raise HTTPException(
            status_code=409, detail=f"Service already exists: {service_id}"
        )

    # Add timestamp
    service_config["created_at"] = datetime.utcnow().isoformat()
    service_config["updated_at"] = datetime.utcnow().isoformat()

    # Register the service
    service_registry.register_service(service_id, service_config)

    # Create default subscription tier if not provided
    if "pricing_tiers" not in service_config:
        service_registry.update_service(
            service_id,
            {
                "pricing_tiers": {
                    "free": {"limit": 100, "price": 0},
                    "basic": {"limit": 1000, "price": 29},
                    "pro": {"limit": 10000, "price": 99},
                }
            },
        )

    return {
        "service_id": service_id,
        "message": "Service registered successfully",
        "registered_at": datetime.utcnow().isoformat(),
    }


# Proxy requests to services
@app.api_route(
    "/gateway/proxy/{service_id}/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
)
async def proxy_request(
    service_id: str,
    path: str,
    request: Request,
    api_key: str = Header(None, alias="X-API-Key"),
    user_id: str = Header(None, alias="X-User-ID"),
    source_ip: str = Header(None, alias="X-Forward-For"),
):
    """Proxy requests to NexusAI template services"""

    # Authenticate the request
    auth_result = await authenticate_api_key(api_key, service_id)

    if not auth_result["valid"]:
        raise HTTPException(status_code=401, detail=auth_result["error"])

    # Get service configuration
    service_config = service_registry.get_service(service_id)

    if not service_config:
        raise HTTPException(status_code=404, detail=f"Service not found: {service_id}")

    # Check subscription
    subscription = subscription_manager.get_subscription(
        user_id=user_id, service_id=service_id
    )

    if not subscription:
        raise HTTPException(
            status_code=403, detail="No active subscription for this service"
        )

    # Check rate limits
    rate_limit_check = subscription_manager.check_rate_limit(
        user_id=user_id, service_id=service_id
    )

    if not rate_limit_check["allowed"]:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Current usage: {rate_limit_check['current']}, Limit: {rate_limit_check['limit']}",
        )

    # Build target URL
    base_url = service_config.get("base_url", "").rstrip("/")
    target_url = f"{base_url}/{path}"

    # Get request body
    body = await request.body()
    headers = dict(request.headers)

    # Remove gateway-specific headers
    headers.pop("host", None)
    headers.pop("user-agent", None)
    headers.pop("x-forwarded-for", None)

    # Add service-specific headers
    headers["X-Gateway-Service"] = service_id
    headers["X-Gateway-User"] = user_id

    # Forward request to the service
    import requests

    try:
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            data=body,
            params=dict(request.query_params),
            timeout=30,
            verify=False,  # In production, use proper certificate validation
        )

        # Track the request
        analytics.track_request(
            service_id=service_id,
            user_id=user_id,
            method=request.method,
            path=path,
            status_code=response.status_code,
            response_time=response.elapsed.total_seconds()
            if hasattr(response, "elapsed")
            else 0,
            source_ip=source_ip,
        )

        # Return the response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Service unavailable: {e}") from e


# Usage analytics
@app.get("/gateway/usage/{service_id}")
async def get_service_usage(
    service_id: str,
    user_id: str | None = None,
    start_time: str | None = None,
    end_time: str | None = None,
):
    """Get usage statistics for a service"""

    # Get usage data
    usage_data = analytics.get_usage(
        service_id=service_id, user_id=user_id, start_time=start_time, end_time=end_time
    )

    return {
        "service_id": service_id,
        "usage": usage_data,
        "period": {"start": start_time, "end": end_time},
        "generated_at": datetime.utcnow().isoformat(),
    }


# Subscription management
@app.post("/gateway/subscriptions")
async def create_subscription(subscription_data: dict):
    """Create a new subscription"""

    required_fields = ["user_id", "service_id", "tier"]
    for field in required_fields:
        if field not in subscription_data:
            raise HTTPException(
                status_code=400, detail=f"Missing required field: {field}"
            )

    user_id = subscription_data["user_id"]
    service_id = subscription_data["service_id"]
    tier = subscription_data["tier"]

    # Check if service exists
    service_config = service_registry.get_service(service_id)
    if not service_config:
        raise HTTPException(status_code=404, detail=f"Service not found: {service_id}")

    # Check if tier exists
    if (
        "pricing_tiers" not in service_config
        or tier not in service_config["pricing_tiers"]
    ):
        raise HTTPException(
            status_code=400, detail=f"Invalid subscription tier: {tier}"
        )

    # Create subscription
    subscription_id = subscription_manager.create_subscription(
        user_id=user_id, service_id=service_id, tier=tier
    )

    # Get subscription details
    subscription = subscription_manager.get_subscription(subscription_id)

    return {
        "subscription_id": subscription_id,
        "user_id": user_id,
        "service_id": service_id,
        "tier": tier,
        "created_at": subscription["created_at"],
        "expires_at": subscription["expires_at"],
        "usage_limit": subscription["usage_limit"],
        "current_usage": subscription["current_usage"],
    }


@app.get("/gateway/subscriptions/{subscription_id}")
async def get_subscription(subscription_id: str):
    """Get subscription details"""

    subscription = subscription_manager.get_subscription(subscription_id)

    if not subscription:
        raise HTTPException(
            status_code=404, detail=f"Subscription not found: {subscription_id}"
        )

    return subscription


@app.delete("/gateway/subscriptions/{subscription_id}")
async def cancel_subscription(subscription_id: str):
    """Cancel a subscription"""

    if not subscription_manager.cancel_subscription(subscription_id):
        raise HTTPException(
            status_code=404, detail=f"Subscription not found: {subscription_id}"
        )

    return {
        "subscription_id": subscription_id,
        "message": "Subscription cancelled successfully",
        "cancelled_at": datetime.utcnow().isoformat(),
    }


# Health check
@app.get("/gateway/health")
async def health_check():
    """Gateway health check"""

    redis_status = "healthy" if redis_client.ping() else "unhealthy"

    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "redis": redis_status,
            "service_registry": "healthy"
            if len(service_registry.get_all_services()) > 0
            else "empty",
            "subscription_manager": "healthy",
            "analytics": "healthy",
        },
        "stats": {
            "total_services": len(service_registry.get_all_services()),
            "active_subscriptions": subscription_manager.get_active_subscription_count(),
            "total_requests": analytics.get_total_requests(),
        },
    }


# Initialize services
@app.on_event("startup")
async def startup_event():
    """Initialize gateway services"""

    # Add default services
    default_services = {
        "ai-video-generator": {
            "name": "AI Video Generator",
            "description": "Browser-based video recording with webcam capture and YouTube upload via OAuth",
            "version": "1.0.0",
            "base_url": "http://ai-video-generator:8000",
            "authentication_type": "oauth",
            "subscription_required": True,
            "pricing_tiers": {
                "free": {"limit": 10, "price": 0},
                "basic": {"limit": 100, "price": 29},
                "pro": {"limit": 1000, "price": 99},
            },
            "tags": ["video", "generation", "youtube", "automation"],
            "capabilities": ["generate", "upload", "manage"],
            "requirements": ["oauth"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        "yt-faceless": {
            "name": "YT Faceless",
            "description": "Complete YouTube automation tool that generates scripts, voiceovers, and thumbnails",
            "version": "1.0.0",
            "base_url": "http://yt-faceless:8000",
            "authentication_type": "oauth",
            "subscription_required": True,
            "pricing_tiers": {
                "free": {"limit": 5, "price": 0},
                "basic": {"limit": 50, "price": 39},
                "pro": {"limit": 500, "price": 149},
            },
            "tags": ["youtube", "automation", "content", "generation"],
            "capabilities": ["generate", "upload", "schedule"],
            "requirements": ["oauth"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        "ai-employee": {
            "name": "AI Employee",
            "description": "Employee dashboard that manages tasks, schedules, and workflows",
            "version": "1.0.0",
            "base_url": "http://ai-employee:8000",
            "authentication_type": "api_key",
            "subscription_required": True,
            "pricing_tiers": {
                "free": {"limit": 20, "price": 0},
                "basic": {"limit": 200, "price": 49},
                "pro": {"limit": 2000, "price": 199},
            },
            "tags": ["employee", "management", "task", "workflow"],
            "capabilities": ["manage", "schedule", "track"],
            "requirements": ["api_key"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
        "aitravelagency": {
            "name": "AI Travel Agency",
            "description": "Intelligent travel platform generates personalized itineraries and handles bookings",
            "version": "1.0.0",
            "base_url": "http://aitravelagency:8000",
            "authentication_type": "oauth",
            "subscription_required": True,
            "pricing_tiers": {
                "free": {"limit": 5, "price": 0},
                "basic": {"limit": 50, "price": 39},
                "pro": {"limit": 500, "price": 149},
            },
            "tags": ["travel", "booking", "itinerary", "personalized"],
            "capabilities": ["plan", "book", "recommed", "pricing"],
            "requirements": ["oauth"],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        },
    }

    for service_id, service_config in default_services.items():
        if not service_registry.get_service(service_id):
            service_registry.register_service(service_id, service_config)

    print("NexusAI API Gateway initialized successfully")


if __name__ == "__main__":
    uvicorn.run("gateway.main:app", host="0.0.0.0", port=8000, reload=True)

# Export for imports
__all__ = ["analytics", "app", "service_registry", "subscription_manager"]
