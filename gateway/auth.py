"""
Authentication module for NexusAI API Gateway
Handles API key validation, authentication, and authorization
"""

import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta

import jwt
import redis


class APIKeyAuth:
    """API key authentication and authorization"""

    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.auth_secret = os.getenv("AUTH_SECRET", "default-secret-key")
        self.token_ttl = int(os.getenv("TOKEN_TTL", "3600"))  # 1 hour

    def generate_token(self, user_id: str, service_id: str) -> str:
        """Generate a JWT token for API authentication"""
        payload = {
            "sub": user_id,
            "service": service_id,
            "iat": datetime.utcnow().timestamp(),
            "exp": datetime.utcnow().timestamp() + self.token_ttl,
            "jti": hashlib.sha256(
                f"{user_id}:{service_id}:{datetime.utcnow().timestamp()}".encode()
            ).hexdigest()[:16],
        }

        return jwt.encode(payload, self.auth_secret, algorithm="HS256")

    def validate_token(self, token: str) -> dict | None:
        """Validate JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.auth_secret, algorithms=["HS256"])

            # Check if token is blacklisted
            if self.is_token_blacklisted(payload.get("jti")):
                return None

            return payload

        except jwt.InvalidTokenError:
            return None

    def is_token_blacklisted(self, jti: str) -> bool:
        """Check if token is blacklisted"""
        return bool(self.redis_client.exists(f"token:blacklist:{jti}"))

    def blacklist_token(self, jti: str):
        """Blacklist a token"""
        ttl = int(os.getenv("TOKEN_BLACKLIST_TTL", "86400"))  # 24 hours
        self.redis_client.setex(f"token:blacklist:{jti}", ttl, "1")

    def authenticate_api_key(self, api_key: str) -> tuple[bool, dict | None]:
        """Authenticate API key and return user/service info"""
        if not api_key or len(api_key) < 10:
            return False, None

        # Try to decode as JWT
        if "." in api_key:
            payload = self.validate_token(api_key)
            if payload:
                return True, {
                    "user_id": payload.get("sub"),
                    "service_id": payload.get("service"),
                    "token_id": payload.get("jti"),
                    "type": "jwt",
                }

        # Try to look up in Redis as stored API key
        api_key_data = self.redis_client.get(f"api_key:{api_key}")
        if api_key_data:
            key_info = json.loads(api_key_data)
            return True, {
                "user_id": key_info.get("user_id"),
                "service_id": key_info.get("service_id"),
                "api_key": api_key,
                "type": "stored",
            }

        return False, None

    def create_api_key(self, user_id: str, service_id: str, permissions: list) -> str:
        """Create a new API key"""
        api_key = secrets.token_urlsafe(32)

        key_data = {
            "user_id": user_id,
            "service_id": service_id,
            "permissions": permissions,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "status": "active",
        }

        self.redis_client.setex(
            f"api_key:{api_key}", 2592000, json.dumps(key_data)
        )  # 30 days

        # Also store reverse index
        self.redis_client.sadd(f"user_keys:{user_id}", api_key)
        self.redis_client.sadd(f"service_keys:{service_id}", api_key)

        return api_key

    def invalidate_api_key(self, api_key: str):
        """Invalidate an API key"""
        key_data = self.redis_client.get(f"api_key:{api_key}")
        if key_data:
            key_info = json.loads(key_data)
            self.redis_client.delete(f"api_key:{api_key}")

            # Remove from indexes
            self.redis_client.srem(f"user_keys:{key_info.get('user_id')}", api_key)
            self.redis_client.srem(
                f"service_keys:{key_info.get('service_id')}", api_key
            )

    def validate_permissions(self, api_key: str, required_permission: str) -> bool:
        """Validate if API key has required permissions"""
        auth_result = self.authenticate_api_key(api_key)

        if not auth_result[0]:
            return False

        key_info = auth_result[1]

        if key_info["type"] == "jwt":
            # For JWT tokens, permissions are embedded in the token
            # This is a simplified check - in production, you'd have a more sophisticated permission system
            return True
        elif key_info["type"] == "stored":
            # For stored keys, check permissions list
            return required_permission in key_info.get("permissions", [])

        return False

    def rotate_api_key(self, old_api_key: str) -> str:
        """Rotate an API key and return new key"""
        # Get old key info
        old_key_data = self.redis_client.get(f"api_key:{old_api_key}")
        if not old_key_data:
            raise ValueError("Invalid API key")

        key_info = json.loads(old_key_data)

        # Invalidate old key
        self.invalidate_api_key(old_api_key)

        # Generate new key with same attributes
        new_api_key = self.create_api_key(
            user_id=key_info["user_id"],
            service_id=key_info["service_id"],
            permissions=key_info["permissions"],
        )

        # Notify about rotation
        self.redis_client.publish(
            "api_key_rotations",
            json.dumps(
                {
                    "old_key": old_api_key,
                    "new_key": new_api_key,
                    "user_id": key_info["user_id"],
                    "service_id": key_info["service_id"],
                    "rotated_at": datetime.utcnow().isoformat(),
                }
            ),
        )

        return new_api_key

    def get_api_key_usage_stats(self, api_key: str, hours: int = 24) -> dict:
        """Get usage statistics for an API key"""
        stats_key = (
            f"api_key_stats:{api_key}:{int(datetime.utcnow().timestamp() / 3600)}"
        )

        stats = self.redis_client.hgetall(stats_key)

        if not stats:
            return {
                "total_requests": 0,
                "unique_ips": 0,
                "unique_users": 0,
                "error_rate": 0,
                "avg_response_time": 0,
            }

        # Parse stats
        total_requests = int(stats.get("total_requests", 0))
        error_requests = int(stats.get("error_requests", 0))
        unique_ips = int(stats.get("unique_ips", 0))
        unique_users = int(stats.get("unique_users", 0))
        total_response_time = float(stats.get("total_response_time", 0))

        return {
            "total_requests": total_requests,
            "unique_ips": unique_ips,
            "unique_users": unique_users,
            "error_rate": (error_requests / total_requests * 100)
            if total_requests > 0
            else 0,
            "avg_response_time": (total_response_time / total_requests)
            if total_requests > 0
            else 0,
            "period_hours": hours,
        }

    def get_service_api_keys(self, service_id: str) -> list[str]:
        """Get all API keys for a service"""
        return list(self.redis_client.smembers(f"service_keys:{service_id}"))

    def get_user_api_keys(self, user_id: str) -> list[str]:
        """Get all API keys for a user"""
        return list(self.redis_client.smembers(f"user_keys:{user_id}"))

    def log_api_key_usage(
        self,
        api_key: str,
        user_id: str,
        service_id: str,
        status_code: int,
        response_time: float,
        source_ip: str,
    ):
        """Log API key usage for analytics"""
        current_hour = int(datetime.utcnow().timestamp() / 3600)
        stats_key = f"api_key_stats:{api_key}:{current_hour}"

        pipeline = self.redis_client.pipeline()
        pipeline.hincrby(stats_key, "total_requests", 1)

        if status_code >= 400:
            pipeline.hincrby(stats_key, "error_requests", 1)

        pipeline.sadd(f"unique_ips:{stats_key}", source_ip)
        pipeline.sadd(f"unique_users:{stats_key}", user_id)
        pipeline.hincrbyfloat(stats_key, "total_response_time", response_time)

        pipeline.expire(stats_key, 3600)  # 1 hour expiration

        pipeline.execute()
