from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# For SQLite fallback if running outside docker with local SQLite during dev/test
# But we default to PostgreSQL as specified in the environment variables
DATABASE_URL = settings.DATABASE_URL

# Connect arguments needed for sqlite, ignored for postgresql
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
