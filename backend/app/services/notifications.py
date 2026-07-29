"""Unified CRM notifications — email + Telegram + in-app (CSE327-style)."""

import logging

from sqlalchemy.orm import Session

from app.models import Contact, Deal, DealStage, Notification, Task, Tenant, User
from app.services.email_service import (
    notify_deal_stage_change,
    notify_new_contact,
    notify_task_assigned,
    send_team_notification,
)
from app.services.telegram_client import send_tenant_telegram

logger = logging.getLogger(__name__)


def create_in_app_for_tenant(
    db: Session,
    tenant_id: int,
    title: str,
    message: str,
    ntype: str = "general",
    entity_type: str | None = None,
    entity_id: int | None = None,
    exclude_user_id: int | None = None,
    only_user_id: int | None = None,
) -> int:
    """Create in-app notifications for tenant users. Returns count created."""
    q = db.query(User).filter(User.tenant_id == tenant_id)
    if only_user_id is not None:
        q = q.filter(User.id == only_user_id)
    users = q.all()
    created = 0
    for user in users:
        if exclude_user_id is not None and user.id == exclude_user_id:
            continue
        db.add(
            Notification(
                tenant_id=tenant_id,
                user_id=user.id,
                title=title,
                message=message,
                type=ntype,
                entity_type=entity_type,
                entity_id=entity_id,
            )
        )
        created += 1
    if created:
        db.commit()
    return created


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
    create_in_app_for_tenant(
        db,
        tenant.id,
        title="New contact",
        message=f"{contact.name} added by {actor_name}",
        ntype="contact",
        entity_type="Contact",
        entity_id=contact.id,
    )
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
    if old_stage != new_stage:
        create_in_app_for_tenant(
            db,
            tenant.id,
            title=f"Deal moved to {new_stage.value}",
            message=f"Deal #{deal.id} (${deal.value:,.0f}) {old_stage.value} → {new_stage.value} by {actor_name}",
            ntype="deal",
            entity_type="Deal",
            entity_id=deal.id,
        )
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
        create_in_app_for_tenant(
            db,
            tenant.id,
            title="Task assigned",
            message=f'"{task.title}" → {assignee.name} (by {actor_name})',
            ntype="task",
            entity_type="Task",
            entity_id=task.id,
            only_user_id=assignee.id,
        )
    return {"email_sent": email_sent, "telegram_sent": telegram_sent}
