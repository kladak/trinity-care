"""Auth routes: demo login and password token."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import DemoLoginIn, PasswordLoginIn, TokenOut, UserOut
from app.services.audit import write_audit
from app.services.auth import create_access_token, get_current_user, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

PERSONA_EMAIL = {
    "family": "family@demo.trinitycare.local",
    "staff": "staff@demo.trinitycare.local",
}


@router.post("/demo-login", response_model=TokenOut)
def demo_login(body: DemoLoginIn, db: Session = Depends(get_db)) -> TokenOut:
    email = PERSONA_EMAIL[body.persona]
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=500, detail="Seed data missing; restart the API")
    token = create_access_token(user)
    write_audit(db, actor_id=user.id, action="demo_login", resource_type="user", resource_id=str(user.id))
    db.commit()
    return TokenOut(
        access_token=token,
        role=user.role,  # type: ignore[arg-type]
        display_name=user.display_name,
        email=user.email,
    )


@router.post("/token", response_model=TokenOut)
def password_login(body: PasswordLoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user)
    write_audit(db, actor_id=user.id, action="password_login", resource_type="user", resource_id=str(user.id))
    db.commit()
    return TokenOut(
        access_token=token,
        role=user.role,  # type: ignore[arg-type]
        display_name=user.display_name,
        email=user.email,
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user
