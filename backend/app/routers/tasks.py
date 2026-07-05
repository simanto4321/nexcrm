"""CRUD routes for tasks — tenant-scoped; sales_rep sees only their tasks."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, assert_resource_tenant, get_current_tenant_user
from app.models import Task, TaskStatus, User, UserRole
from app.schemas import MessageResponse, TaskCreate, TaskResponse, TaskUpdate
from app.services.notifications import on_task_assigned
from app.tenant_filters import tasks_query

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _validate_assignee(db: Session, ctx: TenantUserContext, assigned_to: int | None) -> int | None:
    if assigned_to is None:
        return None
    user = db.query(User).filter(User.id == assigned_to, User.tenant_id == ctx.tenant_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assigned user not found in tenant")
    return assigned_to


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    tasks = tasks_query(db, ctx).order_by(Task.created_at.desc()).all()
    return [_task_to_response(t) for t in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    task = tasks_query(db, ctx).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    assert_resource_tenant(task.tenant_id, ctx)
    return _task_to_response(task)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    body: TaskCreate,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    assigned_to = body.assigned_to
    if ctx.role == UserRole.sales_rep:
        assigned_to = ctx.user_id
    else:
        assigned_to = _validate_assignee(db, ctx, assigned_to)

    task = Task(
        tenant_id=ctx.tenant_id,
        title=body.title,
        due_date=body.due_date,
        status=TaskStatus(body.status),
        assigned_to=assigned_to,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    if task.assigned_to:
        assignee = db.query(User).filter(User.id == task.assigned_to).first()
        on_task_assigned(db, ctx.tenant, task, assignee, ctx.user.name)
    return _task_to_response(task)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    body: TaskUpdate,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    task = tasks_query(db, ctx).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    assert_resource_tenant(task.tenant_id, ctx)

    old_assigned_to = task.assigned_to
    data = body.model_dump(exclude_unset=True)
    if "assigned_to" in data and ctx.role == UserRole.sales_rep:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sales reps cannot reassign tasks")
    if "assigned_to" in data:
        data["assigned_to"] = _validate_assignee(db, ctx, data["assigned_to"])
    if "status" in data:
        data["status"] = TaskStatus(data["status"])

    for key, value in data.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    if task.assigned_to and task.assigned_to != old_assigned_to:
        assignee = db.query(User).filter(User.id == task.assigned_to).first()
        on_task_assigned(db, ctx.tenant, task, assignee, ctx.user.name)
    return _task_to_response(task)


@router.delete("/{task_id}", response_model=MessageResponse)
def delete_task(
    task_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    task = tasks_query(db, ctx).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    assert_resource_tenant(task.tenant_id, ctx)
    db.delete(task)
    db.commit()
    return MessageResponse(message="Task deleted")


def _task_to_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        tenant_id=task.tenant_id,
        assigned_to=task.assigned_to,
        title=task.title,
        due_date=task.due_date,
        status=task.status.value if isinstance(task.status, TaskStatus) else task.status,
        created_at=task.created_at,
    )
