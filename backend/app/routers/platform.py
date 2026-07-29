"""Platform super-admin routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth_utils import create_access_token, verify_password
from app.database import get_db
from app.dependencies import get_platform_admin
from app.models import Contact, Deal, DealStage, PlatformAdmin, Task, Tenant, TenantStatus, User

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
    user_count: int = 0
    contact_count: int = 0
    deal_count: int = 0
    task_count: int = 0
    pipeline_value: float = 0
    won_value: float = 0


class PlatformOverview(BaseModel):
    tenant_count: int
    active_tenants: int
    suspended_tenants: int
    total_users: int
    total_contacts: int
    total_deals: int
    total_pipeline: float


class TenantStatusUpdate(BaseModel):
    status: str


def _tenant_stats(db: Session, tenant_id: int) -> dict:
    users = db.query(func.count(User.id)).filter(User.tenant_id == tenant_id).scalar() or 0
    contacts = db.query(func.count(Contact.id)).filter(Contact.tenant_id == tenant_id).scalar() or 0
    deals = db.query(func.count(Deal.id)).filter(Deal.tenant_id == tenant_id).scalar() or 0
    tasks = db.query(func.count(Task.id)).filter(Task.tenant_id == tenant_id).scalar() or 0
    pipeline = (
        db.query(func.coalesce(func.sum(Deal.value), 0.0))
        .filter(Deal.tenant_id == tenant_id, Deal.stage.notin_([DealStage.won, DealStage.lost]))
        .scalar()
        or 0.0
    )
    won = (
        db.query(func.coalesce(func.sum(Deal.value), 0.0))
        .filter(Deal.tenant_id == tenant_id, Deal.stage == DealStage.won)
        .scalar()
        or 0.0
    )
    return {
        "user_count": int(users),
        "contact_count": int(contacts),
        "deal_count": int(deals),
        "task_count": int(tasks),
        "pipeline_value": float(pipeline),
        "won_value": float(won),
    }


def _to_item(db: Session, t: Tenant) -> TenantListItem:
    stats = _tenant_stats(db, t.id)
    return TenantListItem(
        id=t.id,
        name=t.name,
        company_code=t.company_code,
        plan=t.plan,
        status=t.status.value if isinstance(t.status, TenantStatus) else t.status,
        created_at=t.created_at.isoformat(),
        **stats,
    )


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


@router.get("/overview", response_model=PlatformOverview)
def platform_overview(
    _admin: PlatformAdmin = Depends(get_platform_admin),
    db: Session = Depends(get_db),
):
    tenants = db.query(Tenant).all()
    active = sum(1 for t in tenants if (t.status.value if isinstance(t.status, TenantStatus) else t.status) == "active")
    pipeline = (
        db.query(func.coalesce(func.sum(Deal.value), 0.0))
        .filter(Deal.stage.notin_([DealStage.won, DealStage.lost]))
        .scalar()
        or 0.0
    )
    return PlatformOverview(
        tenant_count=len(tenants),
        active_tenants=active,
        suspended_tenants=len(tenants) - active,
        total_users=int(db.query(func.count(User.id)).scalar() or 0),
        total_contacts=int(db.query(func.count(Contact.id)).scalar() or 0),
        total_deals=int(db.query(func.count(Deal.id)).scalar() or 0),
        total_pipeline=float(pipeline),
    )


@router.get("/tenants", response_model=list[TenantListItem])
def list_tenants(
    _admin: PlatformAdmin = Depends(get_platform_admin),
    db: Session = Depends(get_db),
):
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    return [_to_item(db, t) for t in tenants]


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
    return _to_item(db, tenant)
