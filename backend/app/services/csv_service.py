import csv
from io import StringIO
from typing import List
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.order import Order

def export_products_csv(db: Session) -> str:
    products = db.query(Product).order_by(Product.id).all()
    
    f = StringIO()
    writer = csv.writer(f)
    
    # Headers
    writer.writerow(["ID", "Name", "SKU", "Description", "Price (₹)", "Quantity", "Created At", "Updated At"])
    
    for p in products:
        writer.writerow([
            p.id,
            p.name,
            p.sku,
            p.description or "",
            p.price,
            p.quantity,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else "",
            p.updated_at.strftime("%Y-%m-%d %H:%M:%S") if p.updated_at else ""
        ])
        
    return f.getvalue()

def export_orders_csv(db: Session) -> str:
    orders = db.query(Order).order_by(Order.id).all()
    
    f = StringIO()
    writer = csv.writer(f)
    
    # Headers
    writer.writerow(["Order ID", "Customer Name", "Customer Email", "Total Amount (₹)", "Status", "Created At", "Item Count"])
    
    for o in orders:
        writer.writerow([
            o.id,
            o.customer.full_name if o.customer else "Unknown",
            o.customer.email if o.customer else "",
            o.total_amount,
            o.status,
            o.created_at.strftime("%Y-%m-%d %H:%M:%S") if o.created_at else "",
            len(o.items)
        ])
        
    return f.getvalue()
