from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from src.core.database import get_db
from src.services.feed_service import FeedService

router = APIRouter(prefix="/feed", tags=["Feed"])

@router.get("/")
def get_location_feed(
    lat: float = Query(..., description="Latitude of the user"),
    lng: float = Query(..., description="Longitude of the user"),
    radius_km: float = Query(10.0, description="Search radius in kilometers"),
    category: str = Query(None, description="Category filter"),
    sort_by: str = Query("price_asc", description="Sort logic (price_asc, distance_asc, popular)"),
    db: Session = Depends(get_db)
):
    items = FeedService.get_feed(db, lat, lng, radius_km, category, sort_by)
    return {"items": items}
