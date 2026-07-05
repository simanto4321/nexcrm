"""Query helpers for role-based tenant isolation (used in Stage 2+)."""

from sqlalchemy.orm import Query, Session

from app.dependencies import TenantUserContext
from app.models import Contact, Deal, Task, UserRole


def contacts_query(db: Session, ctx: TenantUserContext) -> Query:
    """All contacts for tenant; sales_rep sees only assigned contacts."""
    q = db.query(Contact).filter(Contact.tenant_id == ctx.tenant_id)
    if ctx.role == UserRole.sales_rep:
        q = q.filter(Contact.assigned_to == ctx.user_id)
    return q


def deals_query(db: Session, ctx: TenantUserContext) -> Query:
    """All deals for tenant; sales_rep sees deals for their contacts only."""
    q = db.query(Deal).filter(Deal.tenant_id == ctx.tenant_id)
    if ctx.role == UserRole.sales_rep:
        q = q.join(Contact, Deal.contact_id == Contact.id).filter(Contact.assigned_to == ctx.user_id)
    return q


def tasks_query(db: Session, ctx: TenantUserContext) -> Query:
    """All tasks for tenant; sales_rep sees only their assigned tasks."""
    q = db.query(Task).filter(Task.tenant_id == ctx.tenant_id)
    if ctx.role == UserRole.sales_rep:
        q = q.filter(Task.assigned_to == ctx.user_id)
    return q
