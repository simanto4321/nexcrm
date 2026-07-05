"""Reusable FastAPI dependencies for auth and tenant isolation."""

from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.auth_utils import decode_access_token
from app.database import get_db
from app.models import PlatformAdmin, Tenant, TenantStatus, User, UserRole

security = HTTPBearer()


@dataclass
class TenantUserContext:
    """Authenticated user context extracted from JWT — use on every protected route."""

    user_id: int
    tenant_id: int
    role: UserRole
    email: str
    user: User
    tenant: Tenant


def get_current_tenant_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> TenantUserContext:
    """
    Decode JWT, load user + tenant, enforce tenant is active.
    Every tenant-scoped endpoint MUST depend on this.
    """
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
        tenant_id = int(payload["tenant_id"])
        role_str = payload["role"]
        email = payload["email"]
    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id, User.tenant_id == tenant_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant not found")

    if tenant.status == TenantStatus.suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant account is suspended")

    try:
        role = UserRole(role_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid role in token")

    return TenantUserContext(
        user_id=user.id,
        tenant_id=tenant.id,
        role=role,
        email=email,
        user=user,
        tenant=tenant,
    )


def require_tenant_admin(ctx: TenantUserContext = Depends(get_current_tenant_user)) -> TenantUserContext:
    """Only tenant_admin role may proceed."""
    if ctx.role != UserRole.tenant_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant admin access required")
    return ctx


def assert_resource_tenant(resource_tenant_id: int, ctx: TenantUserContext) -> None:
    """
    Reject if the resource belongs to a different tenant (even if ID was guessed).
    Call this whenever loading a single resource by ID.
    """
    if resource_tenant_id != ctx.tenant_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this resource")


def get_platform_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> PlatformAdmin:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        if payload.get("role") != "platform_admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin access required")
        admin_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = db.query(PlatformAdmin).filter(PlatformAdmin.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Platform admin not found")
    return admin
