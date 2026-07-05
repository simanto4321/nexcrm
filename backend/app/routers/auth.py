"""Authentication routes: signup and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth_utils import create_access_token, hash_password, verify_password
from app.database import get_db
from app.dependencies import get_current_tenant_user, TenantUserContext
from app.models import Tenant, TenantSettings, TenantStatus, User, UserRole
from app.schemas import LoginRequest, MessageResponse, SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """
    Create a new tenant and the first tenant_admin user.
    Returns a JWT so the admin can use the app immediately.
    """
    existing_tenant = db.query(Tenant).filter(Tenant.company_code == body.company_code).first()
    if existing_tenant:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Company code already taken")

    tenant = Tenant(
        name=body.tenant_name,
        company_code=body.company_code,
        plan="free",
        status=TenantStatus.active,
    )
    db.add(tenant)
    db.flush()

    admin = User(
        tenant_id=tenant.id,
        name=body.admin_name,
        email=body.admin_email,
        password_hash=hash_password(body.password),
        role=UserRole.tenant_admin,
    )
    db.add(admin)

    # Default tenant settings row
    db.add(TenantSettings(tenant_id=tenant.id))
    db.commit()
    db.refresh(admin)
    db.refresh(tenant)

    token = create_access_token(
        user_id=admin.id,
        tenant_id=tenant.id,
        role=admin.role.value,
        email=admin.email,
    )

    return TokenResponse(
        access_token=token,
        user_id=admin.id,
        tenant_id=tenant.id,
        role=admin.role.value,
        tenant_name=tenant.name,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email + password + company_code; returns JWT."""
    tenant = db.query(Tenant).filter(Tenant.company_code == body.company_code).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if tenant.status == TenantStatus.suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tenant account is suspended")

    user = db.query(User).filter(User.email == body.email, User.tenant_id == tenant.id).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        user_id=user.id,
        tenant_id=tenant.id,
        role=user.role.value,
        email=user.email,
    )

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        tenant_id=tenant.id,
        role=user.role.value,
        tenant_name=tenant.name,
    )


@router.get("/me", response_model=UserResponse)
def get_me(ctx: TenantUserContext = Depends(get_current_tenant_user)):
    """Protected test endpoint — confirms JWT + tenant dependency works."""
    return ctx.user
