"""Dashboard stats — counts scoped to tenant and user role."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, get_current_tenant_user
from app.models import Deal, DealStage, Task, TaskStatus
from app.schemas import DashboardResponse
from app.tenant_filters import contacts_query, deals_query, tasks_query

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

STAGES = ["new", "contacted", "negotiation", "won", "lost"]


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    total_contacts = contacts_query(db, ctx).count()

    deals_by_stage: dict[str, int] = {s: 0 for s in STAGES}
    rows = (
        deals_query(db, ctx)
        .with_entities(Deal.stage, func.count(Deal.id))
        .group_by(Deal.stage)
        .all()
    )
    for stage, count in rows:
        key = stage.value if hasattr(stage, "value") else stage
        deals_by_stage[key] = count

    pending_tasks = (
        tasks_query(db, ctx).filter(Task.status == TaskStatus.pending).count()
    )

    return DashboardResponse(
        total_contacts=total_contacts,
        deals_by_stage=deals_by_stage,
        pending_tasks=pending_tasks,
    )
