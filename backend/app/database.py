"""SQLAlchemy database engine and session factory."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


def _normalize_db_url(url: str) -> str:
    """Use psycopg v3 driver; Supabase URLs often use postgresql:// without a driver."""
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


engine = create_engine(_normalize_db_url(settings.database_url), pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Yield a database session; close when the request finishes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
