from typing import Any, List, Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep, CurrentUser
from app.models.alert import Alert
from app.models.user import User, RoleEnum
from app.schemas.alert import AlertCreate, AlertRead

router = APIRouter()

def get_current_tenant(current_user: CurrentUser) -> User:
    if current_user.role != RoleEnum.TENANT:
        raise HTTPException(status_code=403, detail="The user is not a tenant")
    return current_user

@router.post("/", response_model=AlertRead)
async def create_alert(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_tenant)],
    alert_in: AlertCreate,
) -> Any:
    """
    Create a new property alert for a tenant.
    """
    db_alert = Alert(
        **alert_in.model_dump(),
        tenant_id=current_user.id
    )
    session.add(db_alert)
    await session.commit()
    await session.refresh(db_alert)
    return db_alert

@router.get("/me", response_model=List[AlertRead])
async def read_own_alerts(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_tenant)],
) -> Any:
    """
    Get current tenant's alerts.
    """
    stmt = select(Alert).where(Alert.tenant_id == current_user.id)
    alerts = await session.scalars(stmt)
    return alerts.all()
