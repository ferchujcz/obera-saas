from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AlertBase(BaseModel):
    max_price: float
    neighborhood: str
    min_bedrooms: int
    is_active: bool = True

class AlertCreate(AlertBase):
    pass

class AlertRead(AlertBase):
    id: int
    tenant_id: int
    created_at: datetime

    class Config:
        from_attributes = True
