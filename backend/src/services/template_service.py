from sqlalchemy.orm import Session
from src.models.templates import Template
from typing import List, Dict, Any
from uuid import UUID
from fastapi import HTTPException

def get_templates(db: Session) -> List[Template]:
    return db.query(Template).all()

def get_template(db: Session, template_id: UUID) -> Template:
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

def calculate_template(db: Session, template_id: UUID, people: int) -> Dict[str, Any]:
    template = get_template(db, template_id)
    
    calculated_items = []
    for item in template.items:
        calc_item = {
            "name": item.get("name"),
            "calculated_qty": item.get("base_qty", 0) * people,
            "unit": item.get("unit"),
            "required": item.get("required", False)
        }
        calculated_items.append(calc_item)
        
    return {
        "template_id": str(template.id),
        "template_name": template.name,
        "category": template.category,
        "people": people,
        "items": calculated_items
    }
