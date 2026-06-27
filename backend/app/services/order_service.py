from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.audit import AuditLog
from app.schemas.order import OrderCreate
from decimal import Decimal

def create_new_order(db: Session, order_data: OrderCreate) -> Order:
    # Begin transactional check
    # Check if customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found"
        )

    # Validate items list is not empty
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )

    db_order_items = []
    total_amount = Decimal("0.00")
    stock_updates = []
    audit_logs_to_create = []

    # Track product IDs in this order to check for duplicates in the request
    seen_products = set()

    for item in order_data.items:
        if item.product_id in seen_products:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate product ID {item.product_id} in order request"
            )
        seen_products.add(item.product_id)

        # Retrieve product with a row lock to prevent race conditions (select for update)
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )

        # Check stock availability
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). Requested: {item.quantity}, Available: {product.quantity}"
            )

        # Calculate item price and add to total
        item_total_price = Decimal(str(product.price))
        total_amount += item_total_price * Decimal(str(item.quantity))

        # Track old and new quantity for audit log
        old_qty = product.quantity
        new_qty = old_qty - item.quantity

        # Update product stock
        product.quantity = new_qty
        stock_updates.append(product)

        # Prepare OrderItem
        db_order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=item_total_price
        )
        db_order_items.append(db_order_item)

        # Prepare AuditLog
        audit_log = AuditLog(
            product_id=product.id,
            change_type="SALE",
            quantity_changed=-item.quantity,
            old_quantity=old_qty,
            new_quantity=new_qty
        )
        audit_logs_to_create.append(audit_log)

    try:
        # Create the Order entry
        db_order = Order(
            customer_id=customer.id,
            total_amount=total_amount,
            status="Completed" # Auto completes when successfully ordered & deducted
        )
        db.add(db_order)
        db.flush() # Flushes order to DB to get the order ID

        # Link order items and save them
        for db_order_item in db_order_items:
            db_order_item.order_id = db_order.id
            db.add(db_order_item)

        # Link reference order ID to audit logs and save them
        for audit_log in audit_logs_to_create:
            audit_log.reference_id = f"Order #{db_order.id}"
            db.add(audit_log)

        # Commit transaction
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order processing failed and transaction was rolled back: {str(e)}"
        )
