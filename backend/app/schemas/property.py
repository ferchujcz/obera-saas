from typing import Optional, List
from pydantic import BaseModel
from app.models.property import PropertyStatusEnum

class PropertyImageBase(BaseModel):
    image_url: str

class PropertyImageCreate(PropertyImageBase):
    pass

class PropertyImageRead(PropertyImageBase):
    id: int
    property_id: int

    class Config:
        from_attributes = True

class PropertyBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    neighborhood: str
    bedrooms: int
    property_type: Optional[str] = "Departamento"
    contract_requirements: Optional[str] = None
    status: PropertyStatusEnum = PropertyStatusEnum.AVAILABLE

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    neighborhood: Optional[str] = None
    bedrooms: Optional[int] = None
    property_type: Optional[str] = None
    contract_requirements: Optional[str] = None
    status: Optional[PropertyStatusEnum] = None

class PropertyRead(PropertyBase):
    id: int
    owner_id: int
    images: List[PropertyImageRead] = []

    class Config:
        from_attributes = True

