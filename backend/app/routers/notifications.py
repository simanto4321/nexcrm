"""In-app notifications — inspired by CSE327 notification system."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, get_current_tenant_user
from app.models import Notification
from app.schemas import MessageResponse, NotificationResponse, UnreadCountResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
    limit: int = 50,
):
    return (
        db.query(Notification)
        .filter(Notification.tenant_id == ctx.tenant_id, Notification.user_id == ctx.user_id)
        .order_by(Notification.created_at.desc())
        .limit(min(limit, 100))
        .all()
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def unread_count(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.tenant_id == ctx.tenant_id,
            Notification.user_id == ctx.user_id,
            Notification.is_read.is_(False),
        )
        .count()
    )
    return UnreadCountResponse(unread=count)


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.tenant_id == ctx.tenant_id,
            Notification.user_id == ctx.user_id,
        )
        .first()
    )
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    note.is_read = True
    db.commit()
    db.refresh(note)
    return note


@router.post("/read-all", response_model=MessageResponse)
def mark_all_read(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    (
        db.query(Notification)
        .filter(
            Notification.tenant_id == ctx.tenant_id,
            Notification.user_id == ctx.user_id,
            Notification.is_read.is_(False),
        )
        .update({"is_read": True})
    )
    db.commit()
    return MessageResponse(message="All notifications marked as read")
