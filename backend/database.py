from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ganti "postgres:password@localhost/koran_uigm" sesuai dengan konfigurasi database PostgreSQL Anda
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin@localhost:5432/koran_uigm"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()