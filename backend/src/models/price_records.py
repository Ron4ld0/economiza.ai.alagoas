from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.core.database import Base
import uuid

class PriceRecord(Base):
    __tablename__ = "price_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    establishment_id = Column(UUID(as_uuid=True), ForeignKey("establishments.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products_master.id"), nullable=False)
    raw_description = Column(String(255), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    issued_at = Column(DateTime(timezone=True), index=True, nullable=False)

    establishment = relationship("Establishment")
    product = relationship("ProductMaster")
