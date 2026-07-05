"""Outbound email via Gmail SMTP — tenant notifications."""

import logging
import smtplib
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Contact, Deal, DealStage, Task, Tenant, TenantEmailConfig, User

logger = logging.getLogger(__name__)


def _smtp_configured() -> bool:
    if settings.email_demo_mode or settings.email_simulate_mode:
        return True
    return bool(settings.gmail_address.strip() and settings.gmail_app_password.strip())


def send_email(*, to: str, subject: str, body: str) -> bool:
    """Send a plain-text email. Returns True if sent."""
    if settings.email_simulate_mode:
        logger.info("[EMAIL SIMULATE] to=%s subject=%s body=%s", to, subject, body[:200])
        return True

    if not _smtp_configured():
        logger.warning("GMAIL_ADDRESS / GMAIL_APP_PASSWORD not set — email skipped")
        return False

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    from_addr = settings.gmail_address if settings.gmail_address.strip() else "nexcrm-demo@localhost"
    msg["From"] = from_addr
    msg["To"] = to

    host = settings.smtp_host
    port = settings.smtp_port
    use_tls = settings.smtp_use_tls

    try:
        if settings.email_demo_mode:
            with smtplib.SMTP(host, port, timeout=30) as server:
                server.sendmail(from_addr, [to], msg.as_string())
            logger.info("Demo email sent to %s (subject=%s)", to, subject)
            return True

        password = settings.gmail_app_password.replace(" ", "")
        with smtplib.SMTP(host, port, timeout=30) as server:
            if use_tls:
                server.starttls()
            server.login(settings.gmail_address, password)
            server.sendmail(settings.gmail_address, [to], msg.as_string())
        return True
    except Exception as exc:
        logger.exception("Failed to send email to %s: %s", to, exc)
        return False


def get_tenant_email_config(db: Session, tenant_id: int) -> TenantEmailConfig | None:
    return db.query(TenantEmailConfig).filter(TenantEmailConfig.tenant_id == tenant_id).first()


def send_team_notification(db: Session, tenant_id: int, subject: str, body: str) -> bool:
    """Send to tenant team_email if notifications are enabled."""
    config = get_tenant_email_config(db, tenant_id)
    if not config or not config.notifications_enabled or not config.team_email:
        logger.info("Email notifications disabled or no team_email for tenant_id=%s", tenant_id)
        return False
    return send_email(to=config.team_email, subject=subject, body=body)


def notify_new_contact(db: Session, tenant: Tenant, contact: Contact, actor_name: str) -> bool:
    subject = f"[{tenant.name}] New contact: {contact.name}"
    body = (
        f"A new contact was added to {tenant.name}.\n\n"
        f"Name: {contact.name}\n"
        f"Email: {contact.email or '—'}\n"
        f"Phone: {contact.phone or '—'}\n"
        f"Status: {contact.status}\n"
        f"Added by: {actor_name}\n"
    )
    return send_team_notification(db, tenant.id, subject, body)


def notify_deal_stage_change(
    db: Session,
    tenant: Tenant,
    deal: Deal,
    old_stage: DealStage,
    new_stage: DealStage,
    actor_name: str,
) -> bool:
    if new_stage not in (DealStage.won, DealStage.lost) or old_stage == new_stage:
        return False
    subject = f"[{tenant.name}] Deal {new_stage.value}: #{deal.id}"
    body = (
        f"Deal #{deal.id} was moved to '{new_stage.value}'.\n\n"
        f"Previous stage: {old_stage.value}\n"
        f"Value: {deal.value}\n"
        f"Contact ID: {deal.contact_id or '—'}\n"
        f"Updated by: {actor_name}\n"
    )
    return send_team_notification(db, tenant.id, subject, body)


def notify_task_assigned(
    db: Session,
    tenant: Tenant,
    task: Task,
    assignee: User | None,
    actor_name: str,
) -> bool:
    if not assignee:
        return False
    subject = f"[{tenant.name}] Task assigned: {task.title}"
    due = task.due_date.strftime("%Y-%m-%d") if task.due_date else "—"
    body = (
        f"A task was assigned on {tenant.name}.\n\n"
        f"Title: {task.title}\n"
        f"Assigned to: {assignee.name} ({assignee.email})\n"
        f"Due date: {due}\n"
        f"Assigned by: {actor_name}\n"
    )
    return send_team_notification(db, tenant.id, subject, body)
