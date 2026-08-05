from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# --- SKEMA KATEGORI ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# --- SKEMA FEEDBACK / ASPIRASI ---
class FeedbackCreate(BaseModel):
    sender_name: Optional[str] = "Anonim"
    category_id: int  # <-- Menggunakan ID kategori yang berelasi
    message: str

class FeedbackUpdate(BaseModel):
    status: str
    admin_response: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    sender_name: str
    message: str
    status: str
    admin_response: Optional[str] = None
    created_at: Optional[datetime] = None
    category_id: int
    category_rel: Optional[CategoryResponse] = None  # Menampilkan detail kategori yang berelasi

    class Config:
        from_attributes = True