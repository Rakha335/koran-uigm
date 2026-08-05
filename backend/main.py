import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
from dotenv import load_dotenv

# Import SQLAlchemy untuk koneksi PostgreSQL
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

# Memuat file .env dari folder backend
load_dotenv()

# --- KONFIGURASI DATABASE POSTGRESQL (Mengambil dari .env) ---
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODEL TABEL DATABASE (TERHUBUNG DENGAN FOREIGN KEY) ---
class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    icon = Column(String(50), nullable=True)  # Kolom icon untuk UI

    # Relasi one-to-many ke feedback
    feedbacks = relationship("FeedbackModel", back_populates="category_rel", cascade="all, delete-orphan")

class FeedbackModel(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_name = Column(String(150), default="Anonim")
    message = Column(Text, nullable=False)
    created_at = Column(String(100), nullable=True)

    # Menghubungkan tabel feedbacks ke id di tabel categories
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    
    # Relasi balik ke objek kategori
    category_rel = relationship("CategoryModel", back_populates="feedbacks")

# Membuat tabel otomatis jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(title="KORAN UIGM PostgreSQL API", version="3.1")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- KONFIGURASI KEAMANAN (Mengambil dari .env) ---
SECRET_KEY = os.getenv("SECRET_KEY", "kunci-rahasia-uigm-2026")
ALGORITHM = "HS256"

ADMIN_USER = os.getenv("ADMIN_USER", "uigm")
ADMIN_PASS = os.getenv("ADMIN_PASS", "uigm2026")

WIB = timezone(timedelta(hours=7))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

# Dependency untuk mendapatkan sesi database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SCHEMA / PYDANTIC MODEL ---
class Token(BaseModel):
    access_token: str
    token_type: str

class FeedbackCreate(BaseModel):
    sender_name: Optional[str] = "Anonim"
    category_id: int  # Menggunakan ID Kategori yang berelasi
    message: str
    created_at: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "GraduationCap"

# --- VERIFIKASI TOKEN ---
def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != ADMIN_USER:
            raise HTTPException(status_code=401, detail="Token tidak valid")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa atau salah")
    return ADMIN_USER

# --- LOGIN ---
@app.post("/admin/login", response_model=Token)
def login_admin(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != ADMIN_USER or form_data.password != ADMIN_PASS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah!",
        )
    
    expires = timedelta(minutes=120)
    token = jwt.encode({"sub": ADMIN_USER, "exp": datetime.now(WIB) + expires}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

# --- ENDPOINT ASPIRASI ---
@app.get("/feedbacks/")
def get_feedbacks(db: Session = Depends(get_db)):
    feedbacks = db.query(FeedbackModel).all()
    # Format agar frontend tetap bisa membaca nama kategori dengan mulus lewat relasi
    result = []
    for f in feedbacks:
        result.append({
            "id": f.id,
            "sender_name": f.sender_name,
            "category": f.category_rel.name if f.category_rel else "Umum",
            "category_id": f.category_id,
            "message": f.message,
            "created_at": f.created_at
        })
    return result

@app.post("/feedbacks/")
def create_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    # Validasi apakah category_id yang dikirim benar-benar ada di database
    db_category = db.query(CategoryModel).filter(CategoryModel.id == data.category_id).first()
    if not db_category:
        raise HTTPException(status_code=400, detail="Kategori yang dipilih tidak valid atau tidak ditemukan.")

    waktu_wib = datetime.now(WIB).strftime("%Y-%m-%d %H:%M")

    new_item = FeedbackModel(
        sender_name=data.sender_name or "Anonim",
        category_id=data.category_id,
        message=data.message,
        created_at=waktu_wib
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return {"success": True, "message": "Berhasil", "data": new_item}

@app.delete("/feedbacks/{feedback_id}")
def delete_feedback(feedback_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    item = db.query(FeedbackModel).filter(FeedbackModel.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        
    db.delete(item)
    db.commit()
        
    return {"success": True, "message": "Data berhasil dihapus"}

# --- ENDPOINT KATEGORI ---
@app.get("/categories/")
def get_categories(db: Session = Depends(get_db)):
    return db.query(CategoryModel).all()

@app.post("/categories/")
def create_category(data: CategoryCreate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    existing = db.query(CategoryModel).filter(CategoryModel.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Kategori sudah ada")
        
    new_category = CategoryModel(
        name=data.name,
        icon=data.icon or "GraduationCap"
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return {"success": True, "message": "Kategori berhasil ditambahkan", "data": new_category}

# ENDPOINT HAPUS KATEGORI
@app.delete("/admin/categories/{category_id}")
def delete_category(category_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    try:
        item = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Kategori tidak ditemukan")
            
        db.delete(item)
        db.commit()
        return {"success": True, "message": "Kategori berhasil dihapus"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Kesalahan internal server: {str(e)}")