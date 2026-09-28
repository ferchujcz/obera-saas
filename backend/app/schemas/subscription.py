from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.subscription import PlanTypeEnum

class SubscriptionBase(BaseModel):
    plan_type: PlanTypeEnum
    is_active: bool = True

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionRead(SubscriptionBase):
    id: int
    user_id: int
    start_date: datetime
    end_date: datetime

    class Config:
        from_attributes = True
