from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime
from app.schemas.product import ProductResponse
from app.schemas.order import OrderResponse

class AuditLogResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    sku: str
    change_type: str
    quantity_changed: int
    old_quantity: int
    new_quantity: int
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DailyRevenue(BaseModel):
    date: str
    revenue: Decimal
    order_count: int

class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_count: int
    low_stock_products: List[ProductResponse]
    recent_orders: List[OrderResponse]
    recent_activity: List[AuditLogResponse]
    revenue_chart: List[DailyRevenue]
