"""CRUD routes for contacts — tenant-scoped with sales_rep visibility."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, assert_resource_tenant, get_current_tenant_user
from app.models import Contact, User, UserRole
from app.schemas import ContactCreate, ContactResponse, ContactUpdate, MessageResponse
from app.services.notifications import on_new_contact
from app.tenant_filters import contacts_query

router = APIRouter(prefix="/contacts", tags=["contacts"])


def _validate_assignee(db: Session, ctx: TenantUserContext, assigned_to: int | None) -> int | None:
    """Ensure assigned_to user belongs to the same tenant."""
    if assigned_to is None:
        return None
    user = db.query(User).filter(User.id == assigned_to, User.tenant_id == ctx.tenant_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assigned user not found in tenant")
    return assigned_to


@router.get("", response_model=list[ContactResponse])
def list_contacts(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    return contacts_query(db, ctx).order_by(Contact.created_at.desc()).all()


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    contact = contacts_query(db, ctx).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    assert_resource_tenant(contact.tenant_id, ctx)
    return contact


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    body: ContactCreate,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    assigned_to = body.assigned_to
    if ctx.role == UserRole.sales_rep:
        assigned_to = ctx.user_id
    else:
        assigned_to = _validate_assignee(db, ctx, assigned_to)

    contact = Contact(
        tenant_id=ctx.tenant_id,
        name=body.name,
        phone=body.phone,
        email=body.email,
        status=body.status,
        assigned_to=assigned_to,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    on_new_contact(db, ctx.tenant, contact, ctx.user.name)
    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    body: ContactUpdate,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    contact = contacts_query(db, ctx).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    assert_resource_tenant(contact.tenant_id, ctx)

    data = body.model_dump(exclude_unset=True)
    if "assigned_to" in data and ctx.role == UserRole.sales_rep:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sales reps cannot reassign contacts")
    if "assigned_to" in data:
        data["assigned_to"] = _validate_assignee(db, ctx, data["assigned_to"])

    for key, value in data.items():
        setattr(contact, key, value)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", response_model=MessageResponse)
def delete_contact(
    contact_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    contact = contacts_query(db, ctx).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    assert_resource_tenant(contact.tenant_id, ctx)
    db.delete(contact)
    db.commit()
    return MessageResponse(message="Contact deleted")
