"""SQLAlchemy database setup with SQLite."""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from backend.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _migrate_columns():
    """Add new columns to existing tables if missing."""
    inspector = inspect(engine)
    with engine.begin() as conn:
        # Lessons table: add full_script and script_author
        if inspector.has_table("lessons"):
            existing = {col["name"] for col in inspector.get_columns("lessons")}
            if "full_script" not in existing:
                conn.execute(text("ALTER TABLE lessons ADD COLUMN full_script TEXT DEFAULT ''"))
            if "script_author" not in existing:
                stmt = text("ALTER TABLE lessons ADD COLUMN script_author VARCHAR(200) DEFAULT ''")
                conn.execute(stmt)
            if "script_image" not in existing:
                conn.execute(text("ALTER TABLE lessons ADD COLUMN script_image TEXT DEFAULT ''"))
            if "image_prompt" not in existing:
                conn.execute(text("ALTER TABLE lessons ADD COLUMN image_prompt TEXT DEFAULT ''"))
            if "ppt_path" not in existing:
                conn.execute(text("ALTER TABLE lessons ADD COLUMN ppt_path TEXT DEFAULT ''"))
            if "drive_script_link" not in existing:
                conn.execute(
                    text("ALTER TABLE lessons ADD COLUMN drive_script_link VARCHAR(512) DEFAULT ''")
                )
            if "drive_ppt_link" not in existing:
                conn.execute(
                    text("ALTER TABLE lessons ADD COLUMN drive_ppt_link VARCHAR(512) DEFAULT ''")
                )


def init_db():
    """Create all tables and run migrations."""
    import backend.models  # noqa: F401 — ensures models are registered with Base

    Base.metadata.create_all(bind=engine)
    _migrate_columns()
