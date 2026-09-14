"""Visit scheduling routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FamilyResidentLink, Resident, User, Visit
from app.routers.residents import _linked_resident_ids, _visit_out
from app.schemas import VisitCreate, VisitOut, VisitPatch
from app.services.audit import write_audit
from app.services.auth import get_current_user

router = APIRouter(tags=["visits"])


@router.get("/visits", response_model=list[VisitOut])
def list_visits(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[VisitOut]:
    if user.role == "facility_staff":
        q = (
            db.query(Visit)
            .join(Resident)
            .filter(Resident.facility_id == user.facility_id)
            .order_by(Visit.scheduled_at.desc())
        )
    else:
        ids = _linked_resident_ids(db, user)
        q = (
            db.query(Visit)
            .filter(Visit.requester_id == user.id)
            .order_by(Visit.scheduled_at.desc())
        )
        if ids:
            pass  # already filtered by requester; family only sees own requests
    visits = q.all()
    write_audit(db, actor_id=user.id, action="list_visits", resource_type="visit")
    db.commit()
    return [_visit_out(v) for v in visits]


@router.post("/visits", response_model=VisitOut, status_code=201)
def create_visit(
    body: VisitCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitOut:
    resident = db.get(Resident, body.resident_id)
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    if user.role == "family":
        link = (
            db.query(FamilyResidentLink)
            .filter(
                FamilyResidentLink.family_user_id == user.id,
                FamilyResidentLink.resident_id == body.resident_id,
            )
            .first()
        )
        if not link:
            raise HTTPException(status_code=403, detail="Not linked to this resident")
    elif user.role == "facility_staff":
        if resident.facility_id != user.facility_id:
            raise HTTPException(status_code=403, detail="Wrong facility")
    visit = Visit(
        resident_id=body.resident_id,
        requester_id=user.id,
        scheduled_at=body.scheduled_at,
        notes=body.notes,
        status="requested",
    )
    db.add(visit)
    db.flush()
    write_audit(
        db,
        actor_id=user.id,
        action="create_visit",
        resource_type="visit",
        resource_id=str(visit.id),
    )
    db.commit()
    db.refresh(visit)
    return _visit_out(visit)


@router.patch("/visits/{visit_id}", response_model=VisitOut)
def patch_visit(
    visit_id: int,
    body: VisitPatch,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VisitOut:
    visit = db.get(Visit, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    resident = db.get(Resident, visit.resident_id)
    if user.role == "family" and visit.requester_id != user.id:
        raise HTTPException(status_code=403, detail="Not your visit")
    if user.role == "facility_staff" and (not resident or resident.facility_id != user.facility_id):
        raise HTTPException(status_code=403, detail="Wrong facility")
    if user.role == "family" and body.status not in ("cancelled",):
        raise HTTPException(status_code=403, detail="Family may only cancel")
    visit.status = body.status
    write_audit(
        db,
        actor_id=user.id,
        action="patch_visit",
        resource_type="visit",
        resource_id=str(visit.id),
    )
    db.commit()
    db.refresh(visit)
    return _visit_out(visit)
