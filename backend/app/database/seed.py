from sqlalchemy.orm import Session
from app.database.connection import SessionLocal, engine, Base
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.audit import AuditLog
from decimal import Decimal
from datetime import datetime, timedelta, timezone

def seed_db():
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(Product).first() is not None:
            print("Database already has records. Skipping seeding.")
            return

        print("Seeding database...")

        # 1. Add Products
        products_data = [
            {"sku": "LAP-MBP-14", "name": "MacBook Pro 14\"", "description": "Apple M3 Chip, 16GB RAM, 512GB SSD", "price": Decimal("1599.99"), "quantity": 25, "image_url": None},
            {"sku": "PHN-IPH-15", "name": "iPhone 15 Pro", "description": "128GB, Natural Titanium, Super Retina XDR", "price": Decimal("999.00"), "quantity": 40, "image_url": None},
            {"sku": "HD-SONY-1000XM5", "name": "Sony WH-1000XM5", "description": "Wireless Noise Canceling Headphones", "price": Decimal("348.00"), "quantity": 15, "image_url": None},
            {"sku": "KB-LOGI-MX", "name": "Logitech MX Keys S", "description": "Advanced Wireless Illuminated Keyboard", "price": Decimal("109.99"), "quantity": 5, "image_url": None}, # Low stock
            {"sku": "MS-LOGI-MX3", "name": "Logitech MX Master 3S", "description": "Wireless Performance Mouse", "price": Decimal("99.99"), "quantity": 8, "image_url": None}, # Low stock
            {"sku": "MON-DELL-U27", "name": "Dell UltraSharp 27\"", "description": "4K USB-C Hub Monitor - U2723QE", "price": Decimal("479.99"), "quantity": 12, "image_url": None},
            {"sku": "SSD-SAMS-990", "name": "Samsung 990 PRO 2TB", "description": "PCIe Gen 4 NVMe M.2 Internal SSD", "price": Decimal("169.99"), "quantity": 50, "image_url": None},
        ]
        
        products = []
        for p in products_data:
            prod = Product(**p)
            db.add(prod)
            products.append(prod)
        db.flush() # Populate IDs

        # 2. Add Audit logs for product creation
        for prod in products:
            audit = AuditLog(
                product_id=prod.id,
                change_type="CREATE",
                quantity_changed=prod.quantity,
                old_quantity=0,
                new_quantity=prod.quantity,
                reference_id="Initial Data Seed"
            )
            db.add(audit)

        # 3. Add Customers
        customers_data = [
            {"full_name": "John Doe", "email": "john.doe@example.com", "phone": "15550199"},
            {"full_name": "Jane Smith", "email": "jane.smith@example.com", "phone": "15550188"},
            {"full_name": "Robert Johnson", "email": "robert.j@example.com", "phone": "15550177"},
            {"full_name": "Emily Davis", "email": "emily.davis@example.com", "phone": "15550166"},
        ]

        customers = []
        for c in customers_data:
            cust = Customer(**c)
            db.add(cust)
            customers.append(cust)
        db.flush() # Populate IDs

        # 4. Add Orders
        # Order 1: John Doe buys 1 MacBook and 1 Sony Headphone (2 days ago)
        o1 = Order(
            customer_id=customers[0].id,
            total_amount=Decimal("1947.99"),
            status="Completed",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(o1)
        db.flush()
        
        db.add(OrderItem(order_id=o1.id, product_id=products[0].id, quantity=1, price=Decimal("1599.99")))
        db.add(OrderItem(order_id=o1.id, product_id=products[2].id, quantity=1, price=Decimal("348.00")))
        
        # Deduct inventory & add audits
        products[0].quantity -= 1
        products[2].quantity -= 1
        db.add(AuditLog(product_id=products[0].id, change_type="SALE", quantity_changed=-1, old_quantity=25, new_quantity=24, reference_id=f"Order #{o1.id}"))
        db.add(AuditLog(product_id=products[2].id, change_type="SALE", quantity_changed=-1, old_quantity=15, new_quantity=14, reference_id=f"Order #{o1.id}"))

        # Order 2: Jane Smith buys 2 iPhones (1 day ago)
        o2 = Order(
            customer_id=customers[1].id,
            total_amount=Decimal("1998.00"),
            status="Completed",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(o2)
        db.flush()
        
        db.add(OrderItem(order_id=o2.id, product_id=products[1].id, quantity=2, price=Decimal("999.00")))
        products[1].quantity -= 2
        db.add(AuditLog(product_id=products[1].id, change_type="SALE", quantity_changed=-2, old_quantity=40, new_quantity=38, reference_id=f"Order #{o2.id}"))

        # Order 3: Robert Johnson buys 1 Logitech Mouse and 1 Logitech Keyboard (today)
        o3 = Order(
            customer_id=customers[2].id,
            total_amount=Decimal("209.98"),
            status="Completed",
            created_at=datetime.now(timezone.utc)
        )
        db.add(o3)
        db.flush()
        
        db.add(OrderItem(order_id=o3.id, product_id=products[3].id, quantity=1, price=Decimal("109.99")))
        db.add(OrderItem(order_id=o3.id, product_id=products[4].id, quantity=1, price=Decimal("99.99")))
        products[3].quantity -= 1
        products[4].quantity -= 1
        db.add(AuditLog(product_id=products[3].id, change_type="SALE", quantity_changed=-1, old_quantity=5, new_quantity=4, reference_id=f"Order #{o3.id}"))
        db.add(AuditLog(product_id=products[4].id, change_type="SALE", quantity_changed=-1, old_quantity=8, new_quantity=7, reference_id=f"Order #{o3.id}"))

        db.commit()
        print("Database seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
