"""Team members and invites — CSE327 employee-style management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth_utils import hash_password
from app.database import get_db
from app.dependencies import TenantUserContext, get_current_tenant_user, require_tenant_admin
from app.models import InviteStatus, User, UserInvite, UserRole
from app.schemas import InviteCreate, InviteResponse, MessageResponse, TeamMemberCreate, UserResponse
from app.services.notifications import create_in_app_for_tenant

router = APIRouter(prefix="/team", tags=["team"])


@router.get("/members", response_model=list[UserResponse])
def list_members(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(User)
        .filter(User.tenant_id == ctx.tenant_id)
        .order_by(User.created_at.asc())
        .all()
    )


@router.post("/members", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    body: TeamMemberCreate,
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(User)
        .filter(User.tenant_id == ctx.tenant_id, User.email == body.email.lower())
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in this tenant")

    user = User(
        tenant_id=ctx.tenant_id,
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=UserRole(body.role),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    create_in_app_for_tenant(
        db,
        ctx.tenant_id,
        title="New team member",
        message=f"{user.name} ({user.role.value.replace('_', ' ')}) joined the workspace.",
        ntype="team",
        entity_type="User",
        entity_id=user.id,
        exclude_user_id=user.id,
    )
    return user


@router.get("/invites", response_model=list[InviteResponse])
def list_invites(
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    invites = (
        db.query(UserInvite)
        .filter(UserInvite.tenant_id == ctx.tenant_id)
        .order_by(UserInvite.created_at.desc())
        .all()
    )
    return [
        InviteResponse(
            id=i.id,
            tenant_id=i.tenant_id,
            email=i.email,
            role=i.role.value if hasattr(i.role, "value") else i.role,
            status=i.status.value if hasattr(i.status, "value") else i.status,
            invited_by=i.invited_by,
            created_at=i.created_at,
        )
        for i in invites
    ]


@router.post("/invites", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
def create_invite(
    body: InviteCreate,
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.tenant_id == ctx.tenant_id, User.email == body.email.lower())
        .first()
    )
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    invite = UserInvite(
        tenant_id=ctx.tenant_id,
        email=body.email.lower(),
        role=UserRole(body.role),
        invited_by=ctx.user_id,
        status=InviteStatus.pending,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)
    create_in_app_for_tenant(
        db,
        ctx.tenant_id,
        title="Invite sent",
        message=f"Invite pending for {invite.email} as {invite.role.value.replace('_', ' ')}.",
        ntype="team",
        entity_type="Invite",
        entity_id=invite.id,
    )
    return InviteResponse(
        id=invite.id,
        tenant_id=invite.tenant_id,
        email=invite.email,
        role=invite.role.value,
        status=invite.status.value,
        invited_by=invite.invited_by,
        created_at=invite.created_at,
    )


@router.delete("/invites/{invite_id}", response_model=MessageResponse)
def cancel_invite(
    invite_id: int,
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    invite = (
        db.query(UserInvite)
        .filter(UserInvite.id == invite_id, UserInvite.tenant_id == ctx.tenant_id)
        .first()
    )
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    db.delete(invite)
    db.commit()
    return MessageResponse(message="Invite cancelled")
