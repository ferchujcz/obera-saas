import enum
from datetime import datetime
from typing import List

from sqlalchemy import ForeignKey, String, Text, Numeric, Integer, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class PropertyStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RENTED = "RENTED"
    PAUSED = "PAUSED"
    EXPIRED = "EXPIRED"

class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    neighborhood: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    property_type: Mapped[str] = mapped_column(String(50), nullable=True, default="Departamento")
    contract_requirements: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[PropertyStatusEnum] = mapped_column(Enum(PropertyStatusEnum), default=PropertyStatusEnum.AVAILABLE, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    owner: Mapped["User"] = relationship(back_populates="properties")
    images: Mapped[List["PropertyImage"]] = relationship(
        back_populates="property",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="property",
        cascade="all, delete-orphan"
    )


class PropertyImage(Base):
    __tablename__ = "property_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)

    # Relación bidireccional con Property
    property: Mapped["Property"] = relationship(back_populates="images")

