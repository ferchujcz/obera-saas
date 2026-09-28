from typing import Any, Annotated
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from app.api.deps import SessionDep, get_current_active_owner, CurrentUser
from app.models.subscription import Subscription, PlanTypeEnum
from app.models.user import User
from app.schemas.subscription import SubscriptionRead

router = APIRouter()

@router.post("/trial", response_model=SubscriptionRead)
async def start_trial(
    session: SessionDep,
    current_user: Annotated[User, Depends(get_current_active_owner)],
) -> Any:
    """
    Start a 30-day trial for the owner.
    """
    stmt = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True,
        Subscription.end_date > datetime.now(timezone.utc)
    )
    existing_sub = await session.scalar(stmt)
    if existing_sub:
        raise HTTPException(status_code=400, detail="User already has an active subscription")

    now = datetime.now(timezone.utc)
    db_sub = Subscription(
        user_id=current_user.id,
        plan_type=PlanTypeEnum.TRIAL,
        start_date=now,
        end_date=now + timedelta(days=30),
        is_active=True
    )
    session.add(db_sub)
    await session.commit()
    await session.refresh(db_sub)
    return db_sub

@router.get("/me", response_model=SubscriptionRead)
async def read_own_subscription(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Get current user's active subscription.
    """
    stmt = select(Subscription).where(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True,
        Subscription.end_date > datetime.now(timezone.utc)
    )
    db_sub = await session.scalar(stmt)
    if not db_sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    return db_sub
