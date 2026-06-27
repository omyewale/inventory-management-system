from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    change_type = Column(String, nullable=False) # "RESTOCK", "SALE", "ADJUSTMENT", "CREATE"
    quantity_changed = Column(Integer, nullable=False)
    old_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    reference_id = Column(String, nullable=True) # Order ID or user note
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    product = relationship("Product", back_populates="audit_logs")
