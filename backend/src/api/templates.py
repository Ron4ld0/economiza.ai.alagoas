from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.services import template_service
from typing import List, Any, Dict
from pydantic import BaseModel
from uuid import UUID

router = APIRouter()

class CalculateRequest(BaseModel):
    people: int

@router.get("/")
def list_templates(db: Session = Depends(get_db)):
    templates = template_service.get_templates(db)
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "category": t.category
        } for t in templates
    ]

@router.post("/{template_id}/calculate")
def calculate_template(template_id: UUID, req: CalculateRequest, db: Session = Depends(get_db)):
    return template_service.calculate_template(db, template_id, req.people)
