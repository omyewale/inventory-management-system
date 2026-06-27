from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    customer_email: str
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    pages: int
