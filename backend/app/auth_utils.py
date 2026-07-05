"""Password hashing and JWT token utilities."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(
    *,
    user_id: int,
    tenant_id: int,
    role: str,
    email: str,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)
    )
    payload = {
        "sub": str(user_id),
        "tenant_id": tenant_id,
        "role": role,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode JWT; raises JWTError on failure."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
