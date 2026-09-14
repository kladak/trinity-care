"""Audit log routes — metadata only."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditOut
from app.services.auth import require_role

router = APIRouter(tags=["audit"])


@router.get("/audit", response_model=list[AuditOut])
def list_audit(
    user: User = Depends(require_role("facility_staff")),
    db: Session = Depends(get_db),
) -> list[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
