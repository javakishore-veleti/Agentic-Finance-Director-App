"""Tenancy DTOs: Customer, Organization, OrganizationCurrency."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class CustomerOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    legal_name: Optional[str] = None
    industry: Optional[str] = None
    plan: str
    status: str
    default_organization_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True

class CustomerUpdateRequest(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    industry: Optional[str] = None


class OrganizationOut(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    name: str
    code: str
    legal_entity_name: Optional[str] = None
    country: Optional[str] = None
    timezone: str
    fiscal_year_end_month: int
    default_currency_code: str
    status: str
    is_default: bool

    class Config:
        from_attributes = True

class OrgCreateRequest(BaseModel):
    name: str
    code: str
    legal_entity_name: Optional[str] = None
    country: Optional[str] = None
    timezone: str = "America/New_York"
    fiscal_year_end_month: int = 12
    default_currency_code: str = "USD"

class OrgUpdateRequest(BaseModel):
    name: Optional[str] = None
    legal_entity_name: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None
    fiscal_year_end_month: Optional[int] = None
    default_currency_code: Optional[str] = None
    status: Optional[str] = None


class OrgCurrencyOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    currency_code: str
    is_primary: bool
    is_reporting: bool
    exchange_rate_source: str
    status: str

    class Config:
        from_attributes = True

class OrgCurrencyCreateRequest(BaseModel):
    currency_code: str
    is_primary: bool = False
    is_reporting: bool = False
    exchange_rate_source: str = "manual"
