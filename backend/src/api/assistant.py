from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.services import llm_service
from src.services import template_service
from src.models.templates import Template

router = APIRouter()

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    text: str
    widget_type: Optional[str] = None
    widget_data: Optional[Dict[str, Any]] = None

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    intent = llm_service.parse_intent(req.text)
    action = intent.get("action")
    
    if action == "general_chat":
        return ChatResponse(text=intent.get("response", "Olá! Como posso ajudar?"))
        
    elif action == "search_product":
        prod_name = intent.get("product_name", "")
        
        # Search the DB for the product and its cheapest prices
        from src.models.products_master import ProductMaster
        from src.models.price_records import PriceRecord
        from src.models.establishments import Establishment
        
        from sqlalchemy import or_
        
        # We want to match products that START with the product name or ARE exactly the product name
        # to avoid matching "Sazon de Arroz" when searching for "Arroz"
        products = db.query(ProductMaster).filter(
            or_(
                ProductMaster.canonical_name.ilike(f"{prod_name} %"),
                ProductMaster.canonical_name.ilike(f"{prod_name}")
            )
        ).all()
        
        if not products:
            # Fallback to general search if strict search fails
            products = db.query(ProductMaster).filter(ProductMaster.canonical_name.ilike(f"%{prod_name}%")).all()
            
        if not products:
            return ChatResponse(text=f"Poxa, não encontrei nenhum registro recente para '{prod_name}'. Tente buscar por outro item!")
            
        product_ids = [p.id for p in products]
        
        # Find cheapest prices
        cheapest_records = db.query(PriceRecord, Establishment, ProductMaster).join(
            Establishment, PriceRecord.establishment_id == Establishment.id
        ).join(
            ProductMaster, PriceRecord.product_id == ProductMaster.id
        ).filter(
            PriceRecord.product_id.in_(product_ids)
        ).order_by(PriceRecord.unit_price.asc()).limit(3).all()
        
        if not cheapest_records:
            return ChatResponse(text=f"Não encontrei preços recentes na sua região para '{prod_name}'.")
            
        offers = []
        for record, est, prod in cheapest_records:
            offers.append({
                "product_name": prod.canonical_name,
                "price": float(record.unit_price),
                "establishment_name": est.trade_name or est.corporate_name,
                "address": est.address
            })
            
        return ChatResponse(
            text=f"Dei uma vasculhada rápida nas notas fiscais (SEFAZ-AL) e encontrei o '{prod_name}' mais barato nestes locais:",
            widget_type="product_offers",
            widget_data={"offers": offers}
        )
        
    elif action == "calculate_template":
        template_name = intent.get("template_name", "Churrasco")
        people = intent.get("people", 4)
        
        # Find template by name in DB (case insensitive roughly)
        templates = template_service.get_templates(db)
        matched_template = None
        for t in templates:
            if template_name.lower() in t.name.lower() or t.name.lower() in template_name.lower():
                matched_template = t
                break
                
        if not matched_template:
            return ChatResponse(text=f"Não encontrei nenhuma lista pronta para '{template_name}'. Temos Churrasco, Cesta Básica e Petiscos.")
            
        calculated = template_service.calculate_template(db, matched_template.id, people)
        
        return ChatResponse(
            text=f"Legal! Preparei a lista de {matched_template.name} para {people} pessoas. Dá uma olhada:",
            widget_type="template_list",
            widget_data=calculated
        )
        
    return ChatResponse(text="Não entendi o que você quis dizer. Pode tentar de outra forma?")
