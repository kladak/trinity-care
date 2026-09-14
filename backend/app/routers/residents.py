"""Resident and feed routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FamilyResidentLink, Resident, Update, User, Visit
from app.schemas import ResidentDetailOut, ResidentOut, UpdateOut, VisitOut
from app.services.audit import write_audit
from app.services.auth import get_current_user

router = APIRouter(tags=["residents"])


def _resident_out(r: Resident) -> ResidentOut:
    return ResidentOut(
        id=r.id,
        display_name=r.display_name,
        facility_id=r.facility_id,
        room=r.room,
        care_notes=r.care_notes,
        facility_name=r.facility.name if r.facility else None,
    )


def _update_out(u: Update) -> UpdateOut:
    return UpdateOut(
        id=u.id,
        resident_id=u.resident_id,
        author_id=u.author_id,
        update_type=u.update_type,  # type: ignore[arg-type]
        body=u.body,
        created_at=u.created_at,
        author_name=u.author.display_name if u.author else None,
        resident_name=u.resident.display_name if u.resident else None,
    )


def _visit_out(v: Visit) -> VisitOut:
    return VisitOut(
        id=v.id,
        resident_id=v.resident_id,
        requester_id=v.requester_id,
        scheduled_at=v.scheduled_at,
        notes=v.notes,
        status=v.status,  # type: ignore[arg-type]
        created_at=v.created_at,
        resident_name=v.resident.display_name if v.resident else None,
        requester_name=v.requester.display_name if v.requester else None,
    )


def _linked_resident_ids(db: Session, user: User) -> list[int]:
    rows = db.query(FamilyResidentLink.resident_id).filter(FamilyResidentLink.family_user_id == user.id).all()
    return [r[0] for r in rows]


@router.get("/residents", response_model=list[ResidentOut])
def list_residents(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ResidentOut]:
    if user.role == "facility_staff":
        q = db.query(Resident).filter(Resident.facility_id == user.facility_id)
    else:
        ids = _linked_resident_ids(db, user)
        q = db.query(Resident).filter(Resident.id.in_(ids)) if ids else db.query(Resident).filter(False)
    residents = q.all()
    write_audit(db, actor_id=user.id, action="list_residents", resource_type="resident")
    db.commit()
    return [_resident_out(r) for r in residents]


@router.get("/residents/{resident_id}", response_model=ResidentDetailOut)
def resident_detail(
    resident_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResidentDetailOut:
    resident = db.get(Resident, resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    if user.role == "family":
        if resident_id not in _linked_resident_ids(db, user):
            raise HTTPException(status_code=403, detail="Not linked to this resident")
    elif user.role == "facility_staff":
        if resident.facility_id != user.facility_id:
            raise HTTPException(status_code=403, detail="Wrong facility")
    updates = (
        db.query(Update)
        .filter(Update.resident_id == resident_id)
        .order_by(Update.created_at.desc())
        .limit(50)
        .all()
    )
    visits = (
        db.query(Visit)
        .filter(Visit.resident_id == resident_id)
        .order_by(Visit.scheduled_at.desc())
        .limit(50)
        .all()
    )
    write_audit(
        db,
        actor_id=user.id,
        action="view_resident",
        resource_type="resident",
        resource_id=str(resident_id),
    )
    db.commit()
    return ResidentDetailOut(
        resident=_resident_out(resident),
        updates=[_update_out(u) for u in updates],
        visits=[_visit_out(v) for v in visits],
    )


@router.get("/feed", response_model=list[UpdateOut])
def family_feed(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[UpdateOut]:
    if user.role == "facility_staff":
        q = (
            db.query(Update)
            .join(Resident)
            .filter(Resident.facility_id == user.facility_id)
            .order_by(Update.created_at.desc())
            .limit(100)
        )
    else:
        ids = _linked_resident_ids(db, user)
        if not ids:
            return []
        q = (
            db.query(Update)
            .filter(Update.resident_id.in_(ids))
            .order_by(Update.created_at.desc())
            .limit(100)
        )
    updates = q.all()
    write_audit(db, actor_id=user.id, action="view_feed", resource_type="update")
    db.commit()
    return [_update_out(u) for u in updates]
