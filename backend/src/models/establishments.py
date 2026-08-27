from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from src.core.database import Base
import uuid
import datetime

class Establishment(Base):
    __tablename__ = "establishments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cnpj = Column(String(14), unique=True, index=True, nullable=False)
    corporate_name = Column(String(255), nullable=False)
    trade_name = Column(String(255))
    location = Column(Geometry('POINT', srid=4326))
    address = Column(String)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
