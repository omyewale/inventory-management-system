from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="product", cascade="all, delete-orphan")
