from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
from app.database.connection import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerListResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    # Check if email is unique
    existing = db.query(Customer).filter(Customer.email == customer_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_in.email}' already exists"
        )
    
    db_customer = Customer(**customer_in.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("", response_model=CustomerListResponse)
def get_customers(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    sort_by: str = Query("id"),
    sort_order: str = Query("asc")
):
    query = db.query(Customer)
    
    # Searching
    if search:
        search_filter = or_(
            Customer.full_name.ilike(f"%{search}%"),
            Customer.email.ilike(f"%{search}%"),
            Customer.phone.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
        
    # Sorting
    if hasattr(Customer, sort_by):
        col = getattr(Customer, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(desc(col))
        else:
            query = query.order_by(asc(col))
    else:
        query = query.order_by(Customer.id.asc())

    # Count total
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

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
        
    db.delete(customer)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
