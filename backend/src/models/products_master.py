from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from src.core.database import Base
import uuid

class ProductMaster(Base):
    __tablename__ = "products_master"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gtin_ean = Column(String(14), unique=True, index=True)
    canonical_name = Column(String(255), nullable=False)
    category = Column(String(100))
    embedding = Column(Vector(384)) # Using 384 dimensions for standard MiniLM models
