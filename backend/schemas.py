from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class FeedbackBase(BaseModel):
    sender_name: Optional[str] = "Anonim"
    category: str
    message : str

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    status: str
    admin_response: Optional[str] = None

class FeedbackResponse(FeedbackBase):
    id: int
    status: str
    admin_response: Optional[str] = None
    created_at: Optional[datetime] = None  # Dibuat Optional agar aman jika ada data kosong

    class Config:
        from_attributes = True