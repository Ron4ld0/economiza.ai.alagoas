from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/{ean}/prices")
def get_product_prices(
    ean: str,
    lat: float = Query(..., description="Latitude of the user"),
    lng: float = Query(..., description="Longitude of the user"),
    radius_km: float = Query(10.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    result = ProductService.get_prices_by_ean(db, ean, lat, lng, radius_km)
    if result is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado na base de dados.")
    
    return result
