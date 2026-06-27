import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
PHONE_REGEX = r"^\+?[1-9]\d{1,14}$" # Standard E.164 phone formatting or general numbers

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="Customer email address")
    phone: Optional[str] = Field(None, description="E.164 or local phone number")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v:
            # Strip spaces, hyphens, parentheses to check digits
            cleaned = re.sub(r"[\s\-\(\)]", "", v)
            if not re.match(r"^\+?\d{7,15}$", cleaned):
                raise ValueError("Invalid phone number format. Must be between 7 and 15 digits.")
            return cleaned
        return v

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerListResponse(BaseModel):
    items: List[CustomerResponse]
    total: int
    page: int
    pages: int
