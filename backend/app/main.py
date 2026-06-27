import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.database.connection import engine, Base
from app.routers import products, customers, orders, dashboard
from app.core.config import settings
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("inventory_system")

# Create database tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Auto-seed the database if empty
    from app.database.seed import seed_db
    seed_db()
except Exception as e:
    logger.error(f"Error initializing database tables: {str(e)}")

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Scalable enterprise API for managing products, customers, orders, and dashboard analytics",
    version="1.0.0"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, configure specific allowed domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount static files folder for uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Routers
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# Global exception handlers
@app.exception_handler(IntegrityError)
def integrity_exception_handler(request: Request, exc: IntegrityError):
    logger.error(f"Database Integrity Error: {str(exc)}")
    # Simplify user-facing integrity errors (e.g., unique constraints)
    detail = str(exc.orig) if exc.orig else str(exc)
    if "unique constraint" in detail.lower() or "duplicate key" in detail.lower():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "A record with this unique identifier already exists."}
        )
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": f"Database integrity violation: {detail}"}
    )

@app.exception_handler(SQLAlchemyError)
def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database Query Error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred while processing the request."}
    )

@app.exception_handler(Exception)
def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please contact system support."}
    )

@app.get("/")
def root():
    return {
        "app": "Inventory & Order Management System API",
        "version": "1.0.0",
        "documentation": "/docs"
    }
