from datetime import datetime

from sqlalchemy import ForeignKey, String, Numeric, Integer, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    max_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    neighborhood: Mapped[str] = mapped_column(String(100), nullable=False)
    min_bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    tenant: Mapped["User"] = relationship(back_populates="alerts")
