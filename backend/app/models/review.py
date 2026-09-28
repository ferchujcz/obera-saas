from datetime import datetime
from typing import Optional
from sqlalchemy import ForeignKey, Text, Integer, DateTime, func, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_review_rating_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewed_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    property_id: Mapped[Optional[int]] = mapped_column(ForeignKey("properties.id", ondelete="SET NULL"), nullable=True, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    reviewer: Mapped["User"] = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewed: Mapped["User"] = relationship("User", foreign_keys=[reviewed_id], back_populates="reviews_received")
    property: Mapped[Optional["Property"]] = relationship("Property", foreign_keys=[property_id], back_populates="reviews")
