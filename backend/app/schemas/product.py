from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    sku: str = Field(..., min_length=3, max_length=50)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0)
    quantity: int = Field(..., ge=0)
    image_url: Optional[str] = None

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        if v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    sku: Optional[str] = Field(None, min_length=3, max_length=50)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        if v is not None and v < 0:
            raise ValueError("Price cannot be negative")
        return v

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v is not None and v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    pages: int
