"""CRUD routes for deals — tenant-scoped; sales_rep sees deals for their contacts."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import TenantUserContext, assert_resource_tenant, get_current_tenant_user
from app.models import Contact, Deal, DealStage, UserRole
from app.schemas import DealCreate, DealResponse, DealUpdate, MessageResponse
from app.services.notifications import on_deal_stage_change
from app.tenant_filters import contacts_query, deals_query

router = APIRouter(prefix="/deals", tags=["deals"])


def _validate_contact(db: Session, ctx: TenantUserContext, contact_id: int | None) -> int | None:
    if contact_id is None:
        return None
    contact = contacts_query(db, ctx).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Contact not found or not accessible")
    return contact_id


@router.get("", response_model=list[DealResponse])
def list_deals(
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    deals = deals_query(db, ctx).order_by(Deal.created_at.desc()).all()
    return [_deal_to_response(d) for d in deals]


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(
    deal_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    deal = deals_query(db, ctx).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    assert_resource_tenant(deal.tenant_id, ctx)
    return _deal_to_response(deal)


@router.post("", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(
    body: DealCreate,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    contact_id = _validate_contact(db, ctx, body.contact_id)
    deal = Deal(
        tenant_id=ctx.tenant_id,
        contact_id=contact_id,
        stage=DealStage(body.stage),
        value=body.value,
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return _deal_to_response(deal)


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    body: DealUpdate,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    deal = deals_query(db, ctx).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    assert_resource_tenant(deal.tenant_id, ctx)

    old_stage = deal.stage
    data = body.model_dump(exclude_unset=True)
    if "contact_id" in data:
        data["contact_id"] = _validate_contact(db, ctx, data["contact_id"])
    if "stage" in data:
        data["stage"] = DealStage(data["stage"])

    for key, value in data.items():
        setattr(deal, key, value)
    db.commit()
    db.refresh(deal)
    on_deal_stage_change(db, ctx.tenant, deal, old_stage, deal.stage, ctx.user.name)
    return _deal_to_response(deal)


@router.delete("/{deal_id}", response_model=MessageResponse)
def delete_deal(
    deal_id: int,
    ctx: TenantUserContext = Depends(get_current_tenant_user),
    db: Session = Depends(get_db),
):
    deal = deals_query(db, ctx).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    assert_resource_tenant(deal.tenant_id, ctx)
    db.delete(deal)
    db.commit()
    return MessageResponse(message="Deal deleted")


def _deal_to_response(deal: Deal) -> DealResponse:
    return DealResponse(
        id=deal.id,
        tenant_id=deal.tenant_id,
        contact_id=deal.contact_id,
        stage=deal.stage.value if isinstance(deal.stage, DealStage) else deal.stage,
        value=deal.value,
        created_at=deal.created_at,
    )
