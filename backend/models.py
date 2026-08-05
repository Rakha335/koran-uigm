from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    
    # Relasi ke feedback (Satu kategori bisa punya banyak feedback)
    feedbacks = relationship("Feedback", back_populates="category_rel", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_name = Column(String, default="Anonim")
    message = Column(String)
    status = Column(String, default="Pending")
    admin_response = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Hubungkan ke ID Kategori (Foreign Key)
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # Relasi balik ke objek Category
    category_rel = relationship("Category", back_populates="feedbacks")