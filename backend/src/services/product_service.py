from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.establishments import Establishment
from src.models.price_records import PriceRecord
from src.models.products_master import ProductMaster
from src.services.stats_service import StatsService

class ProductService:
    @staticmethod
    def get_prices_by_ean(db: Session, ean: str, lat: float, lng: float, radius_km: float):
        radius_degrees = radius_km / 111.0
        point = f'POINT({lng} {lat})'
        
        # Verify if product exists
        product = db.query(ProductMaster).filter(ProductMaster.ean == ean).first()
        if not product:
            return None
        
        # Get price records for this product within the radius
        query = (
            db.query(
                PriceRecord, 
                Establishment,
                func.ST_Distance(Establishment.location, func.ST_GeomFromText(point, 4326)).label("distance_deg")
            )
            .join(Establishment, PriceRecord.establishment_id == Establishment.id)
            .filter(PriceRecord.product_id == product.id)
            .filter(func.ST_DWithin(Establishment.location, func.ST_GeomFromText(point, 4326), radius_degrees))
            .order_by(PriceRecord.unit_price) # Order by lowest price first
            .limit(10)
            .all()
        )
        
        prices_list = []
        for record, estab, distance_deg in query:
            distance_km = round(distance_deg * 111.0, 2) if distance_deg else 0.0
            badge = StatsService.calculate_price_badge(record.unit_price)
            
            prices_list.append({
                "id": str(record.id),
                "price": float(record.unit_price),
                "badge": badge,
                "distance_km": distance_km,
                "establishment": {
                    "name": estab.trade_name or estab.corporate_name,
                    "address": estab.address
                }
            })
            
        return {
            "product_name": product.canonical_name,
            "ean": product.ean,
            "prices": prices_list
        }
