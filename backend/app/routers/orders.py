from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
from app.database.connection import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.models.audit import AuditLog
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.services.order_service import create_new_order
from app.services.csv_service import export_orders_csv

router = APIRouter(prefix="/orders", tags=["Orders"])

def serialize_order(order: Order) -> dict:
    """Helper to transform model Order to OrderResponse schema layout"""
    items_serialized = []
    for item in order.items:
        items_serialized.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else "Deleted Product",
            "sku": item.product.sku if item.product else "N/A",
            "quantity": item.quantity,
            "price": item.price
        })
    
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else "Deleted Customer",
        "customer_email": order.customer.email if order.customer else "N/A",
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": items_serialized
    }

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    db_order = create_new_order(db, order_in)
    return serialize_order(db_order)

@router.get("", response_model=OrderListResponse)
def get_orders(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    sort_by: str = Query("id"),
    sort_order: str = Query("desc")
):
    # Join Customer to search by name/email
    query = db.query(Order).join(Customer)
    
    # Search filter
    if search:
        search_filter = or_(
            Customer.full_name.ilike(f"%{search}%"),
            Customer.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    # Status filter
    if status_filter:
        query = query.filter(Order.status == status_filter)
        
    # Sorting
    if sort_by == "customer_name":
        col = Customer.full_name
    elif hasattr(Order, sort_by):
        col = getattr(Order, sort_by)
    else:
        col = Order.id
        
    if sort_order.lower() == "asc":
        query = query.order_by(asc(col))
    else:
        query = query.order_by(desc(col))

    # Count total
    total = query.count()
    
    # Pagination
    offset = (page - 1) * limit
    orders = query.offset(offset).limit(limit).all()
    
    serialized_orders = [serialize_order(o) for o in orders]
    pages = (total + limit - 1) // limit
    
    return {
        "items": serialized_orders,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    csv_data = export_orders_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders_export.csv"}
    )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )
    return serialize_order(order)

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    # Retrieve order
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )

    # For transaction safety, we lock the products and restock
    try:
        # If order was not cancelled, we restock products
        if order.status != "Cancelled":
            for item in order.items:
                product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if product:
                    old_qty = product.quantity
                    new_qty = old_qty + item.quantity
                    product.quantity = new_qty
                    
                    # Create Audit Log
                    audit = AuditLog(
                        product_id=product.id,
                        change_type="RESTOCK",
                        quantity_changed=item.quantity,
                        old_quantity=old_qty,
                        new_quantity=new_qty,
                        reference_id=f"Order #{order.id} Deleted/Restocked"
                    )
                    db.add(audit)
                    
        db.delete(order)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete order and restore inventory: {str(e)}"
        )
