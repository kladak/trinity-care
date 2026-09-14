"""Pydantic schemas for the Trinity Care demo API."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


Role = Literal["family", "facility_staff"]
UpdateType = Literal["update", "check_in", "message"]
VisitStatus = Literal["requested", "confirmed", "cancelled", "completed"]


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    display_name: str
    email: str


class DemoLoginIn(BaseModel):
    persona: Literal["family", "staff"] = "family"


class PasswordLoginIn(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    role: Role
    facility_id: int | None = None

    model_config = {"from_attributes": True}


class FacilityOut(BaseModel):
    id: int
    name: str
    location: str

    model_config = {"from_attributes": True}


class ResidentOut(BaseModel):
    id: int
    display_name: str
    facility_id: int
    room: str
    care_notes: str
    facility_name: str | None = None

    model_config = {"from_attributes": True}


class UpdateOut(BaseModel):
    id: int
    resident_id: int
    author_id: int
    update_type: UpdateType
    body: str
    created_at: datetime
    author_name: str | None = None
    resident_name: str | None = None

    model_config = {"from_attributes": True}


class UpdateCreate(BaseModel):
    resident_id: int
    update_type: UpdateType = "update"
    body: str = Field(min_length=1, max_length=2000)


class VisitOut(BaseModel):
    id: int
    resident_id: int
    requester_id: int
    scheduled_at: datetime
    notes: str
    status: VisitStatus
    created_at: datetime
    resident_name: str | None = None
    requester_name: str | None = None

    model_config = {"from_attributes": True}


class VisitCreate(BaseModel):
    resident_id: int
    scheduled_at: datetime
    notes: str = Field(default="", max_length=1000)


class VisitPatch(BaseModel):
    status: VisitStatus


class ResidentDetailOut(BaseModel):
    resident: ResidentOut
    updates: list[UpdateOut]
    visits: list[VisitOut]


class AuditOut(BaseModel):
    id: int
    actor_id: int | None
    action: str
    resource_type: str
    resource_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthOut(BaseModel):
    status: str
    service: str


class ReadyOut(BaseModel):
    status: str
    database: str
