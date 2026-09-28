from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    reviewed_id: int
    property_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5, description="Calificación entre 1 y 5 estrellas")
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: int
    reviewer_id: int
    reviewer_email: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
