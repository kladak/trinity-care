"""Staff update / check-in routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resident, Update, User
from app.routers.residents import _update_out
from app.schemas import UpdateCreate, UpdateOut
from app.services.audit import write_audit
from app.services.auth import require_role

router = APIRouter(tags=["updates"])


@router.post("/updates", response_model=UpdateOut, status_code=201)
def create_update(
    body: UpdateCreate,
    user: User = Depends(require_role("facility_staff")),
    db: Session = Depends(get_db),
) -> UpdateOut:
    resident = db.get(Resident, body.resident_id)
    if not resident or resident.facility_id != user.facility_id:
        raise HTTPException(status_code=404, detail="Resident not found at your facility")
    update = Update(
        resident_id=body.resident_id,
        author_id=user.id,
        update_type=body.update_type,
        body=body.body,
    )
    db.add(update)
    db.flush()
    write_audit(
        db,
        actor_id=user.id,
        action="create_update",
        resource_type="update",
        resource_id=str(update.id),
    )
    db.commit()
    db.refresh(update)
    return _update_out(update)
