from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List
from app.database.connection import get_db
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.audit import AuditLog
from app.schemas.dashboard import DashboardStats
from app.routers.orders import serialize_order

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardStats)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    # 1. Total counts
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    
    # 2. Total revenue (sum of active orders)
    revenue_query = db.query(func.sum(Order.total_amount)).filter(Order.status != "Cancelled").scalar()
    total_revenue = Decimal(str(revenue_query)) if revenue_query is not None else Decimal("0.00")
    
    # 3. Low stock products (quantity <= 10)
    low_stock_threshold = 10
    low_stock_query = db.query(Product).filter(Product.quantity <= low_stock_threshold)
    low_stock_count = low_stock_query.count()
    low_stock_products = low_stock_query.order_by(Product.quantity.asc()).limit(5).all()
    
    # 4. Recent orders
    recent_orders_db = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = [serialize_order(o) for o in recent_orders_db]
    
    # 5. Recent Activity / Audit Logs
    recent_activity_db = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    recent_activity = []
    for log in recent_activity_db:
        recent_activity.append({
            "id": log.id,
            "product_id": log.product_id,
            "product_name": log.product.name if log.product else "Deleted Product",
            "sku": log.product.sku if log.product else "N/A",
            "change_type": log.change_type,
            "quantity_changed": log.quantity_changed,
            "old_quantity": log.old_quantity,
            "new_quantity": log.new_quantity,
            "reference_id": log.reference_id,
            "created_at": log.created_at
        })
        
    # 6. Chart: Revenue of last 7 days
    # Let's calculate daily revenue group by date for the last 7 days
    start_date = datetime.now(timezone.utc).date() - timedelta(days=6)
    
    # Query for daily revenue
    daily_revenue_query = (
        db.query(
            cast(Order.created_at, Date).label("order_date"),
            func.sum(Order.total_amount).label("daily_total"),
            func.count(Order.id).label("order_count")
        )
        .filter(Order.created_at >= start_date)
        .filter(Order.status != "Cancelled")
        .group_by(cast(Order.created_at, Date))
        .all()
    )
    
    # Build dictionary for quick lookup
    revenue_map = {row.order_date: (Decimal(str(row.daily_total)), row.order_count) for row in daily_revenue_query}
    
    # Fill in all 7 days with 0 if there are no orders
    revenue_chart = []
    for i in range(7):
        day = start_date + timedelta(days=i)
        rev, count = revenue_map.get(day, (Decimal("0.00"), 0))
        revenue_chart.append({
            "date": day.strftime("%Y-%m-%d"),
            "revenue": rev,
            "order_count": count
        })
        
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "low_stock_count": low_stock_count,
        "low_stock_products": low_stock_products,
        "recent_orders": recent_orders,
        "recent_activity": recent_activity,
        "revenue_chart": revenue_chart
    }
