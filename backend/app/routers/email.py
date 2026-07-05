"""Tenant email notification settings (tenant_admin)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, require_tenant_admin
from app.models import TenantEmailConfig
from app.schemas import EmailConfigRequest, EmailConfigResponse, EmailTestResponse
from app.services.email_service import get_tenant_email_config, send_email, send_team_notification

router = APIRouter(prefix="/email", tags=["email"])


@router.get("/config", response_model=EmailConfigResponse)
def get_email_config(
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    config = get_tenant_email_config(db, ctx.tenant_id)
    if not config:
        return EmailConfigResponse(team_email=None, notifications_enabled=True, smtp_configured=_smtp_ok())
    return EmailConfigResponse(
        team_email=config.team_email,
        notifications_enabled=config.notifications_enabled,
        smtp_configured=_smtp_ok(),
    )


@router.put("/config", response_model=EmailConfigResponse)
def update_email_config(
    body: EmailConfigRequest,
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    config = get_tenant_email_config(db, ctx.tenant_id)
    if config:
        config.team_email = body.team_email
        config.notifications_enabled = body.notifications_enabled
    else:
        config = TenantEmailConfig(
            tenant_id=ctx.tenant_id,
            team_email=body.team_email,
            notifications_enabled=body.notifications_enabled,
        )
        db.add(config)
    db.commit()
    db.refresh(config)
    return EmailConfigResponse(
        team_email=config.team_email,
        notifications_enabled=config.notifications_enabled,
        smtp_configured=_smtp_ok(),
    )


@router.post("/test", response_model=EmailTestResponse)
def send_test_email(
    ctx: TenantUserContext = Depends(require_tenant_admin),
    db: Session = Depends(get_db),
):
    """Send a test notification to the tenant team_email."""
    sent = send_team_notification(
        db,
        ctx.tenant_id,
        subject=f"[{ctx.tenant.name}] NexCRM test email",
        body=f"This is a test notification from NexCRM for {ctx.tenant.name}.\n",
    )
    return EmailTestResponse(sent=sent, message="Test email sent" if sent else "Email not sent - check GMAIL_* env vars and team_email config")


def _smtp_ok() -> bool:
    from app.config import settings

    if settings.email_demo_mode or settings.email_simulate_mode:
        return True
    return bool(settings.gmail_address.strip() and settings.gmail_app_password.strip())
