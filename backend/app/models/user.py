import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Enum, String, Boolean, DateTime, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    OWNER = "OWNER"
    TENANT = "TENANT"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    rating_average: Mapped[Optional[float]] = mapped_column(Float, default=0.0, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    subscriptions: Mapped[List["Subscription"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    properties: Mapped[List["Property"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
    alerts: Mapped[List["Alert"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")
    reviews_given: Mapped[List["Review"]] = relationship(
        "Review",
        foreign_keys="Review.reviewer_id",
        back_populates="reviewer",
        cascade="all, delete-orphan",
    )
    reviews_received: Mapped[List["Review"]] = relationship(
        "Review",
        foreign_keys="Review.reviewed_id",
        back_populates="reviewed",
        cascade="all, delete-orphan",
    )

    @property
    def dynamic_rating_average(self) -> float:
        if not self.reviews_received:
            return 0.0
        return round(sum(r.rating for r in self.reviews_received) / len(self.reviews_received), 1)

