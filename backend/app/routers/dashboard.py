"""Dashboard stats — counts + pipeline value + recent activity (CSE327-style)."""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, get_current_tenant_user
from app.models import Contact, Deal, DealStage, Task, TaskStatus, User
from app.schemas import ActivityItem, DashboardResponse
from app.tenant_filters import contacts_query, deals_query, tasks_query

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

STAGES = ["new", "contacted", "negotiation", "won", "lost"]
OPEN_STAGES = {DealStage.new, DealStage.contacted, DealStage.negotiation}


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

    pending_tasks = tasks_query(db, ctx).filter(Task.status == TaskStatus.pending).count()

    team_count = db.query(User).filter(User.tenant_id == ctx.tenant_id).count()

    pipeline_value = (
        deals_query(db, ctx)
        .filter(Deal.stage.in_(OPEN_STAGES))
        .with_entities(func.coalesce(func.sum(Deal.value), 0.0))
        .scalar()
        or 0.0
    )
    won_value = (
        deals_query(db, ctx)
        .filter(Deal.stage == DealStage.won)
        .with_entities(func.coalesce(func.sum(Deal.value), 0.0))
        .scalar()
        or 0.0
    )

    recent: list[ActivityItem] = []
    for c in contacts_query(db, ctx).order_by(Contact.created_at.desc()).limit(5).all():
        recent.append(
            ActivityItem(
                kind="contact",
                title=f"Contact: {c.name}",
                detail=c.status or "lead",
                created_at=c.created_at,
                entity_id=c.id,
            )
        )
    for d in deals_query(db, ctx).order_by(Deal.created_at.desc()).limit(5).all():
        stage = d.stage.value if hasattr(d.stage, "value") else d.stage
        recent.append(
            ActivityItem(
                kind="deal",
                title=f"Deal #{d.id} · ${d.value:,.0f}",
                detail=f"Stage: {stage}",
                created_at=d.created_at,
                entity_id=d.id,
            )
        )
    for t in tasks_query(db, ctx).order_by(Task.created_at.desc()).limit(5).all():
        status = t.status.value if hasattr(t.status, "value") else t.status
        recent.append(
            ActivityItem(
                kind="task",
                title=t.title,
                detail=f"Status: {status}",
                created_at=t.created_at,
                entity_id=t.id,
            )
        )
    recent.sort(key=lambda a: a.created_at, reverse=True)
    recent = recent[:12]

    return DashboardResponse(
        total_contacts=total_contacts,
        deals_by_stage=deals_by_stage,
        pending_tasks=pending_tasks,
        team_count=team_count,
        pipeline_value=float(pipeline_value),
        won_value=float(won_value),
        recent_activity=recent,
    )
