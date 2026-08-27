from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from src.core.database import Base
import uuid

class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    category = Column(String(100))
    items = Column(JSONB, nullable=False) # Stores required/optional items and base quantities
