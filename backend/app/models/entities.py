"""ORM models."""

from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, Enum):
    family = "family"
    facility_staff = "facility_staff"


class UpdateType(str, Enum):
    update = "update"
    check_in = "check_in"
    message = "message"


class VisitStatus(str, Enum):
    requested = "requested"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class Facility(Base):
    __tablename__ = "facilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)

    residents: Mapped[list["Resident"]] = relationship(back_populates="facility")
    staff: Mapped[list["User"]] = relationship(back_populates="facility")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(40), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    facility_id: Mapped[int | None] = mapped_column(ForeignKey("facilities.id"), nullable=True)

    facility: Mapped[Facility | None] = relationship(back_populates="staff")
    links: Mapped[list["FamilyResidentLink"]] = relationship(back_populates="family_user")


class Resident(Base):
    __tablename__ = "residents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    facility_id: Mapped[int] = mapped_column(ForeignKey("facilities.id"), nullable=False)
    room: Mapped[str] = mapped_column(String(40), nullable=False)
    care_notes: Mapped[str] = mapped_column(Text, default="")  # synthetic fluff only

    facility: Mapped[Facility] = relationship(back_populates="residents")
    links: Mapped[list["FamilyResidentLink"]] = relationship(back_populates="resident")
    updates: Mapped[list["Update"]] = relationship(back_populates="resident")
    visits: Mapped[list["Visit"]] = relationship(back_populates="resident")


class FamilyResidentLink(Base):
    __tablename__ = "family_resident_links"
    __table_args__ = (UniqueConstraint("family_user_id", "resident_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    family_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    resident_id: Mapped[int] = mapped_column(ForeignKey("residents.id"), nullable=False)
    relationship_label: Mapped[str] = mapped_column(String(80), nullable=False)

    family_user: Mapped[User] = relationship(back_populates="links")
    resident: Mapped[Resident] = relationship(back_populates="links")


class Update(Base):
    __tablename__ = "updates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    resident_id: Mapped[int] = mapped_column(ForeignKey("residents.id"), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    update_type: Mapped[str] = mapped_column(String(40), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    resident: Mapped[Resident] = relationship(back_populates="updates")
    author: Mapped[User] = relationship()


class Visit(Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    resident_id: Mapped[int] = mapped_column(ForeignKey("residents.id"), nullable=False)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(40), default=VisitStatus.requested.value)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    resident: Mapped[Resident] = relationship(back_populates="visits")
    requester: Mapped[User] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(80), nullable=False)
    resource_id: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    # Metadata only; request and response bodies are never stored.
