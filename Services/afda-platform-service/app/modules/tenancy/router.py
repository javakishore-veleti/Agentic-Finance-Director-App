"""
Tenancy router:
  /customer — get/update current customer
  /organizations — CRUD orgs
  /organizations/{id}/currencies — manage org currencies
"""
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.shared.responses import ok
from app.shared.exceptions import NotFoundError, BadRequestError
from app.modules.identity.models import User, Organization, OrganizationCurrency
from app.modules.identity.dao import CustomerDAO, OrganizationDAO
from app.modules.tenancy.dao import OrgCurrencyDAO
from app.modules.tenancy.dtos import (
    CustomerUpdateRequest, OrgCreateRequest, OrgUpdateRequest,
    OrgCurrencyCreateRequest,
)

router = APIRouter()


# ── Customer ───────────────────────────────────────────────────

@router.get("/customer")
async def get_customer(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = CustomerDAO(db)
    c = await dao.get_by_id(user.customer_id)
    if not c:
        raise NotFoundError("Customer")
    return ok(data={
        "id": str(c.id), "name": c.name, "slug": c.slug,
        "legal_name": c.legal_name, "industry": c.industry,
        "plan": c.plan, "status": c.status,
        "default_organization_id": str(c.default_organization_id) if c.default_organization_id else None,
    })

@router.put("/customer")
async def update_customer(
    req: CustomerUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can update customer")
    dao = CustomerDAO(db)
    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(user.customer_id, **updates)
        await db.commit()
    return ok(message="Customer updated")


# ── Organizations ──────────────────────────────────────────────

@router.get("/organizations")
async def list_organizations(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    dao = OrganizationDAO(db)
    orgs = await dao.list_by_customer(user.customer_id)
    return ok(data=[{
        "id": str(o.id), "name": o.name, "code": o.code,
        "country": o.country, "timezone": o.timezone,
        "default_currency_code": o.default_currency_code,
        "status": o.status, "is_default": o.is_default,
    } for o in orgs])


@router.post("/organizations")
async def create_organization(
    req: OrgCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.is_customer_admin:
        raise BadRequestError("Only customer admins can create organizations")

    dao = OrganizationDAO(db)
    org = Organization(
        customer_id=user.customer_id,
        name=req.name,
        code=req.code,
        legal_entity_name=req.legal_entity_name,
        country=req.country,
        timezone=req.timezone,
        fiscal_year_end_month=req.fiscal_year_end_month,
        default_currency_code=req.default_currency_code,
        status="active",
    )
    org = await dao.create(org)

    # Create default currency
    currency = OrganizationCurrency(
        organization_id=org.id,
        currency_code=req.default_currency_code,
        is_primary=True,
        is_reporting=True,
        status="active",
    )
    db.add(currency)
    await db.commit()

    return ok(data={"id": str(org.id), "name": org.name, "code": org.code})


@router.put("/organizations/{org_id}")
async def update_organization(
    org_id: uuid.UUID,
    req: OrgUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = OrganizationDAO(db)
    org = await dao.get_by_id(org_id)
    if not org or org.customer_id != user.customer_id:
        raise NotFoundError("Organization")

    updates = req.model_dump(exclude_none=True)
    if updates:
        await dao.update(org_id, **updates)
        await db.commit()
    return ok(message="Organization updated")


@router.delete("/organizations/{org_id}")
async def deactivate_organization(
    org_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Prevent deleting default org
    cust_dao = CustomerDAO(db)
    customer = await cust_dao.get_by_id(user.customer_id)
    if customer and customer.default_organization_id == org_id:
        raise BadRequestError("Cannot delete the default organization")

    dao = OrganizationDAO(db)
    await dao.update(org_id, status="archived")
    await db.commit()
    return ok(message="Organization archived")


# ── Organization Currencies ────────────────────────────────────

@router.get("/organizations/{org_id}/currencies")
async def list_currencies(
    org_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = OrgCurrencyDAO(db)
    currencies = await dao.list_by_org(org_id)
    return ok(data=[{
        "id": str(c.id), "currency_code": c.currency_code,
        "is_primary": c.is_primary, "is_reporting": c.is_reporting,
        "exchange_rate_source": c.exchange_rate_source, "status": c.status,
    } for c in currencies])


@router.post("/organizations/{org_id}/currencies")
async def add_currency(
    org_id: uuid.UUID,
    req: OrgCurrencyCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dao = OrgCurrencyDAO(db)
    currency = OrganizationCurrency(
        organization_id=org_id,
        currency_code=req.currency_code,
        is_primary=req.is_primary,
        is_reporting=req.is_reporting,
        exchange_rate_source=req.exchange_rate_source,
        status="active",
    )
    currency = await dao.create(currency)
    await db.commit()
    return ok(data={"id": str(currency.id), "currency_code": currency.currency_code})
