"""Unified CRM notifications — email + Telegram."""

import logging

from sqlalchemy.orm import Session

from app.models import Contact, Deal, DealStage, Task, Tenant, User
from app.services.email_service import (
    notify_deal_stage_change,
    notify_new_contact,
    notify_task_assigned,
    send_team_notification,
)
from app.services.telegram_client import bot_configured, send_telegram_message, send_tenant_telegram

logger = logging.getLogger(__name__)


def notify_team(db: Session, tenant: Tenant, subject: str, body: str) -> dict:
    """Send a notification to tenant email and Telegram group."""
    email_sent = send_team_notification(db, tenant.id, subject, body)
    telegram_sent = send_tenant_telegram(db, tenant.id, f"*{subject}*\n\n{body}")
    return {"email_sent": email_sent, "telegram_sent": telegram_sent}


def on_new_contact(db: Session, tenant: Tenant, contact: Contact, actor_name: str) -> dict:
    email_sent = notify_new_contact(db, tenant, contact, actor_name)
    text = (
        f"New contact on {tenant.name}\n"
        f"Name: {contact.name}\n"
        f"Email: {contact.email or '—'}\n"
        f"Added by: {actor_name}"
    )
    telegram_sent = send_tenant_telegram(db, tenant.id, text)
    return {"email_sent": email_sent, "telegram_sent": telegram_sent}


def on_deal_stage_change(
    db: Session,
    tenant: Tenant,
    deal: Deal,
    old_stage: DealStage,
    new_stage: DealStage,
    actor_name: str,
) -> dict:
    email_sent = notify_deal_stage_change(db, tenant, deal, old_stage, new_stage, actor_name)
    telegram_sent = False
    if new_stage in (DealStage.won, DealStage.lost) and old_stage != new_stage:
        text = (
            f"Deal #{deal.id} → {new_stage.value}\n"
            f"Value: ${deal.value:,.0f}\n"
            f"Updated by: {actor_name}"
        )
        telegram_sent = send_tenant_telegram(db, tenant.id, text)
    return {"email_sent": email_sent, "telegram_sent": telegram_sent}


def on_task_assigned(
    db: Session,
    tenant: Tenant,
    task: Task,
    assignee: User | None,
    actor_name: str,
) -> dict:
    email_sent = notify_task_assigned(db, tenant, task, assignee, actor_name)
    telegram_sent = False
    if assignee:
        due = task.due_date.strftime("%Y-%m-%d") if task.due_date else "—"
        text = (
            f"Task assigned on {tenant.name}\n"
            f"Title: {task.title}\n"
            f"Assigned to: {assignee.name}\n"
            f"Due: {due}"
        )
        telegram_sent = send_tenant_telegram(db, tenant.id, text)
    return {"email_sent": email_sent, "telegram_sent": telegram_sent}
