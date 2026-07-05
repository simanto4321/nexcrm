"""Platform super-admin routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.auth_utils import create_access_token, hash_password, verify_password
from app.database import get_db
from app.dependencies import get_platform_admin
from app.models import PlatformAdmin, Tenant, TenantStatus

router = APIRouter(prefix="/platform", tags=["platform"])


class PlatformLoginRequest(BaseModel):
    email: EmailStr
    password: str


class PlatformTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_id: int
    email: str


class TenantListItem(BaseModel):
    id: int
    name: str
    company_code: str
    plan: str
    status: str
    created_at: str


class TenantStatusUpdate(BaseModel):
    status: str


@router.post("/auth/login", response_model=PlatformTokenResponse)
def platform_login(body: PlatformLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(PlatformAdmin).filter(PlatformAdmin.email == body.email).first()
    if not admin or not verify_password(body.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        user_id=admin.id,
        tenant_id=0,
        role="platform_admin",
        email=admin.email,
    )
    return PlatformTokenResponse(access_token=token, admin_id=admin.id, email=admin.email)


@router.get("/tenants", response_model=list[TenantListItem])
def list_tenants(
    _admin: PlatformAdmin = Depends(get_platform_admin),
    db: Session = Depends(get_db),
):
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    return [
        TenantListItem(
            id=t.id,
            name=t.name,
            company_code=t.company_code,
            plan=t.plan,
            status=t.status.value if isinstance(t.status, TenantStatus) else t.status,
            created_at=t.created_at.isoformat(),
        )
        for t in tenants
    ]


@router.patch("/tenants/{tenant_id}/status", response_model=TenantListItem)
def update_tenant_status(
    tenant_id: int,
    body: TenantStatusUpdate,
    _admin: PlatformAdmin = Depends(get_platform_admin),
    db: Session = Depends(get_db),
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")

    try:
        tenant.status = TenantStatus(body.status)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status") from exc

    db.commit()
    db.refresh(tenant)
    return TenantListItem(
        id=tenant.id,
        name=tenant.name,
        company_code=tenant.company_code,
        plan=tenant.plan,
        status=tenant.status.value,
        created_at=tenant.created_at.isoformat(),
    )
