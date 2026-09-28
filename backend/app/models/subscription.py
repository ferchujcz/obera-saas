import enum
from datetime import datetime

from sqlalchemy import ForeignKey, Enum, DateTime, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class PlanTypeEnum(str, enum.Enum):
    TRIAL = "TRIAL"
    FREE = "FREE"
    PAY_PER_LISTING = "PAY_PER_LISTING"
    MONTHLY = "MONTHLY"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    plan_type: Mapped[PlanTypeEnum] = mapped_column(Enum(PlanTypeEnum), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relaciones
    user: Mapped["User"] = relationship(back_populates="subscriptions")
