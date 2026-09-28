from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.user import RoleEnum
from app.schemas.property import PropertyRead

class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True
    role: RoleEnum = RoleEnum.TENANT

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None
    role: Optional[RoleEnum] = None

class UserRead(UserBase):
    id: int
    rating_average: Optional[float] = 0.0

    class Config:
        from_attributes = True

class PublicReviewItem(BaseModel):
    id: int
    reviewer_id: int
    reviewer_email: Optional[str] = None
    property_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PublicUserProfile(BaseModel):
    id: int
    email: str
    role: RoleEnum
    created_at: datetime
    rating_average: float
    reviews_count: int
    reviews: List[PublicReviewItem] = []
    properties: List[PropertyRead] = []

    class Config:
        from_attributes = True

