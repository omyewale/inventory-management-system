import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from app.database.connection import get_db
from app.models.product import Product
from app.models.audit import AuditLog
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.schemas.dashboard import AuditLogResponse
from app.services.csv_service import export_products_csv
from app.core.config import settings

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    # Check uniqueness of SKU
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_in.sku}' already exists"
        )
    
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.flush() # Populate ID

    # Create Audit Log for initial stock creation
    audit = AuditLog(
        product_id=db_product.id,
        change_type="CREATE",
        quantity_changed=db_product.quantity,
        old_quantity=0,
        new_quantity=db_product.quantity,
        reference_id="Product Initialization"
    )
    db.add(audit)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("", response_model=ProductListResponse)
def get_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: str = Query("id"),
    sort_order: str = Query("asc"),
    low_stock: Optional[bool] = Query(None),
    low_stock_threshold: int = Query(10)
):
    query = db.query(Product)
    
    # Searching
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    # Filtering
    if low_stock:
        query = query.filter(Product.quantity <= low_stock_threshold)
        
    # Sorting
    if hasattr(Product, sort_by):
        col = getattr(Product, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(col))
        else:
            query = query.order_by(asc(col))
    else:
        query = query.order_by(Product.id.asc())

    # Count total matching products
    total = query.count()
    
    # Pagination
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()
    
    pages = (total + limit - 1) // limit
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    csv_data = export_products_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products_export.csv"}
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

@router.get("/{product_id}/audit", response_model=List[AuditLogResponse])
def get_product_audit_logs(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    logs = db.query(AuditLog).filter(AuditLog.product_id == product_id).order_by(AuditLog.created_at.desc()).all()
    
    # Map model to output format
    response_logs = []
    for log in logs:
        response_logs.append({
            "id": log.id,
            "product_id": log.product_id,
            "product_name": product.name,
            "sku": product.sku,
            "change_type": log.change_type,
            "quantity_changed": log.quantity_changed,
            "old_quantity": log.old_quantity,
            "new_quantity": log.new_quantity,
            "reference_id": log.reference_id,
            "created_at": log.created_at
        })
    return response_logs

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
        
    update_data = product_in.model_dump(exclude_unset=True)
    
    # Check SKU uniqueness if SKU is changing
    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{update_data['sku']}' already exists"
            )

    # Track stock change for audit logging
    if "quantity" in update_data and update_data["quantity"] != product.quantity:
        old_qty = product.quantity
        new_qty = update_data["quantity"]
        diff = new_qty - old_qty
        
        audit = AuditLog(
            product_id=product.id,
            change_type="ADJUSTMENT",
            quantity_changed=diff,
            old_quantity=old_qty,
            new_quantity=new_qty,
            reference_id="Manual Inventory Correction"
        )
        db.add(audit)

    for field, value in update_data.items():
        setattr(product, field, value)
        
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    # Check if product is in any completed/pending orders
    # To keep DB integrity, we block deletion if it would break constraints.
    # In order.py, we have ForeignKey RESTRICT on product_id to prevent orphaned order entries.
    # So we should return a clean bad request exception to explain this.
    from app.models.order import OrderItem
    has_orders = db.query(OrderItem).filter(OrderItem.product_id == product_id).first()
    if has_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product because it is referenced in existing orders. Consider setting quantity to 0 instead."
        )

    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/{product_id}/image", response_model=ProductResponse)
def upload_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload JPG, PNG, WEBP, or GIF."
        )

    # Generate secure filename
    filename = f"prod_{product_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image file: {str(e)}"
        )

    # Save relative URL path to product database
    relative_url = f"/static/uploads/{filename}"
    product.image_url = relative_url
    db.commit()
    db.refresh(product)
    return product
